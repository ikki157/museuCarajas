import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '../../lib/utils'

export type ButtonVariant = 'primary' | 'light' | 'outline-light'

const baseStyles =
  'group inline-flex items-center justify-center gap-2.5 rounded-sm px-6 py-3.5 text-[11.5px] font-semibold uppercase tracking-[0.16em] transition duration-300 ease-museum disabled:pointer-events-none disabled:opacity-55'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-clay text-cream hover:bg-clay-dark',
  light: 'bg-parchment text-forest-deep hover:bg-cream',
  'outline-light':
    'border border-parchment/35 text-parchment hover:border-parchment hover:bg-parchment/10',
}

export function buttonStyles(variant: ButtonVariant = 'primary', className?: string): string {
  return cn(baseStyles, variants[variant], className)
}

type ButtonLinkProps = ComponentPropsWithoutRef<'a'> & {
  variant?: ButtonVariant
  children: ReactNode
}

export function ButtonLink({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a className={buttonStyles(variant, className)} {...props}>
      {children}
    </a>
  )
}

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant
  children: ReactNode
}

export function Button({
  variant = 'primary',
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonStyles(variant, className)} {...props}>
      {children}
    </button>
  )
}
