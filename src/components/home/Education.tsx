import { ArrowRight, Mail } from 'lucide-react'
import { buildMailto } from '../../lib/utils'
import { educationAudiences } from '../../data/content'
import { ButtonLink } from '../ui/Button'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

export function Education() {
  return (
    <section
      id="educacao"
      aria-labelledby="educacao-title"
      className="texture-lines relative overflow-hidden bg-forest py-24 text-parchment lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-0 h-[480px] w-[480px] rounded-full bg-forest-soft/50 blur-3xl"
      />

      <div className="site-container relative">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-start lg:gap-14 xl:gap-20">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionHeading
                tone="light"
                eyebrow="Educação e Cultura"
                title="Conhecer para preservar."
                titleId="educacao-title"
              />
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-7 space-y-4 text-[15px] leading-[1.8] text-parchment/65 sm:text-[15.5px]">
                <p>
                  O projeto Conhecer para Preservar é voltado principalmente à comunidade escolar. A
                  programação envolve palestras e atividades lúdicas sobre a importância da
                  arqueologia e da preservação do patrimônio regional.
                </p>
                <p>
                  A proposta é aproximar estudantes da história de Parauapebas e da região de
                  Carajás, mostrando que a arqueologia também faz parte do presente da cidade.
                </p>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <blockquote className="mt-9 border-l-2 border-copper-light/70 pl-6">
                <p className="display text-[clamp(1.3rem,2.3vw,1.7rem)] font-medium leading-snug text-parchment/90">
                  “Parauapebas é conhecida também como uma área muito importante na arqueologia
                  amazônica, com datação encontrada na Serra dos Carajás com mais de 11 mil anos.”
                </p>
                <footer className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-parchment/35">
                  Rogério Andrade · Arqueólogo do museu
                </footer>
              </blockquote>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-10 border-t border-parchment/15">
                {educationAudiences.map((audience, index) => (
                  <div
                    key={audience.title}
                    className="grid gap-2 border-b border-parchment/15 py-5 sm:grid-cols-[auto_1fr] sm:gap-6"
                  >
                    <span className="text-[9px] font-medium tabular-nums tracking-[0.18em] text-copper-light/80 sm:pt-1">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="display text-[19px] font-medium leading-tight text-parchment">
                        {audience.title}
                      </h3>
                      <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-parchment/50">
                        {audience.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink
                  href={buildMailto(
                    'Solicitação de visita em grupo — Museu Municipal Hilmar Harry Kluck',
                    'Olá, gostaria de solicitar uma visita em grupo ao Museu Municipal Hilmar Harry Kluck. Instituição: \nQuantidade de pessoas: \nData desejada: \nResponsável: ',
                  )}
                  variant="light"
                >
                  <Mail size={15} strokeWidth={1.7} aria-hidden="true" />
                  Solicitar visita em grupo
                </ButtonLink>
                <ButtonLink href="#visite" variant="outline-light">
                  Informações de visitação
                  <ArrowRight
                    size={15}
                    strokeWidth={1.8}
                    className="transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </ButtonLink>
              </div>
              <p className="mt-4 max-w-xl text-[10.5px] leading-relaxed text-parchment/35">
                Visitas de escolas e outras instituições devem ser solicitadas com ofício enviado
                aos e-mails institucionais do museu.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={120}>
              <figure className="relative">
                <div className="img-zoom overflow-hidden bg-forest-soft">
                  <img
                    src="/images/museu/museu-04.jpg"
                    alt="Instrumentos musicais e adornos com plumária em exposição no museu."
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover"
                  />
                </div>
                <figcaption className="absolute -bottom-5 left-4 right-4 border border-parchment/15 bg-forest-deep/95 p-5 text-parchment/55 shadow-2xl backdrop-blur-sm sm:left-6 sm:right-6">
                  <p className="eyebrow text-copper-light">Acervo em diálogo</p>
                  <p className="mt-2 text-[12.5px] leading-relaxed">
                    Instrumentos e adornos ajudam a contar histórias sobre técnicas, saberes e
                    relações culturais na Amazônia.
                  </p>
                  <p className="mt-3 text-[9px] leading-relaxed text-parchment/30">
                    Fotografia: Prefeitura de Parauapebas / Ascom (2023)
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
