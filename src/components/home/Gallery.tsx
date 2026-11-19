import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  FileText,
  ImageOff,
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
import { ScrollTrigger } from '../../lib/gsap'
import { isSupabaseConfigured, supabaseConfigIssue } from '../../lib/supabase'
import { cn } from '../../lib/utils'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { GalleryLightbox } from './GalleryLightbox'

const ALL_CATEGORIES = 'Todas'
const ALL_MEDIA = 'todos'
const WHEEL_COOLDOWN_MS = 320
const SWIPE_THRESHOLD_PX = 40

type MediaFilter = typeof ALL_MEDIA | GaleriaMediaType

const MEDIA_FILTERS: ReadonlyArray<{ value: MediaFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'fotografia', label: 'Fotos' },
  { value: 'video', label: 'Vídeos' },
  { value: 'documento', label: 'Documentos' },
]

function getInitialMediaFilter(): MediaFilter {
  if (typeof window === 'undefined') return ALL_MEDIA
  const param = new URLSearchParams(window.location.search).get('midia')?.trim()
  if (param === 'fotografia' || param === 'video' || param === 'documento') {
    return param
  }
  return ALL_MEDIA
}

function getCoverflowLayerStyle(delta: number) {
  if (delta === 0) {
    return {
      xPct: 0,
      scale: 1,
      opacity: 1,
      zIndex: 30,
    }
  }

  if (Math.abs(delta) === 1) {
    return {
      xPct: delta * 62,
      scale: 0.82,
      opacity: 0.92,
      zIndex: 20,
    }
  }

  if (Math.abs(delta) === 2) {
    return {
      xPct: Math.sign(delta) * 108,
      scale: 0.66,
      opacity: 0.65,
      zIndex: 10,
    }
  }

  return {
    xPct: Math.sign(delta) * 140,
    scale: 0.55,
    opacity: 0,
    zIndex: 0,
  }
}

