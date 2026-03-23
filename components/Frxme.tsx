import React, { useRef, useEffect, useState, Suspense, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, useProgress } from '@react-three/drei'
import { Mono } from './ui/Typography'
import FrxmePanel from './FrxmePanel'

function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function handleScroll() {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollHeight = el.scrollHeight - window.innerHeight
      const rawProgress = -rect.top / scrollHeight
      setProgress(Math.max(0, Math.min(1, rawProgress)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [ref])

  return progress
}

function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return x * x * (3 - 2 * x)
}

type SelectedLogo = 'default1' | 'default2' | 'custom'

const DEFAULT_LOGOS: Record<SelectedLogo, string> = {
  default1: '/frxmeDefaultLogo.png',
  default2: '/frxmeDefaultLogo2.png',
  custom: '/frxmeDefaultLogo.png',
}

const COLOR_OPTIONS = [
  { name: 'Obsidian', value: '#1a1a1a' },
  { name: 'Arctic', value: '#e8e8e8' },
  { name: 'Midnight', value: '#1e293b' },
  { name: 'Graphite', value: '#4a4a4a' },
  { name: 'Sand', value: '#c2b280' },
]

function FrxmeLoadingOverlay({ isReady }: { isReady: boolean }) {
  const { progress } = useProgress()

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-500 ${
        isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <style>
        {`
          @keyframes frxme-loader-logo-fade {
            0%, 100% { opacity: 0.28; }
            50% { opacity: 0.78; }
          }
        `}
      </style>
      <div className="flex flex-col items-center gap-5 px-6">
        <img
          src="/frxmeDefaultLogo.png"
          alt="FRXME"
          className="w-40 md:w-56 h-auto object-contain motion-reduce:opacity-60"
          style={{ animation: 'frxme-loader-logo-fade 1.8s ease-in-out infinite' }}
        />
        <div className="w-32 md:w-40 h-px bg-white/10 overflow-hidden">
          <div
            className="h-full bg-white transition-[width] duration-200 ease-out"
            style={{ width: `${Math.max(progress, 8)}%` }}
          />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35 tabular-nums">
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  )
}

