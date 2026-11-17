import { cn } from '../../lib/utils'

type LogoProps = {
  tone?: 'light' | 'dark'
  className?: string
  compact?: boolean
  /** 'wordmark': marca tipográfica editorial, sem símbolo (cabeçalho Sylvan). */
  variant?: 'default' | 'wordmark'
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('h-10 w-10 shrink-0', className)}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="24" cy="24" r="21.5" stroke="currentColor" strokeWidth="1" opacity="0.38" />
      <g transform="translate(24 24)">
        <circle r="10.2" fill="#c83e37" />
        {[0, 72, 144, 216, 288].map((angle) => (
          <path
            key={`lobe-${angle}`}
            d="M0 -16.5 C4.9 -13.2, 6.8 -7.5, 3.9 -2.2 L0 0 L-3.9 -2.2 C-6.8 -7.5, -4.9 -13.2, 0 -16.5 Z"
            fill="#c83e37"
            transform={`rotate(${angle})`}
          />
        ))}
        {[0, 72, 144, 216, 288].map((angle) => (
          <path
            key={`fold-${angle}`}
            d="M0 -13.8 C1.7 -9.8, 1.9 -5.6, 0 -1.9 C-1.9 -5.6, -1.7 -9.8, 0 -13.8 Z"
            fill="#e3655b"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle r="4.4" fill="#8f241f" />
        <circle r="2.7" fill="#f7f1e7" />
        <circle r="1.3" fill="#d9a06a" />
      </g>
    </svg>
  )
}

export function Logo({ tone = 'dark', className, compact = false, variant = 'default' }: LogoProps) {
  if (variant === 'wordmark') {
    return (
      <span
        className={cn(
          'inline-flex flex-col items-start text-left xl:items-center xl:text-center',
          tone === 'light' ? 'text-parchment' : 'text-ink',
          className,
        )}
      >
        <span className="display text-[21px] font-medium leading-none tracking-[-0.02em] sm:text-[25px]">
          Museu Carajás<span className="text-[#c83e37]">.</span>
        </span>
        <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.24em] opacity-80">
          Acervo Digital · Memória Regional
        </span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-3.5',
        tone === 'light' ? 'text-parchment' : 'text-ink',
        className,
      )}
    >
      <LogoMark className={compact ? 'h-9 w-9' : 'h-11 w-11'} />
      <span className="flex flex-col">
        <span className="display text-[19px] font-semibold leading-none tracking-[-0.015em] sm:text-[21px]">
          Museu Carajás<span className="text-[#c83e37]">.</span>
        </span>
        <span className="mt-1.5 text-xs font-medium uppercase tracking-[0.18em] opacity-80">
          Acervo Digital · Memória Regional
        </span>
      </span>
    </span>
  )
}
