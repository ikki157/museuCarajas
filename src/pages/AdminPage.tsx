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
  Lock,
  LogOut,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
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
  type GaleriaItem,
  type GaleriaMediaType,
} from '../lib/galeria'
import { isSupabaseConfigured, supabase, supabaseConfigIssue } from '../lib/supabase'
import { cn, formatBytes, formatDate } from '../lib/utils'

type AdminTab = 'fila' | 'acervo'
type StatusFilter = 'pendente' | 'publicada' | 'recusada' | 'todas'

const STATUS_FILTERS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: 'pendente', label: 'Pendentes' },
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
    badgeClass: 'border-line bg-parchment/85 text-forest',
  },
  em_analise: {
    label: 'Em análise',
    badgeClass: 'border-forest/25 bg-parchment text-forest',
  },
  aprovada: {
    label: 'Aprovada',
    badgeClass: 'border-forest/30 bg-forest/10 text-forest',
  },
  publicada: {
    label: 'Publicada',
    badgeClass: 'border-forest bg-forest text-cream',
  },
  recusada: {
    label: 'Recusada',
    badgeClass: 'border-[#8b2f2b]/30 bg-[#8b2f2b]/10 text-[#8b2f2b]',
  },
}

const labelClass = 'mb-1.5 block text-[13px] font-medium text-ink/85'
const inputClass =
  'w-full rounded-xl border border-line/80 bg-parchment/55 px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-stone/65 focus:border-forest focus:bg-cream'

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
  const embedVideoUrl = item.midia_externa_url
    ? getEmbedVideoUrl(item.midia_externa_url)
    : null
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
    <article className="rounded-3xl border border-line/70 bg-cream p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/60 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-forest px-3 py-1 font-mono text-xs font-medium text-cream">
              {item.protocolo}
            </span>
            <span className="rounded-full border border-line bg-parchment/70 px-3 py-1 text-xs font-medium text-ink/85">
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

          <p className="text-sm text-ink">
            Enviado por <span className="font-medium">{item.nome}</span> (
            <a
              href={`mailto:${item.email}`}
              className="text-forest underline decoration-line underline-offset-2 hover:text-ink"
            >
              {item.email}
            </a>
            ){item.telefone ? ` · ${item.telefone}` : ''}
          </p>

          <p className="text-xs text-stone">
            Recebido em {formatDate(item.criado_em)}
            {item.arquivo_nome_original
              ? ` · ${item.arquivo_nome_original}`
              : ''}
            {item.arquivo_tamanho
              ? ` (${formatBytes(item.arquivo_tamanho)})`
              : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleTogglePreview()}
          aria-expanded={previewOpen}
          className="inline-flex items-center gap-2 rounded-full border border-forest/35 bg-parchment/60 px-4 py-2 text-xs font-medium text-forest transition-colors hover:border-forest hover:bg-parchment"
        >
          {previewOpen ? (
            <>
              <EyeOff size={14} strokeWidth={1.75} aria-hidden="true" />
              Ocultar pré-visualização
            </>
          ) : (
            <>
              <Eye size={14} strokeWidth={1.75} aria-hidden="true" />
              Pré-visualizar mídia
            </>
          )}
        </button>
      </div>

      {previewOpen ? (
        <div className="mt-5 rounded-2xl border border-line/70 bg-parchment/45 p-4">
          {loadingPreview ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-stone">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              <span>Carregando pré-visualização segura...</span>
            </div>
          ) : previewError ? (
            <div className="flex items-center gap-2 text-sm text-[#8b2f2b]">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{previewError}</span>
            </div>
          ) : item.midia_externa_url ? (
            <div className="space-y-3">
              {embedVideoUrl ? (
                <div className="aspect-video w-full overflow-hidden rounded-2xl bg-forest-deep">
                  <iframe
                    src={embedVideoUrl}
                    title={titulo || item.titulo}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : null}
              <a
                href={item.midia_externa_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-forest underline underline-offset-4 hover:text-ink"
              >
                <ExternalLink size={13} aria-hidden="true" />
                Abrir link externo em nova aba
              </a>
            </div>
          ) : signedUrl ? (
            item.tipo_midia === 'fotografia' ? (
              <div className="space-y-3">
                <img
                  src={signedUrl}
                  alt={titulo || item.titulo}
                  className="max-h-[420px] w-full rounded-2xl bg-forest-deep/5 object-contain"
                />
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-forest underline underline-offset-4 hover:text-ink"
                >
                  <ExternalLink size={13} aria-hidden="true" />
                  Abrir imagem em tamanho original
                </a>
              </div>
            ) : item.tipo_midia === 'video' ? (
              <video
                src={signedUrl}
                controls
                preload="metadata"
                className="max-h-[420px] w-full rounded-2xl bg-forest-deep"
              />
            ) : (
              <div className="space-y-3">
                <iframe
                  src={signedUrl}
                  title={`Pré-visualização do documento: ${titulo || item.titulo}`}
                  className="h-[420px] w-full rounded-2xl border border-line bg-cream"
                />
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-medium text-cream transition-colors hover:bg-forest-deep"
                >
                  <ExternalLink size={13} aria-hidden="true" />
                  Abrir PDF
                </a>
              </div>
            )
          ) : (
            <p className="text-sm text-stone">
              Nenhuma mídia anexada para pré-visualização.
            </p>
          )}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`titulo-${item.id}`} className={labelClass}>
            Título
          </label>
          <input
            id={`titulo-${item.id}`}
            type="text"
            maxLength={160}
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`categoria-${item.id}`} className={labelClass}>
            Categoria
          </label>
          <input
            id={`categoria-${item.id}`}
            type="text"
            maxLength={40}
            list="curadoria-categorias"
            value={categoria}
            onChange={(event) => setCategoria(event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`periodo-${item.id}`} className={labelClass}>
            Época / Período
          </label>
          <input
            id={`periodo-${item.id}`}
            type="text"
            maxLength={80}
            value={periodoEstimado}
            onChange={(event) => setPeriodoEstimado(event.target.value)}
            placeholder="Ex.: Década de 1980"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`local-${item.id}`} className={labelClass}>
            Local
          </label>
          <input
            id={`local-${item.id}`}
            type="text"
            maxLength={120}
            value={localizacao}
            onChange={(event) => setLocalizacao(event.target.value)}
            placeholder="Ex.: Serra dos Carajás"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`credito-${item.id}`} className={labelClass}>
            Crédito
          </label>
          <input
            id={`credito-${item.id}`}
            type="text"
            maxLength={200}
            value={credito}
            onChange={(event) => setCredito(event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`descricao-${item.id}`} className={labelClass}>
            Descrição
          </label>
          <textarea
            id={`descricao-${item.id}`}
            rows={3}
            maxLength={2000}
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            className={cn(inputClass, 'resize-y leading-relaxed')}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`obs-${item.id}`} className={labelClass}>
            Observações da curadoria (opcional)
          </label>
          <input
            id={`obs-${item.id}`}
            type="text"
            value={observacoes}
            onChange={(event) => setObservacoes(event.target.value)}
            placeholder="Motivo de recusa ou nota editorial interna..."
            className={inputClass}
          />
        </div>
      </div>

      {actionError ? (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-2xl border border-[#8b2f2b]/35 bg-[#8b2f2b]/5 px-4 py-3 text-sm text-[#8b2f2b]"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line/60 pt-5">
        {item.status !== 'recusada' && item.status !== 'publicada' ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void handleReject()}
            className="inline-flex items-center gap-2 rounded-full border border-[#8b2f2b]/40 px-5 py-2.5 text-sm font-medium text-[#8b2f2b] transition-colors hover:bg-[#8b2f2b]/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRejecting ? (
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            ) : null}
            Recusar
          </button>
        ) : null}

        <button
          type="button"
          disabled={isBusy || item.status === 'publicada'}
          onClick={() => void handlePublish()}
          className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPublishing ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
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
    </article>
  )
}

