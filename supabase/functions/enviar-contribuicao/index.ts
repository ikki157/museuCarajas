import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0'

const MAX_PHOTO_BYTES = 10 * 1024 * 1024
const MAX_PDF_BYTES = 15 * 1024 * 1024
const MAX_VIDEO_BYTES = 25 * 1024 * 1024
const MAX_REQUEST_BYTES = 27 * 1024 * 1024
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
const MIN_FORM_TIME_MS = 2500
const MAX_FORM_TIME_MS = 24 * 60 * 60 * 1000

type FileFormat = 'jpg' | 'png' | 'webp' | 'pdf' | 'mp4' | 'webm'
type FileCategory = 'fotografia' | 'documento' | 'video'

type ValidatedFile = {
  format: FileFormat
  category: FileCategory
  extension: string
  mime: string
  size: number
  bytes: Uint8Array
}

const FORMAT_LABELS: Record<FileFormat, string> = {
  jpg: 'JPEG',
  png: 'PNG',
  webp: 'WEBP',
  pdf: 'PDF',
  mp4: 'MP4',
  webm: 'WebM',
}

const EXTENSIONS: Record<FileFormat, string[]> = {
  jpg: ['jpg', 'jpeg'],
  png: ['png'],
  webp: ['webp'],
  pdf: ['pdf'],
  mp4: ['mp4'],
  webm: ['webm'],
}

const MIME_TYPES: Record<FileFormat, string[]> = {
  jpg: ['image/jpeg', 'image/jpg'],
  png: ['image/png'],
  webp: ['image/webp'],
  pdf: ['application/pdf'],
  mp4: ['video/mp4'],
  webm: ['video/webm'],
}

const CANONICAL_MIME: Record<FileFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  webm: 'video/webm',
}

const ALLOWED_MEDIA_TYPES = new Set<FileCategory>(['fotografia', 'video', 'documento'])

const ALLOWED_CATEGORIES = new Set([
  'video',
  'historia_oral',
  'paisagem',
  'comunidade',
  'mineracao',
  'cultura_indigena',
  'fotografia',
  'documento',
  'objeto',
  'arqueologico',
  'outro',
])

const configuredOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

class RequestError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'RequestError'
    this.status = status
  }
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin =
    origin && (configuredOrigins.length === 0 || configuredOrigins.includes(origin))
      ? origin
      : configuredOrigins[0] ?? '*'

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  origin: string | null,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(origin),
    },
  })
}

function isOriginAllowed(origin: string | null): boolean {
  if (configuredOrigins.length === 0) return true
  if (!origin) return false
  return configuredOrigins.includes(origin)
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length))
}

function containsBytes(bytes: Uint8Array, target: readonly number[]): boolean {
  if (target.length === 0 || bytes.length < target.length) return false

  for (let index = 0; index <= bytes.length - target.length; index += 1) {
    let matches = true
    for (let offset = 0; offset < target.length; offset += 1) {
      if (bytes[index + offset] !== target[offset]) {
        matches = false
        break
      }
    }
    if (matches) return true
  }

  return false
}

function containsAscii(bytes: Uint8Array, value: string): boolean {
  const target = value.split('').map((character) => character.charCodeAt(0))
  return containsBytes(bytes, target)
}

function detectFormat(bytes: Uint8Array): FileFormat | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpg'
  }

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  if (bytes.length >= 8 && pngSignature.every((value, index) => bytes[index] === value)) {
    return 'png'
  }

  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') {
    return 'webp'
  }

  if (bytes.length >= 5 && ascii(bytes, 0, 5) === '%PDF-') {
    return 'pdf'
  }

  if (bytes.length >= 12 && ascii(bytes, 4, 4) === 'ftyp') {
    return 'mp4'
  }

  if (
    bytes.length >= 4 &&
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return 'webm'
  }

  return null
}

function sanitizeFileName(name: string): string {
  const clean = name
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)

  return clean || 'arquivo'
}

