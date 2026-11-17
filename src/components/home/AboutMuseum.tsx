import { ArrowDownRight, ExternalLink } from 'lucide-react'
import { hilmarBio, photoCredit, sourceUrl } from '../../data/content'
import { ButtonLink } from '../ui/Button'
import { Reveal } from '../ui/Reveal'

const milestones = [
  { value: '2011', label: 'Criação por lei municipal' },
  { value: '2020', label: 'Abertura ao público' },
  { value: '+11 mil', label: 'Anos de datação na Serra dos Carajás*' },
]

export function AboutMuseum() {
  return (
    <section id="museu" aria-labelledby="museu-title" className="relative bg-parchment">
      {/* 1. Divisão assimétrica: bloco sage que "desce" sobre a faixa escura + retrato arredondado */}
      <div className="site-container relative z-10">
        <div className="grid lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <div className="rounded-b-[40px] bg-cream px-6 pb-14 pt-16 sm:px-10 lg:col-span-5 lg:-mb-14 lg:px-12 lg:pb-16 lg:pt-24">
            <Reveal>
              <p className="eyebrow text-clay">O Museu</p>
              <h2
                id="museu-title"
                className="display mt-5 text-[clamp(2.1rem,3.6vw,3.2rem)] font-medium leading-[1.04] tracking-[-0.025em] text-ink"
              >
                Um museu para lembrar de onde viemos.
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-8 space-y-5 text-[15.5px] leading-[1.8] text-ink/80 sm:text-base">
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
              <dl className="mt-10 flex flex-wrap gap-x-9 gap-y-6">
                {milestones.map((item) => (
                  <div key={item.value} className="max-w-[9.5rem]">
                    <dt className="display text-[clamp(1.9rem,3vw,2.5rem)] font-medium leading-none text-forest">
                      {item.value}
                    </dt>
                    <dd className="mt-2 text-xs leading-snug text-stone">{item.label}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-xs leading-relaxed text-stone">
                *Datação citada pelo arqueólogo do museu em publicação oficial de 2023.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <ButtonLink href="#hilmar" variant="primary" className="mt-10">
                Quem foi Hilmar Harry Kluck
                <ArrowDownRight
                  size={16}
                  strokeWidth={1.7}
                  className="transition group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </ButtonLink>
            </Reveal>
          </div>

          <div className="py-12 lg:col-span-7 lg:pb-28 lg:pt-14">
            <Reveal>
              <div className="relative">
                <figure className="overflow-hidden rounded-[36px] bg-sand-deep shadow-sm">
                  <img
                    src="/images/museu/museu-02.jpg"
                    alt="Placa do Museu de Parauapebas Hilmar Harry Kluck na fachada da sede administrativa, com pintura de folhas ao fundo."
                    width={1280}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/5] w-full object-cover object-center sm:aspect-[5/6]"
                  />
                </figure>

                <figure className="relative -mt-16 ml-auto w-[62%] overflow-hidden rounded-2xl bg-cream shadow-sm sm:-mt-24 sm:w-[52%] lg:-mb-8 lg:-ml-6 lg:mr-auto lg:w-[48%]">
                  <img
                    src="/images/museu/museu-03.jpg"
                    alt="Fotografia histórica de moradores de Parauapebas em uma caminhonete durante o plebiscito, com cartaz em apoio ao município."
                    width={1280}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="px-4 py-3 text-xs leading-snug text-stone">
                    Memória da formação de Parauapebas. {photoCredit} (2023).
                  </figcaption>
                </figure>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* 2. Faixa de declaração em floresta enevoada */}
      <div className="relative z-0 isolate overflow-hidden bg-forest-deep pb-24 pt-28 text-parchment lg:pt-44">
        <img
          src="/images/museu/museu-01.jpg"
          alt=""
          aria-hidden="true"
          width={1280}
          height={720}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-20"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(21,34,28,0.35)_0%,rgba(21,34,28,0.92)_100%)]"
        />

        <div className="site-container">
          <Reveal>
            <blockquote className="mx-auto max-w-3xl text-center">
              <p className="display text-[clamp(1.55rem,3.2vw,2.5rem)] font-light leading-[1.3] text-parchment/90">
                “O acervo do museu é composto por peças da{' '}
                <strong className="font-semibold text-parchment">cultura Xikrin</strong>, mas também
                temos <strong className="font-semibold text-parchment">itens arqueológicos</strong>{' '}
                de povos que habitaram a{' '}
                <strong className="font-semibold text-parchment">região de Carajás</strong> bem antes
                da comunidade Xikrin.”
              </p>
              <footer className="mt-7 text-xs font-medium uppercase tracking-[0.18em] text-parchment/80">
                Rogério Andrade · Arqueólogo do museu
              </footer>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="group mt-9 inline-flex items-center gap-2 rounded-full bg-parchment px-7 py-3 text-[12px] font-medium tracking-[0.06em] text-forest-deep transition hover:bg-cream"
              >
                Fonte oficial
                <ExternalLink
                  size={13}
                  strokeWidth={1.8}
                  className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            </blockquote>
          </Reveal>
        </div>
      </div>

      {/* 3. Homenagem: cartão sage que emerge da faixa escura */}
      <div id="hilmar" className="scroll-mt-28 pb-24 lg:pb-32">
        <div className="site-container">
          <Reveal>
            <div className="relative -mt-16 rounded-[40px] bg-parchment p-8 text-ink sm:p-14 lg:-mt-20">
              <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-4">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border border-forest/50">
                    <span className="display text-4xl font-medium tracking-[-0.04em] text-forest">
                      HHK
                    </span>
                  </div>
                  <p className="eyebrow mt-7 text-stone">Homenagem</p>
                  <h3 className="display mt-4 text-[clamp(1.8rem,3vw,2.6rem)] font-medium leading-[1.05] text-ink">
                    Uma vida dedicada à causa indigenista.
                  </h3>
                </div>

                <div className="lg:col-span-8">
                  <div className="space-y-4 text-[14.5px] leading-[1.8] text-ink/85 sm:text-[15.5px]">
                    {hilmarBio.map((paragraph) => (
                      <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                    ))}
                  </div>
                  <p className="mt-6 border-t border-forest/20 pt-5 text-xs leading-relaxed text-stone">
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
