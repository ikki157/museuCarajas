import { useLayoutEffect, useRef } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { heroImage, museum, photoCredit, visit } from '../../data/content'
import { gsap } from '../../lib/gsap'
import { ButtonLink } from '../ui/Button'

function Words({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="inline-block overflow-hidden pb-[0.14em] align-bottom">
            <span className={`hero-word inline-block will-change-transform ${className}`}>{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </>
  )
}

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(
          [
            '.hero-bg',
            '.hero-bg-wrap',
            '.hero-veil',
            '.hero-eyebrow > *',
            '.hero-word',
            '.hero-sub',
            '.hero-cta',
            '.hero-meta',
            '.hero-content',
          ],
          { clearProps: 'all' },
        )
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Entrada orquestrada
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
        tl.from('.hero-bg', { scale: 1.18, duration: 1.8, ease: 'power3.out' }, 0)
          .from('.hero-veil', { opacity: 0, duration: 1.1 }, 0)
          .from('.hero-eyebrow > *', { opacity: 0, y: 14, stagger: 0.08, duration: 0.8 }, 0.35)
          .from('.hero-word', { yPercent: 115, rotate: 4, stagger: 0.07, duration: 1.2 }, 0.45)
          .from('.hero-sub', { opacity: 0, y: 24, duration: 1 }, 1.0)
          .from('.hero-cta', { opacity: 0, y: 24, stagger: 0.1, duration: 0.9 }, 1.15)
          .from('.hero-meta', { opacity: 0, y: 20, stagger: 0.08, duration: 0.8 }, 1.35)

        // Parallax em camadas no scroll: fundo reduz de 1.06 -> 1.0 enquanto conteúdo desliza mais rápido
        const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
        gsap.fromTo(
          '.hero-bg-wrap',
          { scale: 1.06, yPercent: 0 },
          { scale: 1.0, yPercent: 12, ease: 'none', scrollTrigger: st },
        )
        gsap.fromTo(
          '.hero-content',
          { yPercent: 0, opacity: 1 },
          { yPercent: -18, opacity: 0.15, ease: 'none', scrollTrigger: st },
        )
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={root}
      id="inicio"
      aria-labelledby="hero-title"
      className="hero-chevron-mask relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-forest-deep text-parchment"
    >
      <div className="hero-bg-wrap absolute -inset-x-6 -top-6 -bottom-6 -z-30 will-change-transform">
        <img
          src={heroImage.src}
          alt={heroImage.alt}
          width={1280}
          height={720}
          fetchPriority="high"
          className="hero-bg h-full w-full scale-110 object-cover object-[58%_center] will-change-transform"
        />
      </div>

      {/* Névoa de pinheiro: base uniforme + vinheta radial + neblina superior e inferior */}
      <div aria-hidden="true" className="hero-veil absolute inset-0 -z-20 bg-forest-deep/40" />
      <div
        aria-hidden="true"
        className="hero-veil absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,rgba(21,34,28,0.45)_0%,rgba(21,34,28,0.88)_100%)]"
      />
      <div
        aria-hidden="true"
        className="hero-veil absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(21,34,28,0.7)_0%,rgba(21,34,28,0)_28%,rgba(21,34,28,0)_62%,rgba(21,34,28,0.75)_100%)]"
      />

      <div className="hero-content site-container relative flex flex-1 flex-col pb-28 pt-32 will-change-transform md:pb-32">
        <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center text-center">
          <p className="hero-eyebrow eyebrow text-parchment/85">
            <span>Acervo Digital · Região de Carajás</span>
          </p>

          <h1
            id="hero-title"
            className="display mt-6 text-[clamp(3.5rem,9vw,7.4rem)] font-medium leading-[0.94] tracking-[-0.035em]"
          >
            <Words text="Museu" />{' '}
            <span className="italic text-copper-light">
              <Words text="Carajás." />
            </span>
          </h1>

          <p className="hero-sub mx-auto mt-8 max-w-2xl text-[16px] leading-relaxed text-parchment/90 sm:text-[18px]">
            Preservando registros históricos, fotografias, vídeos e documentos que contam a memória
            viva de Parauapebas e da região de Carajás.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="hero-cta">
              <ButtonLink href="#galeria" variant="light">
                Explorar registros
                <ArrowDown
                  size={15}
                  strokeWidth={1.8}
                  className="transition group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </ButtonLink>
            </div>
            <div className="hero-cta">
              <ButtonLink href="#contribua" variant="outline-light">
                Enviar um registro
                <ArrowUpRight
                  size={15}
                  strokeWidth={1.8}
                  className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </ButtonLink>
            </div>
          </div>
        </div>

        <p className="hero-meta mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-parchment/80">
          Fotografia: {photoCredit} (2023) · {visit.addressLine1} · {museum.city} – {museum.stateCode}
        </p>
      </div>
    </section>
  )
}
