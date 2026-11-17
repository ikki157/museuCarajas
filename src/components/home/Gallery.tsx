import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ArrowUpRight, ImageOff, Maximize2, RefreshCw } from 'lucide-react'
import { useGaleria, type GaleriaStatus } from '../../hooks/useGaleria'
import { getGaleriaImageUrl, type GaleriaItem } from '../../lib/galeria'
import { isSupabaseConfigured, supabaseConfigIssue } from '../../lib/supabase'
import { cn, formatDate } from '../../lib/utils'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { GalleryLightbox } from './GalleryLightbox'

const ALL_CATEGORIES = 'Todas'

const statusCopy: Record<GaleriaStatus, { label: string; dot: string }> = {
  live: { label: 'Atualização em tempo real', dot: 'bg-[#7d9b69]' },
  connecting: { label: 'Conectando ao acervo digital', dot: 'bg-copper' },
  offline: { label: 'Conexão em tempo real indisponível', dot: 'bg-clay' },
  unconfigured: { label: 'Acervo digital não configurado', dot: 'bg-stone/50' },
}

function GalleryCard({ item, onOpen }: { item: GaleriaItem; onOpen: () => void }) {
  const imageUrl = getGaleriaImageUrl(item)

  return (
    <figure className="group mb-5 break-inside-avoid">
      <button
        type="button"
        onClick={onOpen}
        disabled={!imageUrl}
        aria-label={`Ampliar imagem: ${item.titulo}`}
        className="relative block aspect-[16/10] w-full overflow-hidden rounded-[28px] bg-sand-deep text-left disabled:cursor-default"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.descricao ? `${item.titulo}. ${item.descricao}` : item.titulo}
            width={1280}
            height={720}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-700 ease-museum group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-sand text-stone">
            <ImageOff size={24} strokeWidth={1.4} aria-hidden="true" />
            <span className="text-xs uppercase tracking-[0.16em]">Imagem indisponível</span>
          </div>
        )}

        <span className="absolute right-4 top-4 rounded-full bg-forest-deep/75 px-3 py-1.5 text-xs font-medium tracking-[0.06em] text-parchment backdrop-blur-sm">
          {item.formato}
        </span>

        {imageUrl ? (
          <span
            aria-hidden="true"
            className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-parchment/90 text-forest opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Maximize2 size={14} strokeWidth={1.7} />
          </span>
        ) : null}
      </button>

      <figcaption className="pt-3.5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">
            {item.categoria}
          </p>
          <p className="shrink-0 text-xs text-stone">{formatDate(item.criado_em)}</p>
        </div>
        <h3 className="display mt-1.5 text-[19px] font-medium leading-tight text-forest">
          {item.titulo}
        </h3>
        {item.descricao ? (
          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-stone">
            {item.descricao}
          </p>
        ) : null}
        <p className="mt-2 text-xs leading-relaxed text-stone">
          {item.credito ?? 'Acervo do Museu Municipal Hilmar Harry Kluck'}
        </p>
      </figcaption>
    </figure>
  )
}

function GallerySkeleton() {
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3" aria-hidden="true">
      {[280, 360, 320, 420, 300, 380].map((height, index) => (
        <div key={height} className="mb-5 break-inside-avoid">
          <div
            className="animate-shimmer w-full bg-[linear-gradient(90deg,#ede2d0_25%,#fbf7ef_50%,#ede2d0_75%)]"
            style={{ height }}
          />
          <div className="mt-3 h-2.5 w-20 animate-pulse bg-sand" />
          <div className="mt-2 h-4 w-2/3 animate-pulse bg-sand" />
          <div className="mt-2 h-2.5 w-1/3 animate-pulse bg-sand" />
          {index === 5 ? <span className="sr-only">Carregando galeria</span> : null}
        </div>
      ))}
    </div>
  )
}