type GalleryAdminRowProps = {
  item: GaleriaItem
  onTogglePublicado: (id: string, nextValue: boolean) => Promise<void>
  onDelete: (item: GaleriaItem) => Promise<void>
}

function GalleryAdminRow({
  item,
  onTogglePublicado,
  onDelete,
}: GalleryAdminRowProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  const imageUrl =
    item.tipo_midia === 'fotografia'
      ? getGaleriaImageUrl(item)
      : getGaleriaThumbnailUrl(item)

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-line/70 bg-cream p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-parchment text-forest">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : item.tipo_midia === 'video' ? (
            <Film size={20} aria-hidden="true" />
          ) : item.tipo_midia === 'documento' ? (
            <FileText size={20} aria-hidden="true" />
          ) : (
            <ImageIcon size={20} aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                item.publicado
                  ? 'bg-forest text-cream'
                  : 'border border-line bg-parchment text-stone',
              )}
            >
              {item.publicado ? 'Publicado' : 'Oculto'}
            </span>
            <span className="text-xs text-stone">
              {MEDIA_LABELS[item.tipo_midia]} · {item.categoria}
            </span>
          </div>

          <p className="mt-1 truncate font-serif text-lg font-normal text-ink">
            {item.titulo}
          </p>

          <p className="truncate text-xs text-stone">
            {item.periodo_estimado ? `${item.periodo_estimado} · ` : ''}
            {item.credito ?? 'Acervo Museu Carajás'}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2.5">
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
          className="rounded-full border border-forest/35 px-4 py-2 text-xs font-medium text-forest transition-colors hover:border-forest hover:bg-parchment/70 disabled:opacity-50"
        >
          {item.publicado ? 'Ocultar' : 'Publicar'}
        </button>

        {confirmingDelete ? (
          <div className="flex items-center gap-2">
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
              className="rounded-full bg-[#8b2f2b] px-4 py-2 text-xs font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Confirmar exclusão
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmingDelete(false)}
              className="rounded-full border border-line px-3 py-2 text-xs text-stone hover:text-ink"
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
            className="inline-flex items-center gap-1.5 rounded-full border border-[#8b2f2b]/35 px-4 py-2 text-xs font-medium text-[#8b2f2b] transition-colors hover:bg-[#8b2f2b]/10 disabled:opacity-50"
          >
            <Trash2 size={13} aria-hidden="true" />
            Excluir
          </button>
        )}
      </div>
    </div>
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
        listContribuicoes(statusFilter),
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
  }, [isAdmin, statusFilter])

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
      <div className="flex min-h-screen items-center justify-center bg-parchment px-5 py-16">
        <div className="w-full max-w-md rounded-3xl border border-line/70 bg-cream p-8 text-center">
          <h1 className="font-serif text-3xl font-normal text-ink">
            Curadoria indisponível
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone">
            {supabaseConfigIssue ?? 'Configure o Supabase para acessar a curadoria.'}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream hover:bg-forest-deep"
          >
            Voltar ao site
          </Link>
        </div>
      </div>
    )
  }

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-parchment px-5">
        <div className="flex items-center gap-3 rounded-full border border-line bg-cream px-6 py-3 text-sm text-forest">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          <span>Verificando sessão da curadoria...</span>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-parchment px-5 py-16">
        <div className="mx-auto w-full max-w-md">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm text-stone transition-colors hover:text-ink"
          >
            <ArrowLeft
              size={15}
              strokeWidth={1.75}
              className="transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            Voltar ao acervo
          </Link>

          <form
            onSubmit={handleLoginSubmit}
            className="mt-6 rounded-3xl border border-line/70 bg-cream p-8 sm:p-10"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-parchment text-forest">
              <Lock size={18} strokeWidth={1.75} aria-hidden="true" />
            </div>

            <h1 className="mt-5 font-serif text-3xl font-normal tracking-[-0.02em] text-ink">
              Curadoria · Museu Carajás
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone">
              Acesso restrito à equipe curatorial para revisão e publicação de
              registros no acervo.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="admin-email" className={labelClass}>
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
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="admin-password" className={labelClass}>
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
                  className={inputClass}
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
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment pb-24">
      <header className="border-b border-line/70 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div>
            <h1 className="font-serif text-2xl font-normal text-ink">
              Curadoria · Museu Carajás
            </h1>
            {user.email ? (
              <p className="text-xs text-stone">{user.email}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-parchment/70 px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-forest hover:bg-parchment"
            >
              Ver site
              <ExternalLink size={13} aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="inline-flex items-center gap-1.5 rounded-full border border-forest/35 px-4 py-2 text-xs font-medium text-forest transition-colors hover:bg-forest hover:text-cream"
            >
              <LogOut size={13} aria-hidden="true" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 pt-8 sm:px-8">
        <datalist id="curadoria-categorias">
          <option value="Cultura Xikrin" />
          <option value="Arqueologia" />
          <option value="Ferrovia & Formação" />
          <option value="Memória Urbana" />
          {materialCategories.map((category) => (
            <option key={category.value} value={category.label} />
          ))}
        </datalist>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Seções da curadoria"
            className="inline-flex rounded-full border border-line/70 bg-cream p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'fila'}
              onClick={() => setActiveTab('fila')}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                activeTab === 'fila'
                  ? 'bg-forest text-cream'
                  : 'text-stone hover:text-ink',
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
                'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                activeTab === 'acervo'
                  ? 'bg-forest text-cream'
                  : 'text-stone hover:text-ink',
              )}
            >
              Acervo Publicado ({galeriaItems.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => void loadWorkspaceData()}
            disabled={loadingData}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-4 py-2 text-xs font-medium text-forest transition-colors hover:border-forest disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={loadingData ? 'animate-spin' : undefined}
              aria-hidden="true"
            />
            Atualizar
          </button>
        </div>

        {feedbackBanner ? (
          <div
            role="status"
            className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-forest/30 bg-cream px-5 py-3 text-sm text-forest"
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
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{dataError}</span>
          </div>
        ) : null}

        {activeTab === 'fila' ? (
          <div className="mt-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                role="group"
                aria-label="Filtrar contribuições por status"
                className="flex flex-wrap gap-2"
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
                        'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                        selected
                          ? 'bg-forest text-cream'
                          : 'border border-line/80 bg-cream/80 text-stone hover:text-ink',
                      )}
                    >
                      {filter.label}
                    </button>
                  )
                })}
              </div>

              <p className="text-xs tabular-nums text-stone">
                {contribuicoes.length}{' '}
                {contribuicoes.length === 1 ? 'envio' : 'envios'}
              </p>
            </div>

            {loadingData ? (
              <div className="flex items-center justify-center gap-2 rounded-3xl border border-line/70 bg-cream py-16 text-sm text-stone">
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                <span>Carregando envios...</span>
              </div>
            ) : contribuicoes.length === 0 ? (
              <div className="rounded-3xl border border-line/70 bg-cream px-6 py-14 text-center">
                <p className="font-serif text-2xl font-normal text-ink">
                  Nenhum envio nesta fila
                </p>
                <p className="mt-2 text-sm text-stone">
                  Alterne o filtro acima para consultar envios já analisados.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {contribuicoes.map((item) => (
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
          <div className="mt-6 space-y-4">
            {loadingData ? (
              <div className="flex items-center justify-center gap-2 rounded-3xl border border-line/70 bg-cream py-16 text-sm text-stone">
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                <span>Carregando acervo...</span>
              </div>
            ) : galeriaItems.length === 0 ? (
              <div className="rounded-3xl border border-line/70 bg-cream px-6 py-14 text-center">
                <p className="font-serif text-2xl font-normal text-ink">
                  Nenhum registro cadastrado na galeria
                </p>
              </div>
            ) : (
              galeriaItems.map((item) => (
                <GalleryAdminRow
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
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

