import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface FrxmePanelProps {
  scrollProgress: number
  color: string
  logoMapUrl: string
  onReady?: () => void
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return x * x * (3 - 2 * x)
}

function FrxmePanel({ scrollProgress, color, logoMapUrl, onReady }: FrxmePanelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const logoMaterialRef = useRef<THREE.Material | null>(null)
  const colorMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const targetColor = useRef(new THREE.Color(color))
  const currentColor = useRef(new THREE.Color(color))
  const [logoTexture, setLogoTexture] = useState<THREE.Texture | null>(null)
  const [hasLogoTextureResolved, setHasLogoTextureResolved] = useState(false)
  const hasReportedReady = useRef(false)

  useEffect(() => {
    if (!logoMapUrl) {
      setLogoTexture(null)
      setHasLogoTextureResolved(true)
      return
    }

    let cancelled = false
    const loader = new THREE.TextureLoader()
    setHasLogoTextureResolved(false)

    loader.load(
      logoMapUrl,
      (texture) => {
        if (cancelled) return
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        setLogoTexture(texture)
        setHasLogoTextureResolved(true)
      },
      undefined,
      () => {
        if (cancelled) return
        setLogoTexture(null)
        setHasLogoTextureResolved(true)
      }
    )

    return () => {
      cancelled = true
    }
  }, [logoMapUrl])

  targetColor.current.set(color)

  useFrame((_state, delta) => {
    if (!groupRef.current) return

    currentColor.current.lerp(targetColor.current, 1 - Math.pow(0.001, delta))

    if (colorMaterialRef.current)
      colorMaterialRef.current.color.copy(currentColor.current)

    // Phase 1 (0–0.15): Intro — close-up front view
    // Phase 2 (0.15–0.45): Pull back, full 360 rotation back to front
    // Phase 3 (0.45–0.7): Slight 3/4 angle, offset left for specs
    // Phase 4 (0.7–1.0): Return to dead-center front, zoom out for color picker

    const p = scrollProgress

    const introZoom = smoothstep(0, 0.15, p)
    const pullback = smoothstep(0.15, 0.45, p)
    const settle = smoothstep(0.45, 0.7, p)
    // Customization (color/logo) comes in after features, so shift this later
    const colorPhase = smoothstep(0.85, 0.95, p)
    const zoomOut = smoothstep(0.95, 1.0, p)

    // Offsets for left/right framing with text sections
    const specsLeftPhase = smoothstep(0.35, 0.45, p) * (1 - smoothstep(0.5, 0.54, p))
    let rightPhase = smoothstep(0.5, 0.7, p)
    if (p >= 0.8) rightPhase = 1

    // Full 360 during pullback so it lands back at front
    const phase2RotY = Math.PI * 2 * pullback
    // Slight angle for specs readability
    const phase3RotY = lerp(0, Math.PI * 0.15, settle)
    // Return to front for color picker
    const phase4RotY = lerp(0, -phase3RotY, colorPhase)
    const rotY = phase2RotY + phase3RotY + phase4RotY

    const rotX = lerp(0.05, -0.05, pullback) + lerp(0, 0.05, settle) * (1 - colorPhase)
    const specsOffsetX = lerp(0, -1.5, specsLeftPhase) * (1 - colorPhase)
    const rightOffsetX = lerp(0, 1.5, rightPhase) * (1 - colorPhase)
    const colorOffsetX = lerp(0, -1.8, colorPhase)
    const posX = specsOffsetX + rightOffsetX + colorOffsetX
    const posZ = lerp(0.5, 0, introZoom) + lerp(0, -1.0, pullback) + lerp(0, -0.5, colorPhase) + lerp(0, -2.5, zoomOut)
    const posY = lerp(0, 0.2, settle) * (1 - colorPhase) + lerp(0, 0.5, colorPhase) + lerp(0, 0.3, zoomOut)

    groupRef.current.rotation.y += (rotY - groupRef.current.rotation.y) * 0.08
    groupRef.current.rotation.x += (rotX - groupRef.current.rotation.x) * 0.08
    groupRef.current.position.x += (posX - groupRef.current.position.x) * 0.08
    groupRef.current.position.z += (posZ - groupRef.current.position.z) * 0.08
    groupRef.current.position.y += (posY - groupRef.current.position.y) * 0.08
  })

  const { scene: glbScene } = useGLTF('/frxme_low_poly.glb')

  useEffect(() => {
    if (hasReportedReady.current) return
    if (!glbScene) return
    if (logoMapUrl && !hasLogoTextureResolved) return

    hasReportedReady.current = true
    onReady?.()
  }, [glbScene, hasLogoTextureResolved, logoMapUrl, onReady])

  useEffect(() => {
    if (!glbScene) return

    glbScene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return

      const materials = Array.isArray(child.material) ? child.material : [child.material]

      materials.forEach((material) => {
        if (!material) return

        if (material.name === 'm_logo') {
          logoMaterialRef.current = material

          const standardMaterial = material as THREE.MeshStandardMaterial
          if (!logoTexture) return

          const glbLogoTexture = logoTexture.clone()

          glbLogoTexture.wrapS = THREE.ClampToEdgeWrapping
          glbLogoTexture.wrapT = THREE.ClampToEdgeWrapping
          // Flip vertically so GLB UVs match the 2D preview
          glbLogoTexture.repeat.set(1, -1)
          glbLogoTexture.offset.set(0, 1)
          glbLogoTexture.needsUpdate = true

          standardMaterial.map = glbLogoTexture
          standardMaterial.transparent = true
          standardMaterial.toneMapped = false
          standardMaterial.needsUpdate = true
        }

        if (
          material.name !== 'm_logo' &&
          material.name !== 'm_screen' &&
          material instanceof THREE.MeshStandardMaterial &&
          !colorMaterialRef.current
        ) {
          // Use the first non-logo, non-screen standard material as the color-driven material
          colorMaterialRef.current = material
          material.color.copy(currentColor.current)
        }
      })
    })
  }, [glbScene, logoTexture])

  return (
    <group ref={groupRef}>
      <primitive object={glbScene} scale={[2.8, 2.8, 2.8]} position={[0, -3, 0]} />
    </group>
  )
}

useGLTF.preload('/frxme_low_poly.glb')

export default FrxmePanel