function Frxme() {
  const sectionRef = useRef<HTMLElement>(null)
  const progress = useScrollProgress(sectionRef)
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value)
  const [selectedLogo, setSelectedLogo] = useState<SelectedLogo>('default1')
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isSceneReady, setIsSceneReady] = useState(false)

  const logoMapUrl =
    selectedLogo === 'default1'
      ? DEFAULT_LOGOS.default1
      : selectedLogo === 'default2'
        ? DEFAULT_LOGOS.default2
        : customLogoUrl || DEFAULT_LOGOS.custom

  // Scroll phases (8 phases total)
  // Strong vignette for initial hero; fully gone by ~9% scroll
  const vignetteOpacity = 1 - smoothstep(0, 0.09, progress)
  const introOpacity = 1 - smoothstep(0, 0.1, progress)
  const taglineOpacity = smoothstep(0.1, 0.2, progress) * (1 - smoothstep(0.25, 0.35, progress))
  const specsOpacity = smoothstep(0.35, 0.45, progress) * (1 - smoothstep(0.45, 0.55, progress))
  const purposeOpacity = smoothstep(0.55, 0.65, progress) * (1 - smoothstep(0.65, 0.75, progress))
  const colorPickerOpacity = smoothstep(0.75, 0.8, progress) * (1 - smoothstep(0.8, 0.85, progress))
  const featuresOpacity = smoothstep(0.85, 0.9, progress) * (1 - smoothstep(0.9, 0.95, progress))
  const logoPickerOpacity = smoothstep(0.95, 0.97, progress)
  const ctaOpacity = smoothstep(0.97, 1, progress)

  const handleSceneReady = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsSceneReady(true))
    })
  }, [])

  useEffect(() => {
    if (isSceneReady) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isSceneReady])

  function handleCustomLogoClick() {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  function handleLogoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'image/png') {
      setLogoError('Please upload a PNG file.')
      return
    }

    const url = URL.createObjectURL(file)
    setCustomLogoUrl(url)
    setSelectedLogo('custom')
    setLogoError(null)
  }

  return (
    <section
      id="frxme"
      ref={sectionRef}
      className="relative bg-black text-white z-10"
      style={{ height: '600vh' }}
    >
      <FrxmeLoadingOverlay isReady={isSceneReady} />

      <div className="sticky top-0 h-screen overflow-hidden">
        {/* 3D Canvas — always visible behind overlays */}
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 8], fov: 35 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.4} />
              <directionalLight
                position={[5, 8, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize={[1024, 1024]}
              />
              <directionalLight position={[-3, 4, -4]} intensity={0.3} />
              <pointLight position={[0, 2, 4]} intensity={0.5} color="#ffffff" />

              <FrxmePanel
                scrollProgress={progress}
                color={selectedColor}
                logoMapUrl={logoMapUrl}
                onReady={handleSceneReady}
              />

              <ContactShadows
                position={[0, -3.85, 0]}
                opacity={0.4}
                scale={8}
                blur={2.5}
              />

              <Environment preset="city" />
            </Suspense>
          </Canvas>
        </div>

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Vignette — fades out as user scrolls */}
        <div
          className="absolute inset-0 pointer-events-none z-[5] transition-opacity duration-500"
          style={{
            opacity: vignetteOpacity,
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, transparent 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.95) 70%, black 100%)',
          }}
        />

        {/* Progress indicator */}
        <div className="absolute top-20 right-6 md:right-12 z-20 pointer-events-none">
          <div className="w-px h-24 bg-white/20 relative">
            <div
              className="absolute top-0 left-0 w-full bg-white"
              style={{ height: `${progress * 100}%` }}
            />
          </div>
          <Mono className="text-white/30 text-[8px] mt-2 w-8 text-center -ml-3">
            {Math.round(progress * 100)}%
          </Mono>
        </div>

        {/* Phase 1: Intro hero text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-4 pointer-events-none z-10"
          style={{ opacity: introOpacity }}
        >
          <Mono className="text-white mb-6">[ Introducing ]</Mono>
          <h2 className="text-6xl md:text-[10rem] lg:text-[14rem] font-bold tracking-tighter leading-[0.85] uppercase text-center">
            FRXME
          </h2>
          <p className="mt-6 md:mt-8 text-sm md:text-base text-white font-mono uppercase tracking-widest text-center max-w-md">
            The future of interactive experiences
          </p>
        </div>

        {/* Scroll hint (minimal) */}
        <div
          className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none z-10 transition-opacity duration-500"
          style={{ opacity: 1 - smoothstep(0.02, 0.08, progress) }}
        >
          <div className="flex flex-col items-center gap-2">
            <Mono className="text-white/40 text-[9px] tracking-[0.25em]">[ Scroll ]</Mono>
            <div className="text-white/60 animate-bounce motion-reduce:animate-none">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Phase 2: Tagline / what it is */}
        <div
          className="absolute inset-0 flex items-end justify-start px-6 md:px-12 pb-24 md:pb-16 pointer-events-none z-10"
          style={{ opacity: taglineOpacity }}
        >
          <div className="max-w-lg">
            <Mono className="text-white/40 mb-4">[ What is FRXME? ]</Mono>
            <h3 className="text-2xl md:text-4xl font-bold uppercase tracking-tight leading-tight mb-4">
              Interactive Mixed Reality Display
            </h3>
            <p className="text-sm md:text-base text-white/50 font-mono leading-relaxed">
              An interactive mixed reality display that puts audiences inside the experience. Real-time AR, full-body tracking—users step into games, interact with branded content, and capture shareable moments.
            </p>
          </div>
        </div>

        {/* Phase 3: Specs */}
        <div
          className="absolute inset-0 flex items-center justify-end pointer-events-none z-10"
          style={{ opacity: specsOpacity }}
        >
          <div className="w-full md:w-1/2 lg:w-5/12 px-6 md:px-12">
            <div>
              <Mono className="text-white/40 mb-6">[ Specifications ]</Mono>
              <div className="space-y-4">
                {SPECS.map((spec) => (
                  <div key={spec.label} className="flex justify-between items-baseline border-b border-white/10 pb-3">
                    <span className="font-mono text-xs uppercase tracking-wider text-white/40">{spec.label}</span>
                    <span className="font-mono text-sm font-bold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        
        {/* Phase 4: Purpose / Use Case */}
        <div
          className="absolute inset-0 flex items-center justify-start pointer-events-none z-10"
          style={{ opacity: purposeOpacity }}
        >
          <div className="w-full md:w-1/2 lg:w-5/12 px-6 md:px-12">
            <div>
              <Mono className="text-white/40 mb-6">[ Purpose / Use Case ]</Mono>
              <p className="text-sm md:text-base text-white/50 font-mono leading-relaxed">
                For events, retail, festivals and brand activations—where brands want attention, participation and shareability. Turns passive viewers into active participants.
              </p>
            </div>
          </div>
        </div>{/* Phase 5: Color picker (docked to right so FRXME stays unobstructed) */}
        <div
          className="absolute inset-0 flex items-center justify-end z-10"
          style={{
            opacity: featuresOpacity,
            pointerEvents: featuresOpacity > 0.5 ? 'auto' : 'none',
          }}
        >
          <div className="w-full max-w-xs md:max-w-sm mr-6 md:mr-12 px-5 py-5 md:py-6">
            <Mono className="text-white/40 mb-2">[ Finish ]</Mono>
            <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight mb-4">
              Choose Your Color
            </h3>
            <div className="flex flex-wrap gap-4">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedColor(opt.value)}
                  className="group flex flex-col items-center gap-1"
                >
                  <div
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 transition-all duration-300"
                    style={{
                      backgroundColor: opt.value,
                      borderColor:
                        selectedColor === opt.value ? '#ffffff' : 'rgba(255,255,255,0.2)',
                      transform: selectedColor === opt.value ? 'scale(1.12)' : 'scale(1)',
                      boxShadow:
                        selectedColor === opt.value
                          ? '0 0 16px rgba(255,255,255,0.18)'
                          : 'none',
                    }}
                  />
                  <span
                    className="font-mono text-[9px] uppercase tracking-wider transition-colors duration-300"
                    style={{
                      color:
                        selectedColor === opt.value ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {opt.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        
        {/* Phase 6: Features */}
        <div
          className="absolute inset-0 flex items-center justify-start pointer-events-none z-10"
          style={{ opacity: colorPickerOpacity }}
        >
          <div className="w-full md:w-1/2 lg:w-5/12 px-6 md:px-12">
            <div>
              <Mono className="text-white/40 mb-6">[ Features ]</Mono>
              <ul className="text-sm md:text-base text-white/50 font-mono leading-relaxed space-y-2">
                <li>• Fully branded design</li>
                <li>• Custom AR characters & environments</li>
                <li>• Interactive games & challenges</li>
                <li>• Photo/video capture & social sharing</li>
                <li>• Analytics & data capture</li>
              </ul>
            </div>
          </div>
        </div>{/* Phase 7: Logo picker (also docked to right) */}
        <div
          className="absolute inset-0 flex items-center justify-end z-10"
          style={{
            opacity: logoPickerOpacity,
            pointerEvents: logoPickerOpacity > 0.5 ? 'auto' : 'none',
          }}
        >
          <div className="w-full max-w-xs md:max-w-sm mr-6 md:mr-12 px-5 py-6">
            <Mono className="text-white/40 mb-2">[ Branding ]</Mono>
            <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight mb-2">
              Apply a Logo
            </h3>
            <p className="text-[9px] md:text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">
              Mapped to the front base panel
            </p>

            <div className="flex items-center gap-4 md:gap-5 mb-4">
              {/* Default 1 */}
              <button
                type="button"
                onClick={() => setSelectedLogo('default1')}
                className="group flex flex-col items-center gap-2"
              >
                <div
                  className="w-16 h-10 md:w-20 md:h-12 border-2 bg-white/5 flex items-center justify-center transition-all duration-300"
                  style={{
                    borderColor:
                      selectedLogo === 'default1'
                        ? '#ffffff'
                        : 'rgba(255,255,255,0.25)',
                    boxShadow:
                      selectedLogo === 'default1'
                        ? '0 0 20px rgba(255,255,255,0.18)'
                        : 'none',
                  }}
                >
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/70">
                    Logo A
                  </span>
                </div>
                <span
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{
                    color:
                      selectedLogo === 'default1'
                        ? '#ffffff'
                        : 'rgba(255,255,255,0.4)',
                  }}
                >
                  Default A
                </span>
              </button>

              {/* Default 2 */}
              <button
                type="button"
                onClick={() => setSelectedLogo('default2')}
                className="group flex flex-col items-center gap-2"
              >
                <div
                  className="w-16 h-10 md:w-20 md:h-12 border-2 bg-white/5 flex items-center justify-center transition-all duration-300"
                  style={{
                    borderColor:
                      selectedLogo === 'default2'
                        ? '#ffffff'
                        : 'rgba(255,255,255,0.25)',
                    boxShadow:
                      selectedLogo === 'default2'
                        ? '0 0 20px rgba(255,255,255,0.18)'
                        : 'none',
                  }}
                >
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/70">
                    Logo B
                  </span>
                </div>
                <span
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{
                    color:
                      selectedLogo === 'default2'
                        ? '#ffffff'
                        : 'rgba(255,255,255,0.4)',
                  }}
                >
                  Default B
                </span>
              </button>

              {/* Custom upload */}
              <button
                type="button"
                onClick={handleCustomLogoClick}
                className="group flex flex-col items-center gap-2"
              >
                <div
                  className="w-16 h-10 md:w-20 md:h-12 border-2 border-dashed flex items-center justify-center transition-all duration-300"
                  style={{
                    borderColor:
                      selectedLogo === 'custom'
                        ? '#ffffff'
                        : 'rgba(255,255,255,0.35)',
                    boxShadow:
                      selectedLogo === 'custom'
                        ? '0 0 20px rgba(255,255,255,0.18)'
                        : 'none',
                    backgroundColor: 'rgba(0,0,0,0.35)',
                  }}
                >
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/70">
                    PNG
                  </span>
                </div>
                <span
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{
                    color:
                      selectedLogo === 'custom'
                        ? '#ffffff'
                        : 'rgba(255,255,255,0.4)',
                  }}
                >
                  Upload
                </span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png"
              className="hidden"
              onChange={handleLogoFileChange}
            />

            <div className="mt-4 flex flex-col items-center gap-1">
              <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">
                Recommended: 1024×1024 PNG with alpha
              </p>
              {logoError && (
                <p className="font-mono text-[9px] text-red-400 uppercase tracking-widest">
                  {logoError}
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom CTA (end of scroll only) */}
      <div
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 transition-opacity duration-500"
        style={{
          opacity: ctaOpacity,
          pointerEvents: ctaOpacity > 0.5 ? 'auto' : 'none',
        }}
      >
        <a
          href="https://product.frxme.co/"
          className="px-5 py-3 border border-white/30 text-[10px] md:text-xs font-bold uppercase tracking-widest font-mono hover:bg-white hover:text-black transition-colors bg-black/30 backdrop-blur-sm"
        >
          Request Access
        </a>
      </div>
    </section>
  )
}

const SPECS = [
  { label: 'Display', value: '43" HD Touchscreen' },
  { label: 'Camera', value: '4K Ultra HD' },
  { label: 'Tracking', value: 'Full-Body AR @ 60fps' },
  { label: 'Lighting', value: 'LED Ring Light' },
  { label: 'Delivery', value: 'QR Code in <10s' },
  { label: 'Branding', value: 'Fully Customisable' },
]

export default Frxme
