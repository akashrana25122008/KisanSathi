import { Link } from 'react-router-dom'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'harvest'
  | 'danger'

export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
  secondary:
    'bg-white text-ink-800 border border-ink-200 hover:bg-ink-50 hover:border-ink-300 active:bg-ink-100 disabled:text-ink-400',
  outline:
    'bg-transparent text-brand-700 border border-brand-300 hover:bg-brand-50 active:bg-brand-100 disabled:text-ink-400 disabled:border-ink-200',
  ghost:
    'bg-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200 disabled:text-ink-300',
  harvest:
    'bg-harvest-500 text-white shadow-sm hover:bg-harvest-600 active:bg-harvest-700 disabled:bg-harvest-200',
  danger:
    'bg-danger-600 text-white shadow-sm hover:bg-danger-700 active:bg-danger-700 disabled:bg-danger-100',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-base gap-2 rounded-xl',
}

const BASE_CLASSES =
  'inline-flex items-center justify-center font-semibold transition-colors duration-150 ' +
  'disabled:cursor-not-allowed select-none whitespace-nowrap'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  /** Render as a Link to a route when set. */
  to?: string
  /** Render as an anchor/link via asChild pattern for flexibility. */
  asChild?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = 'button',
  to,
  asChild = false,
  ...rest
}: ButtonProps) {
  const classes = cn(
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && 'w-full',
    className,
  )

  if (asChild) {
    return (
      <span className={classes} role="button" tabIndex={0}>
        {leadingIcon}
        {children}
        {trailingIcon}
      </span>
    )
  }

  if (to) {
    return (
      <Link to={to} className={classes}>
        {leadingIcon}
        {children}
        {trailingIcon}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...rest}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  )
}
