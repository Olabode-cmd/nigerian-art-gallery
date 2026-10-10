import { HugeiconsIcon } from '@hugeicons/react'
import { MicIcon, MicOffIcon } from '@hugeicons/core-free-icons'
import { useGallery } from '../store'
import { voice } from '../voice'

export default function VoiceControls() {
  const roomId = useGallery((state) => state.roomId)
  const voiceEnabled = useGallery((state) => state.voiceEnabled)
  const voiceMuted = useGallery((state) => state.voiceMuted)
  const voiceError = useGallery((state) => state.voiceError)
  const setVoiceError = useGallery((state) => state.setVoiceError)

  if (!roomId) return null

  const handleClick = () => {
    if (!voiceEnabled) {
      void voice.enableVoice().then((error) => {
        if (error) setVoiceError(error)
      })
    } else {
      setVoiceError(null)
      voice.toggleMute()
    }
  }

  const icon = voiceEnabled && !voiceMuted ? MicIcon : MicOffIcon
  const backgroundColor = voiceEnabled
    ? voiceMuted
      ? '#b45309' // on but muted
      : '#16a34a' // live
    : 'rgba(0, 0, 0, 0.7)' // off
  const label = !voiceEnabled
    ? 'Turn on microphone'
    : voiceMuted
      ? 'Unmute microphone'
      : 'Mute microphone'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      {voiceError && (
        <div
          style={{
            color: '#fca5a5',
            fontSize: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '4px 10px',
            borderRadius: '6px',
            textAlign: 'center',
            maxWidth: '280px'
          }}
        >
          {voiceError}
        </div>
      )}
      <button
        aria-label={label}
        onClick={handleClick}
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          color: 'white'
        }}
      >
        <HugeiconsIcon icon={icon} size={22} color="currentColor" strokeWidth={1.8} />
      </button>
    </div>
  )
}
