import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileText,
  Film,
  Link2,
  Loader2,
  Lock,
  Send,
  Upload,
  X,
} from 'lucide-react'
import { materialCategories, visit } from '../../data/content'
import {
  validateContributionFile,
  validateExternalVideoUrl,
  type ValidatedFile,
  type ValidatedFileCategory,
} from '../../lib/file-validation'
import { ContributionError, submitContribution } from '../../lib/contribuicao'
import { isSupabaseConfigured, supabaseConfigIssue } from '../../lib/supabase'
import { cn, formatBytes } from '../../lib/utils'
import { Button } from '../ui/Button'

type FieldName =
  | 'nome'
  | 'email'
  | 'telefone'
  | 'titulo'
  | 'categoria'
  | 'periodoEstimado'
  | 'localizacao'
  | 'descricao'
  | 'midiaExternaUrl'
  | 'arquivo'
  | 'autorizacao'

type VideoSourceMode = 'upload' | 'url'

type FormValues = {
  nome: string
  email: string
  telefone: string
  titulo: string
  categoria: string
  periodoEstimado: string
  localizacao: string
  descricao: string
  midiaExternaUrl: string
}

type FormErrors = Partial<Record<FieldName, string>>
type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error'

const initialValues: FormValues = {
  nome: '',
  email: '',
  telefone: '',
  titulo: '',
  categoria: '',
  periodoEstimado: '',
  localizacao: '',
  descricao: '',
  midiaExternaUrl: '',
}

const MEDIA_TYPE_OPTIONS: ReadonlyArray<{
  value: ValidatedFileCategory
  label: string
  hint: string
  accept: string
  helper: string
  icon: typeof Camera
}> = [
  {
    value: 'fotografia',
    label: 'Fotografia',
    hint: 'JPG, PNG ou WEBP',
    accept: '.jpg,.jpeg,.png,.webp',
    helper:
      'Fotografias em JPG, PNG ou WEBP até 10 MB. A extensão, o tipo MIME e o conteúdo real são verificados.',
    icon: Camera,
  },
  {
    value: 'video',
    label: 'Vídeo',
    hint: 'MP4/WebM ou YouTube/Vimeo',
    accept: '.mp4,.webm',
    helper:
      'Vídeos curtos em MP4 ou WEBM até 25 MB para envio direto (ou use um link do YouTube/Vimeo acima).',
    icon: Film,
  },
  {
    value: 'documento',
    label: 'Documento Histórico',
    hint: 'PDF até 15 MB',
    accept: '.pdf',
    helper:
      'Documentos históricos digitalizados em PDF até 15 MB. A assinatura e integridade do arquivo são verificadas.',
    icon: FileText,
  },
]

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null

  return (
    <p id={id} className="field-error" role="alert">
      <AlertCircle size={13} strokeWidth={1.9} className="mt-px shrink-0" aria-hidden="true" />
      {message}
    </p>
  )
}

