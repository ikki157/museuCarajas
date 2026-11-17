import { supabase } from './supabase'

export type GaleriaItem = {
  id: string
  titulo: string
  descricao: string | null
  categoria: string
  caminho_storage: string
  arquivo_url: string | null
  formato: string
  credito: string | null
  publicado: boolean
  criado_em: string
  atualizado_em: string
}

const GALERIA_BUCKET = 'galeria'

export function mapGaleriaRow(row: Record<string, unknown>): GaleriaItem {
  return {
    id: String(row.id),
    titulo: typeof row.titulo === 'string' ? row.titulo : 'Imagem do acervo',
    descricao: typeof row.descricao === 'string' ? row.descricao : null,
    categoria: typeof row.categoria === 'string' ? row.categoria : 'Acervo',
    caminho_storage: typeof row.caminho_storage === 'string' ? row.caminho_storage : '',
    arquivo_url: typeof row.arquivo_url === 'string' ? row.arquivo_url : null,
    formato: typeof row.formato === 'string' ? row.formato : 'jpg',
    credito: typeof row.credito === 'string' ? row.credito : null,
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