function CoverflowCard({
  item,
  delta,
  onSelect,
  onOpen,
}: {
  item: GaleriaItem
  delta: number
  onSelect: () => void
  onOpen: () => void
}) {
  const mediaUrl = getGaleriaImageUrl(item)
  const thumbnailUrl = getGaleriaThumbnailUrl(item)
  const isCenter = delta === 0
  const isAdjacent = Math.abs(delta) === 1
  const isOuter = Math.abs(delta) === 2
  const isHidden = Math.abs(delta) > 2
  const canOpen = Boolean(mediaUrl || item.midia_externa_url)

  const { xPct, scale, opacity, zIndex } = getCoverflowLayerStyle(delta)

  const subtitle = [item.periodo_estimado, item.localizacao]
    .filter(Boolean)
    .join(' · ')

  const actionLabel = isCenter
    ? item.tipo_midia === 'video'
      ? `Reproduzir vídeo: ${item.titulo}`
      : item.tipo_midia === 'documento'
        ? `Abrir documento: ${item.titulo}`
        : `Ampliar fotografia: ${item.titulo}`
    : `Centralizar registro: ${item.titulo}`

  const handleClick = () => {
    if (isHidden) return
    if (!isCenter) {
      onSelect()
      return
    }
    if (canOpen) {
      onOpen()
    }
  }

  return (
    <div
      aria-hidden={isHidden || undefined}
      style={{
        zIndex,
        opacity,
        transform: `translate3d(${xPct - 50}%, -50%, 0) scale(${scale})`,
      }}
      className={cn(
        'gallery-card-item absolute left-1/2 top-1/2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none',
        isHidden && 'pointer-events-none',
      )}
    >
      <button
        type="button"
        tabIndex={isHidden ? -1 : 0}
        onClick={handleClick}
        disabled={isCenter && !canOpen}
        aria-label={actionLabel}
        className={cn(
          'group relative block aspect-[3/4] w-[260px] overflow-hidden rounded-[24px] bg-forest-deep text-left ring-1 ring-parchment/15 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-[300px] lg:w-[330px]',
          isCenter &&
            'ring-parchment/25 shadow-[0_32px_70px_-24px_rgba(5,12,9,0.75)] hover:-translate-y-1.5',
          isAdjacent &&
            'shadow-[0_22px_50px_-24px_rgba(5,12,9,0.65)] brightness-[0.88] hover:scale-[1.036] hover:brightness-100',
          isOuter &&
            'shadow-[0_16px_40px_-24px_rgba(5,12,9,0.55)] brightness-[0.75] hover:brightness-90',
          isCenter && !canOpen && 'cursor-default',
        )}
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
                width={900}
                height={1200}
                loading={Math.abs(delta) <= 1 ? 'eager' : 'lazy'}
                decoding="async"
                className={cn(
                  'h-full w-full object-cover transition duration-700 ease-museum',
                  isCenter && 'group-hover:scale-[1.03]',
                )}
              />
            ) : (
              <div className="flex h-full w-full flex-col justify-between bg-[radial-gradient(circle_at_top_right,rgba(79,102,88,0.55),rgba(21,34,28,0.98))] p-6 text-parchment">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-copper-light">
                  {item.formato === 'youtube' || item.formato === 'vimeo'
                    ? item.formato
                    : 'Acervo Audiovisual'}
                </span>
                <p className="display line-clamp-3 text-xl leading-snug text-parchment/95">
                  {item.titulo}
                </p>
              </div>
            )}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-forest-deep/15"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-cream/95 text-forest-deep shadow-md transition duration-300 group-hover:scale-105"
            >
              <Play
                size={16}
                strokeWidth={1.8}
                fill="currentColor"
                className="ml-0.5"
              />
            </span>
          </>
        ) : item.tipo_midia === 'documento' ? (
          <>
            <div className="flex h-full w-full flex-col justify-between border border-forest/15 bg-[linear-gradient(160deg,#dce2d6_0%,#c1ccb9_55%,#96aa99_100%)] p-6 text-ink">
              <div className="space-y-3 border-b border-forest/15 pb-4">
                <span className="inline-block text-[10.5px] font-semibold uppercase tracking-[0.22em] text-stone">
                  Documento Histórico
                </span>
                <p className="display line-clamp-4 text-[21px] font-medium leading-snug text-forest">
                  {item.titulo}
                </p>
              </div>

              <div className="space-y-2 pb-10">
                {item.descricao ? (
                  <p className="line-clamp-4 text-[13px] leading-relaxed text-ink/80">
                    {item.descricao}
                  </p>
                ) : null}
                {item.credito ? (
                  <p className="truncate text-[11px] uppercase tracking-[0.14em] text-stone">
                    {item.credito}
                  </p>
                ) : null}
              </div>
            </div>

            <span
              aria-hidden="true"
              className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-cream/95 text-forest-deep shadow-md"
            >
              <FileText size={16} strokeWidth={1.75} aria-hidden="true" />
            </span>
          </>
        ) : mediaUrl ? (
          <img
            src={mediaUrl}
            alt={
              item.descricao
                ? `${item.titulo}. ${item.descricao}`
                : item.titulo
            }
            width={900}
            height={1200}
            loading={Math.abs(delta) <= 1 ? 'eager' : 'lazy'}
            decoding="async"
            className={cn(
              'h-full w-full object-cover transition duration-700 ease-museum',
              isCenter && 'group-hover:scale-[1.03]',
            )}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-sand text-stone">
            <ImageOff size={24} strokeWidth={1.4} aria-hidden="true" />
            <span className="text-xs uppercase tracking-[0.16em]">
              Mídia indisponível
            </span>
          </div>
        )}

        {isCenter ? (
          <div
            className={cn(
              'pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-deep/92 via-forest-deep/60 to-transparent px-5 pb-5 pt-20 text-cream',
              item.tipo_midia !== 'fotografia' && 'pr-16',
            )}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-copper-light">
              {item.categoria}
            </p>
            <h3 className="display mt-1 line-clamp-2 text-[20px] font-medium leading-snug text-cream">
              {item.titulo}
            </h3>
            {subtitle ? (
              <p className="mt-1.5 truncate text-xs text-parchment/85">
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}
      </button>
    </div>
  )
}

function GallerySkeleton() {
  const slots = [-2, -1, 0, 1, 2]

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative mx-auto flex h-[420px] w-full max-w-6xl items-center justify-center overflow-hidden sm:h-[480px] lg:h-[520px]"
    >
      {slots.map((delta) => {
        const { xPct, scale, opacity, zIndex } = getCoverflowLayerStyle(delta)
        return (
          <div
            key={delta}
            aria-hidden="true"
            style={{
              zIndex,
              opacity,
              transform: `translate3d(${xPct - 50}%, -50%, 0) scale(${scale})`,
            }}
            className="animate-shimmer absolute left-1/2 top-1/2 aspect-[3/4] w-[260px] rounded-[24px] bg-[linear-gradient(90deg,rgba(44,64,54,0.5)_25%,rgba(79,102,88,0.42)_50%,rgba(44,64,54,0.5)_75%)] ring-1 ring-parchment/10 sm:w-[300px] lg:w-[330px]"
          />
        )
      })}
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
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxId, setLightboxId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(window.location.search).get('foto')?.trim() || null
  })

  const stageRef = useRef<HTMLDivElement>(null)
  const activeIndexRef = useRef(0)
  const totalItemsRef = useRef(0)
  const lastWheelStepRef = useRef(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const syncedDeepLinkRef = useRef(false)

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

  const safeActiveIndex =
    filteredItems.length > 0
      ? Math.min(Math.max(0, activeIndex), filteredItems.length - 1)
      : 0

  activeIndexRef.current = safeActiveIndex
  totalItemsRef.current = filteredItems.length

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
    if (lightboxId && lightboxIndex === -1) {
      setLightboxId(null)
    } else if (
      !syncedDeepLinkRef.current &&
      lightboxIndex >= 0
    ) {
      syncedDeepLinkRef.current = true
      setActiveIndex(lightboxIndex)
    }
  }, [items.length, lightboxId, lightboxIndex, loading])

  useEffect(() => {
    setActiveIndex(0)
  }, [searchQuery, selectedMediaType, selectedCategory])

  useEffect(() => {
    if (activeIndex !== safeActiveIndex) {
      setActiveIndex(safeActiveIndex)
    }
  }, [activeIndex, safeActiveIndex])

  useEffect(() => {
    ScrollTrigger.refresh()
  }, [loading, filteredItems.length])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || loading || filteredItems.length <= 1) return

    const handleWheel = (event: WheelEvent) => {
      const total = totalItemsRef.current
      if (total <= 1) return

      const primaryDelta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX

      if (Math.abs(primaryDelta) < 4) return

      const current = activeIndexRef.current
      const goingForward = primaryDelta > 0

      if ((current === 0 && !goingForward) || (current >= total - 1 && goingForward)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      const now = performance.now()
      if (now - lastWheelStepRef.current < WHEEL_COOLDOWN_MS) return

      lastWheelStepRef.current = now
      setActiveIndex((prev) => {
        const clampedPrev = Math.min(Math.max(0, prev), total - 1)
        return goingForward
          ? Math.min(total - 1, clampedPrev + 1)
          : Math.max(0, clampedPrev - 1)
      })
    }

    stage.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      stage.removeEventListener('wheel', handleWheel)
    }
  }, [filteredItems.length, loading])

  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => Math.min(filteredItems.length - 1, prev + 1))
  }

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) return
    touchStartRef.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    }
  }

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start || event.changedTouches.length === 0 || filteredItems.length <= 1) {
      return
    }

    const dx = event.changedTouches[0].clientX - start.x
    const dy = event.changedTouches[0].clientY - start.y

    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) {
      return
    }

    if (dx < 0) {
      handleNext()
    } else {
      handlePrev()
    }
  }

  const hasItems = items.length > 0
  const showFilters = isSupabaseConfigured || hasItems
  const hasActiveFilters =
    selectedMediaType !== ALL_MEDIA ||
    selectedCategory !== ALL_CATEGORIES ||
    searchQuery.trim().length > 0
  const canPrev = safeActiveIndex > 0
  const canNext = safeActiveIndex < filteredItems.length - 1

  return (
    <section
      id="galeria"
      aria-labelledby="galeria-title"
      className="relative overflow-hidden bg-parchment py-28 lg:py-36"
    >
      <div className="site-container">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Acervo Digital"
              title="Registros da história de Carajás."
              titleId="galeria-title"
              description="Fotografias, vídeos e documentos históricos reunidos e preservados continuamente para a memória da região."
            />
          </Reveal>
        </div>

        {error && hasItems ? (
          <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl border border-line bg-cream px-5 py-3 text-[13px] text-ink sm:flex-row sm:items-center sm:justify-between">
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
          <div className="mx-auto mt-10 max-w-4xl">
            {/* Tier 1: Search pill + Media Type segmented control */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <div className="relative w-full sm:w-80">
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
                  className="w-full rounded-full border border-ink/15 bg-cream/90 py-2.5 pl-10 pr-9 text-[13.5px] text-ink transition-colors placeholder:text-stone/75 focus:border-forest focus:bg-cream focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpar busca"
                    className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-stone transition-colors hover:bg-parchment hover:text-ink"
                  >
                    <X size={14} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <div
                role="group"
                aria-label="Filtrar galeria por tipo de mídia"
                className="no-scrollbar inline-flex max-w-full items-center overflow-x-auto rounded-full border border-ink/10 bg-ink/[0.07] p-1"
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
                        'shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors',
                        isActive
                          ? 'bg-forest text-cream shadow-sm'
                          : 'text-ink/70 hover:text-ink',
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tier 2: Categories row */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 border-t border-ink/10 pt-4">
              <span className="mr-1 text-[11px] font-medium uppercase tracking-[0.16em] text-stone/80">
                Categorias
              </span>

              <div
                role="group"
                aria-label="Filtrar galeria por categoria"
                className="flex flex-wrap items-center justify-center gap-2"
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
                    'rounded-full border px-3.5 py-1 text-[12.5px] transition-colors',
                    selectedCategory === ALL_CATEGORIES
                      ? 'border-forest/35 bg-ink/12 font-semibold text-forest'
                      : 'border-ink/15 bg-transparent font-medium text-ink/65 hover:border-ink/35 hover:text-ink',
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
                        'rounded-full border px-3.5 py-1 text-[12.5px] transition-colors',
                        isActive
                          ? 'border-forest/35 bg-ink/12 font-semibold text-forest'
                          : 'border-ink/15 bg-transparent font-medium text-ink/65 hover:border-ink/35 hover:text-ink',
                      )}
                    >
                      {category}
                    </button>
                  )
                })}
              </div>

              <span
                aria-hidden="true"
                className="mx-1 hidden h-4 w-px bg-ink/15 sm:inline-block"
              />

              <Link
                to="/contribua"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-cream/70 px-3.5 py-1 text-[12.5px] font-medium text-forest transition-colors hover:border-forest hover:bg-forest hover:text-cream"
              >
                Enviar registro
                <ArrowRight size={13} strokeWidth={1.8} aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : null}

        {/* Framed misty-forest alcove behind the Coverflow carousel */}
        <div
          aria-busy={loading}
          className="relative mt-10 overflow-hidden rounded-[36px] bg-forest-deep px-4 py-10 shadow-[0_30px_80px_-40px_rgba(16,33,25,0.55)] sm:rounded-[48px] sm:px-8 sm:py-14"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,102,88,0.38)_0%,rgba(21,34,28,0.92)_68%,rgba(15,25,20,1)_100%)]"
          />

          <div className="relative z-10">
            {loading ? (
              <GallerySkeleton />
            ) : !isSupabaseConfigured ? (
              <div className="mx-auto max-w-2xl px-4 py-10 text-center sm:py-14">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-parchment/25 text-parchment/75">
                  <ImageOff size={23} strokeWidth={1.4} aria-hidden="true" />
                </div>
                <h3 className="display mt-6 text-[clamp(1.6rem,3vw,2.2rem)] font-medium text-parchment">
                  Acervo digital em preparação
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-parchment/75">
                  Fotografias, vídeos e documentos serão exibidos aqui assim que
                  a conexão com o acervo digital do museu for configurada.
                </p>

                {import.meta.env.DEV ? (
                  <details className="mx-auto mt-7 max-w-2xl rounded-2xl border border-dashed border-parchment/25 bg-forest/60 p-4 text-left">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-parchment">
                      Instruções para o ambiente de desenvolvimento
                    </summary>
                    <div className="mt-3 space-y-2 font-mono text-xs leading-relaxed text-parchment/80">
                      <p>
                        1. Copie .env.example para .env.local e preencha as
                        variáveis do Supabase.
                      </p>
                      <p>
                        2. Execute as migrações SQL em supabase/migrations.
                      </p>
                      <p>
                        3. Publique a Edge Function e rode npm run seed:galeria.
                      </p>
                      {supabaseConfigIssue ? (
                        <p className="text-copper-light">{supabaseConfigIssue}</p>
                      ) : null}
                    </div>
                  </details>
                ) : null}
              </div>
            ) : error && !hasItems ? (
              <div className="mx-auto max-w-2xl px-4 py-10 text-center sm:py-14">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-parchment/25 text-parchment">
                  <AlertCircle size={23} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="display mt-6 text-[clamp(1.6rem,3vw,2.2rem)] font-medium text-parchment">
                  Não foi possível carregar o acervo
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-parchment/75">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={refresh}
                  className="group mt-7 inline-flex items-center gap-2 rounded-full border border-parchment/35 px-7 py-3 text-[12px] font-medium tracking-[0.06em] text-parchment transition hover:border-parchment hover:bg-parchment hover:text-forest-deep"
                >
                  <RefreshCw size={14} strokeWidth={1.7} aria-hidden="true" />
                  Tentar novamente
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="mx-auto max-w-2xl px-4 py-10 text-center sm:py-14">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-parchment/25 text-parchment/75">
                  <ImageOff size={23} strokeWidth={1.4} aria-hidden="true" />
                </div>
                <h3 className="display mt-6 text-[clamp(1.6rem,3vw,2.2rem)] font-medium text-parchment">
                  {hasActiveFilters
                    ? 'Nenhum registro encontrado para este filtro'
                    : 'Nenhum registro publicado ainda'}
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-parchment/75">
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
                    className="mt-7 inline-flex items-center gap-2 rounded-full border border-parchment/35 px-7 py-3 text-[12px] font-medium tracking-[0.06em] text-parchment transition hover:border-parchment hover:bg-parchment hover:text-forest-deep"
                  >
                    Limpar filtros
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                <div
                  ref={stageRef}
                  role="region"
                  aria-roledescription="carrossel"
                  aria-label="Acervo digital em carrossel interativo"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="relative mx-auto flex h-[420px] w-full max-w-6xl touch-pan-y select-none items-center justify-center overflow-hidden sm:h-[480px] lg:h-[520px]"
                >
                  {filteredItems.map((item, index) => {
                    const delta = index - safeActiveIndex
                    if (Math.abs(delta) > 3) return null

                    return (
                      <CoverflowCard
                        key={item.id}
                        item={item}
                        delta={delta}
                        onSelect={() => setActiveIndex(index)}
                        onOpen={() => {
                          setLightboxId(item.id)
                          syncGalleryUrl(selectedMediaType, selectedCategory, item.id)
                        }}
                      />
                    )
                  })}
                </div>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={!canPrev}
                    aria-label="Registro anterior"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-parchment/30 text-parchment transition hover:border-parchment hover:bg-parchment hover:text-forest-deep disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canNext}
                    aria-label="Próximo registro"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-parchment/30 text-parchment transition hover:border-parchment hover:bg-parchment hover:text-forest-deep disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </div>
              </>
            )}
          </div>
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
              setActiveIndex(nextIndex)
              setLightboxId(nextItem.id)
              syncGalleryUrl(selectedMediaType, selectedCategory, nextItem.id)
            }
          }}
        />
      ) : null}
    </section>
  )
}
