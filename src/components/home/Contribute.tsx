import { ArrowUpRight, Mail } from 'lucide-react'
import { donationItems, sourceUrl, visit } from '../../data/content'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { ContributionForm } from './ContributionForm'

export function Contribute() {
  return (
    <section
      id="contribua"
      aria-labelledby="contribua-title"
      className="relative overflow-hidden bg-sand py-24 lg:py-32"
    >
      <div className="site-container">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16 xl:gap-20">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionHeading
                eyebrow="Contribua com o Museu"
                title="Sua memória também é patrimônio."
                titleId="contribua-title"
              />
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-7 space-y-4 text-[15px] leading-relaxed text-stone">
                <p>
                  O acervo do Museu Municipal Hilmar Harry Kluck é formado principalmente por
                  doações. Objetos, fotografias e documentos guardados por famílias e instituições
                  ajudam a contar a história de Parauapebas.
                </p>
                <p>
                  Se você tem um item ou uma memória para compartilhar, envie as informações para
                  análise da equipe do museu. A contribuição não é publicada automaticamente.
                </p>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-9 border-t border-ink/15 pt-6">
                <p className="eyebrow text-clay">O que compartilhar</p>
                <ul className="mt-4 space-y-3">
                  {donationItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-[13px] leading-relaxed text-ink/70"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-copper"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-8 grid gap-5 border-y border-ink/15 py-5 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">
                    Fotografias
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone">
                    JPG, PNG ou WEBP
                    <br />
                    Até 10 MB
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">
                    Documentos
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone">
                    PDF
                    <br />
                    Até 15 MB
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-6 space-y-3 text-[11px] leading-relaxed text-stone">
                <p>
                  Os dados enviados serão utilizados pela equipe do museu apenas para análise e
                  contato sobre esta contribuição.
                </p>
                <p className="flex items-start gap-2">
                  <Mail size={14} className="mt-0.5 shrink-0 text-clay" aria-hidden="true" />
                  <span>
                    Prefere falar por e-mail?{' '}
                    <a
                      href={`mailto:${visit.emails[0]}`}
                      className="break-all text-forest underline decoration-forest/25 underline-offset-4 transition hover:text-clay"
                    >
                      {visit.emails[0]}
                    </a>
                  </span>
                </p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="group mt-7 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-clay transition hover:text-clay-dark"
              >
                Sobre o projeto Salvaguarda
                <ArrowUpRight
                  size={13}
                  strokeWidth={1.8}
                  className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={100}>
              <ContributionForm />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