async function sha256Hex(value: string | Uint8Array): Promise<string> {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function hasValidImageEnding(
  bytes: Uint8Array,
  format: 'jpg' | 'png' | 'webp',
): boolean {
  if (format === 'webp') {
    if (bytes.length < 20) return false
    if (ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WEBP') return false
    const chunkType = ascii(bytes, 12, 4)
    if (chunkType !== 'VP8 ' && chunkType !== 'VP8L' && chunkType !== 'VP8X') return false
    const riffSize =
      (bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24)) >>> 0
    return riffSize === 0 || riffSize + 8 <= bytes.length
  }

  const tail = bytes.subarray(Math.max(0, bytes.length - 4096))

  if (format === 'jpg') {
    return bytes.length >= 4 && containsBytes(tail, [0xff, 0xd9])
  }

  if (bytes.length < 20) return false
  return containsBytes(tail, [0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82])
}

function hasValidPdfEnding(bytes: Uint8Array): boolean {
  if (bytes.length < 100) return false

  const tail = bytes.subarray(Math.max(0, bytes.length - 4096))
  return containsAscii(tail, '%%EOF')
}

function hasValidVideoStructure(bytes: Uint8Array, format: 'mp4' | 'webm'): boolean {
  if (bytes.length < 64) return false

  if (format === 'mp4') {
    if (ascii(bytes, 4, 4) !== 'ftyp') return false
    const boxSize =
      ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0
    return boxSize >= 16 && boxSize <= bytes.length
  }

  return (
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  )
}

function validateExternalVideoUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim()

  if (!trimmed || trimmed.length > 512) {
    throw new RequestError('Informe um link de vídeo válido com até 512 caracteres.')
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new RequestError(
      'Informe uma URL HTTPS válida do YouTube ou Vimeo.',
    )
  }

  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new RequestError(
      'Por segurança, apenas links HTTPS públicos do YouTube ou Vimeo são aceitos.',
    )
  }

  const host = parsed.hostname.toLowerCase()
  const youtubeIdRegex = /^[A-Za-z0-9_-]{11}$/
  const vimeoIdRegex = /^\d{5,12}$/

  if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com') {
    if (parsed.pathname === '/watch') {
      const videoId = parsed.searchParams.get('v')?.trim() ?? ''
      if (youtubeIdRegex.test(videoId)) {
        return `https://www.youtube.com/watch?v=${videoId}`
      }
    }

    if (parsed.pathname.startsWith('/shorts/')) {
      const videoId = parsed.pathname.slice('/shorts/'.length).split('/')[0]?.trim() ?? ''
      if (youtubeIdRegex.test(videoId)) {
        return `https://www.youtube.com/shorts/${videoId}`
      }
    }
  }

  if (host === 'youtu.be') {
    const videoId = parsed.pathname.replace(/^\/+/, '').split('/')[0]?.trim() ?? ''
    if (youtubeIdRegex.test(videoId)) {
      return `https://www.youtube.com/watch?v=${videoId}`
    }
  }

  if (host === 'vimeo.com' || host === 'www.vimeo.com') {
    const videoId = parsed.pathname.replace(/^\/+|\/+$/g, '').split('/')[0]?.trim() ?? ''
    if (vimeoIdRegex.test(videoId)) {
      return `https://vimeo.com/${videoId}`
    }
  }

  if (host === 'player.vimeo.com' && parsed.pathname.startsWith('/video/')) {
    const videoId = parsed.pathname.slice('/video/'.length).split('/')[0]?.trim() ?? ''
    if (vimeoIdRegex.test(videoId)) {
      return `https://vimeo.com/${videoId}`
    }
  }

  throw new RequestError(
    'Use apenas links diretos do YouTube (youtube.com/watch?v=, youtu.be/ ou youtube.com/shorts/) ou Vimeo (vimeo.com/).',
  )
}

