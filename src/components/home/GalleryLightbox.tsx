import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight, ImageOff, X } from 'lucide-react'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { getGaleriaImageUrl, type GaleriaItem } from '../../lib/galeria'
import { formatDate } from '../../lib/utils'

type GalleryLightboxProps = {
  items: GaleriaItem[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function GalleryLightbox({ items, index, onClose, onNavigate }: GalleryLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const item = items[index]
  const total = items.length

  useBodyScrollLock(true)
  useFocusTrap(true, dialogRef)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowRight' && total > 1) {
        onNavigate((index + 1) % total)
      } else if (event.key === 'ArrowLeft' && total > 1) {
        onNavigate((index - 1 + total) % total)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [index, total, onClose, onNavigate])

  if (!item) return null

  const imageUrl = getGaleriaImageUrl(item)
  const previousIndex = (index - 1 + total) % total
  const nextIndex = (index + 1) % total

  return createPortal(
    <div
      className="animate-fade-in fixed inset-0 z-[80] flex bg-forest-deep/97 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-title"
        tabIndex={-1}
        className="flex h-full w-full flex-col"
      >
        <div className="flex items-center justify-between gap-4 border-b border-parchment/10 px-5 py-4 sm:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-copper-light">
              {item.categoria}
            </p>
            <h2
              id="lightbox-title"
              className="display mt-1 truncate text-lg font-medium text-parchment sm:text-xl"
            >
              {item.titulo}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <span
              className="text-xs tabular-nums tracking-[0.06em] text-parchment/80"
              aria-live="polite"
            >
              Foto {index + 1} de {total}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar visualização ampliada"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-parchment/25 text-parchment/85 transition hover:border-parchment/60 hover:bg-parchment/10 hover:text-parchment"
            >
              <X size={18} strokeWidth={1.7} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-5 sm:px-20">
          {total > 1 ? (
            <button
              type="button"
              onClick={() => onNavigate(previousIndex)}
              aria-label="Ver imagem anterior"
              className="absolute left-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-parchment/20 bg-forest-deep/50 text-parchment/85 backdrop-blur-sm transition hover:border-parchment/60 hover:text-parchment sm:left-6"
            >
              <ArrowLeft size={19} strokeWidth={1.6} aria-hidden="true" />
            </button>
          ) : null}

          {imageUrl ? (
            <img
              key={item.id}
              src={imageUrl}
              alt={item.descricao ? `${item.titulo}. ${item.descricao}` : item.titulo}
              width={1280}
              height={720}
              decoding="async"
              className="animate-fade-in max-h-[70vh] max-w-full rounded-2xl object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)]"
            />
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-parchment/30 px-10 py-16 text-parchment/70">
              <ImageOff size={30} strokeWidth={1.3} aria-hidden="true" />
              <p className="text-[11px] uppercase tracking-[0.16em]">Imagem indisponível</p>
            </div>
          )}

          {total > 1 ? (
            <button
              type="button"
              onClick={() => onNavigate(nextIndex)}
              aria-label="Ver próxima imagem"
              className="absolute right-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-parchment/20 bg-forest-deep/50 text-parchment/85 backdrop-blur-sm transition hover:border-parchment/60 hover:text-parchment sm:right-6"
            >
              <ArrowRight size={19} strokeWidth={1.6} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="border-t border-parchment/10 px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {item.descricao ? (
                <p className="max-w-3xl text-[13px] leading-relaxed text-parchment/80">
                  {item.descricao}
                </p>
              ) : null}
              <p className="mt-2 text-[11px] leading-relaxed text-parchment/70">
                {item.credito ?? 'Acervo do Museu Municipal Hilmar Harry Kluck'}
                {item.criado_em ? ` · ${formatDate(item.criado_em)}` : ''}
              </p>
            </div>
            <p className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-parchment/70">
              Use ← → para navegar · Esc para fechar
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
