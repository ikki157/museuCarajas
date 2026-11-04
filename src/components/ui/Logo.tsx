import { cn } from '../../lib/utils'

type LogoProps = {
  tone?: 'light' | 'dark'
  className?: string
  compact?: boolean
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('h-10 w-10 shrink-0', className)}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="24" cy="24" r="22.5" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <path
        d="M24 11c-7.2 0-13 5.4-13 12.2 0 6.8 5.3 11.8 12 11.8 5.6 0 9.8-3.7 9.8-8.4 0-4.3-3.4-7.4-7.6-7.4-3.5 0-6.2 2.3-6.2 5.2 0 2.4 1.9 4.2 4.2 4.2 1.8 0 3.1-1.1 3.1-2.6 0-1.2-.9-2.1-2-2.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="36.5" cy="13.5" r="2" fill="#B87333" />
    </svg>
  )
}

export function Logo({ tone = 'dark', className, compact = false }: LogoProps) {
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
        <span className="text-[8.5px] font-semibold uppercase tracking-[0.28em] opacity-65">
          Museu Municipal
        </span>
        <span className="display mt-0.5 text-[18px] font-semibold leading-none tracking-[-0.01em] sm:text-[19px]">
          Hilmar Harry Kluck
        </span>
        <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.24em] opacity-55">
          Parauapebas · Pará
        </span>
      </span>
    </span>
  )
}
