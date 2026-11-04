import { useEffect, useState } from 'react'

export function useActiveSection(sectionIds: readonly string[]): string {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? '')
  const key = sectionIds.join('|')

  useEffect(() => {
    const ids = key.split('|')
    let frame = 0

    const update = () => {
      frame = 0

      const elements = ids
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element !== null)

      if (elements.length === 0) return

      const scrollBottom = window.scrollY + window.innerHeight
      const pageBottom = document.documentElement.scrollHeight

      if (scrollBottom >= pageBottom - 4) {
        setActiveSection(elements[elements.length - 1].id)
        return
      }

      const marker = window.innerHeight * 0.35
      let current = elements[0].id

      for (const element of elements) {
        if (element.getBoundingClientRect().top <= marker) {
          current = element.id
        }
      }

      setActiveSection(current)
    }

    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('hashchange', schedule)

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('hashchange', schedule)
    }
  }, [key])

  return activeSection
}
