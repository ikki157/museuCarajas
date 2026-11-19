import {
  mapGaleriaRow,
  type GaleriaItem,
  type GaleriaMediaType,
} from './galeria'
import { supabase } from './supabase'

export type ContribuicaoStatus =
  | 'pendente'
  | 'em_analise'
  | 'aprovada'
  | 'recusada'
  | 'publicada'

export type ContribuicaoItem = {
  id: string
  protocolo: string
  nome: string
  email: string
  telefone: string | null
  titulo: string
  categoria: string
  descricao: string
  autorizacao: boolean
  tipo_midia: GaleriaMediaType
  periodo_estimado: string | null
  localizacao: string | null
  midia_externa_url: string | null
  arquivo_caminho: string | null
  arquivo_nome_original: string | null
  arquivo_mime: string | null
  arquivo_tamanho: number | null
  arquivo_hash: string | null
  status: ContribuicaoStatus
  observacoes: string | null
  criado_em: string
  atualizado_em: string
}

export type ContribuicaoPublishOverrides = {
  titulo: string
  descricao: string
  categoria: string
  periodo_estimado?: string | null
  localizacao?: string | null
  credito?: string | null
}

function getClient() {
  if (!supabase) {
    throw new Error('Conexão com o Supabase não configurada neste ambiente.')
  }
  return supabase
}

function inferFormatFromContribution(contribuicao: ContribuicaoItem): string {
  const mime = contribuicao.arquivo_mime?.trim().toLowerCase() ?? ''
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'application/pdf') return 'pdf'
  if (mime === 'video/mp4') return 'mp4'
  if (mime === 'video/webm') return 'webm'

  const external = contribuicao.midia_externa_url?.trim().toLowerCase() ?? ''
  if (external.includes('youtube.com') || external.includes('youtu.be')) {
    return 'youtube'
  }
  if (external.includes('vimeo.com')) {
    return 'vimeo'
  }
  if (/\.webm(\?|$)/.test(external)) {
    return 'webm'
  }
  if (contribuicao.tipo_midia === 'video') return 'mp4'
  if (contribuicao.tipo_midia === 'documento') return 'pdf'
  return 'jpg'
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!userId.trim()) return false
  const client = getClient()

  const { data, error } = await client
    .from('museu_administradores')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(
      `Não foi possível verificar permissões de curadoria: ${error.message}`,
    )
  }

  return Boolean(data?.user_id)
}

