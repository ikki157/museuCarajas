export const MAX_PHOTO_BYTES = 10 * 1024 * 1024
export const MAX_PDF_BYTES = 15 * 1024 * 1024
export const MAX_VIDEO_BYTES = 25 * 1024 * 1024
export const ACCEPTED_FILE_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.pdf,.mp4,.webm'

export type ValidatedFileCategory = 'fotografia' | 'documento' | 'video'
export type ValidatedFileFormat = 'jpg' | 'png' | 'webp' | 'pdf' | 'mp4' | 'webm'

export type ValidatedFile = {
  file: File
  category: ValidatedFileCategory
  format: ValidatedFileFormat
  extension: string
  mime: string
  size: number
}

export type FileValidationResult =
  | { ok: true; value: ValidatedFile }
  | { ok: false; error: string }

export type ExternalVideoValidationResult =
  | { ok: true; provider: 'youtube' | 'vimeo'; normalizedUrl: string }
  | { ok: false; error: string }

const FORMAT_LABELS: Record<ValidatedFileFormat, string> = {
  jpg: 'JPEG',
  png: 'PNG',
  webp: 'WEBP',
  pdf: 'PDF',
  mp4: 'MP4',
  webm: 'WebM',
}

const EXTENSIONS: Record<ValidatedFileFormat, string[]> = {
  jpg: ['jpg', 'jpeg'],
  png: ['png'],
  webp: ['webp'],
  pdf: ['pdf'],
  mp4: ['mp4'],
  webm: ['webm'],
}

const MIME_TYPES: Record<ValidatedFileFormat, string[]> = {
  jpg: ['image/jpeg', 'image/jpg'],
  png: ['image/png'],
  webp: ['image/webp'],
  pdf: ['application/pdf'],
  mp4: ['video/mp4'],
  webm: ['video/webm'],
}

const CANONICAL_MIME: Record<ValidatedFileFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  webm: 'video/webm',
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length))
}

function detectFormat(bytes: Uint8Array): ValidatedFileFormat | null {
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

async function hasValidImageEnding(
  file: File,
  format: 'jpg' | 'png' | 'webp',
  header: Uint8Array,
): Promise<boolean> {
  if (format === 'webp') {
    if (file.size < 20 || header.length < 16) return false
    if (ascii(header, 0, 4) !== 'RIFF' || ascii(header, 8, 4) !== 'WEBP') return false
    const chunkType = ascii(header, 12, 4)
    if (chunkType !== 'VP8 ' && chunkType !== 'VP8L' && chunkType !== 'VP8X') return false
    const riffSize =
      (header[4] | (header[5] << 8) | (header[6] << 16) | (header[7] << 24)) >>> 0
    return riffSize === 0 || riffSize + 8 <= file.size
  }

  const tail = new Uint8Array(await file.slice(Math.max(0, file.size - 4096)).arrayBuffer())

  if (format === 'jpg') {
    return file.size >= 4 && containsBytes(tail, [0xff, 0xd9])
  }

  if (file.size < 20) return false
  return containsBytes(tail, [0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82])
}

async function canDecodeImage(file: File): Promise<boolean> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file)
      const hasDimensions = bitmap.width > 0 && bitmap.height > 0
      bitmap.close()
      return hasDimensions
    } catch {
      return false
    }
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image.naturalWidth > 0 && image.naturalHeight > 0)
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(false)
    }

    image.src = url
  })
}

async function hasValidPdfEnding(file: File): Promise<boolean> {
  if (file.size < 100) return false

  const tail = new Uint8Array(await file.slice(Math.max(0, file.size - 4096)).arrayBuffer())
  return containsAscii(tail, '%%EOF')
}

function hasValidVideoStructure(
  file: File,
  format: 'mp4' | 'webm',
  header: Uint8Array,
): boolean {
  if (file.size < 64 || header.length < 16) return false

  if (format === 'mp4') {
    if (ascii(header, 4, 4) !== 'ftyp') return false
    const boxSize =
      ((header[0] << 24) | (header[1] << 16) | (header[2] << 8) | header[3]) >>> 0
    return boxSize >= 16 && boxSize <= file.size
  }

  return (
    header[0] === 0x1a &&
    header[1] === 0x45 &&
    header[2] === 0xdf &&
    header[3] === 0xa3
  )
}

export function sanitizeFileName(name: string): string {
  const clean = name
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)

  return clean || 'arquivo'
}

