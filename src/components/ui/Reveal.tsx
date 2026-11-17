import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from '../../lib/gsap'
import { cn } from '../../lib/utils'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  variant?: 'fade-up' | 'clip-card'
}

export function Reveal({ children, className, delay = 0, variant = 'fade-up' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(node, { clearProps: 'all', opacity: 1, y: 0, clipPath: 'none' })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (variant === 'clip-card') {
          gsap.fromTo(
            node,
            { clipPath: 'inset(12% 8% 12% 8% round 36px)' },
            {
              clipPath: 'inset(0% 0% 0% 0% round 36px)',
              ease: 'none',
              scrollTrigger: {
                trigger: node,
                start: 'top 90%',
                end: 'top 35%',
                scrub: 0.6,
              },
            },
          )
          return
        }

        gsap.fromTo(
          node,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: delay / 1000,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: node,
              start: 'top 88%',
              once: true,
            },
          },
        )
      })
    }, ref)

    return () => ctx.revert()
  }, [delay, variant])

  return (
    <div ref={ref} className={cn('will-change-[transform,opacity]', className)}>
      {children}
    </div>
  )
}
