import { useCallback, useEffect, useState, type FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Film,
  Image as ImageIcon,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/ui/Logo'
import { materialCategories } from '../data/content'
import {
  approveAndPublishContribution,
  checkIsAdmin,
  deleteGaleriaItem,
  getContributionSignedUrl,
  listContribuicoes,
  listGaleriaAdmin,
  toggleGaleriaPublicado,
  updateContributionStatus,
  type ContribuicaoItem,
  type ContribuicaoStatus,
} from '../lib/admin'
import {
  getEmbedVideoUrl,
  getGaleriaImageUrl,
  getGaleriaThumbnailUrl,
  sanitizeSafeMediaUrl,
  type GaleriaItem,
  type GaleriaMediaType,
} from '../lib/galeria'
import { isSupabaseConfigured, supabase, supabaseConfigIssue } from '../lib/supabase'
import { cn, formatBytes, formatDate } from '../lib/utils'

type AdminTab = 'fila' | 'acervo'
type StatusFilter =
  | 'pendente'
  | 'em_analise'
  | 'publicada'
  | 'recusada'
  | 'todas'

const STATUS_FILTERS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: 'pendente', label: 'Pendentes' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'publicada', label: 'Publicadas' },
  { value: 'recusada', label: 'Recusadas' },
  { value: 'todas', label: 'Todas' },
]

const MEDIA_LABELS: Record<GaleriaMediaType, string> = {
  fotografia: 'Fotografia',
  video: 'Vídeo',
  documento: 'Documento',
}

const STATUS_META: Record<
  ContribuicaoStatus,
  { label: string; badgeClass: string }
> = {
  pendente: {
    label: 'Pendente',
    badgeClass: 'border-[#9a7230]/30 bg-[#ede2cb] text-[#6d4f1c]',
  },
  em_analise: {
    label: 'Em análise',
    badgeClass: 'border-forest/25 bg-parchment text-forest',
  },
  aprovada: {
    label: 'Aprovada',
    badgeClass: 'border-forest/30 bg-[#d5dfd0] text-forest',
  },
  publicada: {
    label: 'Publicada',
    badgeClass: 'border-forest/25 bg-[#cdd9c7] text-forest',
  },
  recusada: {
    label: 'Recusada',
    badgeClass: 'border-[#9e4c3f]/30 bg-[#edd8d3] text-[#7c352a]',
  },
}

const loginLabelClass = 'mb-1.5 block text-[13.5px] font-medium text-ink/85'
const loginInputClass =
  'w-full rounded-2xl border border-ink/15 bg-cream/90 px-4 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-stone/65 focus:border-forest focus:bg-cream'

const fieldLabelClass = 'mb-1.5 block text-[13px] font-medium text-ink/85'
const fieldInputClass =
  'w-full rounded-2xl border border-ink/12 bg-parchment/55 px-4 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-stone/65 focus:border-forest focus:bg-cream'

type ContributionCardProps = {
  item: ContribuicaoItem
  onPublished: (titulo: string) => Promise<void>
  onRejected: (titulo: string) => Promise<void>
}

