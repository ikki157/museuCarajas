import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'

const PRELOADER_STORAGE_KEY = 'museu_preloader_seen'

export function Preloader() {
  const [hidden, setHidden] = useState(() => {
    if (typeof window === 'undefined') return true
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return true
    }
    try {
      return window.sessionStorage.getItem(PRELOADER_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  const curtainRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (hidden || !curtainRef.current) return

    try {
      window.sessionStorage.setItem(PRELOADER_STORAGE_KEY, '1')
    } catch {
      // Ignora caso o storage de sessão esteja bloqueado pelo navegador
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => setHidden(true),
      })

      tl.fromTo(
        '.preloader-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.2, ease: 'power2.out' },
        0,
      ).to(
        curtainRef.current,
        { yPercent: -100, duration: 0.9, ease: 'power3.inOut' },
        0.15,
      )
    }, curtainRef)

    return () => ctx.revert()
  }, [hidden])

  if (hidden) return null

  return (
    <div
      ref={curtainRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center bg-forest-deep text-parchment will-change-transform"
    >
      <p className="text-[10.5px] font-medium uppercase tracking-[0.26em] text-parchment/75">
        Museu Municipal
      </p>
      <p className="display mt-2 text-[clamp(1.8rem,3.6vw,2.8rem)] font-medium tracking-[-0.02em] text-parchment">
        Hilmar Harry Kluck<span className="opacity-70">.</span>
      </p>
      <div className="mt-6 h-px w-36 overflow-hidden bg-parchment/20">
        <div className="preloader-line h-full w-full origin-left bg-copper-light" />
      </div>
    </div>
  )
}

