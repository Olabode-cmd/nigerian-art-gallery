import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'

export default function LoadingScreen() {
  const { progress } = useProgress()
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => setShow(false), 500)
      return () => clearTimeout(timer)
    }
  }, [progress])

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      opacity: progress === 100 ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
      pointerEvents: progress === 100 ? 'none' : 'auto'
    }}>
      <img
        src="/nigerian-flag.png"
        alt="Flag of Nigeria"
        style={{
          width: '120px',
          height: 'auto',
          borderRadius: '10px',
          marginBottom: '1.75rem'
        }}
      />
      <h1 style={{ color: '#fff', marginBottom: '2rem', fontSize: '2rem', fontWeight: 700 }}>
        Nigerian Art Gallery
      </h1>
      <div style={{
        width: '300px',
        height: '6px',
        background: '#333',
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
          transition: 'width 0.3s ease-out'
        }} />
      </div>
      <p style={{ color: '#aaa', marginTop: '1rem' }}>
        Loading... {Math.round(progress)}%
      </p>
    </div>
  )
}
