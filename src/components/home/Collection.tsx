import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { collectionCategories, photoCredit } from '../../data/content'
import { gsap } from '../../lib/gsap'
import { cn } from '../../lib/utils'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

function getInitialCollectionId(): string {
  if (typeof window === 'undefined') return collectionCategories[0].id
  const param = new URLSearchParams(window.location.search).get('acervo')?.trim()
  if (param && collectionCategories.some((category) => category.id === param)) {
    return param
  }
  return collectionCategories[0].id
}

export function Collection() {
  const sectionRef = useRef<HTMLElement>(null)
  const hasMountedRef = useRef(false)
  const [activeId, setActiveId] = useState(getInitialCollectionId)
  const active =
    collectionCategories.find((category) => category.id === activeId) ?? collectionCategories[0]

  useLayoutEffect(() => {
    // Evita animar fade-out no carregamento inicial antes de o usuário trocar de aba
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    const panel = sectionRef.current?.querySelector<HTMLElement>(`#panel-${active.id}`)
    if (!panel) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        const media = panel.querySelector('.collection-media')
        const captions = panel.querySelectorAll('.collection-caption-item')
        if (media) gsap.set(media, { clearProps: 'all', opacity: 1, scale: 1, clipPath: 'none' })
        if (captions.length) gsap.set(captions, { clearProps: 'all', opacity: 1, y: 0 })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const media = panel.querySelector('.collection-media')
        const captions = panel.querySelectorAll('.collection-caption-item')

        if (media) {
          gsap.fromTo(
            media,
            { opacity: 0, scale: 1.04, clipPath: 'inset(6% 4% 6% 4% round 36px)' },
            {
              opacity: 1,
              scale: 1,
              clipPath: 'inset(0% 0% 0% 0% round 36px)',
              duration: 0.65,
              ease: 'power3.out',
            },
          )
        }

        if (captions.length) {
          gsap.fromTo(
            captions,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.06,
              ease: 'power3.out',
            },
          )
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [active.id])

  const selectCategory = (categoryId: string) => {
    setActiveId(categoryId)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('acervo', categoryId)
      if (!url.hash) url.hash = '#acervo'
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
    }
  }

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
    selectCategory(nextCategory.id)
    window.requestAnimationFrame(() => {
      document.getElementById(`tab-${nextCategory.id}`)?.focus()
    })
  }

  return (
    <section
      ref={sectionRef}
      id="acervo"
      aria-labelledby="acervo-title"
      className="relative overflow-hidden bg-forest-deep py-24 text-parchment lg:py-32"
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
              <p className="max-w-md text-[14.5px] leading-relaxed text-parchment/75">
                Uma coleção formada principalmente por doações e por vestígios que conectam o
                presente de Parauapebas a milhares de anos de história. Percorra as categorias que
                organizam esse patrimônio.
              </p>
              <a
                href="#galeria"
                className="group mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-copper-light transition hover:text-parchment"
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
                className="flex flex-col gap-3"
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
                      onClick={() => selectCategory(category.id)}
                      onKeyDown={(event) => handleTabKeyDown(event, index)}
                      className={cn(
                        'group flex w-full items-center gap-4 rounded-full border px-6 py-4 text-left transition-colors duration-300 sm:px-7 sm:py-5',
                        isActive
                          ? 'border-parchment/60 bg-parchment/10 text-parchment'
                          : 'border-parchment/30 text-parchment/80 hover:border-parchment/60 hover:text-parchment',
                      )}
                    >
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
                            : 'text-parchment/60 group-hover:text-parchment',
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  )
                })}
              </div>

              <p className="mt-5 max-w-sm text-xs leading-relaxed text-parchment/75">
                Categorias e legendas demonstrativas. A classificação curatorial definitiva é de
                responsabilidade do museu.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={100}>
              {collectionCategories.map((category) => {
                const isActive = category.id === active.id

                return (
                  <div
                    key={category.id}
                    id={`panel-${category.id}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${category.id}`}
                    tabIndex={0}
                    hidden={!isActive}
                  >
                    <figure>
                      <div className="collection-media img-zoom relative overflow-hidden rounded-[36px] bg-forest-soft will-change-[transform,opacity,clip-path]">
                        <img
                          src={category.image}
                          alt={category.alt}
                          width={1280}
                          height={720}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[4/3] w-full object-cover"
                          style={{ objectPosition: category.focus ?? 'center' }}
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-forest-deep/45 via-transparent to-transparent"
                        />
                        <p className="absolute left-5 top-5 rounded-full bg-forest-deep/75 px-4 py-2 text-xs font-medium tracking-[0.06em] text-parchment backdrop-blur-sm">
                          {category.title}
                        </p>
                      </div>

                      <figcaption className="mt-7 px-2">
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <p className="collection-caption-item eyebrow text-copper-light">
                              Coleção
                            </p>
                            <h3 className="collection-caption-item display mt-3 text-[clamp(1.6rem,3.2vw,2.35rem)] font-medium leading-[1.08] text-parchment">
                              {category.title}
                            </h3>
                            <p className="collection-caption-item mt-4 max-w-xl text-[14px] leading-relaxed text-parchment/75">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <p className="collection-caption-item mt-5 text-xs leading-relaxed text-parchment/75">
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