async function validateFile(file: File): Promise<ValidatedFile> {
  if (!(file instanceof File)) {
    throw new RequestError('Selecione um arquivo válido.')
  }

  if (file.size === 0) {
    throw new RequestError('O arquivo está vazio. Selecione outro arquivo.')
  }

  const fileName = file.name.trim()
  const extension = fileName.includes('.')
    ? fileName.split('.').pop()?.toLowerCase() ?? ''
    : ''

  if (!extension) {
    throw new RequestError(
      'O arquivo não possui extensão. Envie JPG, PNG, WEBP, PDF, MP4 ou WEBM.',
    )
  }

  const allExtensions = Object.values(EXTENSIONS).flat()
  if (!allExtensions.includes(extension)) {
    throw new RequestError(
      'Formato não permitido. Envie fotografias (JPG, PNG, WEBP), documentos (PDF) ou vídeos curtos (MP4, WEBM).',
    )
  }

  const extensionLimit =
    extension === 'pdf'
      ? MAX_PDF_BYTES
      : extension === 'mp4' || extension === 'webm'
        ? MAX_VIDEO_BYTES
        : MAX_PHOTO_BYTES

  if (file.size > extensionLimit) {
    throw new RequestError(
      extension === 'pdf'
        ? 'O arquivo excede o limite de 15 MB para documentos PDF.'
        : extension === 'mp4' || extension === 'webm'
          ? 'O vídeo excede o limite de 25 MB para envio direto.'
          : 'O arquivo excede o limite de 10 MB para fotografias.',
    )
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const header = bytes.subarray(0, 64)
  const format = detectFormat(header)

  if (!format) {
    throw new RequestError(
      'O conteúdo do arquivo não corresponde a JPG, PNG, WEBP, PDF, MP4 ou WEBM. Renomear a extensão não é suficiente.',
    )
  }

  if (!EXTENSIONS[format].includes(extension)) {
    throw new RequestError(
      `A extensão .${extension} não corresponde ao conteúdo real do arquivo (${FORMAT_LABELS[format]}).`,
    )
  }

  const declaredMime = (file.type ?? '').trim().toLowerCase()
  if (declaredMime && !MIME_TYPES[format].includes(declaredMime)) {
    throw new RequestError(
      `O tipo MIME informado (${declaredMime}) não corresponde ao conteúdo real (${FORMAT_LABELS[format]}).`,
    )
  }

  const category: FileCategory =
    format === 'pdf'
      ? 'documento'
      : format === 'mp4' || format === 'webm'
        ? 'video'
        : 'fotografia'

  const limit =
    category === 'documento'
      ? MAX_PDF_BYTES
      : category === 'video'
        ? MAX_VIDEO_BYTES
        : MAX_PHOTO_BYTES

  if (file.size > limit) {
    throw new RequestError(
      category === 'documento'
        ? 'O arquivo excede o limite de 15 MB para documentos PDF.'
        : category === 'video'
          ? 'O vídeo excede o limite de 25 MB para envio direto.'
          : 'O arquivo excede o limite de 10 MB para fotografias.',
    )
  }

  if (format === 'pdf') {
    if (!hasValidPdfEnding(bytes)) {
      throw new RequestError(
        'O PDF parece estar corrompido ou incompleto. Verifique o arquivo e tente novamente.',
      )
    }
  } else if (format === 'mp4' || format === 'webm') {
    if (!hasValidVideoStructure(bytes, format)) {
      throw new RequestError(
        'O vídeo parece estar corrompido ou em um formato incompatível. Tente outro arquivo.',
      )
    }
  } else if (!hasValidImageEnding(bytes, format)) {
    throw new RequestError(
      'A imagem parece estar corrompida ou incompleta. Tente outro arquivo.',
    )
  }

  return {
    format,
    category,
    extension: format === 'jpg' ? 'jpg' : format,
    mime: CANONICAL_MIME[format],
    size: file.size,
    bytes,
  }
}

function readField(form: FormData, name: string): string {
  const value = form.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

function validateFields(form: FormData): {
  nome: string
  email: string
  telefone: string
  titulo: string
  categoria: string
  descricao: string
  autorizacao: boolean
  website: string
  tipoMidia: FileCategory | null
  periodoEstimado: string | null
  localizacao: string | null
  midiaExternaUrl: string | null
  formStartedAt: number
  arquivo: File | null
} {
  const nome = readField(form, 'nome')
  const email = readField(form, 'email').toLowerCase()
  const telefone = readField(form, 'telefone')
  const titulo = readField(form, 'titulo')
  const categoria = readField(form, 'categoria')
  const descricao = readField(form, 'descricao')
  const autorizacao = readField(form, 'autorizacao') === 'true'
  const website = readField(form, 'website')
  const rawTipoMidia = readField(form, 'tipo_midia')
  const rawPeriodoEstimado = readField(form, 'periodo_estimado')
  const rawLocalizacao = readField(form, 'localizacao')
  const rawMidiaExternaUrl = readField(form, 'midia_externa_url')
  const rawElapsedMs = readField(form, 'form_elapsed_ms')
  const rawStartedAt = readField(form, 'form_started_at')
  const formStartedAt = Number(rawStartedAt)
  const rawArquivo = form.get('arquivo')
  const arquivo = rawArquivo instanceof File && rawArquivo.size > 0 ? rawArquivo : null

  if (website) {
    throw new RequestError('Não foi possível validar o envio.')
  }

  if (nome.length < 5 || !nome.includes(' ')) {
    throw new RequestError('Informe seu nome completo (nome e sobrenome).')
  }

  if (nome.length > 160) {
    throw new RequestError('O nome informado é muito longo.')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    throw new RequestError('Informe um endereço de e-mail válido.')
  }

  const phoneDigits = telefone.replace(/\D/g, '')
  if (telefone && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
    throw new RequestError('Informe um telefone com DDD ou deixe este campo em branco.')
  }

  if (titulo.length < 3 || titulo.length > 160) {
    throw new RequestError('Informe um título ou nome de item entre 3 e 160 caracteres.')
  }

  if (!ALLOWED_CATEGORIES.has(categoria)) {
    throw new RequestError('Selecione uma categoria válida para o material.')
  }

  if (descricao.length < 20 || descricao.length > 2000) {
    throw new RequestError('Descreva o item e seu contexto entre 20 e 2.000 caracteres.')
  }

  if (!autorizacao) {
    throw new RequestError('Marque a autorização para que o museu analise a contribuição.')
  }

  let tipoMidia: FileCategory | null = null
  if (rawTipoMidia) {
    if (!ALLOWED_MEDIA_TYPES.has(rawTipoMidia as FileCategory)) {
      throw new RequestError('Tipo de mídia inválido. Use fotografia, video ou documento.')
    }
    tipoMidia = rawTipoMidia as FileCategory
  }

  if (rawPeriodoEstimado.length > 80) {
    throw new RequestError('O período estimado deve ter no máximo 80 caracteres.')
  }

  if (rawLocalizacao.length > 120) {
    throw new RequestError('A localização deve ter no máximo 120 caracteres.')
  }

  if (rawElapsedMs !== '') {
    const formElapsedMs = Number(rawElapsedMs)
    if (
      !Number.isFinite(formElapsedMs) ||
      formElapsedMs < MIN_FORM_TIME_MS ||
      formElapsedMs > MAX_FORM_TIME_MS
    ) {
      throw new RequestError(
        'Não foi possível validar o envio. Recarregue a página e tente novamente.',
      )
    }
  } else {
    const elapsed = Date.now() - formStartedAt
    if (
      !Number.isFinite(formStartedAt) ||
      (elapsed >= 0 && elapsed < MIN_FORM_TIME_MS) ||
      elapsed > MAX_FORM_TIME_MS ||
      elapsed < -MAX_FORM_TIME_MS
    ) {
      throw new RequestError(
        'Não foi possível validar o envio. Recarregue a página e tente novamente.',
      )
    }
  }

  let midiaExternaUrl: string | null = null
  if (rawMidiaExternaUrl) {
    midiaExternaUrl = validateExternalVideoUrl(rawMidiaExternaUrl)
  }

  if (arquivo && midiaExternaUrl) {
    throw new RequestError(
      'Envie um arquivo ou informe um link externo de vídeo, não ambos ao mesmo tempo.',
    )
  }

  if (!arquivo && !midiaExternaUrl) {
    throw new RequestError(
      'Anexe uma fotografia, documento em PDF, vídeo curto ou informe um link válido do YouTube/Vimeo.',
    )
  }

  if (midiaExternaUrl && tipoMidia && tipoMidia !== 'video') {
    throw new RequestError('Links externos são permitidos apenas para o tipo de mídia vídeo.')
  }

  return {
    nome,
    email,
    telefone,
    titulo,
    categoria,
    descricao,
    autorizacao,
    website,
    tipoMidia,
    periodoEstimado: rawPeriodoEstimado || null,
    localizacao: rawLocalizacao || null,
    midiaExternaUrl,
    formStartedAt,
    arquivo,
  }
}

function makeProtocol(): string {
  const now = new Date()
  const date = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
  ].join('')
  const random = crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()
  return `MHK-${date}-${random}`
}

function makeStoragePath(extension: string): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `${year}/${month}/${crypto.randomUUID()}.${extension}`
}