export function validateExternalVideoUrl(url: string): ExternalVideoValidationResult {
  const trimmed = url.trim()
  if (!trimmed) {
    return { ok: false, error: 'Informe o link do vídeo no YouTube ou Vimeo.' }
  }

  if (trimmed.length > 512) {
    return { ok: false, error: 'O link do vídeo é muito longo (máximo de 512 caracteres).' }
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return {
      ok: false,
      error: 'Informe uma URL válida do YouTube ou Vimeo iniciada com https://.',
    }
  }

  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    return {
      ok: false,
      error: 'Por segurança, informe apenas links HTTPS públicos do YouTube ou Vimeo.',
    }
  }

  const host = parsed.hostname.toLowerCase()
  const youtubeIdRegex = /^[A-Za-z0-9_-]{11}$/
  const vimeoIdRegex = /^\d{5,12}$/

  if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com') {
    if (parsed.pathname === '/watch') {
      const videoId = parsed.searchParams.get('v')?.trim() ?? ''
      if (youtubeIdRegex.test(videoId)) {
        return {
          ok: true,
          provider: 'youtube',
          normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
        }
      }
    }

    if (parsed.pathname.startsWith('/shorts/')) {
      const videoId = parsed.pathname.slice('/shorts/'.length).split('/')[0]?.trim() ?? ''
      if (youtubeIdRegex.test(videoId)) {
        return {
          ok: true,
          provider: 'youtube',
          normalizedUrl: `https://www.youtube.com/shorts/${videoId}`,
        }
      }
    }
  }

  if (host === 'youtu.be') {
    const videoId = parsed.pathname.replace(/^\/+/, '').split('/')[0]?.trim() ?? ''
    if (youtubeIdRegex.test(videoId)) {
      return {
        ok: true,
        provider: 'youtube',
        normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
      }
    }
  }

  if (host === 'vimeo.com' || host === 'www.vimeo.com') {
    const videoId = parsed.pathname.replace(/^\/+|\/+$/g, '').split('/')[0]?.trim() ?? ''
    if (vimeoIdRegex.test(videoId)) {
      return {
        ok: true,
        provider: 'vimeo',
        normalizedUrl: `https://vimeo.com/${videoId}`,
      }
    }
  }

  if (host === 'player.vimeo.com' && parsed.pathname.startsWith('/video/')) {
    const videoId = parsed.pathname.slice('/video/'.length).split('/')[0]?.trim() ?? ''
    if (vimeoIdRegex.test(videoId)) {
      return {
        ok: true,
        provider: 'vimeo',
        normalizedUrl: `https://vimeo.com/${videoId}`,
      }
    }
  }

  return {
    ok: false,
    error:
      'Use apenas links diretos do YouTube (youtube.com/watch?v=, youtu.be/ ou youtube.com/shorts/) ou Vimeo (vimeo.com/).',
  }
}

export async function validateContributionFile(file: File): Promise<FileValidationResult> {
  if (!(file instanceof File)) {
    return { ok: false, error: 'Selecione um arquivo válido.' }
  }

  if (file.size === 0) {
    return { ok: false, error: 'O arquivo está vazio. Selecione outro arquivo.' }
  }

  const fileName = file.name.trim()
  const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() ?? '' : ''

  if (!extension) {
    return {
      ok: false,
      error: 'O arquivo não possui extensão. Envie JPG, PNG, WEBP, PDF, MP4 ou WEBM.',
    }
  }

  const allExtensions = Object.values(EXTENSIONS).flat()
  if (!allExtensions.includes(extension)) {
    return {
      ok: false,
      error:
        'Formato não permitido. Envie fotografias (JPG, PNG, WEBP), documentos (PDF) ou vídeos curtos (MP4, WEBM).',
    }
  }

  let header: Uint8Array
  try {
    header = new Uint8Array(await file.slice(0, 64).arrayBuffer())
  } catch {
    return { ok: false, error: 'Não foi possível ler o arquivo. Tente novamente.' }
  }

  const format = detectFormat(header)
  if (!format) {
    return {
      ok: false,
      error:
        'O conteúdo do arquivo não corresponde a JPG, PNG, WEBP, PDF, MP4 ou WEBM. Renomear a extensão não é suficiente.',
    }
  }

  if (!EXTENSIONS[format].includes(extension)) {
    return {
      ok: false,
      error: `A extensão .${extension} não corresponde ao conteúdo real do arquivo (${FORMAT_LABELS[format]}).`,
    }
  }

  const declaredMime = file.type.trim().toLowerCase()
  if (declaredMime && !MIME_TYPES[format].includes(declaredMime)) {
    return {
      ok: false,
      error: `O tipo MIME informado (${declaredMime}) não corresponde ao conteúdo real (${FORMAT_LABELS[format]}).`,
    }
  }

  const category: ValidatedFileCategory =
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
    return {
      ok: false,
      error:
        category === 'documento'
          ? 'O arquivo excede o limite de 15 MB para documentos PDF.'
          : category === 'video'
            ? 'O vídeo excede o limite de 25 MB para envio direto (para vídeos maiores, use um link do YouTube ou Vimeo).'
            : 'O arquivo excede o limite de 10 MB para fotografias.',
    }
  }

  if (category === 'fotografia') {
    const validEnding = await hasValidImageEnding(
      file,
      format as 'jpg' | 'png' | 'webp',
      header,
    )
    const decodable = validEnding && (await canDecodeImage(file))
    if (!decodable) {
      return {
        ok: false,
        error: 'A imagem parece estar corrompida ou incompleta. Tente outro arquivo.',
      }
    }
  } else if (category === 'documento') {
    const validEnding = await hasValidPdfEnding(file)
    if (!validEnding) {
      return {
        ok: false,
        error: 'O PDF parece estar corrompido ou incompleto. Verifique o arquivo e tente novamente.',
      }
    }
  } else {
    const validVideo = hasValidVideoStructure(file, format as 'mp4' | 'webm', header)
    if (!validVideo) {
      return {
        ok: false,
        error: 'O vídeo parece estar corrompido ou em um formato incompatível. Tente outro arquivo.',
      }
    }
  }

  return {
    ok: true,
    value: {
      file,
      category,
      format,
      extension: format === 'jpg' ? 'jpg' : format,
      mime: CANONICAL_MIME[format],
      size: file.size,
    },
  }
}
