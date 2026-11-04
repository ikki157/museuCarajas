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
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  Send,
  Upload,
  X,
} from 'lucide-react'
import { materialCategories, visit } from '../../data/content'
import {
  ACCEPTED_FILE_EXTENSIONS,
  validateContributionFile,
  type ValidatedFile,
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
  | 'descricao'
  | 'arquivo'
  | 'autorizacao'

type FormValues = {
  nome: string
  email: string
  telefone: string
  titulo: string
  categoria: string
  descricao: string
}

type FormErrors = Partial<Record<FieldName, string>>
type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error'

const initialValues: FormValues = {
  nome: '',
  email: '',
  telefone: '',
  titulo: '',
  categoria: '',
  descricao: '',
}

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

  const isBusy = status === 'submitting' || validatingFile

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

  const buildErrors = (): FormErrors => {
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

    if (values.descricao.trim().length < 20) {
      next.descricao = 'Descreva o item e seu contexto com pelo menos 20 caracteres.'
    }

    if (!file) {
      next.arquivo = fileError ?? 'Anexe uma fotografia ou um documento em PDF.'
    }

    if (!autorizacao) {
      next.autorizacao = 'Marque a autorização para que o museu analise a contribuição.'
    }

    return next
  }

  const validationErrors = buildErrors()

  const showError = (field: FieldName): string | undefined => {
    if (field === 'arquivo' && fileError) return fileError
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
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const focusFirstError = (firstField: FieldName) => {
    window.requestAnimationFrame(() => {
      if (firstField === 'arquivo') {
        dropzoneRef.current?.focus()
      } else {
        document.getElementById(firstField)?.focus()
      }
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAttempted(true)
    setSubmitError(null)

    const nextErrors = buildErrors()
    const firstField = Object.keys(nextErrors)[0] as FieldName | undefined

    if (firstField) {
      focusFirstError(firstField)
      return
    }

    if (!file) return

    if (!isSupabaseConfigured) {
      setStatus('error')
      setSubmitError(
        'O serviço de envio não está configurado neste ambiente. Nenhum dado foi enviado.',
      )
      return
    }

    setStatus('submitting')

    try {
      const response = await submitContribution({
        nome: values.nome.trim(),
        email: values.email.trim().toLowerCase(),
        telefone: values.telefone.trim(),
        titulo: values.titulo.trim(),
        categoria: values.categoria,
        descricao: values.descricao.trim(),
        autorizacao,
        website,
        arquivo: file,
        formStartedAt: formStartedAt.current,
      })

      setProtocolo(response.protocolo)
      setStatus('success')
      setValues(initialValues)
      setFile(null)
      setAutorizacao(false)
      setTouched({})
      setAttempted(false)
      formStartedAt.current = Date.now()
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
        className="relative border border-line bg-cream p-6 shadow-[0_30px_80px_-50px_rgba(16,33,25,0.45)] outline-none sm:p-9 lg:p-10"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-[#6f8b5d]" aria-hidden="true" />
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#6f8b5d]/35 bg-[#6f8b5d]/10 text-[#4e6a3e]">
          <CheckCircle2 size={26} strokeWidth={1.6} aria-hidden="true" />
        </div>
        <p className="eyebrow mt-6 text-[#4e6a3e]">Contribuição registrada</p>
        <h3 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.7rem)] font-medium leading-[1.05] text-forest">
          Obrigado por compartilhar essa memória.
        </h3>
        <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-stone">
          Sua contribuição foi recebida para análise da equipe do museu. Ela não será publicada
          automaticamente na galeria.
        </p>

        <div className="mt-7 border border-line bg-parchment px-5 py-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-stone/60">
            Protocolo de envio
          </p>
          <p className="mt-1 font-mono text-[19px] font-semibold tracking-[0.08em] text-forest">
            {protocolo}
          </p>
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-stone/70">
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
            Enviar outra contribuição
          </Button>
          <a
            href="#galeria"
            className="inline-flex items-center justify-center gap-2 border border-forest/25 px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-forest transition hover:bg-forest hover:text-parchment"
          >
            Conhecer a galeria
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="relative border border-line bg-cream p-5 shadow-[0_30px_80px_-50px_rgba(16,33,25,0.45)] sm:p-8 lg:p-10">
      <div className="absolute inset-x-0 top-0 h-1 bg-clay" aria-hidden="true" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow text-clay">Formulário</p>
          <h3
            id="form-title"
            className="display mt-2 text-[clamp(1.8rem,3.2vw,2.5rem)] font-medium leading-none text-forest"
          >
            Envie sua contribuição
          </h3>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 border border-forest/20 px-2.5 py-1.5 text-[8.5px] font-semibold uppercase tracking-[0.14em] text-forest/65">
          <Lock size={11} strokeWidth={1.8} aria-hidden="true" />
          Projeto Salvaguarda
        </span>
      </div>

      <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-stone">
        Compartilhe informações e fotografias de objetos, documentos ou registros ligados à memória
        de Parauapebas. A equipe do museu fará a análise antes de qualquer publicação.
      </p>

      {!isSupabaseConfigured ? (
        <div className="mt-6 flex items-start gap-3 border border-clay/25 bg-clay/5 p-4 text-clay">
          <AlertTriangle size={18} strokeWidth={1.7} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div className="text-[12px] leading-relaxed">
            <p className="font-semibold">Envio indisponível neste ambiente</p>
            <p className="mt-1 text-clay/85">
              A conexão com o Supabase ainda não foi configurada. Nenhuma contribuição será
              enviada. Consulte o README para configurar o serviço.
            </p>
            {import.meta.env.DEV && supabaseConfigIssue ? (
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-clay/70">
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
                Telefone <span className="font-normal normal-case tracking-normal text-stone/60">(opcional)</span>
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
                Título ou nome do item <span className="text-clay">*</span>
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
                Categoria do material <span className="text-clay">*</span>
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

            <div className="sm:col-span-2">
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="descricao" className="field-label">
                  Descrição e contexto histórico <span className="text-clay">*</span>
                </label>
                <span className="text-[10px] tabular-nums text-stone/55">
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
                placeholder="Conte a história do item: o que é, de quem era, em que período foi produzido ou registrado, onde foi obtido e como se relaciona com Parauapebas."
                maxLength={2000}
                className={cn('input-base min-h-[120px] resize-y', showError('descricao') && 'input-error')}
              />
              <p id="descricao-help" className="mt-1.5 text-[10.5px] leading-relaxed text-stone/55">
                Quanto mais contexto, melhor para a análise da equipe do museu.
              </p>
              <FieldError id="descricao-error" message={showError('descricao')} />
            </div>

            <div className="sm:col-span-2">
              <p className="field-label" id="arquivo-label">
                Fotografia ou documento <span className="text-clay">*</span>
              </p>

              <input
                ref={fileInputRef}
                id="arquivo"
                name="arquivo"
                type="file"
                accept={ACCEPTED_FILE_EXTENSIONS}
                onChange={onFileChange}
                className="sr-only"
                aria-labelledby="arquivo-label"
                aria-invalid={Boolean(showError('arquivo'))}
                aria-describedby={showError('arquivo') ? 'arquivo-error arquivo-help' : 'arquivo-help'}
              />

              {file ? (
                <div className="border border-line bg-parchment p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-line bg-sand-deep">
                      {file.category === 'fotografia' && objectUrl ? (
                        <img
                          src={objectUrl}
                          alt={`Pré-visualização de ${file.file.name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FileText size={28} strokeWidth={1.3} className="text-clay" aria-hidden="true" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[8.5px] font-semibold uppercase tracking-[0.18em] text-clay">
                        {file.category === 'fotografia' ? 'Fotografia' : 'Documento PDF'}
                      </p>
                      <p className="mt-1 truncate text-[13.5px] font-medium text-ink" title={file.file.name}>
                        {file.file.name}
                      </p>
                      <p className="mt-1 text-[11px] text-stone">
                        {formatBytes(file.size)} · {file.mime}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <label
                          htmlFor="arquivo"
                          className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.12em] text-forest underline decoration-forest/25 underline-offset-4 transition hover:text-clay"
                        >
                          Trocar arquivo
                        </label>
                        {file.category === 'documento' && objectUrl ? (
                          <a
                            href={objectUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-forest underline decoration-forest/25 underline-offset-4 transition hover:text-clay"
                          >
                            Visualizar PDF
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={removeFile}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-clay transition hover:text-clay-dark"
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
                    'border border-dashed p-6 transition-colors sm:p-8',
                    isDragging
                      ? 'border-copper bg-copper/5'
                      : showError('arquivo')
                        ? 'border-clay/50 bg-clay/5'
                        : 'border-line bg-parchment hover:border-copper/50',
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
                    <span id="arquivo-help" className="mt-1.5 max-w-sm text-[10.5px] leading-relaxed text-stone">
                      Fotografias em JPG, PNG ou WEBP até 10 MB. Documentos em PDF até 15 MB. A
                      extensão, o tipo MIME e o conteúdo real do arquivo são verificados.
                    </span>
                  </label>
                </div>
              )}

              <FieldError id="arquivo-error" message={showError('arquivo')} />
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
                className="mt-0.5 h-4 w-4 shrink-0 accent-clay"
              />
              <span className="text-[11.5px] leading-relaxed text-stone">
                Autorizo a análise deste material pela equipe do museu e o contato sobre esta
                contribuição. Entendo que o envio não garante a incorporação ao acervo nem a
                publicação automática na galeria. <span className="text-clay">*</span>
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
              className="mt-6 flex items-start gap-3 border border-clay/30 bg-clay/5 p-4 text-[12px] leading-relaxed text-clay"
            >
              <AlertCircle size={17} strokeWidth={1.8} className="mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p>{submitError}</p>
                <p className="mt-1.5 text-clay/75">
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
            <p className="text-[10px] leading-relaxed text-stone/55">
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
                  Enviar contribuição
                </>
              )}
            </Button>
          </div>

          {status === 'submitting' ? (
            <div className="mt-4">
              <div className="h-0.5 overflow-hidden bg-line">
                <div className="animate-progress h-full w-1/2 bg-copper" aria-hidden="true" />
              </div>
              <p className="mt-2 text-[10px] text-stone" role="status">
                Enviando o arquivo e registrando a contribuição. Não feche esta página.
              </p>
            </div>
          ) : null}
        </fieldset>
      </form>
    </div>
  )
}
