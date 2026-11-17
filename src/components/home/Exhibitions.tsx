import { Archive, ArrowRight, GraduationCap, Mail } from 'lucide-react'
import { buildMailto } from '../../lib/utils'
import { ButtonLink } from '../ui/Button'
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

        <div className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-7">
            <figure className="img-zoom relative h-full overflow-hidden rounded-[36px] bg-sand-deep">
              <img
                src="/images/museu/museu-05.jpg"
                alt="Painel de abertura da exposição Parauapebas: Conhecer para Preservar, no interior do museu."
                width={1280}
                height={720}
                loading="lazy"
                decoding="async"
                className="h-full min-h-[380px] w-full object-cover object-[42%_center] sm:min-h-[480px] lg:min-h-[560px]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/25 to-transparent"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-6 text-parchment sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-light">
                  Painel expositivo
                </p>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-parchment/90">
                  Prefeitura de Parauapebas / Assessoria de Comunicação (2023)
                </p>
              </figcaption>
            </figure>
          </Reveal>

          <div className="flex flex-col rounded-[36px] bg-cream p-8 sm:p-12 lg:col-span-5">
            <Reveal delay={100}>
              <p className="eyebrow text-clay">A mostra</p>
              <h3 className="display mt-4 text-[clamp(1.7rem,3vw,2.4rem)] font-medium leading-[1.08] text-forest">
                Parauapebas: Conhecer para Preservar
              </h3>
              <p className="display mt-4 text-[clamp(1.15rem,1.8vw,1.4rem)] font-medium leading-snug text-forest/80">
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
              <ButtonLink href="#visite" variant="primary" className="mt-8 lg:mt-10">
                Planeje sua visita
                <ArrowRight
                  size={14}
                  strokeWidth={1.8}
                  className="transition group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </ButtonLink>
            </Reveal>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:mt-8 lg:grid-cols-2 lg:gap-8">
          <Reveal>
            <article className="h-full rounded-[36px] bg-cream p-8 sm:p-12">
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-forest/50 text-forest">
                  <Archive size={20} strokeWidth={1.5} aria-hidden="true" />
                </div>
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
                  <li key={item} className="flex items-start gap-3 text-[13px] leading-relaxed text-ink/75">
                    <span
                      aria-hidden="true"
                      className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-copper"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-6 rounded-2xl bg-parchment/70 p-4 text-xs leading-relaxed text-stone">
                A legislação federal não permite a comercialização de bens arqueológicos. O museu
                recebe doações voluntárias.
              </p>

              <ButtonLink href="#contribua" variant="primary" className="mt-7">
                Contribuir com o acervo
                <ArrowRight
                  size={14}
                  strokeWidth={1.8}
                  className="transition group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </ButtonLink>
            </article>
          </Reveal>

          <Reveal delay={120}>
            <article className="h-full rounded-[36px] bg-cream p-8 sm:p-12 lg:mt-16">
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-forest/50 text-forest">
                  <GraduationCap size={21} strokeWidth={1.5} aria-hidden="true" />
                </div>
              </div>
              <h3 className="display mt-6 text-[clamp(1.9rem,3.4vw,2.7rem)] font-medium leading-none text-forest">
                Projeto Conhecer para Preservar
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
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-forest px-7 py-3.5 text-[12px] font-medium tracking-[0.06em] text-cream transition duration-300 hover:bg-forest-deep"
                >
                  <Mail size={14} strokeWidth={1.7} aria-hidden="true" />
                  Agendar visita escolar
                </a>
                <a
                  href="#educacao"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-forest/60 px-7 py-3.5 text-[12px] font-medium tracking-[0.06em] text-forest transition duration-300 hover:bg-forest hover:text-cream"
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
