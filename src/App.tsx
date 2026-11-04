import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { AboutMuseum } from './components/home/AboutMuseum'
import { Collection } from './components/home/Collection'
import { Contribute } from './components/home/Contribute'
import { Education } from './components/home/Education'
import { Exhibitions } from './components/home/Exhibitions'
import { Gallery } from './components/home/Gallery'
import { Hero } from './components/home/Hero'
import { Visit } from './components/home/Visit'

export default function App() {
  return (
    <div className="min-h-screen bg-parchment">
      <Header />
      <main id="conteudo">
        <Hero />
        <AboutMuseum />
        <Collection />
        <Exhibitions />
        <Gallery />
        <Education />
        <Contribute />
        <Visit />
      </main>
      <Footer />
    </div>
  )
}