function getClientIp(request: Request): string {
  const directIp =
    request.headers.get('cf-connecting-ip')?.trim() ||
    request.headers.get('x-real-ip')?.trim()
  if (directIp) return directIp

  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }

  return 'unknown'
}

function createServiceClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.')
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

async function handleRequest(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Método não permitido.' }, 405, origin)
  }

  if (!isOriginAllowed(origin)) {
    return jsonResponse({ error: 'Origem não autorizada.' }, 403, origin)
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (!Number.isFinite(contentLength) || contentLength > MAX_REQUEST_BYTES) {
    return jsonResponse(
      { error: 'O envio excede o tamanho máximo permitido.' },
      413,
      origin,
    )
  }

  try {
    const supabase = createServiceClient()

    const salt =
      Deno.env.get('RATE_LIMIT_SALT') ??
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
      'museu-hilmar-harry-kluck'
    const ipHash = await sha256Hex(`${salt}:${getClientIp(request)}`)

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
    const { count, error: rateLimitError } = await supabase
      .from('contribuicoes')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('criado_em', windowStart)

    if (rateLimitError) throw rateLimitError

    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return jsonResponse(
        {
          error:
            'Muitos envios em pouco tempo. Aguarde alguns minutos antes de tentar novamente.',
        },
        429,
        origin,
      )
    }

    const form = await request.formData()
    const fields = validateFields(form)

    const id = crypto.randomUUID()
    const protocolo = makeProtocol()

    if (fields.arquivo) {
      const file = await validateFile(fields.arquivo)
      if (fields.tipoMidia && fields.tipoMidia !== file.category) {
        throw new RequestError(
          `O arquivo enviado (${file.category}) não corresponde ao tipo de mídia selecionado (${fields.tipoMidia}).`,
        )
      }

      const fileHash = await sha256Hex(file.bytes)
      const storagePath = makeStoragePath(file.extension)

      const { error: uploadError } = await supabase.storage
        .from('contribuicoes')
        .upload(storagePath, file.bytes, {
          contentType: file.mime,
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('[enviar-contribuicao] Falha no upload:', uploadError)
        throw new RequestError(
          'Não foi possível armazenar o arquivo. Tente novamente em alguns instantes.',
          502,
        )
      }

      const { error: insertError } = await supabase.from('contribuicoes').insert({
        id,
        protocolo,
        nome: fields.nome,
        email: fields.email,
        telefone: fields.telefone || null,
        titulo: fields.titulo,
        categoria: fields.categoria,
        descricao: fields.descricao,
        autorizacao: fields.autorizacao,
        tipo_midia: file.category,
        periodo_estimado: fields.periodoEstimado,
        localizacao: fields.localizacao,
        midia_externa_url: null,
        arquivo_caminho: storagePath,
        arquivo_nome_original: sanitizeFileName(fields.arquivo.name),
        arquivo_mime: file.mime,
        arquivo_tamanho: file.size,
        arquivo_hash: fileHash,
        status: 'pendente',
        ip_hash: ipHash,
      })

      if (insertError) {
        console.error('[enviar-contribuicao] Falha ao registrar contribuição:', insertError)
        await supabase.storage.from('contribuicoes').remove([storagePath])
        throw new RequestError(
          'Não foi possível registrar a contribuição. Tente novamente em alguns instantes.',
          500,
        )
      }
    } else {
      const { error: insertError } = await supabase.from('contribuicoes').insert({
        id,
        protocolo,
        nome: fields.nome,
        email: fields.email,
        telefone: fields.telefone || null,
        titulo: fields.titulo,
        categoria: fields.categoria,
        descricao: fields.descricao,
        autorizacao: fields.autorizacao,
        tipo_midia: 'video',
        periodo_estimado: fields.periodoEstimado,
        localizacao: fields.localizacao,
        midia_externa_url: fields.midiaExternaUrl,
        arquivo_caminho: null,
        arquivo_nome_original: null,
        arquivo_mime: null,
        arquivo_tamanho: null,
        arquivo_hash: null,
        status: 'pendente',
        ip_hash: ipHash,
      })

      if (insertError) {
        console.error('[enviar-contribuicao] Falha ao registrar vídeo externo:', insertError)
        throw new RequestError(
          'Não foi possível registrar a contribuição. Tente novamente em alguns instantes.',
          500,
        )
      }
    }

    return jsonResponse({ ok: true, id, protocolo }, 201, origin)
  } catch (error) {
    if (error instanceof RequestError) {
      return jsonResponse({ error: error.message }, error.status, origin)
    }

    console.error('[enviar-contribuicao] Erro inesperado:', error)
    return jsonResponse(
      {
        error:
          'Não foi possível registrar a contribuição. Tente novamente em alguns instantes.',
      },
      500,
      origin,
    )
  }
}

Deno.serve(handleRequest)
