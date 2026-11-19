import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  ImageOff,
  Maximize2,
  Play,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { useGaleria } from '../../hooks/useGaleria'
import {
  filterGaleriaItems,
  getGaleriaImageUrl,
  getGaleriaThumbnailUrl,
  type GaleriaItem,
  type GaleriaMediaType,
} from '../../lib/galeria'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { isSupabaseConfigured, supabaseConfigIssue } from '../../lib/supabase'
import { cn, formatDate } from '../../lib/utils'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { GalleryLightbox } from './GalleryLightbox'

const ALL_CATEGORIES = 'Todas'
const ALL_MEDIA = 'todos'

type MediaFilter = typeof ALL_MEDIA | GaleriaMediaType

const MEDIA_FILTERS: ReadonlyArray<{ value: MediaFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'fotografia', label: 'Fotografias' },
  { value: 'video', label: 'Vídeos' },
  { value: 'documento', label: 'Documentos' },
]

const MEDIA_BADGES: Record<GaleriaMediaType, string> = {
  fotografia: 'Fotografia',
  video: 'Vídeo',
  documento: 'Documento',
}

function getInitialMediaFilter(): MediaFilter {
  if (typeof window === 'undefined') return ALL_MEDIA
  const param = new URLSearchParams(window.location.search).get('midia')?.trim()
  if (param === 'fotografia' || param === 'video' || param === 'documento') {
    return param
  }
  return ALL_MEDIA
}

function GalleryCard({
  item,
  onOpen,
}: {
  item: GaleriaItem
  onOpen: () => void
}) {
  const mediaUrl = getGaleriaImageUrl(item)
  const thumbnailUrl = getGaleriaThumbnailUrl(item)
  const canOpen = Boolean(mediaUrl || item.midia_externa_url)

  const actionLabel =
    item.tipo_midia === 'video'
      ? `Reproduzir vídeo: ${item.titulo}`
      : item.tipo_midia === 'documento'
        ? `Abrir documento: ${item.titulo}`
        : `Ampliar fotografia: ${item.titulo}`

  return (
    <figure className="gallery-card-item group w-[84vw] shrink-0 snap-start sm:w-[360px] lg:w-[400px]">
      <button
        type="button"
        onClick={onOpen}
        disabled={!canOpen}
        aria-label={actionLabel}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-[28px] bg-sand-deep text-left disabled:cursor-default"
      >
        {item.tipo_midia === 'video' ? (
          <>
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={
                  item.descricao
                    ? `${item.titulo}. ${item.descricao}`
                    : item.titulo
                }
                width={1200}
                height={900}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-700 ease-museum group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full flex-col justify-end bg-[radial-gradient(circle_at_top_right,rgba(79,102,88,0.45),rgba(21,34,28,0.98))] p-6 text-parchment">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-copper-light">
                  {item.formato === 'youtube' || item.formato === 'vimeo'
                    ? item.formato
                    : 'Acervo Audiovisual'}
                </p>
                <p className="display mt-1 line-clamp-2 text-lg leading-snug text-parchment/90">
                  {item.titulo}
                </p>
              </div>
            )}

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-forest-deep/30 transition duration-500 group-hover:bg-forest-deep/15"
            />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-parchment/95 text-forest-deep shadow-lg transition duration-300 group-hover:scale-105"
            >
              <Play
                size={18}
                strokeWidth={1.8}
                fill="currentColor"
                className="ml-0.5"
              />
            </span>
          </>
        ) : item.tipo_midia === 'documento' ? (
          <div className="flex h-full w-full flex-col justify-between border border-line/80 bg-cream p-6 text-ink transition duration-500 group-hover:bg-parchment/80">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-parchment">
                <FileText size={18} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
                  Documento Histórico
                </p>
                {item.periodo_estimado ? (
                  <p className="truncate text-xs text-forest">
                    {item.periodo_estimado}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <p className="display line-clamp-2 text-[19px] font-medium leading-snug text-forest">
                {item.titulo}
              </p>
              {item.localizacao ? (
                <p className="mt-1.5 truncate text-xs text-stone">
                  {item.localizacao}
                </p>
              ) : null}
            </div>
          </div>
        ) : mediaUrl ? (
          <img
            src={mediaUrl}
            alt={
              item.descricao
                ? `${item.titulo}. ${item.descricao}`
                : item.titulo
            }
            width={1200}
            height={900}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-700 ease-museum group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-sand text-stone">
            <ImageOff size={24} strokeWidth={1.4} aria-hidden="true" />
            <span className="text-xs uppercase tracking-[0.16em]">
              Mídia indisponível
            </span>
          </div>
        )}

        <span className="absolute right-4 top-4 rounded-full bg-forest-deep/80 px-3 py-1 text-xs font-medium tracking-[0.04em] text-cream backdrop-blur-sm">
          {item.tipo_midia === 'fotografia'
            ? item.formato.toUpperCase()
            : MEDIA_BADGES[item.tipo_midia]}
        </span>

        {item.tipo_midia === 'fotografia' && mediaUrl ? (
          <span
            aria-hidden="true"
            className="absolute bottom-3.5 right-3.5 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-parchment/90 text-forest opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Maximize2 size={14} strokeWidth={1.7} aria-hidden="true" />
          </span>
        ) : null}
      </button>

      <figcaption className="pt-4">
        <div className="flex items-center justify-between gap-3 text-xs text-stone">
          <span className="truncate font-medium text-forest">
            {item.categoria}
          </span>
          <span className="shrink-0">
            {item.periodo_estimado ?? formatDate(item.criado_em)}
          </span>
        </div>
        <h3 className="display mt-1.5 line-clamp-1 text-[19px] font-medium leading-tight text-forest">
          {item.titulo}
        </h3>
        {item.descricao ? (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-stone">
            {item.descricao}
          </p>
        ) : null}
        <p className="mt-2 truncate text-xs text-stone/90">
          {item.localizacao ? `${item.localizacao} · ` : ''}
          {item.credito ?? 'Acervo Museu Carajás'}
        </p>
      </figcaption>
    </figure>
  )
}

