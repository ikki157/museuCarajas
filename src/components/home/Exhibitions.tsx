import { Archive, ArrowRight, GraduationCap, Mail } from 'lucide-react'
import { buildMailto } from '../../lib/utils'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

export function Exhibitions() {
  return (
    <section
      id="exposicoes"
      aria-labelledby="exposicoes-title"
      className="relative overflow-hidden bg-sand py-24 lg:py-32"
    >
      <div className="site-container">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionHeading
                eyebrow="Exposições e projetos"
                title="Conhecer para preservar."
                titleId="exposicoes-title"
              />
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <Reveal delay={80}>
              <p className="max-w-md text-[14.5px] leading-relaxed text-stone">
                A exposição e os projetos do museu aproximam a comunidade do patrimônio que ajuda a
                contar a história de Parauapebas — e mostram por que ele precisa ser cuidado.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-0">
          <Reveal className="lg:col-span-7">
            <figure className="img-zoom relative h-full overflow-hidden bg-sand-deep">
              <img
                src="/images/museu/museu-05.jpg"
                alt="Painel de abertura da exposição Parauapebas: Conhecer para Preservar, no interior do museu."
                loading="lazy"
                className="h-full min-h-[380px] w-full object-cover object-[42%_center] sm:min-h-[480px] lg:min-h-[560px]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-forest-deep/60 via-transparent to-transparent"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 text-parchment sm:p-8">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-copper-light">
                  Painel expositivo
                </p>
                <p className="mt-2 max-w-md text-[11.5px] leading-relaxed text-parchment/65">
                  Prefeitura de Parauapebas / Assessoria de Comunicação (2023)
                </p>
              </figcaption>
            </figure>
          </Reveal>

          <div className="flex flex-col justify-between border-t border-ink/15 pt-8 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-2 xl:pl-14">
            <Reveal delay={100}>
              <p className="eyebrow text-clay">A mostra</p>
              <h3 className="display mt-4 text-[clamp(1.7rem,3vw,2.4rem)] font-medium leading-[1.08] text-forest">
                Parauapebas: Conhecer para Preservar
              </h3>
              <p className="display mt-4 text-[clamp(1.15rem,1.8vw,1.4rem)] font-medium leading-snug text-forest/70">
                Uma narrativa sobre a memória coletiva da região.
              </p>
              <div className="mt-5 space-y-4 text-[14.5px] leading-relaxed text-stone">
                <p>
                  A exposição apresenta um breve histórico do município e parte dos encontros em
                  torno do patrimônio cultural de Parauapebas. Textos e objetos tradicionais
                  conduzem o visitante por uma narrativa visual sobre a memória local.
                </p>
                <p>
                  O percurso convida a conhecer a cultura indígena Xikrin do Cateté, os vestígios
                  arqueológicos de Carajás e os processos que marcaram a formação da cidade.
                </p>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <a
                href="#visite"
                className="group mt-8 inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-forest transition hover:text-clay lg:mt-10"
              >
                Planeje sua visita
                <ArrowRight
                  size={14}
                  strokeWidth={1.8}
                  className="transition group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            </Reveal>
          </div>
        </div>

        <div className="mt-20 grid gap-14 border-t border-ink/15 pt-12 lg:mt-28 lg:grid-cols-2 lg:gap-20 lg:pt-16">
          <Reveal>
            <article>
              <div className="flex items-start justify-between gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-forest/25 text-forest">
                  <Archive size={20} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <span className="text-[10px] font-medium tabular-nums tracking-[0.2em] text-stone/50">
                  01
                </span>
              </div>
              <h3 className="display mt-6 text-[clamp(1.9rem,3.4vw,2.7rem)] font-medium leading-none text-forest">
                Salvaguarda
              </h3>
              <p className="mt-4 text-[14.5px] leading-relaxed text-stone">
                O acervo do museu é formado principalmente por doações. O projeto incentiva a
                população a compartilhar objetos históricos, documentos, fotografias e artefatos
                arqueológicos, para que essa memória fique à disposição de toda a comunidade.
              </p>

              <ul className="mt-6 space-y-2.5">
                {[
                  'Objetos antigos e itens indígenas',
                  'Fotografias e documentos originais ou cópias',
                  'Registros audiovisuais, sonoros, cartográficos e textuais',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[13px] leading-relaxed text-ink/65">
                    <span
                      aria-hidden="true"
                      className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-copper"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-6 border-l border-clay/40 pl-4 text-[10.5px] leading-relaxed text-stone/75">
                A legislação federal não permite a comercialização de bens arqueológicos. O museu
                recebe doações voluntárias.
              </p>

              <a
                href="#contribua"
                className="group mt-7 inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-clay transition hover:text-clay-dark"
              >
                Contribuir com o acervo
                <ArrowRight
                  size={14}
                  strokeWidth={1.8}
                  className="transition group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            </article>
          </Reveal>

          <Reveal delay={120}>
            <article className="lg:mt-16">
              <div className="flex items-start justify-between gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-forest/25 text-forest">
                  <GraduationCap size={21} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <span className="text-[10px] font-medium tabular-nums tracking-[0.2em] text-stone/50">
                  02
                </span>
              </div>
              <h3 className="display mt-6 text-[clamp(1.9rem,3.4vw,2.7rem)] font-medium leading-none text-forest">
                Conhecer para Preservar
              </h3>
              <p className="mt-4 text-[14.5px] leading-relaxed text-stone">
                Voltado principalmente à comunidade escolar, o projeto promove palestras e
                atividades lúdicas sobre a importância da arqueologia e da preservação do
                patrimônio regional.
              </p>
              <p className="mt-4 text-[14.5px] leading-relaxed text-stone">
                A proposta é aproximar estudantes da história de Parauapebas e da região de Carajás,
                mostrando que a arqueologia também faz parte do presente da cidade.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={buildMailto(
                    'Solicitação de visita escolar — Museu Municipal Hilmar Harry Kluck',
                    'Olá, gostaria de solicitar uma visita escolar ao Museu Municipal Hilmar Harry Kluck. Instituição: \nTurma/quantidade de estudantes: \nData desejada: \nResponsável: ',
                  )}
                  className="group inline-flex items-center gap-2 border border-forest/25 px-4 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-forest transition hover:bg-forest hover:text-parchment"
                >
                  <Mail size={14} strokeWidth={1.7} aria-hidden="true" />
                  Agendar visita escolar
                </a>
                <a
                  href="#educacao"
                  className="group inline-flex items-center gap-2 px-1 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-stone transition hover:text-clay"
                >
                  Ver ações educativas
                  <ArrowRight
                    size={14}
                    strokeWidth={1.8}
                    className="transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
