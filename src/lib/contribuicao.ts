import { supabase } from './supabase'
import type { ValidatedFile, ValidatedFileCategory } from './file-validation'

export type ContributionPayload = {
  nome: string
  email: string
  telefone: string
  titulo: string
  categoria: string
  descricao: string
  autorizacao: boolean
  website: string
  tipoMidia?: ValidatedFileCategory
  periodoEstimado?: string
  localizacao?: string
  midiaExternaUrl?: string
  arquivo?: ValidatedFile | null
  formStartedAt: number
  formElapsedMs: number
}

export type ContributionResponse = {
  protocolo: string
  id: string
}

type ContributionFunctionResponse = ContributionResponse & { ok: true }

export class ContributionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContributionError'
  }
}

async function readFunctionError(error: unknown): Promise<string | null> {
  const context = (error as { context?: Response }).context
  if (!context || typeof context.json !== 'function') return null

  try {
    const body = (await context.json()) as { error?: unknown; message?: unknown }
    if (typeof body.error === 'string' && body.error.trim()) return body.error
    if (typeof body.message === 'string' && body.message.trim()) return body.message
  } catch {
    return null
  }

  return null
}

export async function submitContribution(
  payload: ContributionPayload,
): Promise<ContributionResponse> {
  const externalUrl = payload.midiaExternaUrl?.trim() ?? ''
  const tipoMidia: ValidatedFileCategory =
    payload.tipoMidia ?? payload.arquivo?.category ?? (externalUrl ? 'video' : 'fotografia')

  if (!payload.arquivo && !externalUrl) {
    throw new ContributionError(
      'Anexe um arquivo válido ou informe o link de um vídeo no YouTube ou Vimeo.',
    )
  }

  if (!supabase) {
    throw new ContributionError(
      'O serviço de envio ainda não está configurado. Nenhum dado foi enviado.',
    )
  }

  const formData = new FormData()
  formData.set('nome', payload.nome)
  formData.set('email', payload.email)
  formData.set('telefone', payload.telefone)
  formData.set('titulo', payload.titulo)
  formData.set('categoria', payload.categoria)
  formData.set('descricao', payload.descricao)
  formData.set('autorizacao', String(payload.autorizacao))
  formData.set('website', payload.website)
  formData.set('tipo_midia', tipoMidia)
  formData.set('periodo_estimado', payload.periodoEstimado?.trim() ?? '')
  formData.set('localizacao', payload.localizacao?.trim() ?? '')
  formData.set('midia_externa_url', externalUrl)
  formData.set('form_started_at', String(payload.formStartedAt))
  formData.set('form_elapsed_ms', String(payload.formElapsedMs))

  if (payload.arquivo) {
    formData.set('arquivo', payload.arquivo.file, payload.arquivo.file.name)
  }

  const { data, error } = await supabase.functions.invoke('enviar-contribuicao', {
    body: formData,
  })

  if (error) {
    const backendMessage = await readFunctionError(error)
    if (backendMessage) throw new ContributionError(backendMessage)

    if (
      error.message.includes('Failed to send a request') ||
      error.message.includes('Failed to fetch')
    ) {
      throw new ContributionError(
        'Não foi possível conectar ao serviço de envio. Verifique a configuração da Edge Function no Supabase e tente novamente.',
      )
    }

    throw new ContributionError(
      'Não foi possível concluir o envio. Tente novamente em alguns instantes.',
    )
  }

  const response = data as Partial<ContributionFunctionResponse> | null
  if (!response?.ok || typeof response.protocolo !== 'string' || typeof response.id !== 'string') {
    throw new ContributionError(
      'O serviço respondeu de forma inesperada. Tente novamente em alguns instantes.',
    )
  }

  return { protocolo: response.protocolo, id: response.id }
}
