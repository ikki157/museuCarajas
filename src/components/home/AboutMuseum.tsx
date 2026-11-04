import { ArrowDownRight, ExternalLink } from 'lucide-react'
import { hilmarBio, photoCredit, sourceUrl } from '../../data/content'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

export function AboutMuseum() {
  return (
    <section
      id="museu"
      aria-labelledby="museu-title"
      className="relative overflow-hidden bg-parchment py-24 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-24 h-[520px] w-[520px] rounded-full bg-sand/70 blur-3xl"
      />

      <div className="site-container relative">
        <div className="grid gap-20 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <div className="relative lg:col-span-5">
            <Reveal>
              <div className="relative pr-4 sm:pr-8">
                <span
                  aria-hidden="true"
                  className="absolute -left-3 top-16 hidden h-36 w-px bg-copper/45 sm:block"
                />
                <figure className="relative overflow-hidden rounded-t-[130px] bg-sand-deep sm:rounded-t-[160px]">
                  <img
                    src="/images/museu/museu-02.jpg"
                    alt="Placa do Museu de Parauapebas Hilmar Harry Kluck na fachada da sede administrativa, com pintura de folhas ao fundo."
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover object-center sm:aspect-[5/4]"
                  />
                </figure>

                <figure className="relative -mt-16 ml-auto w-[58%] border-[6px] border-parchment bg-sand-deep shadow-[0_24px_60px_-28px_rgba(16,33,25,0.45)] sm:-mt-20 sm:mr-2 lg:-mr-4">
                  <img
                    src="/images/museu/museu-03.jpg"
                    alt="Fotografia histórica de moradores de Parauapebas em uma caminhonete durante o plebiscito, com cartaz em apoio ao município."
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="bg-parchment px-3 py-2.5 text-[9.5px] leading-snug text-stone">
                    Memória da formação de Parauapebas. {photoCredit} (2023).
                  </figcaption>
                </figure>

                <p className="absolute -left-1 top-[58%] hidden origin-bottom-left -rotate-90 text-[9px] font-semibold uppercase tracking-[0.32em] text-stone/55 sm:block">
                  Desde 2011
                </p>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:pt-6">
            <Reveal>
              <SectionHeading
                eyebrow="O Museu"
                title="Um museu para lembrar de onde viemos."
                titleId="museu-title"
              />
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-8 space-y-5 text-[15.5px] leading-[1.8] text-ink/72 sm:text-base">
                <p>
                  Criado em 2011 por lei municipal e aberto ao público em 2020, o Museu Municipal
                  Hilmar Harry Kluck é ligado à Secretaria Municipal de Cultura (Secult). Seu espaço
                  expositivo conta a história de Parauapebas por meio da cultura indígena Xikrin do
                  Cateté e do processo migratório que marca a formação do município.
                </p>
                <p>
                  O acervo reúne peças da cultura Xikrin e itens arqueológicos de povos que
                  habitaram a região de Carajás muito antes da comunidade Xikrin, como lâminas de
                  machado lítico, objetos de pedra e osso e vasilhas cerâmicas.
                </p>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <blockquote className="mt-9 border-l-2 border-copper pl-6">
                <p className="display text-[clamp(1.25rem,2.2vw,1.6rem)] font-medium leading-snug text-forest">
                  “O acervo do museu é composto por peças da cultura Xikrin, mas também temos itens
                  arqueológicos de povos que habitaram a região de Carajás bem antes da comunidade
                  Xikrin.”
                </p>
                <footer className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                  Rogério Andrade · Arqueólogo do museu
                </footer>
              </blockquote>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-10 grid grid-cols-3 divide-x divide-line border-y border-line">
                <div className="py-5 pr-3">
                  <p className="display text-[clamp(1.9rem,3.4vw,2.8rem)] font-medium leading-none text-clay">
                    2011
                  </p>
                  <p className="mt-2 text-[10.5px] leading-snug text-stone">Criação por lei municipal</p>
                </div>
                <div className="px-3 py-5 sm:px-5">
                  <p className="display text-[clamp(1.9rem,3.4vw,2.8rem)] font-medium leading-none text-clay">
                    2020
                  </p>
                  <p className="mt-2 text-[10.5px] leading-snug text-stone">Abertura ao público</p>
                </div>
                <div className="py-5 pl-3 sm:pl-5">
                  <p className="display text-[clamp(1.9rem,3.4vw,2.8rem)] font-medium leading-none text-clay">
                    +11 mil
                  </p>
                  <p className="mt-2 text-[10.5px] leading-snug text-stone">
                    Anos de datação na Serra dos Carajás*
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10.5px] leading-relaxed text-stone/70">
                  *Datação citada pelo arqueólogo do museu em publicação oficial de 2023.
                </p>
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group inline-flex shrink-0 items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-clay transition hover:text-clay-dark"
                >
                  Fonte oficial
                  <ExternalLink
                    size={13}
                    strokeWidth={1.8}
                    className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <a
                href="#hilmar"
                className="group mt-10 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest transition hover:text-clay"
              >
                Quem foi Hilmar Harry Kluck
                <ArrowDownRight
                  size={16}
                  strokeWidth={1.7}
                  className="transition group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
            </Reveal>
          </div>
        </div>

        <div id="hilmar" className="mt-24 scroll-mt-28 lg:mt-32">
          <Reveal>
            <div className="texture-lines relative overflow-hidden bg-forest px-6 py-12 text-parchment sm:px-10 lg:px-14 lg:py-16">
              <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-4">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border border-copper/45">
                    <span className="display text-4xl font-medium tracking-[-0.04em] text-copper-light">
                      HHK
                    </span>
                  </div>
                  <p className="eyebrow mt-7 text-parchment/40">Homenagem</p>
                  <h3 className="display mt-4 text-[clamp(1.8rem,3vw,2.6rem)] font-medium leading-[1.05] text-parchment">
                    Uma vida dedicada à causa indigenista.
                  </h3>
                </div>

                <div className="lg:col-span-8">
                  <div className="space-y-4 text-[14.5px] leading-[1.8] text-parchment/68 sm:text-[15.5px]">
                    {hilmarBio.map((paragraph) => (
                      <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                    ))}
                  </div>
                  <p className="mt-6 border-t border-parchment/15 pt-5 text-[10.5px] leading-relaxed text-parchment/35">
                    Biografia baseada na publicação oficial da Prefeitura de Parauapebas (2023).
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
