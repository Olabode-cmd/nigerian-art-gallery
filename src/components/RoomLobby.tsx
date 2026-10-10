import { useEffect, useState, type CSSProperties } from 'react'
import { useGallery } from '../store'
import { joinRoomAsPlayer, leaveRoom, prewarmRoom } from '../room'
import { voice } from '../voice'

const ROOM_CODE_PATTERN = /^[a-zA-Z0-9-]{4,64}$/

const labelStyle: CSSProperties = {
  color: '#9ca3af',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px'
}

const pillButton: CSSProperties = {
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: '#4b5563',
  color: '#d1d5db'
}

function createRoomCode(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 8)
  }
  return Math.random().toString(36).slice(2, 10)
}

const panelStyle: CSSProperties = {
  position: 'fixed',
  top: '80px',
  right: '16px',
  zIndex: 1000,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(4px)',
  borderRadius: '8px',
  padding: '16px',
  width: 'min(300px, calc(100vw - 32px))',
  maxHeight: 'calc(100vh - 120px)',
  overflowY: 'auto'
}

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '14px'
}

const primaryButton: CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '6px',
  fontSize: '14px',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: '#2563eb',
  color: 'white'
}

const secondaryButton: CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '6px',
  fontSize: '14px',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: '#4b5563',
  color: '#d1d5db'
}

const dividerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#6b7280',
  fontSize: '12px',
  margin: '12px 0'
}

const inputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: '8px 10px',
  borderRadius: '6px',
  fontSize: '14px',
  border: '1px solid #4b5563',
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
  color: 'white',
  outline: 'none'
}

export default function RoomLobby() {
  const open = useGallery((state) => state.lobbyOpen)
  const roomId = useGallery((state) => state.roomId)
  const roomError = useGallery((state) => state.roomError)
  const peerCount = useGallery((state) => Object.keys(state.peers).length)
  const setLobbyOpen = useGallery((state) => state.setLobbyOpen)
  const userName = useGallery((state) => state.userName)
  const setUserName = useGallery((state) => state.setUserName)
  const recentRooms = useGallery((state) => state.recentRooms)
  const [code, setCode] = useState(
    () => new URLSearchParams(window.location.search).get('room') ?? ''
  )
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Deep link (?room=xyz) opens the lobby with the code pre-filled
    if (new URLSearchParams(window.location.search).get('room')) {
      useGallery.getState().setLobbyOpen(true)
    }
    // Leaving the app ends the connection
    return () => leaveRoom()
  }, [])

  // Fetch the multiplayer chunk while the user reads the lobby, so joining
  // feels instant
  useEffect(() => {
    if (open) prewarmRoom()
  }, [open])

  if (!open) return null

  const isValid = ROOM_CODE_PATTERN.test(code.trim())

  const handleCreate = () => {
    voice.ensureContext() // the audio context must be created inside a user gesture
    void joinRoomAsPlayer(createRoomCode())
  }

  const handleJoin = () => {
    const id = code.trim()
    if (!ROOM_CODE_PATTERN.test(id)) return
    voice.ensureContext()
    void joinRoomAsPlayer(id)
  }

  const handleJoinRecent = (id: string) => {
    voice.ensureContext()
    void joinRoomAsPlayer(id)
  }

  const handleLeave = () => {
    leaveRoom()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable — the code is visible in this panel
    }
  }

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <span style={{ color: 'white', fontSize: '14px' }}>Play with others</span>
        <button
          aria-label="Close"
          onClick={() => setLobbyOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '18px',
            padding: 0,
            lineHeight: 1
          }}
        >
          ×
        </button>
      </div>

      {roomId ? (
        <>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '2px' }}>Room code</div>
            <div style={{ fontFamily: 'monospace', fontSize: '20px', color: 'white' }}>{roomId}</div>
          </div>
          <button onClick={handleCopy} style={{ ...secondaryButton, marginBottom: '10px' }}>
            {copied ? 'Copied!' : 'Copy invite link'}
          </button>
          {peerCount === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '10px' }}>
              Looking for players…
            </div>
          ) : (
            <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '10px' }}>
              {peerCount + 1} in room
            </div>
          )}
          <button onClick={handleLeave} style={{ ...secondaryButton, backgroundColor: '#7f1d1d', color: 'white' }}>
            Leave room
          </button>
          {roomError && <div style={{ color: '#f87171', fontSize: '12px', marginTop: '10px' }}>{roomError}</div>}
        </>
      ) : (
        <>
          <div style={{ marginBottom: '12px' }}>
            <div style={labelStyle}>Your name</div>
            <input
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              placeholder="Optional"
              maxLength={24}
              style={{ ...inputStyle, width: '100%', flex: 'none' }}
            />
          </div>
          <button onClick={handleCreate} style={{ ...primaryButton, marginBottom: '12px' }}>
            Create room
          </button>
          <div style={dividerStyle}>or</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleJoin()
              }}
              placeholder="Room code"
              style={inputStyle}
            />
            <button
              onClick={handleJoin}
              disabled={!isValid}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '14px',
                border: 'none',
                cursor: isValid ? 'pointer' : 'default',
                backgroundColor: isValid ? '#2563eb' : '#374151',
                color: isValid ? 'white' : '#6b7280'
              }}
            >
              Join
            </button>
          </div>
          {recentRooms.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div style={labelStyle}>Recent</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {recentRooms.map((id) => (
                  <button
                    key={id}
                    onClick={() => handleJoinRecent(id)}
                    style={{ ...pillButton, fontFamily: 'monospace' }}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ color: '#6b7280', fontSize: '11px' }}>
            Anyone with the room code can join — share the invite link.
          </div>
          {roomError && <div style={{ color: '#f87171', fontSize: '12px', marginTop: '10px' }}>{roomError}</div>}
        </>
      )}
    </div>
  )
}
