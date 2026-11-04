import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type SectionHeadingProps = {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  tone?: 'light' | 'dark'
  align?: 'left' | 'center'
  className?: string
  titleId?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = 'dark',
  align = 'left',
  className,
  titleId,
}: SectionHeadingProps) {
  const isLight = tone === 'light'

  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      <p
        className={cn(
          'eyebrow flex items-center gap-3',
          align === 'center' && 'justify-center',
          isLight ? 'text-copper-light' : 'text-clay',
        )}
      >
        <span className="h-px w-8 bg-current" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2
        id={titleId}
        className={cn(
          'display mt-5 text-[clamp(2.3rem,4.4vw,4.15rem)] font-medium leading-[1.02] tracking-[-0.025em]',
          isLight ? 'text-parchment' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {description ? (
        <div
          className={cn(
            'mt-6 max-w-2xl text-[15.5px] leading-relaxed sm:text-base',
            align === 'center' && 'mx-auto',
            isLight ? 'text-parchment/70' : 'text-stone',
          )}
        >
          {description}
        </div>
      ) : null}
    </div>
  )
}
