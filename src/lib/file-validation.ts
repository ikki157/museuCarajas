export const MAX_PHOTO_BYTES = 10 * 1024 * 1024
export const MAX_PDF_BYTES = 15 * 1024 * 1024
export const ACCEPTED_FILE_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.pdf'

export type ValidatedFileCategory = 'fotografia' | 'documento'
export type ValidatedFileFormat = 'jpg' | 'png' | 'webp' | 'pdf'

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

const FORMAT_LABELS: Record<ValidatedFileFormat, string> = {
  jpg: 'JPEG',
  png: 'PNG',
  webp: 'WEBP',
  pdf: 'PDF',
}

const EXTENSIONS: Record<ValidatedFileFormat, string[]> = {
  jpg: ['jpg', 'jpeg'],
  png: ['png'],
  webp: ['webp'],
  pdf: ['pdf'],
}

const MIME_TYPES: Record<ValidatedFileFormat, string[]> = {
  jpg: ['image/jpeg', 'image/jpg'],
  png: ['image/png'],
  webp: ['image/webp'],
  pdf: ['application/pdf'],
}

const CANONICAL_MIME: Record<ValidatedFileFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
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

  return null
}

function containsAscii(bytes: Uint8Array, value: string): boolean {
  const target = value.split('').map((character) => character.charCodeAt(0))
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

export function sanitizeFileName(name: string): string {
  const clean = name
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)

  return clean || 'arquivo'
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
      error: 'O arquivo não possui extensão. Envie JPG, PNG, WEBP ou PDF.',
    }
  }

  const allExtensions = Object.values(EXTENSIONS).flat()
  if (!allExtensions.includes(extension)) {
    return {
      ok: false,
      error: 'Formato não permitido. Envie fotografias em JPG, PNG ou WEBP, ou documentos em PDF.',
    }
  }

  let header: Uint8Array
  try {
    header = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  } catch {
    return { ok: false, error: 'Não foi possível ler o arquivo. Tente novamente.' }
  }

  const format = detectFormat(header)
  if (!format) {
    return {
      ok: false,
      error:
        'O conteúdo do arquivo não corresponde a JPG, PNG, WEBP ou PDF. Renomear a extensão não é suficiente.',
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

  const category: ValidatedFileCategory = format === 'pdf' ? 'documento' : 'fotografia'
  const limit = format === 'pdf' ? MAX_PDF_BYTES : MAX_PHOTO_BYTES

  if (file.size > limit) {
    return {
      ok: false,
      error:
        format === 'pdf'
          ? 'O arquivo excede o limite de 15 MB para documentos PDF.'
          : 'O arquivo excede o limite de 10 MB para fotografias.',
    }
  }

  if (category === 'fotografia') {
    const decodable = await canDecodeImage(file)
    if (!decodable) {
      return {
        ok: false,
        error: 'A imagem parece estar corrompida ou incompleta. Tente outro arquivo.',
      }
    }
  } else {
    const validEnding = await hasValidPdfEnding(file)
    if (!validEnding) {
      return {
        ok: false,
        error: 'O PDF parece estar corrompido ou incompleto. Verifique o arquivo e tente novamente.',
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
