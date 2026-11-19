import { useLayoutEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { Preloader } from './components/ui/Preloader'
import { getActiveLenis, useSmoothScroll } from './hooks/useSmoothScroll'
import { ScrollTrigger } from './lib/gsap'
import { AdminPage } from './pages/AdminPage'
import { ContributePage } from './pages/ContributePage'
import { HomePage } from './pages/HomePage'

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    if (pathname === '/' && hash) {
      const targetId = hash.slice(1)
      let timerId: number | undefined

      const rafOne = window.requestAnimationFrame(() => {
        const rafTwo = window.requestAnimationFrame(() => {
          const target = document.getElementById(targetId)
          if (!target) return

          const lenis = getActiveLenis()
          if (lenis) {
            lenis.resize()
            if (document.body.style.overflow !== 'hidden') {
              lenis.start()
            }
            lenis.scrollTo(target, {
              offset: hash === '#inicio' ? 0 : -84,
              duration: 1.15,
            })
          } else {
            target.scrollIntoView({ behavior: 'smooth' })
          }

          ScrollTrigger.refresh()
        })
        timerId = rafTwo
      })

      return () => {
        window.cancelAnimationFrame(rafOne)
        if (timerId !== undefined) window.cancelAnimationFrame(timerId)
      }
    }

    const lenis = getActiveLenis()
    if (lenis) {
      lenis.stop()
      lenis.scrollTo(0, { immediate: true, force: true })
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      if (document.body.style.overflow !== 'hidden') {
        lenis.start()
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }

    const rafId = window.requestAnimationFrame(() => {
      getActiveLenis()?.resize()
      ScrollTrigger.refresh()
    })
    return () => window.cancelAnimationFrame(rafId)
  }, [pathname, hash])

  return null
}

export default function App() {
  useSmoothScroll()
  const { pathname } = useLocation()
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')

  return (
    <div className="min-h-screen bg-parchment">
      <Preloader />
      <ScrollManager />
      {!isAdminRoute ? <Header /> : null}
      <main id="conteudo">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contribua" element={<ContributePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminRoute ? <Footer /> : null}
    </div>
  )
}
