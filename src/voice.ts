import type { Camera } from 'three'
import { Vector3 } from 'three'
import type { Room } from 'trystero'
import { useGallery } from './store'

interface RemoteVoice {
  /** Muted sink that keeps Chromium decoding the remote WebRTC audio */
  element: HTMLAudioElement
  source: MediaStreamAudioSourceNode
  analyser: AnalyserNode
  panner: PannerNode
  data: Uint8Array<ArrayBuffer>
  level: number
}

let activeRoom: Room | null = null
let context: AudioContext | null = null
let micStream: MediaStream | null = null
let micSource: MediaStreamAudioSourceNode | null = null
let micAnalyser: AnalyserNode | null = null
let micData: Uint8Array<ArrayBuffer> | null = null
let micPending = false
let gestureResumeArmed = false

const remoteVoices = new Map<string, RemoteVoice>()
const tmpForward = new Vector3()
const localSpeechLevel = { current: 0 }

// Autoplay policy keeps a context suspended until a user gesture. If resume()
// is called outside one (e.g. a peer's stream arrives), retry on the next input.
function resumeOnNextGesture(ctx: AudioContext): void {
  if (gestureResumeArmed) return
  gestureResumeArmed = true
  const resume = () => {
    gestureResumeArmed = false
    window.removeEventListener('pointerdown', resume)
    window.removeEventListener('keydown', resume)
    void ctx.resume()
  }
  window.addEventListener('pointerdown', resume)
  window.addEventListener('keydown', resume)
}

function ensureContext(): AudioContext {
  if (!context) {
    context = new AudioContext()
  }
  if (context.state !== 'running') {
    void context.resume()
    resumeOnNextGesture(context)
  }
  return context
}

function describeMicError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : ''
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Microphone access denied. Check browser permissions.'
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No microphone found. Connect one and try again.'
    case 'NotReadableError':
      return 'Microphone is busy in another app. Close it and try again.'
    default:
      return 'Could not start the microphone. Try again.'
  }
}

function shareStream(room: Room, stream: MediaStream, target?: string): void {
  room.addStream(stream, target ? { target } : undefined).forEach((sending) => {
    sending.catch((error: unknown) => {
      console.warn('Voice: could not send microphone to a peer', error)
    })
  })
}

function computeLevel(analyser: AnalyserNode, data: Uint8Array<ArrayBuffer>): number {
  analyser.getByteFrequencyData(data)
  let sum = 0
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i]
  }
  const rms = Math.sqrt(sum / data.length) / 255
  return Math.min(1, rms * 4)
}

// Fast attack, slow release — speech indicators read naturally
function smoothLevel(previous: number, next: number): number {
  return next > previous ? next : previous + (next - previous) * 0.2
}

function setNodePosition(node: PannerNode, x: number, y: number, z: number): void {
  if (node.positionX) {
    node.positionX.value = x
    node.positionY.value = y
    node.positionZ.value = z
  } else {
    node.setPosition(x, y, z)
  }
}

function disableMic(): void {
  micStream?.getTracks().forEach((track) => track.stop())
  micSource?.disconnect()
  micStream = null
  micSource = null
  micAnalyser = null
  micData = null
  const store = useGallery.getState()
  store.setVoiceEnabled(false)
  store.setVoiceMuted(false)
}

function removeRemote(peerId: string): void {
  const remote = remoteVoices.get(peerId)
  if (!remote) return
  remote.element.pause()
  remote.element.srcObject = null
  remote.source.disconnect()
  remote.analyser.disconnect()
  remote.panner.disconnect()
  remoteVoices.delete(peerId)
}

