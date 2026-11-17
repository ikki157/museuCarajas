import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'

export function useSmoothScroll(): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis: Lenis | null = null
    let tickerCallback: ((time: number) => void) | null = null
    let bodyObserver: MutationObserver | null = null
    let previousHtmlScrollBehavior = ''

    const teardown = () => {
      document.removeEventListener('click', handleAnchorClick)
      bodyObserver?.disconnect()
      bodyObserver = null

      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback)
        tickerCallback = null
      }

      if (lenis) {
        lenis.destroy()
        lenis = null
        document.documentElement.style.scrollBehavior = previousHtmlScrollBehavior
      }
    }

    const syncScrollLock = () => {
      if (!lenis) return
      if (document.body.style.overflow === 'hidden') {
        lenis.stop()
      } else {
        lenis.start()
      }
    }

    const handleAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href || href === '#') return

      const targetId = href.slice(1)
      const target = document.getElementById(targetId)
      if (!target || !lenis) return

      event.preventDefault()

      window.history.pushState(null, '', href)

      if (href === '#conteudo') {
        target.setAttribute('tabindex', '-1')
        target.focus({ preventScroll: true })
      }

      const scrollToTarget = () => {
        if (!lenis) return
        if (document.body.style.overflow !== 'hidden') {
          lenis.start()
        }
        lenis.scrollTo(target, {
          offset: href === '#inicio' ? 0 : -84,
          duration: 1.15,
        })
      }

      if (document.body.style.overflow === 'hidden') {
        // Aguarda um frame caso o clique tenha acabado de fechar o menu mobile e liberar o body lock
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(scrollToTarget)
        })
      } else {
        scrollToTarget()
      }
    }

    const setup = () => {
      if (mediaQuery.matches) {
        teardown()
        return
      }

      if (lenis) return

      // Evita conflito entre `scroll-behavior: smooth` do CSS e a interpolação por frame do Lenis
      previousHtmlScrollBehavior = document.documentElement.style.scrollBehavior
      document.documentElement.style.scrollBehavior = 'auto'

      const instance = new Lenis({
        lerp: 0.09,
        smoothWheel: true,
        wheelMultiplier: 0.95,
      })
      lenis = instance

      instance.on('scroll', ScrollTrigger.update)

      tickerCallback = (time: number) => {
        instance.raf(time * 1000)
      }
      gsap.ticker.add(tickerCallback)
      gsap.ticker.lagSmoothing(0)

      syncScrollLock()

      bodyObserver = new MutationObserver(() => {
        syncScrollLock()
      })
      bodyObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['style'],
      })

      document.addEventListener('click', handleAnchorClick)
    }

    setup()

    const handleMotionChange = () => {
      if (mediaQuery.matches) {
        teardown()
      } else {
        setup()
      }
    }

    mediaQuery.addEventListener('change', handleMotionChange)

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange)
      teardown()
    }
  }, [])
}