export async function listContribuicoes(
  statusFilter?: string,
): Promise<ContribuicaoItem[]> {
  const client = getClient()

  let query = client
    .from('contribuicoes')
    .select(
      'id, protocolo, nome, email, telefone, titulo, categoria, descricao, autorizacao, tipo_midia, periodo_estimado, localizacao, midia_externa_url, arquivo_caminho, arquivo_nome_original, arquivo_mime, arquivo_tamanho, arquivo_hash, status, observacoes, criado_em, atualizado_em',
    )
    .order('criado_em', { ascending: false })

  if (statusFilter && statusFilter !== 'todas') {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query
  if (error) {
    throw new Error(`Falha ao carregar contribuições: ${error.message}`)
  }

  return (data ?? []) as ContribuicaoItem[]
}

export async function getContributionSignedUrl(path: string): Promise<string> {
  const client = getClient()
  const normalizedPath = path.trim()
  if (!normalizedPath) {
    throw new Error('Caminho do arquivo não encontrado para pré-visualização.')
  }

  const { data, error } = await client.storage
    .from('contribuicoes')
    .createSignedUrl(normalizedPath, 300)

  if (error || !data?.signedUrl) {
    throw new Error(
      error?.message ?? 'Não foi possível gerar o link temporário do arquivo.',
    )
  }

  return data.signedUrl
}

export async function approveAndPublishContribution(
  contribuicao: ContribuicaoItem,
  overrides: ContribuicaoPublishOverrides,
): Promise<string> {
  const client = getClient()

  if (contribuicao.status === 'publicada') {
    throw new Error('Esta contribuição já foi publicada anteriormente.')
  }
  if (contribuicao.status === 'recusada') {
    throw new Error('Contribuições recusadas não podem ser publicadas diretamente.')
  }

  const titulo = overrides.titulo.trim()
  const descricao = overrides.descricao.trim()
  const categoria = overrides.categoria.trim()
  const periodoEstimado = overrides.periodo_estimado?.trim() || null
  const localizacao = overrides.localizacao?.trim() || null
  const credito = overrides.credito?.trim() || contribuicao.nome.trim()

  if (titulo.length < 3 || titulo.length > 160) {
    throw new Error('O título precisa ter entre 3 e 160 caracteres.')
  }
  if (!categoria || categoria.length > 40) {
    throw new Error('A categoria precisa ter entre 1 e 40 caracteres.')
  }
  if (descricao.length < 20 || descricao.length > 2000) {
    throw new Error('A descrição precisa ter entre 20 e 2000 caracteres.')
  }
  if (periodoEstimado && periodoEstimado.length > 80) {
    throw new Error('O período estimado deve ter no máximo 80 caracteres.')
  }
  if (localizacao && localizacao.length > 120) {
    throw new Error('A localização deve ter no máximo 120 caracteres.')
  }

  const formato = inferFormatFromContribution(contribuicao)
  let publicPath: string | null = null
  let publicUrl: string | null = null
  let uploadedPublicFile = false

  if (contribuicao.arquivo_caminho) {
    const { data: blob, error: downloadError } = await client.storage
      .from('contribuicoes')
      .download(contribuicao.arquivo_caminho)

    if (downloadError || !blob) {
      throw new Error(
        `Falha ao baixar arquivo enviado pelo colaborador: ${downloadError?.message ?? 'arquivo ausente'}`,
      )
    }

    // Usa apenas UUID + formato verificado na chave pública (nunca o nome de arquivo enviado pelo usuário)
    publicPath = `curadoria/${contribuicao.id}.${formato}`

    const { error: uploadError } = await client.storage
      .from('galeria')
      .upload(publicPath, blob, {
        contentType: contribuicao.arquivo_mime || blob.type || undefined,
        upsert: true,
      })

    if (uploadError) {
      throw new Error(
        `Falha ao publicar arquivo no acervo público: ${uploadError.message}`,
      )
    }

    uploadedPublicFile = true
    const { data: publicUrlData } = client.storage
      .from('galeria')
      .getPublicUrl(publicPath)
    publicUrl = publicUrlData.publicUrl || null
  }

  const rollbackPublicFile = async () => {
    if (uploadedPublicFile && publicPath) {
      await client.storage.from('galeria').remove([publicPath])
    }
  }

  try {
    const { error: metadataError } = await client
      .from('contribuicoes')
      .update({
        titulo,
        descricao,
        categoria,
        periodo_estimado: periodoEstimado,
        localizacao,
      })
      .eq('id', contribuicao.id)

    if (metadataError) {
      throw new Error(
        `Falha ao salvar ajustes editoriais: ${metadataError.message}`,
      )
    }

    const { data: rpcId, error: rpcError } = await client.rpc(
      'publicar_contribuicao_na_galeria',
      {
        p_contribuicao_id: contribuicao.id,
        p_caminho_publico: publicPath,
        p_thumbnail_url: null,
        p_credito: credito,
      },
    )

    if (!rpcError && typeof rpcId === 'string' && rpcId) {
      if (publicUrl) {
        await client
          .from('galeria')
          .update({ arquivo_url: publicUrl })
          .eq('id', rpcId)
      }
      return rpcId
    }

    const isMissingRpc =
      rpcError?.code === 'PGRST202' || rpcError?.code === '42883'

    if (rpcError && !isMissingRpc) {
      throw new Error(
        rpcError.message ||
          'Não foi possível publicar a contribuição na galeria.',
      )
    }

    const { data: inserted, error: insertError } = await client
      .from('galeria')
      .insert({
        titulo,
        descricao,
        categoria,
        caminho_storage: publicPath,
        arquivo_url: publicUrl,
        formato,
        credito,
        publicado: true,
        tipo_midia: contribuicao.tipo_midia,
        periodo_estimado: periodoEstimado,
        localizacao,
        midia_externa_url: contribuicao.midia_externa_url,
        thumbnail_url: null,
        contribuicao_id: contribuicao.id,
      })
      .select('id')
      .single()

    if (insertError || !inserted?.id) {
      throw new Error(
        insertError?.message ||
          'Não foi possível publicar a contribuição na galeria.',
      )
    }

    const { error: statusUpdateError } = await client
      .from('contribuicoes')
      .update({ status: 'publicada' })
      .eq('id', contribuicao.id)

    if (statusUpdateError) {
      await client.from('galeria').delete().eq('id', String(inserted.id))
      throw new Error(
        `Falha ao atualizar o status da contribuição (publicação revertida): ${statusUpdateError.message}`,
      )
    }

    return String(inserted.id)
  } catch (error) {
    await rollbackPublicFile()
    throw error
  }
}

export async function updateContributionStatus(
  id: string,
  status: 'em_analise' | 'recusada',
  observacoes?: string,
): Promise<void> {
  const client = getClient()

  const payload: { status: 'em_analise' | 'recusada'; observacoes?: string | null } = {
    status,
  }
  if (observacoes !== undefined) {
    payload.observacoes = observacoes.trim() || null
  }

  const { error } = await client
    .from('contribuicoes')
    .update(payload)
    .eq('id', id)

  if (error) {
    throw new Error(`Falha ao atualizar status da contribuição: ${error.message}`)
  }
}

export async function listGaleriaAdmin(): Promise<GaleriaItem[]> {
  const client = getClient()

  const { data, error } = await client
    .from('galeria')
    .select('*')
    .order('criado_em', { ascending: false })

  if (error) {
    throw new Error(`Falha ao carregar acervo da galeria: ${error.message}`)
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map(mapGaleriaRow)
}

export async function toggleGaleriaPublicado(
  id: string,
  publicado: boolean,
): Promise<void> {
  const client = getClient()

  const { error } = await client
    .from('galeria')
    .update({ publicado })
    .eq('id', id)

  if (error) {
    throw new Error(
      `Falha ao atualizar visibilidade do registro: ${error.message}`,
    )
  }
}

export async function deleteGaleriaItem(
  item: Pick<GaleriaItem, 'id' | 'caminho_storage'>,
): Promise<void> {
  const client = getClient()

  const { error } = await client.from('galeria').delete().eq('id', item.id)
  if (error) {
    throw new Error(`Falha ao excluir registro da galeria: ${error.message}`)
  }

  if (item.caminho_storage) {
    await client.storage.from('galeria').remove([item.caminho_storage])
  }
}

