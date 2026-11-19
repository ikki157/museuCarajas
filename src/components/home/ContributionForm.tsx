import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from 'react'
import {
  AlertCircle,
  Check,
  FileText,
  Film,
  Image as ImageIcon,
  Link2,
  Loader2,
  Upload,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { materialCategories } from '../../data/content'
import {
  ContributionError,
  submitContribution,
  type ContributionResponse,
} from '../../lib/contribuicao'
import {
  validateContributionFile,
  validateExternalVideoUrl,
  type ValidatedFile,
  type ValidatedFileCategory,
} from '../../lib/file-validation'
import { isSupabaseConfigured, supabaseConfigIssue } from '../../lib/supabase'
import { cn, formatBytes } from '../../lib/utils'

type VideoSourceMode = 'upload' | 'url'

type FormValues = {
  titulo: string
  categoria: string
  periodoEstimado: string
  localizacao: string
  descricao: string
  midiaExternaUrl: string
  nome: string
  email: string
  telefone: string
}

type FieldKey =
  | 'arquivo'
  | 'midiaExternaUrl'
  | 'titulo'
  | 'categoria'
  | 'periodoEstimado'
  | 'localizacao'
  | 'descricao'
  | 'nome'
  | 'email'
  | 'telefone'
  | 'autorizacao'

type FieldErrors = Partial<Record<FieldKey, string>>

const INITIAL_VALUES: FormValues = {
  titulo: '',
  categoria: '',
  periodoEstimado: '',
  localizacao: '',
  descricao: '',
  midiaExternaUrl: '',
  nome: '',
  email: '',
  telefone: '',
}

const FIELD_ORDER: readonly FieldKey[] = [
  'arquivo',
  'midiaExternaUrl',
  'titulo',
  'categoria',
  'periodoEstimado',
  'localizacao',
  'descricao',
  'nome',
  'email',
  'telefone',
  'autorizacao',
]

const MEDIA_TABS: ReadonlyArray<{
  value: ValidatedFileCategory
  label: string
}> = [
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'video', label: 'Vídeo' },
  { value: 'documento', label: 'Documento' },
]

const ACCEPT_BY_MEDIA: Record<ValidatedFileCategory, string> = {
  fotografia: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
  video: '.mp4,.webm,video/mp4,video/webm',
  documento: '.pdf,application/pdf',
}

const HINT_BY_MEDIA: Record<ValidatedFileCategory, string> = {
  fotografia: 'Formatos JPG, PNG ou WEBP · até 10 MB',
  video: 'Formatos MP4 ou WEBM · até 25 MB',
  documento: 'Formato PDF · até 15 MB',
}

const labelClass = 'mb-2 block text-[13.5px] font-medium text-ink/85'
const inputClass =
  'w-full rounded-2xl border border-line/80 bg-parchment/55 px-4 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-stone/65 focus:border-forest focus:bg-cream'
