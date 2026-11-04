import { useState, type KeyboardEvent } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { collectionCategories, photoCredit } from '../../data/content'
import { cn } from '../../lib/utils'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

export function Collection() {
  const [activeId, setActiveId] = useState(collectionCategories[0].id)
  const active =
    collectionCategories.find((category) => category.id === activeId) ?? collectionCategories[0]

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = collectionCategories.length - 1
    let nextIndex: number | null = null

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = index === lastIndex ? 0 : index + 1
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = index === 0 ? lastIndex : index - 1
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = lastIndex
    }

    if (nextIndex === null) return

    event.preventDefault()
    const nextCategory = collectionCategories[nextIndex]
    setActiveId(nextCategory.id)
    window.requestAnimationFrame(() => {
      document.getElementById(`tab-${nextCategory.id}`)?.focus()
    })
  }

  return (
    <section
      id="acervo"
      aria-labelledby="acervo-title"
      className="texture-lines relative overflow-hidden bg-forest-deep py-24 text-parchment lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 top-10 h-[600px] w-[600px] rounded-full bg-forest-soft/40 blur-3xl"
      />

      <div className="site-container relative">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionHeading
                tone="light"
                eyebrow="Acervo e coleções"
                title="Objetos que guardam histórias."
                titleId="acervo-title"
              />
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <Reveal delay={80}>
              <p className="max-w-md text-[14.5px] leading-relaxed text-parchment/58">
                Uma coleção formada principalmente por doações e por vestígios que conectam o
                presente de Parauapebas a milhares de anos de história. Percorra as categorias que
                organizam esse patrimônio.
              </p>
              <a
                href="#galeria"
                className="group mt-6 inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-copper-light transition hover:text-parchment"
              >
                Ver galeria de fotografias
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

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Reveal>
              <div
                role="tablist"
                aria-label="Categorias do acervo"
                aria-orientation="vertical"
                className="border-t border-parchment/15"
              >
                {collectionCategories.map((category, index) => {
                  const isActive = category.id === active.id

                  return (
                    <button
                      key={category.id}
                      id={`tab-${category.id}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`panel-${category.id}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveId(category.id)}
                      onKeyDown={(event) => handleTabKeyDown(event, index)}
                      className={cn(
                        'group flex w-full items-center gap-4 border-b border-parchment/15 py-4 text-left transition-colors duration-300 sm:gap-5 sm:py-5',
                        isActive
                          ? 'text-parchment'
                          : 'text-parchment/48 hover:text-parchment/80',
                      )}
                    >
                      <span
                        className={cn(
                          'text-[9.5px] font-medium tabular-nums tracking-[0.18em] transition-colors',
                          isActive ? 'text-copper-light' : 'text-parchment/25',
                        )}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={cn(
                          'display flex-1 text-[clamp(1.15rem,2.4vw,1.55rem)] font-medium leading-tight tracking-[-0.01em] transition-colors',
                          isActive && 'text-copper-light',
                        )}
                      >
                        {category.title}
                      </span>
                      <ArrowUpRight
                        size={15}
                        strokeWidth={1.5}
                        className={cn(
                          'shrink-0 transition-all duration-300',
                          isActive
                            ? 'translate-x-0.5 -translate-y-0.5 text-copper-light'
                            : 'text-parchment/20 group-hover:text-parchment/50',
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  )
                })}
              </div>

              <p className="mt-5 max-w-sm text-[10px] leading-relaxed text-parchment/28">
                Categorias e legendas demonstrativas. A classificação curatorial definitiva é de
                responsabilidade do museu.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={100}>
              {collectionCategories.map((category, index) => {
                const isActive = category.id === active.id

                return (
                  <div
                    key={category.id}
                    id={`panel-${category.id}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${category.id}`}
                    tabIndex={0}
                    hidden={!isActive}
                    className={isActive ? 'animate-fade-in' : undefined}
                  >
                    <figure>
                      <div className="img-zoom relative overflow-hidden bg-forest-soft">
                        <img
                          src={category.image}
                          alt={category.alt}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover"
                          style={{ objectPosition: category.focus ?? 'center' }}
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-forest-deep/45 via-transparent to-transparent"
                        />
                        <p className="absolute left-4 top-4 border border-parchment/25 bg-forest-deep/55 px-3 py-1.5 text-[8.5px] font-semibold uppercase tracking-[0.18em] text-parchment/80 backdrop-blur-sm">
                          Acervo · {String(index + 1).padStart(2, '0')}
                        </p>
                      </div>

                      <figcaption className="mt-6 border-t border-parchment/15 pt-5">
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <p className="eyebrow text-copper-light">Coleção</p>
                            <h3 className="display mt-3 text-[clamp(1.6rem,3.2vw,2.35rem)] font-medium leading-[1.08] text-parchment">
                              {category.title}
                            </h3>
                            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-parchment/58">
                              {category.description}
                            </p>
                          </div>
                          <span className="hidden shrink-0 pt-1 text-[10px] tabular-nums tracking-[0.16em] text-parchment/30 sm:block">
                            {String(index + 1).padStart(2, '0')} /{' '}
                            {String(collectionCategories.length).padStart(2, '0')}
                          </span>
                        </div>
                        <p className="mt-5 text-[9.5px] leading-relaxed text-parchment/28">
                          Fotografia do acervo expositivo · {photoCredit} (2023)
                        </p>
                      </figcaption>
                    </figure>
                  </div>
                )
              })}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
