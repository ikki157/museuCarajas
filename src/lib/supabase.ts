import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

function readJwtRole(key: string): string | null {
  const parts = key.split('.')
  if (parts.length !== 3) return null

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    const decoded = JSON.parse(atob(padded)) as { role?: unknown }
    return typeof decoded.role === 'string' ? decoded.role : null
  } catch {
    return null
  }
}

const keyRole = readJwtRole(rawKey)
const usesSecretKey = rawKey.startsWith('sb_secret_') || keyRole === 'service_role'
const hasValidUrl = /^https?:\/\/.+/i.test(rawUrl)
const hasValidKey = rawKey.length >= 20

export const isSupabaseConfigured = hasValidUrl && hasValidKey && !usesSecretKey

export const supabaseConfigIssue = usesSecretKey
  ? 'Uma chave secreta (service_role) foi detectada no frontend. Remova-a imediatamente: apenas a chave pública anon/publishable pode ser usada no navegador.'
  : !hasValidUrl || !hasValidKey
    ? 'As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ainda não foram configuradas.'
    : null

if (usesSecretKey && import.meta.env.DEV) {
  console.error('[Supabase] Chave secreta detectada no cliente. A conexão foi desativada por segurança.')
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, rawKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  : null