const errorInputClass = 'border-[#8b2f2b]/70 focus:border-[#8b2f2b]'
const errorTextClass = 'mt-1.5 flex items-center gap-1.5 text-[13px] text-[#8b2f2b]'

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function ContributionForm() {
  const [tipoMidia, setTipoMidia] = useState<ValidatedFileCategory>('fotografia')
  const [videoSource, setVideoSource] = useState<VideoSourceMode>('upload')
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const [autorizacao, setAutorizacao] = useState(false)
  const [website, setWebsite] = useState('')
  const [file, setFile] = useState<ValidatedFile | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isCheckingFile, setIsCheckingFile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<ContributionResponse | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const formStartedAt = useRef<number>(Date.now())
  const formOpenedAtPerf = useRef<number>(
    typeof performance !== 'undefined' ? performance.now() : 0,
  )

  const isExternalVideo = tipoMidia === 'video' && videoSource === 'url'

  useEffect(() => {
    if (!file || file.category !== 'fotografia') {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(file.file)
    setPreviewUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  function clearFieldError(field: FieldKey) {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function updateValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    clearFieldError(key as FieldKey)
    setSubmitError(null)
  }

  function handleSelectMediaType(nextType: ValidatedFileCategory) {
    if (nextType === tipoMidia) return
    setTipoMidia(nextType)
    if (nextType !== 'video') {
      setVideoSource('upload')
      updateValue('midiaExternaUrl', '')
    }
    if (file && file.category !== nextType) {
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    setFileError(null)
    clearFieldError('arquivo')
    clearFieldError('midiaExternaUrl')
    setSubmitError(null)
  }

  function handleSelectVideoSource(mode: VideoSourceMode) {
    if (mode === videoSource) return
    setVideoSource(mode)
    if (mode === 'url') {
      setFile(null)
      setFileError(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      clearFieldError('arquivo')
    } else {
      updateValue('midiaExternaUrl', '')
      clearFieldError('midiaExternaUrl')
    }
    setSubmitError(null)
  }

  function handleRemoveFile() {
    setFile(null)
    setFileError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    clearFieldError('arquivo')
    setSubmitError(null)
  }

  async function processSelectedFile(candidate: File | undefined | null) {
    if (!candidate) return

    setIsCheckingFile(true)
    setFileError(null)
    clearFieldError('arquivo')
    setSubmitError(null)

    const result = await validateContributionFile(candidate)
    setIsCheckingFile(false)

    if (!result.ok) {
      setFile(null)
      setFileError(result.error)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setTipoMidia(result.value.category)
    if (result.value.category === 'video') {
      setVideoSource('upload')
      updateValue('midiaExternaUrl', '')
    }
    setFile(result.value)
    setFileError(null)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0]
    void processSelectedFile(picked)
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    if (!isDragging) setIsDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    const dropped = event.dataTransfer.files?.[0]
    void processSelectedFile(dropped)
  }

  function focusFirstError(fieldErrors: FieldErrors) {
    const firstKey = FIELD_ORDER.find((key) => Boolean(fieldErrors[key]))
    if (!firstKey) return
    const targetId = firstKey === 'arquivo' ? 'arquivo' : firstKey
    const element = document.getElementById(targetId)
    if (element) {
      element.focus()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || isCheckingFile) return

    setSubmitError(null)

    const validationErrors: FieldErrors = {}
    let normalizedExternalUrl: string | undefined

    if (isExternalVideo) {
      const urlCheck = validateExternalVideoUrl(values.midiaExternaUrl)
      if (!urlCheck.ok) {
        validationErrors.midiaExternaUrl = urlCheck.error
      } else {
        normalizedExternalUrl = urlCheck.normalizedUrl
      }
    } else if (fileError) {
      validationErrors.arquivo = fileError
    } else if (!file) {
      validationErrors.arquivo =
        tipoMidia === 'video'
          ? 'Anexe um vídeo MP4 ou WEBM, ou informe um link do YouTube ou Vimeo.'
          : tipoMidia === 'documento'
            ? 'Anexe um documento histórico em PDF.'
            : 'Anexe uma fotografia para enviar à curadoria.'
    }

    if (values.titulo.trim().length < 3) {
      validationErrors.titulo = 'Informe o título ou o nome do item.'
    }

    if (!values.categoria) {
      validationErrors.categoria = 'Selecione a categoria do material.'
    }

    if (values.periodoEstimado.trim().length > 80) {
      validationErrors.periodoEstimado =
        'O período estimado deve ter no máximo 80 caracteres.'
    }

    if (values.localizacao.trim().length > 120) {
      validationErrors.localizacao =
        'A localização deve ter no máximo 120 caracteres.'
    }

    if (values.descricao.trim().length < 20) {
      validationErrors.descricao =
        'Descreva o item e seu contexto com pelo menos 20 caracteres.'
    }

    const name = values.nome.trim()
    if (name.length < 5 || !name.includes(' ')) {
      validationErrors.nome = 'Informe seu nome completo (nome e sobrenome).'
    } else if (name.length > 160) {
      validationErrors.nome = 'O nome informado deve ter no máximo 160 caracteres.'
    }

    const email = values.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
      validationErrors.email = 'Informe um endereço de e-mail válido.'
    }

    const phoneDigits = values.telefone.replace(/\D/g, '')
    if (phoneDigits && phoneDigits.length < 10) {
      validationErrors.telefone =
        'Informe um telefone com DDD ou deixe este campo em branco.'
    }

    if (!autorizacao) {
      validationErrors.autorizacao =
        'Marque a autorização para que o museu analise a contribuição.'
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      focusFirstError(validationErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const elapsedMs = Math.max(
        0,
        Math.round(
          (typeof performance !== 'undefined' ? performance.now() : 0) -
            formOpenedAtPerf.current,
        ),
      )

      const response = await submitContribution({
        nome: values.nome.trim(),
        email,
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

      setSuccess(response)
    } catch (error) {
      const message =
        error instanceof ContributionError
          ? error.message
          : 'Não foi possível concluir o envio agora. Tente novamente em instantes.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleResetForm() {
    setSuccess(null)
    setValues(INITIAL_VALUES)
    setAutorizacao(false)
    setWebsite('')
    setFile(null)
    setFileError(null)
    setErrors({})
    setSubmitError(null)
    setTipoMidia('fotografia')
    setVideoSource('upload')
    if (fileInputRef.current) fileInputRef.current.value = ''
    formStartedAt.current = Date.now()
    formOpenedAtPerf.current =
      typeof performance !== 'undefined' ? performance.now() : 0
  }

  if (success) {
    return (
      <div
        role="status"
        className="rounded-3xl border border-line/70 bg-cream px-6 py-12 text-center sm:px-10 sm:py-14"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-parchment text-forest">
          <Check size={22} strokeWidth={2} aria-hidden="true" />
        </div>

        <h2 className="mt-5 font-serif text-3xl font-normal text-ink">
          Registro recebido pela curadoria
        </h2>

        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-stone">
          Obrigado por ajudar a preservar a memória de Carajás. Nossa equipe
          analisará o envio e entrará em contato pelo e-mail informado.
        </p>

        {success.protocolo ? (
          <p className="mt-4 inline-block rounded-full border border-line/80 bg-parchment/70 px-4 py-1.5 text-xs font-medium tracking-[0.06em] text-forest">
            Protocolo {success.protocolo}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleResetForm}
            className="rounded-full border border-forest/35 px-6 py-3 text-sm font-medium text-forest transition-colors hover:border-forest hover:bg-parchment/60"
          >
            Enviar outro registro
          </button>

          <Link
            to="/#galeria"
            className="rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
          >
            Voltar ao acervo
          </Link>
        </div>
      </div>
    )
  }

  const displayedFileError = errors.arquivo ?? fileError

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative rounded-3xl border border-line/70 bg-cream p-6 sm:p-10"
    >
      {/* Honeypot anti-bot field kept outside visual flow */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor="website">Website</label>
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

      {/* Block 1: O arquivo */}
      <div>
        <h2 className="font-serif text-2xl font-normal text-ink">O arquivo</h2>

        <div className="mt-5">
          <span id="tipo-midia-label" className={labelClass}>
            Tipo de registro
          </span>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="radiogroup"
              aria-labelledby="tipo-midia-label"
              className="inline-flex rounded-full border border-line/70 bg-parchment/75 p-1"
            >
              {MEDIA_TABS.map((tab) => {
                const selected = tipoMidia === tab.value
                return (
                  <button
                    key={tab.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => handleSelectMediaType(tab.value)}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-[13.5px] font-medium transition-colors',
                      selected
                        ? 'bg-forest text-cream'
                        : 'text-stone hover:text-ink',
                    )}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {tipoMidia === 'video' ? (
              <div className="flex items-center gap-3 text-[13px]">
                <button
                  type="button"
                  onClick={() => handleSelectVideoSource('upload')}
                  className={cn(
                    'transition-colors',
                    videoSource === 'upload'
                      ? 'font-medium text-forest underline underline-offset-4'
                      : 'text-stone hover:text-ink',
                  )}
                >
                  Enviar arquivo
                </button>
                <span className="text-line" aria-hidden="true">
                  /
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectVideoSource('url')}
                  className={cn(
                    'transition-colors',
                    videoSource === 'url'
                      ? 'font-medium text-forest underline underline-offset-4'
                      : 'text-stone hover:text-ink',
                  )}
                >
                  Colar link (YouTube ou Vimeo)
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          {isExternalVideo ? (
            <div>
              <label htmlFor="midiaExternaUrl" className={labelClass}>
                Link do vídeo (YouTube ou Vimeo)
              </label>
              <div className="relative">
                <input
                  id="midiaExternaUrl"
                  name="midiaExternaUrl"
                  type="url"
                  value={values.midiaExternaUrl}
                  onChange={(event) =>
                    updateValue('midiaExternaUrl', event.target.value)
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  aria-invalid={Boolean(errors.midiaExternaUrl)}
                  className={cn(
                    inputClass,
                    'pl-11',
                    errors.midiaExternaUrl && errorInputClass,
                  )}
                />
                <Link2
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone/75"
                  aria-hidden="true"
                />
              </div>
              {errors.midiaExternaUrl ? (
                <p className={errorTextClass} role="alert">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{errors.midiaExternaUrl}</span>
                </p>
              ) : (
                <p className="mt-2 text-xs text-stone">
                  Aceita links diretos do YouTube ou Vimeo.
                </p>
              )}
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                id="arquivo"
                name="arquivo"
                type="file"
                accept={ACCEPT_BY_MEDIA[tipoMidia]}
                onChange={handleFileChange}
                className="sr-only"
              />

              {!file ? (
                <label
                  htmlFor="arquivo"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors',
                    isDragging
                      ? 'border-forest bg-parchment/80'
                      : 'border-stone/40 bg-parchment/40 hover:border-forest hover:bg-parchment/65',
                    displayedFileError && 'border-[#8b2f2b]/70',
                  )}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-forest">
                    {isCheckingFile ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Upload size={18} strokeWidth={1.75} aria-hidden="true" />
                    )}
                  </span>

                  <span className="mt-3.5 text-[15px] font-medium text-ink">
                    {isCheckingFile
                      ? 'Verificando arquivo...'
                      : 'Arraste um arquivo ou clique para escolher'}
                  </span>

                  <span className="mt-1 text-xs text-stone">
                    {HINT_BY_MEDIA[tipoMidia]}
                  </span>
                </label>
              ) : (
                <div className="flex items-center gap-4 rounded-2xl border border-line/80 bg-parchment/45 p-4">
                  {file.category === 'fotografia' && previewUrl ? (
                    <img
                      src={previewUrl}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cream text-forest">
                      {file.category === 'video' ? (
                        <Film size={22} strokeWidth={1.75} aria-hidden="true" />
                      ) : file.category === 'documento' ? (
                        <FileText
                          size={22}
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      ) : (
                        <ImageIcon
                          size={22}
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {file.file.name}
                    </p>
                    <p className="mt-0.5 text-xs text-stone">
                      {formatBytes(file.size)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-forest transition-colors hover:text-ink"
                    >
                      Trocar
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-stone transition-colors hover:text-[#8b2f2b]"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              )}

              {displayedFileError ? (
                <p className={errorTextClass} role="alert">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{displayedFileError}</span>
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Block 2: Sobre o registro */}
      <div className="mt-9 border-t border-line/60 pt-8">
        <h2 className="font-serif text-2xl font-normal text-ink">
          Sobre o registro
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="titulo" className={labelClass}>
              Título
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              maxLength={140}
              value={values.titulo}
              onChange={(event) => updateValue('titulo', event.target.value)}
              placeholder="Ex.: Chegada da ferrovia em 1985"
              aria-invalid={Boolean(errors.titulo)}
              className={cn(inputClass, errors.titulo && errorInputClass)}
            />
            {errors.titulo ? (
              <p className={errorTextClass} role="alert">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{errors.titulo}</span>
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="categoria" className={labelClass}>
                Categoria
              </label>
              <select
                id="categoria"
                name="categoria"
                value={values.categoria}
                onChange={(event) =>
                  updateValue('categoria', event.target.value)
                }
                aria-invalid={Boolean(errors.categoria)}
                className={cn(inputClass, errors.categoria && errorInputClass)}
              >
                <option value="">Selecione...</option>
                {materialCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.categoria ? (
                <p className={errorTextClass} role="alert">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{errors.categoria}</span>
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="periodoEstimado" className={labelClass}>
                Época ou ano (opcional)
              </label>
              <input
                id="periodoEstimado"
                name="periodoEstimado"
                type="text"
                maxLength={80}
                value={values.periodoEstimado}
                onChange={(event) =>
                  updateValue('periodoEstimado', event.target.value)
                }
                placeholder="Ex.: Década de 1980"
                aria-invalid={Boolean(errors.periodoEstimado)}
                className={cn(
                  inputClass,
                  errors.periodoEstimado && errorInputClass,
                )}
              />
              {errors.periodoEstimado ? (
                <p className={errorTextClass} role="alert">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{errors.periodoEstimado}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="localizacao" className={labelClass}>
              Local (opcional)
            </label>
            <input
              id="localizacao"
              name="localizacao"
              type="text"
              maxLength={120}
              value={values.localizacao}
              onChange={(event) =>
                updateValue('localizacao', event.target.value)
              }
              placeholder="Ex.: Serra dos Carajás, núcleo urbano"
              aria-invalid={Boolean(errors.localizacao)}
              className={cn(inputClass, errors.localizacao && errorInputClass)}
            />
            {errors.localizacao ? (
              <p className={errorTextClass} role="alert">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{errors.localizacao}</span>
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="descricao" className={labelClass}>
              História do registro
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={4}
              maxLength={2000}
              value={values.descricao}
              onChange={(event) => updateValue('descricao', event.target.value)}
              placeholder="Conte quem aparece na imagem, o contexto da gravação ou detalhes do documento..."
              aria-invalid={Boolean(errors.descricao)}
              className={cn(
                inputClass,
                'resize-y leading-relaxed',
                errors.descricao && errorInputClass,
              )}
            />
            {values.descricao.length > 1500 ? (
              <p className="mt-1.5 text-right text-xs text-stone">
                {values.descricao.length}/2000
              </p>
            ) : null}
            {errors.descricao ? (
              <p className={errorTextClass} role="alert">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{errors.descricao}</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Block 3: Quem está enviando */}
      <div className="mt-9 border-t border-line/60 pt-8">
        <h2 className="font-serif text-2xl font-normal text-ink">
          Quem está enviando
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="nome" className={labelClass}>
              Nome completo
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              maxLength={160}
              autoComplete="name"
              value={values.nome}
              onChange={(event) => updateValue('nome', event.target.value)}
              placeholder="Seu nome e sobrenome"
              aria-invalid={Boolean(errors.nome)}
              className={cn(inputClass, errors.nome && errorInputClass)}
            />
            {errors.nome ? (
              <p className={errorTextClass} role="alert">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{errors.nome}</span>
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className={labelClass}>
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                maxLength={254}
                autoComplete="email"
                value={values.email}
                onChange={(event) => updateValue('email', event.target.value)}
                placeholder="voce@exemplo.com"
                aria-invalid={Boolean(errors.email)}
                className={cn(inputClass, errors.email && errorInputClass)}
              />
              {errors.email ? (
                <p className={errorTextClass} role="alert">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{errors.email}</span>
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="telefone" className={labelClass}>
                Telefone (opcional)
              </label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                autoComplete="tel"
                value={values.telefone}
                onChange={(event) =>
                  updateValue('telefone', formatPhoneInput(event.target.value))
                }
                placeholder="(94) 99999-9999"
                aria-invalid={Boolean(errors.telefone)}
                className={cn(inputClass, errors.telefone && errorInputClass)}
              />
              {errors.telefone ? (
                <p className={errorTextClass} role="alert">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{errors.telefone}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="autorizacao"
              className="flex cursor-pointer items-start gap-3 text-[13.5px] leading-relaxed text-stone"
            >
              <input
                id="autorizacao"
                name="autorizacao"
                type="checkbox"
                checked={autorizacao}
                onChange={(event) => {
                  setAutorizacao(event.target.checked)
                  clearFieldError('autorizacao')
                  setSubmitError(null)
                }}
                aria-invalid={Boolean(errors.autorizacao)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-stone/60 text-forest accent-forest focus:ring-forest"
              />
              <span>
                Autorizo o Museu Carajás a analisar este registro e, se
                selecionado pela curadoria, exibi-lo no acervo digital com os
                créditos.
              </span>
            </label>
            {errors.autorizacao ? (
              <p className={errorTextClass} role="alert">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{errors.autorizacao}</span>
              </p>
            ) : null}
          </div>

          {!isSupabaseConfigured && supabaseConfigIssue ? (
            <div
              role="note"
              className="rounded-2xl border border-line bg-parchment/70 px-4 py-3 text-[13px] leading-relaxed text-stone"
            >
              {supabaseConfigIssue}
            </div>
          ) : null}

          {submitError ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-2xl border border-[#8b2f2b]/40 bg-[#8b2f2b]/5 px-4 py-3 text-sm text-[#8b2f2b]"
            >
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span>{submitError}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || isCheckingFile}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-4 text-sm font-medium tracking-[0.03em] text-cream transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                  aria-hidden="true"
                />
                <span>Enviando registro...</span>
              </>
            ) : (
              <span>Enviar para análise da curadoria</span>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