export function ContributionForm() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [tipoMidia, setTipoMidia] = useState<ValidatedFileCategory>('fotografia')
  const [videoSource, setVideoSource] = useState<VideoSourceMode>('upload')
  const [file, setFile] = useState<ValidatedFile | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [validatingFile, setValidatingFile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [autorizacao, setAutorizacao] = useState(false)
  const [website, setWebsite] = useState('')
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})
  const [attempted, setAttempted] = useState(false)
  const [status, setStatus] = useState<SubmissionStatus>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [protocolo, setProtocolo] = useState<string | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropzoneRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const formStartedAt = useRef(Date.now())
  const formOpenedAtPerf = useRef(performance.now())

  const isBusy = status === 'submitting' || validatingFile
  const isExternalVideo = tipoMidia === 'video' && videoSource === 'url'
  const activeMediaConfig =
    MEDIA_TYPE_OPTIONS.find((option) => option.value === tipoMidia) ?? MEDIA_TYPE_OPTIONS[0]

  useEffect(() => {
    if (!file) {
      setObjectUrl(null)
      return
    }

    const url = URL.createObjectURL(file.file)
    setObjectUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (status === 'success') {
      successRef.current?.focus()
    }
  }, [status])

  const validationErrors = useMemo<FormErrors>(() => {
    const next: FormErrors = {}
    const name = values.nome.trim()
    const email = values.email.trim()
    const phoneDigits = values.telefone.replace(/\D/g, '')

    if (name.length < 5 || !name.includes(' ')) {
      next.nome = 'Informe seu nome completo (nome e sobrenome).'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      next.email = 'Informe um endereço de e-mail válido.'
    }

    if (phoneDigits && phoneDigits.length < 10) {
      next.telefone = 'Informe um telefone com DDD ou deixe este campo em branco.'
    }

    if (values.titulo.trim().length < 3) {
      next.titulo = 'Informe o título ou o nome do item.'
    }

    if (!values.categoria) {
      next.categoria = 'Selecione a categoria do material.'
    }

    if (values.periodoEstimado.trim().length > 80) {
      next.periodoEstimado = 'O período estimado deve ter no máximo 80 caracteres.'
    }

    if (values.localizacao.trim().length > 120) {
      next.localizacao = 'A localização deve ter no máximo 120 caracteres.'
    }

    if (values.descricao.trim().length < 20) {
      next.descricao = 'Descreva o item e seu contexto com pelo menos 20 caracteres.'
    }

    if (isExternalVideo) {
      const urlCheck = validateExternalVideoUrl(values.midiaExternaUrl)
      if (!urlCheck.ok) {
        next.midiaExternaUrl = urlCheck.error
      }
    } else if (!file) {
      next.arquivo =
        fileError ??
        (tipoMidia === 'video'
          ? 'Anexe um vídeo curto em MP4 ou WEBM.'
          : tipoMidia === 'documento'
            ? 'Anexe um documento histórico em PDF.'
            : 'Anexe uma fotografia em JPG, PNG ou WEBP.')
    }

    if (!autorizacao) {
      next.autorizacao = 'Marque a autorização para que o museu analise a contribuição.'
    }

    return next
  }, [values, file, fileError, autorizacao, isExternalVideo, tipoMidia])

  const showError = (field: FieldName): string | undefined => {
    if (field === 'arquivo' && fileError && !isExternalVideo) return fileError
    if (!attempted && !touched[field]) return undefined
    return validationErrors[field]
  }

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setSubmitError(null)
    if (status === 'error') setStatus('idle')
  }

  const markTouched = (field: FieldName) => {
    setTouched((current) => ({ ...current, [field]: true }))
  }

  const handleMediaTypeChange = (nextType: ValidatedFileCategory) => {
    setTipoMidia(nextType)
    setSubmitError(null)
    setFileError(null)
    if (status === 'error') setStatus('idle')

    if (file && file.category !== nextType) {
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    if (nextType !== 'video') {
      setVideoSource('upload')
    }
  }

  const handleVideoSourceChange = (nextSource: VideoSourceMode) => {
    setVideoSource(nextSource)
    setSubmitError(null)
    setFileError(null)
    if (status === 'error') setStatus('idle')
    if (nextSource === 'url') {
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFile = async (selected: File | undefined) => {
    if (!selected) return

    setFile(null)
    setFileError(null)
    setValidatingFile(true)

    try {
      const result = await validateContributionFile(selected)
      if (!result.ok) {
        setFileError(result.error)
        return
      }
      if (result.value.category !== tipoMidia) {
        const expectedLabel = activeMediaConfig.label.toLowerCase()
        setFileError(
          `Este arquivo foi detectado como ${result.value.category}. Envie um arquivo de ${expectedLabel} (${activeMediaConfig.hint}) ou altere o tipo de mídia acima.`,
        )
        return
      }
      setFile(result.value)
    } catch {
      setFileError('Não foi possível validar o arquivo. Tente novamente.')
    } finally {
      setValidatingFile(false)
    }
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    event.target.value = ''
    void handleFile(selected)
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const selected = event.dataTransfer.files?.[0]
    void handleFile(selected)
  }

  const removeFile = () => {
    setFile(null)
    setFileError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const resetForm = () => {
    setValues(initialValues)
    setTipoMidia('fotografia')
    setVideoSource('upload')
    setFile(null)
    setFileError(null)
    setAutorizacao(false)
    setWebsite('')
    setTouched({})
    setAttempted(false)
    setStatus('idle')
    setSubmitError(null)
    setProtocolo(null)
    formStartedAt.current = Date.now()
    formOpenedAtPerf.current = performance.now()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const focusFirstError = (firstField: FieldName) => {
    window.requestAnimationFrame(() => {
      if (firstField === 'arquivo') {
        fileInputRef.current?.focus()
        dropzoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        document.getElementById(firstField)?.focus()
      }
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAttempted(true)
    setSubmitError(null)

    const firstField = Object.keys(validationErrors)[0] as FieldName | undefined

    if (firstField) {
      focusFirstError(firstField)
      return
    }

    let normalizedExternalUrl: string | undefined
    if (isExternalVideo) {
      const check = validateExternalVideoUrl(values.midiaExternaUrl)
      if (!check.ok) {
        focusFirstError('midiaExternaUrl')
        return
      }
      normalizedExternalUrl = check.normalizedUrl
    } else if (!file) {
      return
    }

    if (!isSupabaseConfigured) {
      setStatus('error')
      setSubmitError(
        'O serviço de envio não está configurado neste ambiente. Nenhum dado foi enviado.',
      )
      return
    }

    setStatus('submitting')

    try {
      const elapsedMs = Math.max(0, Math.round(performance.now() - formOpenedAtPerf.current))
      const response = await submitContribution({
        nome: values.nome.trim(),
        email: values.email.trim().toLowerCase(),
        telefone: values.telefone.trim(),
        titulo: values.titulo.trim(),
        categoria: values.categoria,
        descricao: values.descricao.trim(),
        autorizacao,
        website,
        tipoMidia,
        periodoEstimado: values.periodoEstimado.trim() || undefined,
        localizacao: values.localizacao.trim() || undefined,
        midiaExternaUrl: normalizedExternalUrl,
        arquivo: normalizedExternalUrl ? undefined : file,
        formStartedAt: formStartedAt.current,
        formElapsedMs: elapsedMs,
      })

      setProtocolo(response.protocolo)
      setStatus('success')
      setValues(initialValues)
      setTipoMidia('fotografia')
      setVideoSource('upload')
      setFile(null)
      setAutorizacao(false)
      setTouched({})
      setAttempted(false)
      formStartedAt.current = Date.now()
      formOpenedAtPerf.current = performance.now()
    } catch (error) {
      setStatus('error')
      setSubmitError(
        error instanceof ContributionError
          ? error.message
          : 'Não foi possível concluir o envio. Tente novamente em alguns instantes.',
      )
    }
  }

  if (status === 'success' && protocolo) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="relative rounded-[36px] bg-cream p-6 shadow-[0_24px_60px_-35px_rgba(21,34,28,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:p-10 lg:p-12"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#6f8b5d]/35 bg-[#6f8b5d]/10 text-[#4e6a3e]">
          <CheckCircle2 size={26} strokeWidth={1.6} aria-hidden="true" />
        </div>
        <p className="eyebrow mt-6 text-[#4e6a3e]">Registro recebido</p>
        <h3 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.7rem)] font-medium leading-[1.05] text-forest">
          Obrigado por compartilhar essa memória.
        </h3>
        <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-stone">
          Sua contribuição foi recebida para análise da equipe curatorial do Museu Carajás. Ela não
          é publicada automaticamente no acervo digital.
        </p>

        <div className="mt-7 rounded-2xl bg-parchment px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
            Protocolo de envio
          </p>
          <p className="mt-1 font-mono text-[19px] font-semibold tracking-[0.08em] text-forest">
            {protocolo}
          </p>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-stone">
          Guarde o protocolo. Em caso de dúvidas, escreva para{' '}
          <a
            href={`mailto:${visit.emails[0]}`}
            className="text-clay underline decoration-clay/30 underline-offset-4 transition hover:text-clay-dark"
          >
            {visit.emails[0]}
          </a>
          .
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="primary" onClick={resetForm}>
            Enviar outro registro
          </Button>
          <a
            href="#galeria"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-forest/60 px-7 py-3.5 text-[12px] font-medium tracking-[0.06em] text-forest transition hover:bg-forest hover:text-cream"
          >
            Explorar acervo
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-[36px] bg-cream p-6 shadow-[0_24px_60px_-35px_rgba(21,34,28,0.25)] sm:p-10 lg:p-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow text-clay">Formulário</p>
          <h3
            id="form-title"
            className="display mt-2 text-[clamp(1.8rem,3.2vw,2.5rem)] font-medium leading-none text-forest"
          >
            Envie um registro ao acervo
          </h3>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-forest/50 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest/80">
          <Lock size={11} strokeWidth={1.8} aria-hidden="true" />
          Projeto Salvaguarda
        </span>
      </div>

      <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-stone">
        Compartilhe fotografias, vídeos curtos ou documentos históricos ligados à região de
        Carajás. A equipe do museu fará a validação curatorial antes da publicação.
      </p>

      {!isSupabaseConfigured ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-clay/25 bg-clay/5 p-4 text-clay">
          <AlertTriangle size={18} strokeWidth={1.7} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div className="text-[12px] leading-relaxed">
            <p className="font-semibold">Envio indisponível neste ambiente</p>
            <p className="mt-1 text-clay/90">
              A conexão com o Supabase ainda não foi configurada. Nenhuma contribuição será
              enviada. Consulte o README para configurar o serviço.
            </p>
            {import.meta.env.DEV && supabaseConfigIssue ? (
              <p className="mt-2 font-mono text-xs leading-relaxed text-clay/85">
                {supabaseConfigIssue}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <form
        noValidate
        aria-labelledby="form-title"
        onSubmit={handleSubmit}
        className="mt-7"
        autoComplete="on"
      >
        <fieldset disabled={isBusy} className="min-w-0 border-0 p-0">
          <div className="mb-6">
            <p id="tipo-midia-label" className="field-label">
              Tipo de registro <span className="text-clay">*</span>
            </p>
            <div
              role="group"
              aria-labelledby="tipo-midia-label"
              className="grid gap-2.5 sm:grid-cols-3"
            >
              {MEDIA_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = tipoMidia === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleMediaTypeChange(option.value)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
                      isSelected
                        ? 'border-forest bg-forest text-cream shadow-sm'
                        : 'border-stone/40 bg-parchment text-ink hover:border-forest',
                    )}
                  >
                    <Icon size={17} strokeWidth={1.7} className="shrink-0" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium leading-tight">
                        {option.label}
                      </span>
                      <span
                        className={cn(
                          'mt-0.5 block truncate text-[11px]',
                          isSelected ? 'text-cream/80' : 'text-stone',
                        )}
                      >
                        {option.hint}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="nome" className="field-label">
                Nome completo <span className="text-clay">*</span>
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                autoComplete="name"
                value={values.nome}
                onChange={(event) => updateValue('nome', event.target.value)}
                onBlur={() => markTouched('nome')}
                aria-invalid={Boolean(showError('nome'))}
                aria-describedby={showError('nome') ? 'nome-error' : undefined}
                placeholder="Como você gostaria de ser identificado(a)"
                className={cn('input-base', showError('nome') && 'input-error')}
              />
              <FieldError id="nome-error" message={showError('nome')} />
            </div>

            <div>
              <label htmlFor="email" className="field-label">
                E-mail <span className="text-clay">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => updateValue('email', event.target.value)}
                onBlur={() => markTouched('email')}
                aria-invalid={Boolean(showError('email'))}
                aria-describedby={showError('email') ? 'email-error' : undefined}
                placeholder="voce@exemplo.com"
                className={cn('input-base', showError('email') && 'input-error')}
              />
              <FieldError id="email-error" message={showError('email')} />
            </div>

            <div>
              <label htmlFor="telefone" className="field-label">
                Telefone{' '}
                <span className="font-normal normal-case tracking-normal text-stone">(opcional)</span>
              </label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={values.telefone}
                onChange={(event) => updateValue('telefone', formatPhoneInput(event.target.value))}
                onBlur={() => markTouched('telefone')}
                aria-invalid={Boolean(showError('telefone'))}
                aria-describedby={showError('telefone') ? 'telefone-error' : undefined}
                placeholder="(94) 90000-0000"
                className={cn('input-base', showError('telefone') && 'input-error')}
              />
              <FieldError id="telefone-error" message={showError('telefone')} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="titulo" className="field-label">
                Título ou nome do registro <span className="text-clay">*</span>
              </label>
              <input
                id="titulo"
                name="titulo"
                type="text"
                value={values.titulo}
                onChange={(event) => updateValue('titulo', event.target.value)}
                onBlur={() => markTouched('titulo')}
                aria-invalid={Boolean(showError('titulo'))}
                aria-describedby={showError('titulo') ? 'titulo-error' : undefined}
                placeholder="Ex.: Fotografia da Praça de Eventos na década de 1990"
                maxLength={160}
                className={cn('input-base', showError('titulo') && 'input-error')}
              />
              <FieldError id="titulo-error" message={showError('titulo')} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="categoria" className="field-label">
                Categoria temática <span className="text-clay">*</span>
              </label>
              <select
                id="categoria"
                name="categoria"
                value={values.categoria}
                onChange={(event) => updateValue('categoria', event.target.value)}
                onBlur={() => markTouched('categoria')}
                aria-invalid={Boolean(showError('categoria'))}
                aria-describedby={showError('categoria') ? 'categoria-error' : undefined}
                className={cn('input-base', showError('categoria') && 'input-error')}
              >
                <option value="">Selecione uma categoria</option>
                {materialCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <FieldError id="categoria-error" message={showError('categoria')} />
            </div>

            <div>
              <label htmlFor="periodoEstimado" className="field-label">
                Período ou ano estimado{' '}
                <span className="font-normal normal-case tracking-normal text-stone">(opcional)</span>
              </label>
              <input
                id="periodoEstimado"
                name="periodoEstimado"
                type="text"
                value={values.periodoEstimado}
                onChange={(event) => updateValue('periodoEstimado', event.target.value)}
                onBlur={() => markTouched('periodoEstimado')}
                aria-invalid={Boolean(showError('periodoEstimado'))}
                aria-describedby={showError('periodoEstimado') ? 'periodo-error' : undefined}
                placeholder="Ex.: Década de 1980 ou 1987"
                maxLength={80}
                className={cn('input-base', showError('periodoEstimado') && 'input-error')}
              />
              <FieldError id="periodo-error" message={showError('periodoEstimado')} />
            </div>

            <div>
              <label htmlFor="localizacao" className="field-label">
                Local do registro{' '}
                <span className="font-normal normal-case tracking-normal text-stone">(opcional)</span>
              </label>
              <input
                id="localizacao"
                name="localizacao"
                type="text"
                value={values.localizacao}
                onChange={(event) => updateValue('localizacao', event.target.value)}
                onBlur={() => markTouched('localizacao')}
                aria-invalid={Boolean(showError('localizacao'))}
                aria-describedby={showError('localizacao') ? 'localizacao-error' : undefined}
                placeholder="Ex.: Núcleo Urbano de Carajás, Parauapebas"
                maxLength={120}
                className={cn('input-base', showError('localizacao') && 'input-error')}
              />
              <FieldError id="localizacao-error" message={showError('localizacao')} />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="descricao" className="field-label">
                  Descrição e contexto histórico <span className="text-clay">*</span>
                </label>
                <span className="text-xs tabular-nums text-stone">
                  {values.descricao.length}/2000
                </span>
              </div>
              <textarea
                id="descricao"
                name="descricao"
                rows={4}
                value={values.descricao}
                onChange={(event) => updateValue('descricao', event.target.value)}
                onBlur={() => markTouched('descricao')}
                aria-invalid={Boolean(showError('descricao'))}
                aria-describedby={
                  showError('descricao') ? 'descricao-error descricao-help' : 'descricao-help'
                }
                placeholder="Conte a história do registro: o que aparece, quem participou, em que época foi feito e como se relaciona com a região de Carajás."
                maxLength={2000}
                className={cn('input-base min-h-[120px] resize-y', showError('descricao') && 'input-error')}
              />
              <p id="descricao-help" className="mt-1.5 text-xs leading-relaxed text-stone">
                Quanto mais contexto, melhor para a catalogação pela equipe do museu.
              </p>
              <FieldError id="descricao-error" message={showError('descricao')} />
            </div>

            <div className="sm:col-span-2">
              {tipoMidia === 'video' ? (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="field-label mb-0" id="video-source-label">
                    Forma de envio do vídeo <span className="text-clay">*</span>
                  </p>
                  <div
                    role="group"
                    aria-labelledby="video-source-label"
                    className="inline-flex rounded-full bg-parchment p-1"
                  >
                    <button
                      type="button"
                      aria-pressed={videoSource === 'upload'}
                      onClick={() => handleVideoSourceChange('upload')}
                      className={cn(
                        'rounded-full px-4 py-1.5 text-xs font-medium transition',
                        videoSource === 'upload'
                          ? 'bg-forest text-cream'
                          : 'text-stone hover:text-ink',
                      )}
                    >
                      Arquivo (MP4 / WebM)
                    </button>
                    <button
                      type="button"
                      aria-pressed={videoSource === 'url'}
                      onClick={() => handleVideoSourceChange('url')}
                      className={cn(
                        'rounded-full px-4 py-1.5 text-xs font-medium transition',
                        videoSource === 'url'
                          ? 'bg-forest text-cream'
                          : 'text-stone hover:text-ink',
                      )}
                    >
                      Link YouTube / Vimeo
                    </button>
                  </div>
                </div>
              ) : (
                <p className="field-label" id="arquivo-label">
                  {tipoMidia === 'documento' ? 'Documento histórico (PDF)' : 'Fotografia'}{' '}
                  <span className="text-clay">*</span>
                </p>
              )}

              {isExternalVideo ? (
                <div>
                  <label htmlFor="midiaExternaUrl" className="sr-only">
                    Link do vídeo no YouTube ou Vimeo
                  </label>
                  <div className="relative">
                    <Link2
                      size={16}
                      strokeWidth={1.7}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone"
                    />
                    <input
                      id="midiaExternaUrl"
                      name="midiaExternaUrl"
                      type="url"
                      value={values.midiaExternaUrl}
                      onChange={(event) => updateValue('midiaExternaUrl', event.target.value)}
                      onBlur={() => markTouched('midiaExternaUrl')}
                      aria-invalid={Boolean(showError('midiaExternaUrl'))}
                      aria-describedby={
                        showError('midiaExternaUrl')
                          ? 'midia-url-error midia-url-help'
                          : 'midia-url-help'
                      }
                      placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
                      maxLength={512}
                      className={cn(
                        'input-base pl-11',
                        showError('midiaExternaUrl') && 'input-error',
                      )}
                    />
                  </div>
                  <p id="midia-url-help" className="mt-1.5 text-xs leading-relaxed text-stone">
                    Aceitamos apenas links HTTPS públicos do YouTube (watch, youtu.be, shorts) ou
                    Vimeo.
                  </p>
                  <FieldError id="midia-url-error" message={showError('midiaExternaUrl')} />
                </div>
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    id="arquivo"
                    name="arquivo"
                    type="file"
                    accept={activeMediaConfig.accept}
                    onChange={onFileChange}
                    className="peer sr-only"
                    aria-labelledby={tipoMidia === 'video' ? 'video-source-label' : 'arquivo-label'}
                    aria-invalid={Boolean(showError('arquivo'))}
                    aria-describedby={
                      showError('arquivo') ? 'arquivo-error arquivo-help' : 'arquivo-help'
                    }
                  />

                  {file ? (
                    <div className="rounded-2xl bg-parchment p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sand-deep">
                          {file.category === 'fotografia' && objectUrl ? (
                            <img
                              src={objectUrl}
                              alt={`Pré-visualização de ${file.file.name}`}
                              className="h-full w-full object-cover"
                            />
                          ) : file.category === 'video' && objectUrl ? (
                            <video
                              src={objectUrl}
                              muted
                              playsInline
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FileText
                              size={28}
                              strokeWidth={1.3}
                              className="text-clay"
                              aria-hidden="true"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">
                            {file.category === 'fotografia'
                              ? 'Fotografia'
                              : file.category === 'video'
                                ? 'Vídeo'
                                : 'Documento PDF'}
                          </p>
                          <p
                            className="mt-1 truncate text-[13.5px] font-medium text-ink"
                            title={file.file.name}
                          >
                            {file.file.name}
                          </p>
                          <p className="mt-1 text-xs text-stone">
                            {formatBytes(file.size)} · {file.mime}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                            <label
                              htmlFor="arquivo"
                              className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-forest underline decoration-forest/25 underline-offset-4 transition hover:text-clay"
                            >
                              Trocar arquivo
                            </label>
                            {file.category === 'documento' && objectUrl ? (
                              <a
                                href={objectUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-xs font-semibold uppercase tracking-[0.12em] text-forest underline decoration-forest/25 underline-offset-4 transition hover:text-clay"
                              >
                                Visualizar PDF
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={removeFile}
                              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-clay transition hover:text-clay-dark"
                            >
                              <X size={12} strokeWidth={2} aria-hidden="true" />
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      ref={dropzoneRef}
                      tabIndex={-1}
                      onDragOver={(event) => {
                        event.preventDefault()
                        setIsDragging(true)
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={onDrop}
                      className={cn(
                        'rounded-3xl border border-dashed p-6 transition-colors peer-focus-visible:border-forest peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-forest sm:p-8',
                        isDragging
                          ? 'border-forest bg-forest/5'
                          : showError('arquivo')
                            ? 'border-clay/50 bg-clay/5'
                            : 'border-stone/50 bg-parchment hover:border-forest',
                      )}
                    >
                      <label
                        htmlFor="arquivo"
                        className="flex cursor-pointer flex-col items-center text-center"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-cream text-stone">
                          {validatingFile ? (
                            <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                          ) : (
                            <Upload size={20} strokeWidth={1.5} aria-hidden="true" />
                          )}
                        </span>
                        <span className="mt-4 text-[13px] font-medium text-ink">
                          {validatingFile
                            ? 'Verificando formato e integridade…'
                            : 'Arraste um arquivo ou clique para selecionar'}
                        </span>
                        <span
                          id="arquivo-help"
                          className="mt-1.5 max-w-sm text-xs leading-relaxed text-stone"
                        >
                          {activeMediaConfig.helper}
                        </span>
                      </label>
                    </div>
                  )}

                  <FieldError id="arquivo-error" message={showError('arquivo')} />
                </>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="autorizacao" className="flex cursor-pointer items-start gap-3">
              <input
                id="autorizacao"
                name="autorizacao"
                type="checkbox"
                checked={autorizacao}
                onChange={(event) => {
                  setAutorizacao(event.target.checked)
                  markTouched('autorizacao')
                  setSubmitError(null)
                  if (status === 'error') setStatus('idle')
                }}
                aria-invalid={Boolean(showError('autorizacao'))}
                aria-describedby={showError('autorizacao') ? 'autorizacao-error' : undefined}
                className="mt-0.5 h-5 w-5 shrink-0 accent-clay"
              />
              <span className="text-xs leading-relaxed text-stone">
                Autorizo a análise deste material pela equipe do Museu Carajás e o contato sobre
                esta contribuição. Entendo que o envio não garante a incorporação ao acervo nem a
                publicação automática. <span className="text-clay">*</span>
              </span>
            </label>
            <FieldError id="autorizacao-error" message={showError('autorizacao')} />
          </div>

          <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="website">Não preencha este campo</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          {submitError ? (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-2xl border border-clay/30 bg-clay/5 p-4 text-[12px] leading-relaxed text-clay"
            >
              <AlertCircle size={17} strokeWidth={1.8} className="mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p>{submitError}</p>
                <p className="mt-1.5 text-clay/85">
                  Se o problema persistir, envie os dados para{' '}
                  <a
                    href={`mailto:${visit.emails[0]}`}
                    className="underline decoration-clay/30 underline-offset-4"
                  >
                    {visit.emails[0]}
                  </a>
                  .
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-stone">
              Campos com <span className="text-clay">*</span> são obrigatórios.
            </p>
            <Button
              type="submit"
              variant="primary"
              disabled={isBusy || !isSupabaseConfigured}
              className="w-full sm:w-auto"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                  Enviando com segurança…
                </>
              ) : (
                <>
                  <Send size={15} strokeWidth={1.8} aria-hidden="true" />
                  Enviar registro
                </>
              )}
            </Button>
          </div>

          {status === 'submitting' ? (
            <div className="mt-4">
              <div className="h-0.5 overflow-hidden bg-line">
                <div className="animate-progress h-full w-1/2 bg-copper" aria-hidden="true" />
              </div>
              <p className="mt-2 text-xs text-stone" role="status">
                Enviando e registrando sua contribuição. Não feche esta página.
              </p>
            </div>
          ) : null}
        </fieldset>
      </form>
    </div>
  )
}
