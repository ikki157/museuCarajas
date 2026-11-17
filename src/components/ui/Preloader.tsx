import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'

export function Preloader() {
  const [hidden, setHidden] = useState(() => {
    if (typeof window === 'undefined') return true
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  })

  const curtainRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (hidden || !curtainRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => setHidden(true),
      })

      tl.fromTo(
        '.preloader-emblem',
        { scale: 0.82, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' },
        0,
      )
        .fromTo(
          '.preloader-flower',
          { rotation: 0, transformOrigin: '50% 50%' },
          { rotation: 360, duration: 1.25, ease: 'power2.inOut' },
          0,
        )
        .fromTo(
          '.preloader-line',
          { scaleX: 0 },
          { scaleX: 1, duration: 1.1, ease: 'power2.inOut' },
          0.05,
        )
        .to(
          curtainRef.current,
          { yPercent: -100, duration: 0.85, ease: 'power3.inOut' },
          1.2,
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
      <div className="preloader-emblem relative flex h-16 w-16 items-center justify-center rounded-2xl border border-parchment/20 bg-forest/70 p-2.5 shadow-2xl sm:h-20 sm:w-20">
        <div className="h-full w-full animate-[spin_2.2s_linear_infinite]">
          <svg
            viewBox="0 0 64 64"
            className="preloader-flower h-full w-full"
            fill="none"
          >
            <g transform="translate(32 32)">
              <circle r="13.5" fill="#c83e37" />
              {[0, 72, 144, 216, 288].map((angle) => (
                <path
                  key={`lobe-${angle}`}
                  d="M0 -22 C6.5 -17.5, 9 -10, 5.2 -3 L0 0 L-5.2 -3 C-9 -10, -6.5 -17.5, 0 -22 Z"
                  fill="#c83e37"
                  transform={`rotate(${angle})`}
                />
              ))}
              {[0, 72, 144, 216, 288].map((angle) => (
                <path
                  key={`fold-${angle}`}
                  d="M0 -18.5 C2.3 -13, 2.5 -7.5, 0 -2.5 C-2.5 -7.5, -2.3 -13, 0 -18.5 Z"
                  fill="#e3655b"
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle r="5.8" fill="#8f241f" />
              <circle r="3.6" fill="#f7f1e7" />
              <circle r="1.7" fill="#d9a06a" />
            </g>
          </svg>
        </div>
      </div>

      <p className="mt-6 text-[10.5px] font-medium uppercase tracking-[0.26em] text-parchment/75">
        Acervo Digital · Região de Carajás
      </p>
      <p className="display mt-2 text-[clamp(1.8rem,3.6vw,2.8rem)] font-medium tracking-[-0.02em] text-parchment">
        Museu Carajás<span className="text-[#c83e37]">.</span>
      </p>
      <div className="mt-6 h-px w-36 overflow-hidden bg-parchment/20">
        <div className="preloader-line h-full w-full origin-left bg-copper-light" />
      </div>
    </div>
  )
}
