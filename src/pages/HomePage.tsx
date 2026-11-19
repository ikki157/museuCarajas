import { useEffect } from 'react'
import { AboutMuseum } from '../components/home/AboutMuseum'
import { Collection } from '../components/home/Collection'
import { Education } from '../components/home/Education'
import { Exhibitions } from '../components/home/Exhibitions'
import { Gallery } from '../components/home/Gallery'
import { Hero } from '../components/home/Hero'
import { Visit } from '../components/home/Visit'
import { ParallaxBand } from '../components/ui/ParallaxBand'
import { ScrollTrigger } from '../lib/gsap'

export function HomePage() {
  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
    return () => window.cancelAnimationFrame(rafId)
  }, [])

  return (
    <>
      <Hero />
      <Gallery />
      <Collection />
      <ParallaxBand
        src="/images/museu/museu-03.jpg"
        eyebrow="Memória viva"
        quote="Cada objeto guarda|uma voz da Amazônia."
      />
      <Exhibitions />
      <AboutMuseum />
      <ParallaxBand
        src="/images/museu/museu-05.jpg"
        eyebrow="Conhecer para preservar"
        quote="Quem conhece sua história|cuida do seu território."
      />
      <Education />
      <Visit />
    </>
  )
}

