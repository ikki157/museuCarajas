import { supabase } from './supabase'

export type GaleriaMediaType = 'fotografia' | 'video' | 'documento'

export type GaleriaItem = {
  id: string
  titulo: string
  descricao: string | null
  categoria: string
  tipo_midia: GaleriaMediaType
  periodo_estimado: string | null
  localizacao: string | null
  tags: string[]
  caminho_storage: string | null
  arquivo_url: string | null
  midia_externa_url: string | null
  thumbnail_url: string | null
  formato: string
  credito: string | null
  publicado: boolean
  criado_em: string
  atualizado_em: string
}

const GALERIA_BUCKET = 'galeria'
const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/
const VIMEO_ID_REGEX = /^\d{5,12}$/

function inferMediaType(rawType: unknown, format: string): GaleriaMediaType {
  if (rawType === 'fotografia' || rawType === 'video' || rawType === 'documento') {
    return rawType
  }

  const normalized = format.trim().toLowerCase()
  if (normalized === 'pdf') return 'documento'
  if (
    normalized === 'mp4' ||
    normalized === 'webm' ||
    normalized === 'youtube' ||
    normalized === 'vimeo'
  ) {
    return 'video'
  }
  return 'fotografia'
}

function normalizeOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function extractYouTubeId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim())
    if (parsed.protocol !== 'https:') return null

    const host = parsed.hostname.toLowerCase()
    if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v')?.trim() ?? ''
        return YOUTUBE_ID_REGEX.test(id) ? id : null
      }
      if (parsed.pathname.startsWith('/shorts/') || parsed.pathname.startsWith('/embed/')) {
        const id = parsed.pathname.split('/')[2]?.trim() ?? ''
        return YOUTUBE_ID_REGEX.test(id) ? id : null
      }
    }

    if (host === 'www.youtube-nocookie.com' && parsed.pathname.startsWith('/embed/')) {
      const id = parsed.pathname.split('/')[2]?.trim() ?? ''
      return YOUTUBE_ID_REGEX.test(id) ? id : null
    }

    if (host === 'youtu.be') {
      const id = parsed.pathname.replace(/^\/+/, '').split('/')[0]?.trim() ?? ''
      return YOUTUBE_ID_REGEX.test(id) ? id : null
    }

    return null
  } catch {
    return null
  }
}

function extractVimeoId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim())
    if (parsed.protocol !== 'https:') return null

    const host = parsed.hostname.toLowerCase()
    if (host === 'vimeo.com' || host === 'www.vimeo.com') {
      const id = parsed.pathname.replace(/^\/+|\/+$/g, '').split('/')[0]?.trim() ?? ''
      return VIMEO_ID_REGEX.test(id) ? id : null
    }

    if (host === 'player.vimeo.com' && parsed.pathname.startsWith('/video/')) {
      const id = parsed.pathname.slice('/video/'.length).split('/')[0]?.trim() ?? ''
      return VIMEO_ID_REGEX.test(id) ? id : null
    }

    return null
  } catch {
    return null
  }
}

export function getEmbedVideoUrl(url: string): string | null {
  const youtubeId = extractYouTubeId(url)
  if (youtubeId) {
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`
  }

  const vimeoId = extractVimeoId(url)
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}?dnt=1`
  }

  return null
}

export function mapGaleriaRow(row: Record<string, unknown>): GaleriaItem {
  const formato = typeof row.formato === 'string' && row.formato.trim() ? row.formato.trim() : 'jpg'

  return {
    id: String(row.id),
    titulo: typeof row.titulo === 'string' ? row.titulo : 'Registro do acervo',
    descricao: normalizeOptionalString(row.descricao),
    categoria: typeof row.categoria === 'string' && row.categoria.trim() ? row.categoria.trim() : 'Acervo',
    tipo_midia: inferMediaType(row.tipo_midia, formato),
    periodo_estimado: normalizeOptionalString(row.periodo_estimado),
    localizacao: normalizeOptionalString(row.localizacao),
    tags: normalizeTags(row.tags),
    caminho_storage: normalizeOptionalString(row.caminho_storage),
    arquivo_url: normalizeOptionalString(row.arquivo_url),
    midia_externa_url: normalizeOptionalString(row.midia_externa_url),
    thumbnail_url: normalizeOptionalString(row.thumbnail_url),
    formato,
    credito: normalizeOptionalString(row.credito),
    publicado: row.publicado === true,
    criado_em: typeof row.criado_em === 'string' ? row.criado_em : new Date().toISOString(),
    atualizado_em:
      typeof row.atualizado_em === 'string' ? row.atualizado_em : new Date().toISOString(),
  }
}

export function getGaleriaImageUrl(item: GaleriaItem): string | null {
  if (item.arquivo_url) return item.arquivo_url
  if (!supabase || !item.caminho_storage) return null

  const { data } = supabase.storage.from(GALERIA_BUCKET).getPublicUrl(item.caminho_storage)
  return data.publicUrl || null
}

export function getGaleriaThumbnailUrl(item: GaleriaItem): string | null {
  if (item.thumbnail_url) {
    if (/^(https?:\/\/|\/)/.test(item.thumbnail_url)) {
      return item.thumbnail_url
    }
    if (supabase) {
      const { data } = supabase.storage.from(GALERIA_BUCKET).getPublicUrl(item.thumbnail_url)
      if (data.publicUrl) return data.publicUrl
    }
  }

  if (item.midia_externa_url) {
    const youtubeId = extractYouTubeId(item.midia_externa_url)
    if (youtubeId) {
      return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
    }
  }

  return null
}
