import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { heroImage, museum, photoCredit, visit } from '../../data/content'
import { ButtonLink } from '../ui/Button'

export function Hero() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-forest-deep text-parchment"
    >
      <img
        src={heroImage.src}
        alt={heroImage.alt}
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[58%_center]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(16,33,25,0.97)_0%,rgba(16,33,25,0.86)_38%,rgba(16,33,25,0.35)_72%,rgba(16,33,25,0.2)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(16,33,25,0.96)_0%,rgba(16,33,25,0.1)_46%,rgba(16,33,25,0.45)_100%)]"
      />

      <div className="site-container relative flex flex-1 flex-col justify-end pb-9 pt-32 sm:pb-11 lg:pt-40">
        <div className="grid items-end gap-10 xl:grid-cols-12">
          <div className="max-w-[880px] xl:col-span-10">
            <p className="eyebrow flex flex-wrap items-center gap-3 text-parchment/60">
              <span className="h-px w-8 bg-copper-light" aria-hidden="true" />
              Museu Municipal Hilmar Harry Kluck
              <span className="hidden h-1 w-1 rounded-full bg-copper-light sm:block" aria-hidden="true" />
              <span className="text-parchment/45">Parauapebas · Pará</span>
            </p>

            <h1
              id="hero-title"
              className="display mt-7 text-[clamp(3.05rem,8.4vw,7.4rem)] font-medium leading-[0.92] tracking-[-0.035em]"
            >
              <span className="block">Uma história que</span>
              <span className="block italic text-copper-light">atravessa gerações.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-[16px] leading-relaxed text-parchment/72 sm:text-[17.5px]">
              Descubra a memória, a arqueologia e a riqueza cultural de Parauapebas e da região de
              Carajás.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href="#acervo" variant="light">
                Explore o acervo
                <ArrowDown
                  size={15}
                  strokeWidth={1.8}
                  className="transition group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </ButtonLink>
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

          <div className="hidden justify-end pb-2 xl:col-span-2 xl:flex">
            <p className="text-[9px] font-semibold uppercase leading-[2.2] tracking-[0.32em] text-parchment/35 [writing-mode:vertical-rl]">
              Amazônia · Carajás · Memória
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-parchment/20 pt-5 sm:mt-20">
          <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-copper-light">
                Acervo
              </p>
              <p className="mt-1.5 text-[13px] leading-snug text-parchment/75">
                Cultura Xikrin e arqueologia de Carajás
              </p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-copper-light">
                Visitação
              </p>
              <p className="mt-1.5 text-[13px] leading-snug text-parchment/75">
                Consulte horários e agendamento
              </p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-copper-light">
                Origem
              </p>
              <p className="mt-1.5 text-[13px] leading-snug text-parchment/75">
                Criado em 2011 · Aberto ao público em 2020
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-[10px] text-parchment/30 sm:flex-row sm:items-center sm:justify-between">
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