export function Gallery() {
  const { items, loading, error, status, refresh } = useGaleria()
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (typeof window === 'undefined') return ALL_CATEGORIES
    return new URLSearchParams(window.location.search).get('categoria')?.trim() || ALL_CATEGORIES
  })
  const [lightboxId, setLightboxId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(window.location.search).get('foto')?.trim() || null
  })

  const syncGalleryUrl = (nextCategory: string, nextPhotoId: string | null) => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
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
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  }

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.categoria))).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [items],
  )

  const filteredItems = useMemo(
    () =>
      selectedCategory === ALL_CATEGORIES
        ? items
        : items.filter((item) => item.categoria === selectedCategory),
    [items, selectedCategory],
  )

  const lightboxIndex = lightboxId
    ? filteredItems.findIndex((item) => item.id === lightboxId)
    : -1

  useEffect(() => {
    if (loading || items.length === 0) return
    if (selectedCategory !== ALL_CATEGORIES && !categories.includes(selectedCategory)) {
      setSelectedCategory(ALL_CATEGORIES)
    }
  }, [categories, items.length, loading, selectedCategory])

  useEffect(() => {
    if (loading || items.length === 0) return
    if (lightboxId && lightboxIndex === -1) setLightboxId(null)
  }, [items.length, lightboxId, lightboxIndex, loading])

  const statusInfo = statusCopy[status]
  const hasItems = items.length > 0
  const showFilters = isSupabaseConfigured || hasItems

  return (
    <section
      id="galeria"
      aria-labelledby="galeria-title"
      className="relative overflow-hidden bg-parchment py-24 lg:py-32"
    >
      <div className="site-container">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionHeading
                eyebrow="Galeria"
                title="O acervo em imagens."
                titleId="galeria-title"
              />
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <Reveal delay={80}>
              <div
                role="status"
                aria-live="polite"
                className="inline-flex items-center gap-2.5 rounded-full border border-stone/45 bg-cream px-4 py-2"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    statusInfo.dot,
                    status === 'live' && 'animate-soft-pulse',
                  )}
                />
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
                  {statusInfo.label}
                </span>
              </div>
              <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-stone">
                Fotografias do museu e de seu acervo, carregadas diretamente do banco de dados e
                atualizadas automaticamente quando a equipe publica novas imagens.
              </p>
            </Reveal>
          </div>
        </div>

        {error && hasItems ? (
          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-clay/25 bg-clay/5 px-5 py-3 text-[12px] text-clay sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2">
              <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              Não foi possível sincronizar agora. As imagens exibidas podem estar desatualizadas.
            </p>
            <button
              type="button"
              onClick={refresh}
              className="inline-flex shrink-0 items-center gap-1.5 font-semibold uppercase tracking-[0.12em] transition hover:text-clay-dark"
            >
              <RefreshCw size={13} aria-hidden="true" />
              Tentar novamente
            </button>
          </div>
        ) : null}

        {showFilters ? (
          <div className="mt-10 flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div
              role="group"
              aria-label="Filtrar galeria por categoria"
              className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5"
            >
              <button
                type="button"
                aria-pressed={selectedCategory === ALL_CATEGORIES}
                onClick={() => {
                  setSelectedCategory(ALL_CATEGORIES)
                  setLightboxId(null)
                  syncGalleryUrl(ALL_CATEGORIES, null)
                }}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-xs font-medium tracking-[0.04em] transition',
                  selectedCategory === ALL_CATEGORIES
                    ? 'border-forest bg-forest text-parchment'
                    : 'border-stone/45 text-stone hover:border-forest hover:text-forest',
                )}
              >
                Todas
                <span className="ml-1.5 opacity-80">{items.length}</span>
              </button>

              {categories.map((category) => {
                const count = items.filter((item) => item.categoria === category).length

                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={selectedCategory === category}
                    onClick={() => {
                      setSelectedCategory(category)
                      setLightboxId(null)
                      syncGalleryUrl(category, null)
                    }}
                    className={cn(
                      'shrink-0 rounded-full border px-4 py-2 text-xs font-medium tracking-[0.04em] transition',
                      selectedCategory === category
                        ? 'border-forest bg-forest text-parchment'
                        : 'border-stone/45 text-stone hover:border-forest hover:text-forest',
                    )}
                  >
                    {category}
                    <span className="ml-1.5 opacity-80">{count}</span>
                  </button>
                )
              })}
            </div>

            <p className="shrink-0 text-xs uppercase tracking-[0.16em] text-stone">
              {filteredItems.length} {filteredItems.length === 1 ? 'imagem' : 'imagens'}
            </p>
          </div>
        ) : null}

        <div className="mt-10">
          {loading ? (
            <GallerySkeleton />
          ) : !isSupabaseConfigured ? (
            <div className="rounded-[36px] bg-cream px-6 py-14 text-center sm:px-10 sm:py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line text-stone">
                <ImageOff size={23} strokeWidth={1.4} aria-hidden="true" />
              </div>
              <h3 className="display mt-6 text-[clamp(1.6rem,3vw,2.2rem)] font-medium text-forest">
                Galeria em preparação
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-stone">
                As fotografias do acervo serão exibidas aqui assim que a conexão com o acervo
                digital do museu for configurada.
              </p>

              {import.meta.env.DEV ? (
                <details className="mx-auto mt-7 max-w-2xl rounded-2xl border border-dashed border-stone/40 bg-parchment p-4 text-left">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-forest">
                    Instruções para o ambiente de desenvolvimento
                  </summary>
                  <div className="mt-3 space-y-2 font-mono text-xs leading-relaxed text-stone">
                    <p>1. Copie .env.example para .env.local e preencha as variáveis do Supabase.</p>
                    <p>2. Execute a migração SQL em supabase/migrations.</p>
                    <p>3. Publique a Edge Function e rode npm run seed:galeria.</p>
                    {supabaseConfigIssue ? <p className="text-clay">{supabaseConfigIssue}</p> : null}
                  </div>
                </details>
              ) : null}
            </div>
          ) : error && !hasItems ? (
            <div className="rounded-[36px] border border-clay/25 bg-clay/5 px-6 py-14 text-center sm:py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-clay/30 text-clay">
                <AlertCircle size={23} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="display mt-6 text-[clamp(1.6rem,3vw,2.2rem)] font-medium text-forest">
                Não foi possível carregar a galeria
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
                {hasItems ? 'Nenhuma imagem nesta categoria' : 'Nenhuma fotografia publicada ainda'}
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-stone">
                {hasItems
                  ? 'Escolha outra categoria para continuar explorando o acervo.'
                  : 'Novas imagens aparecerão aqui automaticamente quando forem publicadas pela equipe do museu.'}
              </p>
            </div>
          ) : (
            <div className="gallery-columns columns-1 gap-5 sm:columns-2 lg:columns-3">
              {filteredItems.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onOpen={() => {
                    setLightboxId(item.id)
                    syncGalleryUrl(selectedCategory, item.id)
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-xs leading-relaxed text-stone sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl">
            Legendas e categorias demonstrativas, sujeitas à validação curatorial. Créditos das
            fotografias: Prefeitura de Parauapebas / Assessoria de Comunicação (2023).
          </p>
          <a
            href="#contribua"
            className="group inline-flex shrink-0 items-center gap-2 font-semibold uppercase tracking-[0.14em] text-clay transition hover:text-clay-dark"
          >
            Contribuir com uma imagem
            <ArrowUpRight
              size={13}
              strokeWidth={1.8}
              className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>

      {lightboxIndex >= 0 ? (
        <GalleryLightbox
          items={filteredItems}
          index={lightboxIndex}
          onClose={() => {
            setLightboxId(null)
            syncGalleryUrl(selectedCategory, null)
          }}
          onNavigate={(nextIndex) => {
            const nextItem = filteredItems[nextIndex]
            if (nextItem) {
              setLightboxId(nextItem.id)
              syncGalleryUrl(selectedCategory, nextItem.id)
            }
          }}
        />
      ) : null}
    </section>
  )
}
