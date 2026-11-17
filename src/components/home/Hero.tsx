import { useRef } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { heroImage, museum, photoCredit, visit } from '../../data/content'
import { gsap, useGSAP } from '../../lib/gsap'
import { ButtonLink } from '../ui/Button'

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")"

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

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Entrada orquestrada
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
        tl.from('.hero-bg', { scale: 1.35, duration: 2.4, ease: 'power3.out' }, 0)
          .from('.hero-veil', { opacity: 0, duration: 1.2 }, 0)
          .from('.hero-eyebrow > *', { opacity: 0, y: 14, stagger: 0.08, duration: 0.8 }, 0.35)
          .from('.hero-word', { yPercent: 115, rotate: 4, stagger: 0.07, duration: 1.2 }, 0.45)
          .from('.hero-sub', { opacity: 0, y: 24, duration: 1 }, 1.0)
          .from('.hero-cta', { opacity: 0, y: 24, stagger: 0.1, duration: 0.9 }, 1.15)
          .from('.hero-meta', { opacity: 0, y: 20, stagger: 0.08, duration: 0.8 }, 1.35)
          .from('.hero-line', { scaleX: 0, transformOrigin: 'left', duration: 1.4 }, 1.2)

        // Parallax por camadas no scroll
        const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
        gsap.to('.hero-bg-wrap', { yPercent: 22, ease: 'none', scrollTrigger: st })
        gsap.to('.hero-glow', { yPercent: -35, ease: 'none', scrollTrigger: st })
        gsap.to('.hero-content', { yPercent: -12, opacity: 0.15, ease: 'none', scrollTrigger: st })
        gsap.to('.hero-side', { yPercent: -60, ease: 'none', scrollTrigger: st })

        // Cursor: profundidade e luz que acompanha o mouse
        const bgX = gsap.quickTo('.hero-bg', 'x', { duration: 1.2, ease: 'power3' })
        const bgY = gsap.quickTo('.hero-bg', 'y', { duration: 1.2, ease: 'power3' })
        const glX = gsap.quickTo('.hero-glow', 'x', { duration: 1.6, ease: 'power3' })
        const glY = gsap.quickTo('.hero-glow', 'y', { duration: 1.6, ease: 'power3' })
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5
          const ny = e.clientY / window.innerHeight - 0.5
          bgX(nx * -28)
          bgY(ny * -20)
          glX(nx * 160)
          glY(ny * 120)
        }
        const el = root.current
        el?.addEventListener('pointermove', onMove)
        return () => el?.removeEventListener('pointermove', onMove)
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="inicio"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-forest-deep text-parchment"
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

      <div
        aria-hidden="true"
        className="hero-veil absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(16,33,25,0.96)_0%,rgba(16,33,25,0.84)_45%,rgba(16,33,25,0.6)_100%)]"
      />
      <div
        aria-hidden="true"
        className="hero-veil absolute inset-0 -z-20 bg-[linear-gradient(0deg,rgba(16,33,25,0.98)_0%,rgba(16,33,25,0.15)_46%,rgba(16,33,25,0.5)_100%)]"
      />
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute -right-[10%] top-[8%] -z-10 h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(217,160,106,0.28)_0%,rgba(184,115,51,0.1)_40%,transparent_68%)] blur-2xl will-change-transform"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.14] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <div className="hero-content site-container relative flex flex-1 flex-col justify-end pb-9 pt-32 will-change-transform sm:pb-11 lg:pt-40">
        <div className="grid items-end gap-10 xl:grid-cols-12">
          <div className="max-w-[1100px] xl:col-span-10">
            <p className="hero-eyebrow eyebrow flex flex-wrap items-center gap-3 text-parchment/85">
              <span className="h-px w-8 bg-copper-light" aria-hidden="true" />
              <span>Museu Municipal Hilmar Harry Kluck</span>
              <span className="hidden h-1 w-1 rounded-full bg-copper-light sm:block" aria-hidden="true" />
              <span className="text-parchment/80">Parauapebas · Pará</span>
            </p>

            <h1
              id="hero-title"
              className="display mt-7 text-[clamp(2.9rem,7vw,6.6rem)] font-medium leading-[0.94] tracking-[-0.035em]"
            >
              <span className="block">
                <Words text="Uma história que" />
              </span>
              <span className="block italic text-copper-light">
                <Words text="atravessa gerações." />
              </span>
            </h1>

            <p className="hero-sub mt-8 max-w-2xl text-[16px] leading-relaxed text-parchment/90 sm:text-[17.5px]">
              Descubra a memória, a arqueologia e a riqueza cultural de Parauapebas e da região de
              Carajás.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <div className="hero-cta">
                <ButtonLink href="#acervo" variant="light">
                  Explore o acervo
                  <ArrowDown
                    size={15}
                    strokeWidth={1.8}
                    className="transition group-hover:translate-y-0.5"
                    aria-hidden="true"
                  />
                </ButtonLink>
              </div>
              <div className="hero-cta">
                <ButtonLink href="#visite" variant="outline-light">
                  Planeje sua visita
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

          <div className="hero-side hidden justify-end pb-2 xl:col-span-2 xl:flex">
            <p className="rounded-sm bg-forest-deep/70 px-2 py-3 text-xs font-semibold uppercase leading-[2.2] tracking-[0.24em] text-parchment/90 [writing-mode:vertical-rl]">
              Amazônia · Carajás · Memória
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 pt-5 sm:mt-20">
          <div className="hero-line h-px w-full bg-parchment/30" aria-hidden="true" />
          <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
            {[
              ['Acervo', 'Cultura Xikrin e arqueologia de Carajás'],
              ['Visitação', 'Consulte horários e agendamento'],
              ['Origem', 'Criado em 2011 · Aberto ao público em 2020'],
            ].map(([title, text]) => (
              <div key={title} className="hero-meta">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-light">
                  {title}
                </p>
                <p className="mt-1.5 text-[13px] leading-snug text-parchment/90">{text}</p>
              </div>
            ))}
          </div>

          <div className="hero-meta flex flex-col gap-2 text-xs text-parchment/80 sm:flex-row sm:items-center sm:justify-between">
            <p>Fotografia: {photoCredit} (2023)</p>
            <p>
              {visit.addressLine1} · {museum.city} – {museum.stateCode}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
