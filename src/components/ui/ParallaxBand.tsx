import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'

type ParallaxBandProps = {
  src: string
  alt?: string
  eyebrow: string
  quote: string
  className?: string
}

/** Faixa de transição em tela cheia: imagem com parallax + citação revelada no scroll. */
export function ParallaxBand({ src, alt = '', eyebrow, quote, className = '' }: ParallaxBandProps) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.band-img',
          { yPercent: -14, scale: 1.18 },
          {
            yPercent: 14,
            scale: 1.05,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
        gsap.from('.band-line', {
          yPercent: 110,
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.12,
          scrollTrigger: { trigger: root.current, start: 'top 65%', once: true },
        })
        gsap.from('.band-fade', {
          opacity: 0,
          y: 16,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 65%', once: true },
        })
      })
    },
    { scope: root },
  )

  const lines = quote.split('|')

  return (
    <section
      ref={root}
      aria-label={eyebrow}
      className={`relative isolate flex min-h-[70svh] items-center overflow-hidden bg-forest-deep text-parchment ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={1280}
        height={720}
        className="band-img absolute inset-0 -z-20 h-full w-full object-cover will-change-transform"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-forest-deep/70" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(16,33,25,0.75)_100%)]"
      />
      <div className="site-container py-24 text-center">
        <p className="band-fade eyebrow text-copper-light">{eyebrow}</p>
        <p className="display mx-auto mt-6 max-w-4xl text-[clamp(1.9rem,4.6vw,3.8rem)] font-medium leading-[1.08] tracking-[-0.02em]">
          {lines.map((line) => (
            <span key={line} className="block overflow-hidden pb-[0.12em]">
              <span className="band-line block italic">{line}</span>
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}