function ContributionCard({
  item,
  onPublished,
  onRejected,
}: ContributionCardProps) {
  const [titulo, setTitulo] = useState(item.titulo)
  const [categoria, setCategoria] = useState(item.categoria)
  const [periodoEstimado, setPeriodoEstimado] = useState(
    item.periodo_estimado ?? '',
  )
  const [localizacao, setLocalizacao] = useState(item.localizacao ?? '')
  const [credito, setCredito] = useState(item.nome)
  const [descricao, setDescricao] = useState(item.descricao)
  const [observacoes, setObservacoes] = useState(item.observacoes ?? '')

  const [previewOpen, setPreviewOpen] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const [isPublishing, setIsPublishing] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const statusMeta = STATUS_META[item.status]
  const safeExternalUrl = sanitizeSafeMediaUrl(item.midia_externa_url, false)
  const embedVideoUrl = safeExternalUrl
    ? getEmbedVideoUrl(safeExternalUrl)
    : null
  const safeSignedUrl = sanitizeSafeMediaUrl(signedUrl, false)
  const isBusy = isPublishing || isRejecting

  async function handleTogglePreview() {
    if (previewOpen) {
      setPreviewOpen(false)
      return
    }

    setPreviewOpen(true)
    if (item.midia_externa_url || signedUrl || !item.arquivo_caminho) return

    setLoadingPreview(true)
    setPreviewError(null)
    try {
      const url = await getContributionSignedUrl(item.arquivo_caminho)
      setSignedUrl(url)
    } catch (error) {
      setPreviewError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar a pré-visualização.',
      )
    } finally {
      setLoadingPreview(false)
    }
  }

  async function handlePublish() {
    if (isBusy) return
    setActionError(null)
    setIsPublishing(true)

    try {
      await approveAndPublishContribution(item, {
        titulo,
        categoria,
        periodo_estimado: periodoEstimado,
        localizacao,
        credito,
        descricao,
      })
      await onPublished(titulo.trim() || item.titulo)
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Não foi possível publicar esta contribuição.',
      )
    } finally {
      setIsPublishing(false)
    }
  }

  async function handleReject() {
    if (isBusy) return
    setActionError(null)
    setIsRejecting(true)

    try {
      await updateContributionStatus(item.id, 'recusada', observacoes)
      await onRejected(titulo.trim() || item.titulo)
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar o status.',
      )
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <article className="rounded-[32px] border border-ink/10 bg-cream p-5 sm:p-7">
      <div className="grid gap-7 lg:grid-cols-12 lg:items-start">
        {/* Left column: Dark Gallery Preview Frame */}
        <div className="flex flex-col justify-between gap-4 rounded-[24px] bg-forest-deep p-4 text-parchment sm:p-5 lg:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-parchment/15 pb-3.5">
            <div className="min-w-0">
              <p className="text-xs font-medium text-parchment">
                {MEDIA_LABELS[item.tipo_midia]}
              </p>
              <p className="truncate text-[11.5px] text-parchment/65">
                {item.arquivo_nome_original
                  ? `${item.arquivo_nome_original}${item.arquivo_tamanho ? ` · ${formatBytes(item.arquivo_tamanho)}` : ''}`
                  : safeExternalUrl
                    ? 'Vídeo por link externo'
                    : 'Registro enviado'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleTogglePreview()}
              aria-expanded={previewOpen}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-parchment/30 px-3.5 py-1.5 text-xs font-medium text-parchment transition-colors hover:border-parchment hover:bg-parchment hover:text-forest-deep"
            >
              {previewOpen ? (
                <>
                  <EyeOff size={13.5} strokeWidth={1.75} aria-hidden="true" />
                  Ocultar
                </>
              ) : (
                <>
                  <Eye size={13.5} strokeWidth={1.75} aria-hidden="true" />
                  Pré-visualizar mídia
                </>
              )}
            </button>
          </div>

          {previewOpen ? (
            <div className="space-y-3">
              {loadingPreview ? (
                <div className="flex aspect-[4/3] items-center justify-center gap-2 rounded-2xl border border-parchment/10 bg-forest/40 text-sm text-parchment/75">
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Carregando pré-visualização segura...</span>
                </div>
              ) : previewError ? (
                <div className="flex items-start gap-2 rounded-2xl border border-[#e3655b]/35 bg-[#8b2f2b]/25 p-4 text-sm text-cream">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{previewError}</span>
                </div>
              ) : safeExternalUrl ? (
                <div className="space-y-3">
                  {embedVideoUrl ? (
                    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-parchment/15 bg-black">
                      <iframe
                        src={embedVideoUrl}
                        title={titulo || item.titulo}
                        className="h-full w-full"
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        referrerPolicy="strict-origin-when-cross-origin"
                        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                        allowFullScreen
                      />
                    </div>
                  ) : null}
                  <a
                    href={safeExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-parchment/25 px-4 py-2 text-xs font-medium text-parchment transition-colors hover:border-parchment hover:bg-parchment hover:text-forest-deep"
                  >
                    <ExternalLink size={13} aria-hidden="true" />
                    Abrir link externo
                  </a>
                </div>
              ) : safeSignedUrl ? (
                item.tipo_midia === 'fotografia' ? (
                  <div className="space-y-3">
                    <img
                      src={safeSignedUrl}
                      alt={titulo || item.titulo}
                      referrerPolicy="no-referrer"
                      className="max-h-[340px] w-full rounded-2xl bg-black/25 object-contain"
                    />
                    <a
                      href={safeSignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-parchment/85 underline underline-offset-4 transition-colors hover:text-cream"
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      Abrir imagem original
                    </a>
                  </div>
                ) : item.tipo_midia === 'video' ? (
                  <video
                    src={safeSignedUrl}
                    controls
                    preload="metadata"
                    className="max-h-[340px] w-full rounded-2xl bg-black"
                  />
                ) : (
                  <div className="space-y-3">
                    <iframe
                      src={safeSignedUrl}
                      title={`Pré-visualização do documento: ${titulo || item.titulo}`}
                      referrerPolicy="no-referrer"
                      className="h-[340px] w-full rounded-2xl border border-parchment/15 bg-cream"
                    />
                    <a
                      href={safeSignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-parchment/30 bg-parchment/10 px-4 py-2 text-xs font-medium text-parchment transition-colors hover:bg-parchment hover:text-forest-deep"
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      Abrir documento
                    </a>
                  </div>
                )
              ) : (
                <p className="py-6 text-center text-sm text-parchment/70">
                  Nenhuma mídia anexada para pré-visualização.
                </p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void handleTogglePreview()}
              className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-parchment/20 bg-forest/35 px-5 text-center transition-colors hover:border-parchment/40 hover:bg-forest/55"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-parchment/10 text-parchment">
                {item.tipo_midia === 'video' ? (
                  <Film size={20} strokeWidth={1.6} aria-hidden="true" />
                ) : item.tipo_midia === 'documento' ? (
                  <FileText size={20} strokeWidth={1.6} aria-hidden="true" />
                ) : (
                  <ImageIcon size={20} strokeWidth={1.6} aria-hidden="true" />
                )}
              </span>
              <span className="text-sm font-medium text-parchment">
                Clique para abrir a mídia na galeria segura
              </span>
              <span className="text-xs text-parchment/60">
                Link temporário assinado (5 min)
              </span>
            </button>
          )}

          {item.status !== 'publicada' && item.arquivo_caminho ? (
            <div className="flex items-start gap-2.5 rounded-2xl border border-parchment/15 bg-parchment/[0.08] px-3.5 py-2.5 text-xs leading-relaxed text-parchment/80">
              <ShieldCheck
                size={15}
                className="mt-0.5 shrink-0 text-copper-light"
                aria-hidden="true"
              />
              <span>
                Arquivo em quarentena no bucket privado: verifique a procedência
                e o conteúdo antes de abrir em nova aba ou publicar no acervo.
              </span>
            </div>
          ) : null}
        </div>

        {/* Right column: Calm Metadata & Curation Controls */}
        <div className="space-y-5 lg:col-span-7">
          <div className="space-y-2 border-b border-ink/10 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-ink/15 bg-parchment/80 px-3 py-1 font-mono text-[12px] font-medium text-ink">
                {item.protocolo}
              </span>
              <span className="rounded-full border border-ink/15 bg-parchment/50 px-3 py-1 text-xs font-medium text-ink/80">
                {MEDIA_LABELS[item.tipo_midia]}
              </span>
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium',
                  statusMeta.badgeClass,
                )}
              >
                {statusMeta.label}
              </span>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-ink">
              <p>
                Enviado por <span className="font-medium">{item.nome}</span> ·{' '}
                <a
                  href={`mailto:${item.email}`}
                  className="text-forest underline decoration-ink/25 underline-offset-4 hover:text-ink"
                >
                  {item.email}
                </a>
                {item.telefone ? ` · ${item.telefone}` : ''}
              </p>
              <span className="text-xs text-stone">
                {formatDate(item.criado_em)}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor={`titulo-${item.id}`} className={fieldLabelClass}>
                Título
              </label>
              <input
                id={`titulo-${item.id}`}
                type="text"
                maxLength={160}
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                className={fieldInputClass}
              />
            </div>

            <div>
              <label
                htmlFor={`categoria-${item.id}`}
                className={fieldLabelClass}
              >
                Categoria
              </label>
              <input
                id={`categoria-${item.id}`}
                type="text"
                maxLength={40}
                list="curadoria-categorias"
                value={categoria}
                onChange={(event) => setCategoria(event.target.value)}
                className={fieldInputClass}
              />
            </div>

            <div>
              <label htmlFor={`periodo-${item.id}`} className={fieldLabelClass}>
                Época ou período
              </label>
              <input
                id={`periodo-${item.id}`}
                type="text"
                maxLength={80}
                value={periodoEstimado}
                onChange={(event) => setPeriodoEstimado(event.target.value)}
                placeholder="Ex.: Década de 1980"
                className={fieldInputClass}
              />
            </div>

            <div>
              <label htmlFor={`local-${item.id}`} className={fieldLabelClass}>
                Local
              </label>
              <input
                id={`local-${item.id}`}
                type="text"
                maxLength={120}
                value={localizacao}
                onChange={(event) => setLocalizacao(event.target.value)}
                placeholder="Ex.: Serra dos Carajás"
                className={fieldInputClass}
              />
            </div>

            <div>
              <label htmlFor={`credito-${item.id}`} className={fieldLabelClass}>
                Crédito
              </label>
              <input
                id={`credito-${item.id}`}
                type="text"
                maxLength={200}
                value={credito}
                onChange={(event) => setCredito(event.target.value)}
                className={fieldInputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor={`descricao-${item.id}`}
                className={fieldLabelClass}
              >
                Descrição
              </label>
              <textarea
                id={`descricao-${item.id}`}
                rows={3}
                maxLength={2000}
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                className={cn(fieldInputClass, 'resize-y leading-relaxed')}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={`obs-${item.id}`} className={fieldLabelClass}>
                Observações da curadoria (opcional)
              </label>
              <input
                id={`obs-${item.id}`}
                type="text"
                value={observacoes}
                onChange={(event) => setObservacoes(event.target.value)}
                placeholder="Motivo de recusa ou nota editorial interna..."
                className={fieldInputClass}
              />
            </div>
          </div>

          {actionError ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-2xl border border-[#8b2f2b]/35 bg-[#8b2f2b]/5 px-4 py-3 text-sm text-[#8b2f2b]"
            >
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span>{actionError}</span>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-ink/10 pt-4">
            {item.status !== 'recusada' && item.status !== 'publicada' ? (
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void handleReject()}
                className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-5 py-2.5 text-sm font-medium text-ink/85 transition-colors hover:border-[#8b2f2b]/50 hover:bg-[#8b2f2b]/5 hover:text-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRejecting ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : null}
                Recusar
              </button>
            ) : null}

            <button
              type="button"
              disabled={isBusy || item.status === 'publicada'}
              onClick={() => void handlePublish()}
              className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  <span>Publicando...</span>
                </>
              ) : item.status === 'publicada' ? (
                <>
                  <Check size={15} aria-hidden="true" />
                  <span>Publicada no acervo</span>
                </>
              ) : (
                <span>Aprovar e Publicar</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

type GalleryAdminCardProps = {
  item: GaleriaItem
  onTogglePublicado: (id: string, nextValue: boolean) => Promise<void>
  onDelete: (item: GaleriaItem) => Promise<void>
}

function GalleryAdminCard({
  item,
  onTogglePublicado,
  onDelete,
}: GalleryAdminCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  const imageUrl =
    item.tipo_midia === 'fotografia'
      ? getGaleriaImageUrl(item)
      : getGaleriaThumbnailUrl(item)

  return (
    <article className="flex flex-col justify-between overflow-hidden rounded-[28px] border border-ink/10 bg-cream">
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-forest-deep">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_top,rgba(79,102,88,0.45),rgba(21,34,28,0.98))] text-parchment/80">
              {item.tipo_midia === 'video' ? (
                <Film size={26} strokeWidth={1.5} aria-hidden="true" />
              ) : item.tipo_midia === 'documento' ? (
                <FileText size={26} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <ImageIcon size={26} strokeWidth={1.5} aria-hidden="true" />
              )}
              <span className="text-[11px] uppercase tracking-[0.16em]">
                {MEDIA_LABELS[item.tipo_midia]}
              </span>
            </div>
          )}

          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm',
                item.publicado
                  ? 'bg-forest/90 text-cream'
                  : 'bg-parchment/90 text-ink',
              )}
            >
              {item.publicado ? 'Publicado' : 'Oculto'}
            </span>

            <span className="rounded-full bg-forest-deep/75 px-2.5 py-1 text-[11px] font-medium text-parchment backdrop-blur-sm">
              {MEDIA_LABELS[item.tipo_midia]}
            </span>
          </div>
        </div>

        <div className="p-5">
          <p className="truncate text-xs font-medium text-forest">
            {item.categoria}
            {item.periodo_estimado ? ` · ${item.periodo_estimado}` : ''}
          </p>

          <h3 className="mt-1.5 line-clamp-2 font-serif text-lg font-medium leading-snug text-ink">
            {item.titulo}
          </h3>

          <p className="mt-1.5 truncate text-xs text-stone">
            {item.credito ?? 'Acervo Museu Carajás'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 px-5 py-4">
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            try {
              await onTogglePublicado(item.id, !item.publicado)
            } finally {
              setBusy(false)
            }
          }}
          className="rounded-full border border-forest/35 px-4 py-1.5 text-xs font-medium text-forest transition-colors hover:border-forest hover:bg-forest hover:text-cream disabled:opacity-50"
        >
          {item.publicado ? 'Ocultar' : 'Publicar'}
        </button>

        {confirmingDelete ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                try {
                  await onDelete(item)
                } finally {
                  setBusy(false)
                }
              }}
              className="rounded-full bg-[#8b2f2b] px-3.5 py-1.5 text-xs font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Confirmar
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmingDelete(false)}
              className="rounded-full border border-ink/20 px-3 py-1.5 text-xs text-stone hover:text-ink"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmingDelete(true)}
            aria-label={`Excluir registro ${item.titulo}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#8b2f2b]/35 px-3.5 py-1.5 text-xs font-medium text-[#8b2f2b] transition-colors hover:bg-[#8b2f2b]/10 disabled:opacity-50"
          >
            <Trash2 size={13} aria-hidden="true" />
            Excluir
          </button>
        )}
      </div>
    </article>
  )
}

export function AdminPage() {
  const [authChecking, setAuthChecking] = useState(Boolean(supabase))
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<AdminTab>('fila')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pendente')
  const [contribuicoes, setContribuicoes] = useState<ContribuicaoItem[]>([])
  const [galeriaItems, setGaleriaItems] = useState<GaleriaItem[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null)

  useEffect(() => {
    const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const previousContent = existing?.getAttribute('content') ?? null
    const meta = existing ?? document.createElement('meta')
    meta.setAttribute('name', 'robots')
    meta.setAttribute('content', 'noindex, nofollow')
    if (!existing) {
      document.head.appendChild(meta)
    }

    return () => {
      if (existing && previousContent !== null) {
        existing.setAttribute('content', previousContent)
      } else if (!existing) {
        meta.remove()
      }
    }
  }, [])

  const verifyAdminSession = useCallback(async (sessionUser: User | null) => {
    if (!sessionUser || !supabase) {
      setUser(null)
      setIsAdmin(false)
      setAuthChecking(false)
      return
    }

    setAuthChecking(true)
    try {
      const allowed = await checkIsAdmin(sessionUser.id)
      if (!allowed) {
        await supabase.auth.signOut()
        setUser(null)
        setIsAdmin(false)
        setAuthError(
          'Acesso negado: esta conta não está cadastrada como curadora do Museu Carajás.',
        )
        return
      }
      setUser(sessionUser)
      setIsAdmin(true)
      setAuthError(null)
    } catch (error) {
      setUser(null)
      setIsAdmin(false)
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Erro ao validar sessão de curadoria.',
      )
    } finally {
      setAuthChecking(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setAuthChecking(false)
      return
    }

    let mounted = true
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) void verifyAdminSession(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) void verifyAdminSession(session?.user ?? null)
      },
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [verifyAdminSession])

  const loadWorkspaceData = useCallback(async () => {
    if (!isAdmin) return
    setLoadingData(true)
    setDataError(null)

    try {
      const [queue, gallery] = await Promise.all([
        listContribuicoes('todas'),
        listGaleriaAdmin(),
      ])
      setContribuicoes(queue)
      setGaleriaItems(gallery)
    } catch (error) {
      setDataError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os registros da curadoria.',
      )
    } finally {
      setLoadingData(false)
    }
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin) {
      void loadWorkspaceData()
    }
  }, [isAdmin, loadWorkspaceData])

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || loginBusy) return

    setAuthError(null)
    setLoginBusy(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setAuthError('E-mail ou senha inválidos.')
        return
      }

      if (!data.user) {
        setAuthError('Não foi possível iniciar sessão.')
        return
      }

      const allowed = await checkIsAdmin(data.user.id)
      if (!allowed) {
        await supabase.auth.signOut()
        setUser(null)
        setIsAdmin(false)
        setAuthError(
          'Acesso negado: esta conta não pertence à equipe de curadoria autorizada.',
        )
        return
      }

      setUser(data.user)
      setIsAdmin(true)
      setPassword('')
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao autenticar.',
      )
    } finally {
      setLoginBusy(false)
    }
  }

  async function handleSignOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setContribuicoes([])
    setGaleriaItems([])
    setFeedbackBanner(null)
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-forest-deep px-5 py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,102,88,0.35)_0%,rgba(21,34,28,0.96)_68%,rgba(15,25,20,1)_100%)]"
        />
        <div className="relative z-10 w-full max-w-md rounded-[36px] bg-parchment p-8 text-center text-ink shadow-[0_32px_80px_-28px_rgba(0,0,0,0.55)] sm:p-11">
          <div className="flex justify-center">
            <Logo tone="dark" compact />
          </div>
          <h1 className="mt-6 font-serif text-3xl font-normal text-ink">
            Curadoria indisponível
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone">
            {supabaseConfigIssue ?? 'Configure o Supabase para acessar a curadoria.'}
          </p>
          <Link
            to="/"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
          >
            Voltar ao Museu Carajás
          </Link>
        </div>
      </div>
    )
  }

  if (authChecking) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-forest-deep px-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,102,88,0.35)_0%,rgba(21,34,28,0.96)_68%,rgba(15,25,20,1)_100%)]"
        />
        <div className="relative z-10 flex items-center gap-3 rounded-full border border-parchment/25 bg-parchment px-6 py-3 text-sm font-medium text-forest shadow-lg">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          <span>Verificando sessão da curadoria...</span>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-forest-deep px-5 py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,102,88,0.35)_0%,rgba(21,34,28,0.96)_68%,rgba(15,25,20,1)_100%)]"
        />

        <form
          onSubmit={handleLoginSubmit}
          className="relative z-10 w-full max-w-md rounded-[36px] bg-parchment p-8 text-ink shadow-[0_32px_80px_-28px_rgba(0,0,0,0.55)] sm:p-11"
        >
          <div className="flex justify-center">
            <Logo tone="dark" compact />
          </div>

          <h1 className="mt-7 text-center font-serif text-3xl font-normal tracking-[-0.02em] text-ink">
            Acesso à Curadoria
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-stone">
            Entre com sua conta autorizada para revisar contribuições e publicar
            registros no acervo.
          </p>

          <div className="mt-7 space-y-4">
            <div>
              <label htmlFor="admin-email" className={loginLabelClass}>
                E-mail
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="curador@museucarajas.org"
                className={loginInputClass}
              />
            </div>

            <div>
              <label htmlFor="admin-password" className={loginLabelClass}>
                Senha
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className={loginInputClass}
              />
            </div>
          </div>

          {authError ? (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-2xl border border-[#8b2f2b]/35 bg-[#8b2f2b]/5 px-4 py-3 text-sm text-[#8b2f2b]"
            >
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span>{authError}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loginBusy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginBusy ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                  aria-hidden="true"
                />
                <span>Entrando...</span>
              </>
            ) : (
              <span>Entrar na curadoria</span>
            )}
          </button>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 text-sm text-stone transition-colors hover:text-ink"
            >
              <ArrowLeft
                size={14}
                strokeWidth={1.75}
                className="transition-transform group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
              Voltar ao Museu Carajás
            </Link>
          </div>
        </form>
      </div>
    )
  }

  const pendingCount = contribuicoes.filter(
    (entry) => entry.status === 'pendente',
  ).length
  const publishedCount = galeriaItems.filter((entry) => entry.publicado).length
  const filteredContribuicoes =
    statusFilter === 'todas'
      ? contribuicoes
      : contribuicoes.filter((entry) => entry.status === statusFilter)

  return (
    <div className="min-h-screen bg-parchment pb-24 text-ink">
      <header className="relative overflow-hidden rounded-b-[36px] bg-forest-deep text-parchment shadow-[0_24px_60px_-36px_rgba(16,33,25,0.55)] sm:rounded-b-[48px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,102,88,0.35)_0%,rgba(21,34,28,0.96)_68%,rgba(15,25,20,1)_100%)]"
        />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-3">
            <Logo tone="light" variant="wordmark" />
            <div>
              <h1 className="font-serif text-2xl font-normal tracking-[-0.015em] text-cream sm:text-[1.85rem]">
                Curadoria do Acervo
              </h1>
              {user.email ? (
                <p className="mt-0.5 text-xs text-parchment/70">{user.email}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-parchment/20 bg-parchment/10 px-3.5 py-1.5 text-xs font-medium text-parchment">
              {pendingCount} {pendingCount === 1 ? 'pendente' : 'pendentes'}
            </span>
            <span className="rounded-full border border-parchment/20 bg-parchment/10 px-3.5 py-1.5 text-xs font-medium text-parchment">
              {publishedCount}{' '}
              {publishedCount === 1 ? 'publicado' : 'publicados'}
            </span>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-parchment/30 px-4 py-2 text-xs font-medium text-parchment transition-colors hover:border-parchment hover:bg-parchment hover:text-forest-deep"
            >
              Ver site
              <ExternalLink size={13} aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="inline-flex items-center gap-1.5 rounded-full border border-parchment/20 px-4 py-2 text-xs font-medium text-parchment/85 transition-colors hover:border-parchment/45 hover:bg-parchment/10 hover:text-cream"
            >
              <LogOut size={13} aria-hidden="true" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
        <datalist id="curadoria-categorias">
          <option value="Cultura Xikrin" />
          <option value="Arqueologia" />
          <option value="Ferrovia & Formação" />
          <option value="Memória Urbana" />
          {materialCategories.map((category) => (
            <option key={category.value} value={category.label} />
          ))}
        </datalist>

        {/* Tier 1: Primary workspace switch */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Seções da curadoria"
            className="inline-flex items-center rounded-full border border-ink/10 bg-ink/[0.07] p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'fila'}
              onClick={() => setActiveTab('fila')}
              className={cn(
                'rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors',
                activeTab === 'fila'
                  ? 'bg-forest text-cream shadow-sm'
                  : 'text-ink/70 hover:text-ink',
              )}
            >
              Fila de Contribuições
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'acervo'}
              onClick={() => setActiveTab('acervo')}
              className={cn(
                'rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors',
                activeTab === 'acervo'
                  ? 'bg-forest text-cream shadow-sm'
                  : 'text-ink/70 hover:text-ink',
              )}
            >
              Acervo Publicado ({galeriaItems.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => void loadWorkspaceData()}
            disabled={loadingData}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-cream/85 px-4 py-2 text-xs font-medium text-forest transition-colors hover:border-forest hover:bg-cream disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={loadingData ? 'animate-spin' : undefined}
              aria-hidden="true"
            />
            Atualizar
          </button>
        </div>

        {/* Tier 2: Status filter pills when viewing submissions */}
        {activeTab === 'fila' ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
            <div
              role="group"
              aria-label="Filtrar contribuições por status"
              className="flex flex-wrap items-center gap-2"
            >
              {STATUS_FILTERS.map((filter) => {
                const selected = statusFilter === filter.value
                return (
                  <button
                    key={filter.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setStatusFilter(filter.value)}
                    className={cn(
                      'rounded-full border px-3.5 py-1 text-[12.5px] transition-colors',
                      selected
                        ? 'border-forest/35 bg-ink/12 font-semibold text-forest'
                        : 'border-ink/15 bg-transparent font-medium text-ink/65 hover:border-ink/35 hover:text-ink',
                    )}
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>

            <p className="text-xs tabular-nums text-stone">
              {filteredContribuicoes.length}{' '}
              {filteredContribuicoes.length === 1 ? 'envio' : 'envios'}
            </p>
          </div>
        ) : null}

        {feedbackBanner ? (
          <div
            role="status"
            className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-forest/25 bg-cream px-5 py-3.5 text-sm text-forest"
          >
            <span className="flex items-center gap-2">
              <Check size={16} aria-hidden="true" />
              {feedbackBanner}
            </span>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="text-xs font-medium text-stone hover:text-ink"
            >
              Fechar
            </button>
          </div>
        ) : null}

        {dataError ? (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-2xl border border-[#8b2f2b]/35 bg-[#8b2f2b]/5 px-5 py-3.5 text-sm text-[#8b2f2b]"
          >
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <span>{dataError}</span>
          </div>
        ) : null}

        {activeTab === 'fila' ? (
          <div className="mt-6 space-y-6">
            {loadingData ? (
              <div className="flex items-center justify-center gap-2 rounded-[32px] border border-ink/10 bg-cream py-16 text-sm text-stone">
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                <span>Carregando envios...</span>
              </div>
            ) : filteredContribuicoes.length === 0 ? (
              <div className="rounded-[32px] border border-ink/10 bg-cream px-6 py-14 text-center">
                <p className="font-serif text-2xl font-normal text-ink">
                  Nenhum envio nesta fila
                </p>
                <p className="mt-2 text-sm text-stone">
                  Alterne o filtro acima para consultar envios já analisados.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredContribuicoes.map((item) => (
                  <ContributionCard
                    key={item.id}
                    item={item}
                    onPublished={async (publishedTitle) => {
                      setFeedbackBanner(
                        `"${publishedTitle}" foi aprovado e publicado no acervo.`,
                      )
                      await loadWorkspaceData()
                    }}
                    onRejected={async (rejectedTitle) => {
                      setFeedbackBanner(
                        `"${rejectedTitle}" foi marcado como recusado.`,
                      )
                      await loadWorkspaceData()
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6">
            {loadingData ? (
              <div className="flex items-center justify-center gap-2 rounded-[32px] border border-ink/10 bg-cream py-16 text-sm text-stone">
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                <span>Carregando acervo...</span>
              </div>
            ) : galeriaItems.length === 0 ? (
              <div className="rounded-[32px] border border-ink/10 bg-cream px-6 py-14 text-center">
                <p className="font-serif text-2xl font-normal text-ink">
                  Nenhum registro cadastrado na galeria
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {galeriaItems.map((item) => (
                  <GalleryAdminCard
                    key={item.id}
                    item={item}
                    onTogglePublicado={async (id, nextValue) => {
                      try {
                        await toggleGaleriaPublicado(id, nextValue)
                        setFeedbackBanner(
                          nextValue
                            ? `"${item.titulo}" voltou a ser exibido no site.`
                            : `"${item.titulo}" foi ocultado da exibição pública.`,
                        )
                        await loadWorkspaceData()
                      } catch (error) {
                        setDataError(
                          error instanceof Error
                            ? error.message
                            : 'Erro ao alterar visibilidade.',
                        )
                      }
                    }}
                    onDelete={async (targetItem) => {
                      try {
                        await deleteGaleriaItem(targetItem)
                        setFeedbackBanner(
                          `"${targetItem.titulo}" foi removido do acervo.`,
                        )
                        await loadWorkspaceData()
                      } catch (error) {
                        setDataError(
                          error instanceof Error
                            ? error.message
                            : 'Erro ao excluir registro.',
                        )
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
