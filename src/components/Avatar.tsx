import { forwardRef, useEffect, useMemo, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, MeshLambertMaterial } from 'three'
import type { Group } from 'three'
import type { AvatarConfig } from '../avatarConfig'
import { useGallery } from '../store'

// The model faces -Z to match the movement/camera convention in AvatarControls
// (forward = -Z, so third-person cameras behind at +Z see the back of the head)
export const HEAD_Y = 4.3

type Props = {
  config: AvatarConfig
  /** 0 = idle, 1 = full walk. Drive from movement speed. */
  speed?: MutableRefObject<number>
  /** Only the local player's avatar hides its head in first person */
  isLocal?: boolean
}

const Avatar = forwardRef<Group, Props>(({ config, speed, isLocal = false }, ref) => {
  const mats = useMemo(
    () => ({
      skin: new MeshLambertMaterial({ color: config.skin }),
      shirt: new MeshLambertMaterial({ color: config.shirt }),
      pants: new MeshLambertMaterial({ color: config.pants }),
      hair: new MeshLambertMaterial({ color: config.hair }),
      shoe: new MeshLambertMaterial({ color: '#0d0d0f' }),
      sash: new MeshLambertMaterial({ color: '#1f8a4c' }),
      white: new MeshLambertMaterial({ color: '#f4f4f4' }),
      dark: new MeshLambertMaterial({ color: '#111' }),
    }),
    [config.skin, config.shirt, config.pants, config.hair]
  )

  // R3F doesn't auto-dispose materials passed as objects
  useEffect(() => {
    return () => {
      Object.values(mats).forEach((material) => material.dispose())
    }
  }, [mats])

  const lLeg = useRef<Group>(null)
  const rLeg = useRef<Group>(null)
  const lArm = useRef<Group>(null)
  const rArm = useRef<Group>(null)
  const body = useRef<Group>(null)
  const head = useRef<Group>(null)
  const phase = useRef(0)
  const amp = useRef(0)

  useFrame((state, dt) => {
    // In first person the camera sits inside the head — hide it so you don't
    // see your own eyeballs and nose
    if (isLocal && head.current) {
      head.current.visible = useGallery.getState().cameraView !== 'first'
    }

    const target = speed?.current ?? 0
    amp.current = MathUtils.damp(amp.current, target, 10, dt)
    phase.current += dt * (4 + 6 * amp.current)

    const swing = Math.sin(phase.current) * 0.7 * amp.current
    if (lLeg.current) lLeg.current.rotation.x = swing
    if (rLeg.current) rLeg.current.rotation.x = -swing
    if (lArm.current) lArm.current.rotation.x = -swing * 0.8
    if (rArm.current) rArm.current.rotation.x = swing * 0.8

    // idle breathing + walk bob
    if (body.current) {
      const t = state.clock.elapsedTime
      body.current.position.y =
        Math.abs(Math.sin(phase.current)) * 0.08 * amp.current +
        Math.sin(t * 1.6) * 0.015 * (1 - amp.current)
    }
  })

  return (
    <group ref={ref}>
      {/* Legs: pivot at hip */}
      {[-0.24, 0.24].map((x, i) => (
        <group key={x} ref={i === 0 ? lLeg : rLeg} position={[x, 1.25, 0]}>
          <mesh position={[0, -0.55, 0]} material={mats.pants}>
            <capsuleGeometry args={[0.16, 0.8, 6, 12]} />
          </mesh>
          <mesh position={[0, -1.17, -0.08]} material={mats.shoe}>
            <boxGeometry args={[0.32, 0.16, 0.56]} />
          </mesh>
        </group>
      ))}

      <group ref={body}>
        {/* Torso, flattened front to back */}
        <mesh position={[0, 2.3, 0]} scale={[1, 1, 0.7]} material={mats.shirt}>
          <capsuleGeometry args={[0.45, 1.2, 8, 16]} />
        </mesh>

        {/* Sash */}
        <mesh position={[0, 2.6, -0.33]} rotation={[0, 0, 0.35]} material={mats.sash}>
          <boxGeometry args={[0.1, 1.0, 0.06]} />
        </mesh>

        {/* Arms: pivot at shoulder */}
        {[-0.62, 0.62].map((x, i) => (
          <group key={x} ref={i === 0 ? lArm : rArm} position={[x, 3.0, 0]}>
            <mesh position={[0, -0.5, 0]} material={mats.shirt}>
              <capsuleGeometry args={[0.12, 0.7, 6, 12]} />
            </mesh>
            <mesh position={[0, -1.1, 0]} material={mats.skin}>
              <sphereGeometry args={[0.14, 12, 12]} />
            </mesh>
          </group>
        ))}

        {/* Neck */}
        <mesh position={[0, 3.5, 0]} material={mats.skin}>
          <cylinderGeometry args={[0.2, 0.24, 0.35, 12]} />
        </mesh>

        {/* Head, slightly egg-shaped */}
        <group ref={head} position={[0, 4.15, 0]}>
          <mesh scale={[1, 1.1, 1]} material={mats.skin}>
            <sphereGeometry args={[0.42, 24, 24]} />
          </mesh>

          {config.hairStyle === 'short' && (
            <mesh position={[0, 0.04, 0.03]} rotation={[0.25, 0, 0]} material={mats.hair}>
              <sphereGeometry args={[0.45, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            </mesh>
          )}
          {config.hairStyle === 'afro' && (
            <mesh position={[0, 0.12, 0]} material={mats.hair}>
              <sphereGeometry args={[0.6, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
            </mesh>
          )}
          {config.hairStyle === 'low' && (
            <mesh position={[0, 0.02, 0.02]} rotation={[0.15, 0, 0]} material={mats.hair}>
              <sphereGeometry args={[0.44, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
            </mesh>
          )}

          {/* Ears */}
          {[-0.42, 0.42].map((x) => (
            <mesh key={x} position={[x, 0, 0]} scale={[0.5, 1, 0.8]} material={mats.skin}>
              <sphereGeometry args={[0.08, 8, 8]} />
            </mesh>
          ))}

          {/* Eyes */}
          {[-0.15, 0.15].map((x) => (
            <group key={x} position={[x, 0.07, -0.35]}>
              <mesh material={mats.white}>
                <sphereGeometry args={[0.07, 12, 12]} />
              </mesh>
              <mesh position={[0, 0, -0.055]} material={mats.dark}>
                <sphereGeometry args={[0.035, 8, 8]} />
              </mesh>
            </group>
          ))}

          {/* Nose */}
          <mesh position={[0, -0.04, -0.42]} scale={[0.8, 1, 1]} material={mats.skin}>
            <sphereGeometry args={[0.06, 10, 10]} />
          </mesh>
        </group>
      </group>
    </group>
  )
})

Avatar.displayName = 'Avatar'
export default Avatar
