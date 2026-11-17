import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from '../../lib/gsap'
import { cn } from '../../lib/utils'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  variant?: 'text' | 'image-mask' | 'parallax-card'
}

export function Reveal({ children, className, delay = 0, variant = 'text' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        const innerImg = node.querySelector('img')
        gsap.set(node, { clearProps: 'all', opacity: 1, y: 0, scale: 1, clipPath: 'none' })
        if (innerImg) {
          gsap.set(innerImg, { clearProps: 'all', scale: 1 })
        }
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (variant === 'image-mask') {
          gsap.fromTo(
            node,
            { clipPath: 'inset(10% 6% 10% 6% round 36px)' },
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

          const innerImg = node.querySelector('img')
          if (innerImg) {
            gsap.fromTo(
              innerImg,
              { scale: 1.08 },
              {
                scale: 1.0,
                ease: 'none',
                scrollTrigger: {
                  trigger: node,
                  start: 'top 90%',
                  end: 'bottom 20%',
                  scrub: 0.6,
                },
              },
            )
          }
          return
        }

        if (variant === 'parallax-card') {
          gsap.fromTo(
            node,
            { y: 40 },
            {
              y: -20,
              ease: 'none',
              scrollTrigger: {
                trigger: node,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
              },
            },
          )
          return
        }

        gsap.fromTo(
          node,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
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
