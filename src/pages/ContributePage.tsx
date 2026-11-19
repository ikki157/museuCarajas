import { useEffect } from 'react'
import { Contribute } from '../components/home/Contribute'
import { ScrollTrigger } from '../lib/gsap'

export function ContributePage() {
  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
    return () => window.cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className="min-h-[calc(100svh-84px)] bg-parchment">
      <Contribute />
    </div>
  )
}