function GallerySkeleton() {
  return (
    <div
      className="no-scrollbar flex gap-6 overflow-x-auto pb-4"
      role="status"
      aria-live="polite"
    >
      {[0, 1, 2, 3].map((slot) => (
        <div
          key={slot}
          aria-hidden="true"
          className="w-[84vw] shrink-0 sm:w-[360px] lg:w-[400px]"
        >
          <div className="animate-shimmer aspect-[4/3] w-full rounded-[28px] bg-[linear-gradient(90deg,#c3cbbd_25%,#dce2d6_50%,#c3cbbd_75%)]" />
          <div className="mt-4 h-3 w-24 animate-pulse rounded bg-sand" />
          <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-sand" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-sand" />
        </div>
      ))}
      <span className="sr-only">Carregando registros do acervo</span>
    </div>
  )
}

export function Gallery() {
  const { items, loading, error, refresh } = useGaleria()
  const [selectedMediaType, setSelectedMediaType] =
    useState<MediaFilter>(getInitialMediaFilter)
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (typeof window === 'undefined') return ALL_CATEGORIES
    return (
      new URLSearchParams(window.location.search).get('categoria')?.trim() ||
      ALL_CATEGORIES
    )
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [lightboxId, setLightboxId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(window.location.search).get('foto')?.trim() || null
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const carouselRef = useRef<HTMLDivElement>(null)

  const syncGalleryUrl = (
    nextMediaType: MediaFilter,
    nextCategory: string,
    nextPhotoId: string | null,
  ) => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)

    if (nextMediaType && nextMediaType !== ALL_MEDIA) {
      url.searchParams.set('midia', nextMediaType)
    } else {
      url.searchParams.delete('midia')
    }

    if (nextCategory && nextCategory !== ALL_CATEGORIES) {
      url.searchParams.set('categoria', nextCategory)
    } else {
      url.searchParams.delete('categoria')
    }

    if (nextPhotoId) {
      url.searchParams.set('foto', nextPhotoId)
    } else {
      url.searchParams.delete('foto')
    }

    window.history.replaceState(
      null,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    )
  }

  const categories = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.categoria))).sort((a, b) =>
        a.localeCompare(b, 'pt-BR'),
      ),
    [items],
  )

  const filteredItems = useMemo(
    () =>
      filterGaleriaItems(items, {
        query: searchQuery,
        mediaType: selectedMediaType,
        category: selectedCategory,
      }),
    [items, searchQuery, selectedCategory, selectedMediaType],
  )

  const lightboxIndex = lightboxId
    ? filteredItems.findIndex((item) => item.id === lightboxId)
    : -1

  useEffect(() => {
    if (loading || items.length === 0) return
    if (
      selectedCategory !== ALL_CATEGORIES &&
      !categories.includes(selectedCategory)
    ) {
      setSelectedCategory(ALL_CATEGORIES)
    }
  }, [categories, items.length, loading, selectedCategory])

  useEffect(() => {
    if (loading || items.length === 0) return
    if (lightboxId && lightboxIndex === -1) setLightboxId(null)
  }, [items.length, lightboxId, lightboxIndex, loading])

  const updateScrollButtons = useCallback(() => {
    const el = carouselRef.current
    if (!el) {
      setCanScrollPrev(false)
      setCanScrollNext(false)
      return
    }
    const tolerance = 4
    setCanScrollPrev(el.scrollLeft > tolerance)
    setCanScrollNext(
      el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance,
    )
  }, [])

  useEffect(() => {
    const rafId = window.requestAnimationFrame(updateScrollButtons)
    window.addEventListener('resize', updateScrollButtons)
    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', updateScrollButtons)
    }
  }, [filteredItems.length, loading, updateScrollButtons])

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    el.style.scrollBehavior = ''
    el.style.scrollSnapType = ''
    el.scrollTo({ left: 0, behavior: 'smooth' })
  }, [searchQuery, selectedMediaType, selectedCategory])

  useEffect(() => {
    const el = carouselRef.current
    if (!el || loading || filteredItems.length === 0) return

    const handleWheel = (event: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

      const tolerance = 2
      const atStart = el.scrollLeft <= tolerance
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - tolerance
      const shouldScrollHorizontally =
        (event.deltaY > 0 && !atEnd) || (event.deltaY < 0 && !atStart)

      if (!shouldScrollHorizontally) return

      event.preventDefault()
      event.stopPropagation()

      const delta =
        event.deltaMode === 1
          ? event.deltaY * 32
          : event.deltaMode === 2
            ? event.deltaY * el.clientWidth
            : event.deltaY

      el.style.scrollBehavior = 'auto'
      el.style.scrollSnapType = 'none'
      el.scrollLeft += delta
      updateScrollButtons()
    }

    const handleTouchStart = () => {
      el.style.scrollSnapType = ''
      el.style.scrollBehavior = ''
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    el.addEventListener('touchstart', handleTouchStart, { passive: true })

    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('touchstart', handleTouchStart)
    }
  }, [filteredItems.length, loading, updateScrollButtons])

  const scrollCarousel = (direction: 'prev' | 'next') => {
    const el = carouselRef.current
    if (!el) return
    el.style.scrollBehavior = ''
    el.style.scrollSnapType = ''
    const firstCard = el.querySelector<HTMLElement>('.gallery-card-item')
    const styles = window.getComputedStyle(el)
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '24') || 24
    const step = firstCard ? firstCard.getBoundingClientRect().width + gap : 400
    el.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth',
    })
  }

  const hasItems = items.length > 0
  const showFilters = isSupabaseConfigured || hasItems
  const hasActiveFilters =
    selectedMediaType !== ALL_MEDIA ||
    selectedCategory !== ALL_CATEGORIES ||
    searchQuery.trim().length > 0

  useLayoutEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || loading || filteredItems.length === 0) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      const cards = gsap.utils.toArray<HTMLElement>('.gallery-card-item')
      if (!cards.length) return

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(cards, { clearProps: 'all', opacity: 1, y: 0 })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.06,
            ease: 'power3.out',
            clearProps: 'opacity,transform',
            scrollTrigger: {
              trigger: carousel,
              start: 'top 90%',
              once: true,
            },
          },
        )
        ScrollTrigger.refresh()
      })
    }, carouselRef)

    return () => ctx.revert()
  }, [filteredItems.length, loading])

  return (
    <section
      id="galeria"
      aria-labelledby="galeria-title"
      className="relative overflow-hidden bg-parchment py-28 lg:py-36"
    >
      <div className="site-container">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionHeading
                eyebrow="Acervo Vivo"
                title="Registros da história de Carajás."
                titleId="galeria-title"
              />
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:pb-1">
            <Reveal delay={80}>
              <p className="max-w-md text-[15px] leading-relaxed text-stone">
                Fotografias, vídeos e documentos históricos reunidos e
                atualizados continuamente à medida que novos registros são
                incorporados ao acervo.
              </p>
            </Reveal>
          </div>
        </div>

        {error && hasItems ? (
          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-line bg-cream px-5 py-3 text-[13px] text-ink sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2">
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0 text-forest"
                aria-hidden="true"
              />
              Não foi possível sincronizar agora. Os registros exibidos podem
              estar desatualizados.
            </p>
            <button
              type="button"
              onClick={refresh}
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-forest transition hover:text-ink"
            >
              <RefreshCw size={13} aria-hidden="true" />
              Tentar novamente
            </button>
          </div>
        ) : null}

        {showFilters ? (
          <div className="mt-10 border-b border-line/60 pb-6">
            {/* Top toolbar row: Pill search + Media-type segmented tabs */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <label htmlFor="galeria-busca" className="sr-only">
                  Buscar registros por título, período, local ou tag
                </label>
                <Search
                  size={15}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone/80"
                />
                <input
                  id="galeria-busca"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar por título, década, local ou tag…"
                  className="w-full rounded-full border border-line/70 bg-cream/85 py-2.5 pl-10 pr-10 text-[14px] text-ink transition-colors placeholder:text-stone/75 focus:border-forest focus:bg-cream focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpar busca"
                    className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-stone transition-colors hover:bg-parchment hover:text-ink"
                  >
                    <X size={14} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <div
                role="group"
                aria-label="Filtrar galeria por tipo de mídia"
                className="no-scrollbar inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-line/70 bg-cream/65 p-1"
              >
                {MEDIA_FILTERS.map((option) => {
                  const isActive = selectedMediaType === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setSelectedMediaType(option.value)
                        setLightboxId(null)
                        syncGalleryUrl(option.value, selectedCategory, null)
                      }}
                      className={cn(
                        'shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[13.5px] font-medium transition-colors',
                        isActive
                          ? 'bg-forest text-cream'
                          : 'text-stone hover:text-ink',
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Subtle second row: Category pills on left, result count + carousel controls on right */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div
                role="group"
                aria-label="Filtrar galeria por categoria"
                className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5"
              >
                <button
                  type="button"
                  aria-pressed={selectedCategory === ALL_CATEGORIES}
                  onClick={() => {
                    setSelectedCategory(ALL_CATEGORIES)
                    setLightboxId(null)
                    syncGalleryUrl(selectedMediaType, ALL_CATEGORIES, null)
                  }}
                  className={cn(
                    'shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                    selectedCategory === ALL_CATEGORIES
                      ? 'bg-forest text-cream'
                      : 'bg-parchment/70 text-ink/75 hover:bg-cream',
                  )}
                >
                  Todas
                </button>

                {categories.map((category) => {
                  const isActive = selectedCategory === category
                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setSelectedCategory(category)
                        setLightboxId(null)
                        syncGalleryUrl(selectedMediaType, category, null)
                      }}
                      className={cn(
                        'shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                        isActive
                          ? 'bg-forest text-cream'
                          : 'bg-parchment/70 text-ink/75 hover:bg-cream',
                      )}
                    >
                      {category}
                    </button>
                  )
                })}
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <p className="text-[13px] tabular-nums text-stone">
                  {filteredItems.length}{' '}
                  {filteredItems.length === 1 ? 'registro' : 'registros'}
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollCarousel('prev')}
                    disabled={!canScrollPrev}
                    aria-label="Registro anterior"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line/80 bg-cream/85 text-forest transition-colors hover:border-forest hover:bg-cream disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ChevronLeft
                      size={17}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarousel('next')}
                    disabled={!canScrollNext}
                    aria-label="Próximo registro"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line/80 bg-cream/85 text-forest transition-colors hover:border-forest hover:bg-cream disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ChevronRight
                      size={17}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8" aria-busy={loading}>
          {loading ? (
            <GallerySkeleton />
          ) : !isSupabaseConfigured ? (
            <div className="rounded-[36px] bg-cream px-6 py-14 text-center sm:px-10 sm:py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line text-stone">
                <ImageOff size={23} strokeWidth={1.4} aria-hidden="true" />
              </div>
              <h3 className="display mt-6 text-[clamp(1.6rem,3vw,2.2rem)] font-medium text-forest">
                Acervo digital em preparação
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-stone">
                Fotografias, vídeos e documentos serão exibidos aqui assim que a
                conexão com o acervo digital do museu for configurada.
              </p>

              {import.meta.env.DEV ? (
                <details className="mx-auto mt-7 max-w-2xl rounded-2xl border border-dashed border-stone/40 bg-parchment p-4 text-left">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-forest">
                    Instruções para o ambiente de desenvolvimento
                  </summary>
                  <div className="mt-3 space-y-2 font-mono text-xs leading-relaxed text-stone">
                    <p>
                      1. Copie .env.example para .env.local e preencha as
                      variáveis do Supabase.
                    </p>
                    <p>
                      2. Execute as migrações SQL em supabase/migrations.
                    </p>
                    <p>3. Publique a Edge Function e rode npm run seed:galeria.</p>
                    {supabaseConfigIssue ? (
                      <p className="text-clay">{supabaseConfigIssue}</p>
                    ) : null}
                  </div>
                </details>
              ) : null}
            </div>
          ) : error && !hasItems ? (
            <div className="rounded-[36px] border border-line bg-cream px-6 py-14 text-center sm:py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line text-forest">
                <AlertCircle size={23} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="display mt-6 text-[clamp(1.6rem,3vw,2.2rem)] font-medium text-forest">
                Não foi possível carregar o acervo
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-stone">
                {error}
              </p>
              <button
                type="button"
                onClick={refresh}
                className="group mt-7 inline-flex items-center gap-2 rounded-full border border-forest/60 px-7 py-3 text-[12px] font-medium tracking-[0.06em] text-forest transition hover:bg-forest hover:text-cream"
              >
                <RefreshCw size={14} strokeWidth={1.7} aria-hidden="true" />
                Tentar novamente
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-[36px] bg-cream px-6 py-14 text-center sm:py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line text-stone">
                <ImageOff size={23} strokeWidth={1.4} aria-hidden="true" />
              </div>
              <h3 className="display mt-6 text-[clamp(1.6rem,3vw,2.2rem)] font-medium text-forest">
                {hasActiveFilters
                  ? 'Nenhum registro encontrado para este filtro'
                  : 'Nenhum registro publicado ainda'}
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-stone">
                {hasActiveFilters
                  ? 'Ajuste a busca, o tipo de mídia ou a categoria para continuar explorando o acervo.'
                  : 'Novos registros aparecerão aqui automaticamente quando forem publicados pela equipe curatorial.'}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMediaType(ALL_MEDIA)
                    setSelectedCategory(ALL_CATEGORIES)
                    setSearchQuery('')
                    syncGalleryUrl(ALL_MEDIA, ALL_CATEGORIES, null)
                  }}
                  className="mt-7 inline-flex items-center gap-2 rounded-full border border-forest/60 px-7 py-3 text-[12px] font-medium tracking-[0.06em] text-forest transition hover:bg-forest hover:text-cream"
                >
                  Limpar filtros
                </button>
              ) : null}
            </div>
          ) : (
            <div
              ref={carouselRef}
              onScroll={updateScrollButtons}
              aria-label="Carrossel de registros do acervo"
              className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4"
            >
              {filteredItems.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onOpen={() => {
                    setLightboxId(item.id)
                    syncGalleryUrl(selectedMediaType, selectedCategory, item.id)
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-xs leading-relaxed text-stone sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl">
            Legendas e metadados sujeitos à validação curatorial do Museu
            Carajás. Acervo colaborativo aberto a fotografias, vídeos e
            documentos históricos.
          </p>
          <Link
            to="/contribua"
            className="group inline-flex shrink-0 items-center gap-2 font-semibold uppercase tracking-[0.14em] text-forest transition hover:text-ink"
          >
            Enviar um registro
            <ArrowUpRight
              size={13}
              strokeWidth={1.8}
              className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>

      {lightboxIndex >= 0 ? (
        <GalleryLightbox
          items={filteredItems}
          index={lightboxIndex}
          onClose={() => {
            setLightboxId(null)
            syncGalleryUrl(selectedMediaType, selectedCategory, null)
          }}
          onNavigate={(nextIndex) => {
            const nextItem = filteredItems[nextIndex]
            if (nextItem) {
              setLightboxId(nextItem.id)
              syncGalleryUrl(selectedMediaType, selectedCategory, nextItem.id)
            }
          }}
        />
      ) : null}
    </section>
  )
}