export const voice = {
  /** 0..1 local speech level — feeds the local avatar's gestures */
  localSpeech: localSpeechLevel,

  setRoom(room: Room | null): void {
    const isLeaving = !room && activeRoom !== null
    activeRoom = room
    if (isLeaving) {
      disableMic()
      Array.from(remoteVoices.keys()).forEach(removeRemote)
      localSpeechLevel.current = 0
    }
  },

  async enableVoice(): Promise<string | null> {
    if (!activeRoom) return 'Not in a room'
    if (micStream || micPending) return null
    // getUserMedia only exists on HTTPS or localhost — a LAN IP over http has none
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      return 'Voice chat needs a secure connection (HTTPS or localhost).'
    }
    const room = activeRoom
    const ctx = ensureContext()
    micPending = true
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
    } catch (error) {
      return describeMicError(error)
    } finally {
      micPending = false
    }
    // The user left (or switched rooms) while the permission prompt was open
    if (activeRoom !== room) {
      stream.getTracks().forEach((track) => track.stop())
      return null
    }
    micStream = stream
    micSource = ctx.createMediaStreamSource(stream)
    micAnalyser = ctx.createAnalyser()
    micAnalyser.fftSize = 256
    micData = new Uint8Array(micAnalyser.frequencyBinCount)
    // The analyser taps the mic but is not connected to the destination —
    // no local echo
    micSource.connect(micAnalyser)
    shareStream(room, stream)
    useGallery.getState().setVoiceError(null)
    useGallery.getState().setVoiceEnabled(true)
    return null
  },

  /** Sends the live mic to a peer who joined after voice was turned on */
  shareMicWith(room: Room, peerId: string): void {
    if (micStream) shareStream(room, micStream, peerId)
  },

  toggleMute(): void {
    if (!micStream) return
    const track = micStream.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    useGallery.getState().setVoiceMuted(!track.enabled)
  },

  addRemote(peerId: string, stream: MediaStream): void {
    removeRemote(peerId) // replace if the peer re-adds their stream
    const ctx = ensureContext()
    // Chromium outputs silence for a remote WebRTC stream that is only routed
    // through Web Audio (crbug.com/933677). Attaching it to a muted media
    // element keeps it flowing; the audible path is still the panner below.
    const element = new Audio()
    element.muted = true
    element.srcObject = stream
    element.play().catch((error: unknown) => {
      console.warn('Voice: remote audio sink did not start', error)
    })
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    // Spatial audio: each peer's voice comes from where their avatar stands
    const panner = ctx.createPanner()
    panner.panningModel = 'HRTF'
    panner.distanceModel = 'inverse'
    panner.refDistance = 2
    panner.maxDistance = 40
    panner.rolloffFactor = 1.2
    source.connect(analyser)
    analyser.connect(panner)
    panner.connect(ctx.destination)
    remoteVoices.set(peerId, {
      element,
      source,
      analyser,
      panner,
      data: new Uint8Array(analyser.frequencyBinCount),
      level: 0,
    })
  },

  getRemoteLevel(peerId: string): number {
    return remoteVoices.get(peerId)?.level ?? 0
  },

  removeRemote,

  updateRemotePosition(peerId: string, x: number, y: number, z: number): void {
    const remote = remoteVoices.get(peerId)
    if (remote) setNodePosition(remote.panner, x, y, z)
  },


  updateLevels(): void {
    if (micAnalyser && micData) {
      localSpeechLevel.current = smoothLevel(
        localSpeechLevel.current,
        computeLevel(micAnalyser, micData)
      )
    }
    remoteVoices.forEach((remote) => {
      remote.level = smoothLevel(remote.level, computeLevel(remote.analyser, remote.data))
    })
  },

  updateListener(camera: Camera): void {
    if (!context || context.state !== 'running') return
    const listener = context.listener
    const position = camera.position
    camera.getWorldDirection(tmpForward)
    if (listener.positionX) {
      listener.positionX.value = position.x
      listener.positionY.value = position.y
      listener.positionZ.value = position.z
      listener.forwardX.value = tmpForward.x
      listener.forwardY.value = tmpForward.y
      listener.forwardZ.value = tmpForward.z
      listener.upX.value = camera.up.x
      listener.upY.value = camera.up.y
      listener.upZ.value = camera.up.z
    } else {
      listener.setPosition(position.x, position.y, position.z)
      listener.setOrientation(
        tmpForward.x,
        tmpForward.y,
        tmpForward.z,
        camera.up.x,
        camera.up.y,
        camera.up.z
      )
    }
  },

  ensureContext,
}
