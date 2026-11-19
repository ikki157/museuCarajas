import { useCallback, useEffect, useRef, useState } from 'react'
import { mapGaleriaRow, type GaleriaItem } from '../lib/galeria'
import { supabase } from '../lib/supabase'

export type GaleriaStatus = 'unconfigured' | 'connecting' | 'live' | 'offline'

type UseGaleriaResult = {
  items: GaleriaItem[]
  loading: boolean
  error: string | null
  status: GaleriaStatus
  refresh: () => void
}

const GALERIA_FIELDS = '*'

export function useGaleria(): UseGaleriaResult {
  const [items, setItems] = useState<GaleriaItem[]>([])
  const [loading, setLoading] = useState(Boolean(supabase))
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<GaleriaStatus>(
    supabase ? 'connecting' : 'unconfigured',
  )
  const statusRef = useRef<GaleriaStatus>(supabase ? 'connecting' : 'unconfigured')
  const mountedRef = useRef(true)

  const updateStatus = useCallback((nextStatus: GaleriaStatus) => {
    statusRef.current = nextStatus
    setStatus(nextStatus)
  }, [])

  const load = useCallback(async (showLoading = false) => {
    if (!supabase) {
      setLoading(false)
      updateStatus('unconfigured')
      return
    }

    if (showLoading) setLoading(true)

    try {
      const { data, error: queryError } = await supabase
        .from('galeria')
        .select(GALERIA_FIELDS)
        .eq('publicado', true)
        .order('criado_em', { ascending: false })
        .limit(60)

      if (queryError) throw queryError
      if (!mountedRef.current) return

      const rows = (data ?? []) as Array<Record<string, unknown>>
      setItems(rows.map(mapGaleriaRow))
      setError(null)
    } catch (caughtError) {
      if (!mountedRef.current) return
      if (import.meta.env.DEV) {
        console.error('[Galeria] Falha ao consultar o Supabase:', caughtError)
      }
      setError(
        'Não foi possível carregar a galeria. Verifique a conexão e tente novamente.',
      )
    } finally {
      if (mountedRef.current && showLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    const client = supabase
    if (!client) {
      setLoading(false)
      updateStatus('unconfigured')
      return
    }

    let active = true
    let refreshTimer: number | undefined

    void load(true)

    const scheduleRefresh = () => {
      if (refreshTimer) window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => {
        if (active) void load(false)
      }, 250)
    }

    const channel = client
      .channel('galeria-publica-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'galeria' },
        scheduleRefresh,
      )
      .subscribe((channelStatus) => {
        if (!active) return

        if (channelStatus === 'SUBSCRIBED') {
          updateStatus('live')
        } else if (channelStatus === 'CHANNEL_ERROR' || channelStatus === 'TIMED_OUT') {
          updateStatus('offline')
        } else if (channelStatus === 'CLOSED') {
          updateStatus('offline')
        }
      })

    const handleOnline = () => {
      if (!active) return
      updateStatus('connecting')
      void load(false)
    }

    const handleOffline = () => {
      if (active) updateStatus('offline')
    }

    const handleVisibilityChange = () => {
      if (active && document.visibilityState === 'visible' && statusRef.current !== 'live') {
        void load(false)
      }
    }

    const refreshInterval = window.setInterval(() => {
      if (active && document.visibilityState === 'visible' && statusRef.current !== 'live') {
        void load(false)
      }
    }, 60_000)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      active = false
      mountedRef.current = false
      if (refreshTimer) window.clearTimeout(refreshTimer)
      window.clearInterval(refreshInterval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      void client.removeChannel(channel)
    }
  }, [load, updateStatus])

  const refresh = useCallback(() => {
    void load(true)
  }, [load])

  return { items, loading, error, status, refresh }
}
