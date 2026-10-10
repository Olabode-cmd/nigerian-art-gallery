import type { Camera } from 'three'
import { Vector3 } from 'three'
import type { Room } from 'trystero'
import { useGallery } from './store'

interface RemoteVoice {
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

const remoteVoices = new Map<string, RemoteVoice>()
const tmpForward = new Vector3()
const localSpeechLevel = { current: 0 }

function ensureContext(): AudioContext {
  if (!context) {
    context = new AudioContext()
  }
  if (context.state === 'suspended') {
    void context.resume()
  }
  return context
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
    try {
      const ctx = ensureContext()
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      micStream = stream
      micSource = ctx.createMediaStreamSource(stream)
      micAnalyser = ctx.createAnalyser()
      micAnalyser.fftSize = 256
      micData = new Uint8Array(micAnalyser.frequencyBinCount)
      // The analyser taps the mic but is not connected to the destination —
      // no local echo
      micSource.connect(micAnalyser)
      Promise.allSettled(activeRoom.addStream(stream))
      useGallery.getState().setVoiceError(null)
      useGallery.getState().setVoiceEnabled(true)
      return null
    } catch {
      return 'Microphone access denied. Check browser permissions.'
    }
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

  getMicStream(): MediaStream | null {
    return micStream
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
