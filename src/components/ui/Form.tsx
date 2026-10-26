import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { useId } from 'react'

import { cn } from '@/lib/cn'

const CONTROL_BASE =
  'w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400 ' +
  'transition-colors duration-150 focus:border-brand-500 disabled:bg-ink-50 disabled:text-ink-400'

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  id: string
  label?: ReactNode
  hint?: ReactNode
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-ink-700">
          {label}
          {required ? <span className="ml-0.5 text-danger-600">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  leadingIcon?: ReactNode
  trailingSlot?: ReactNode
  containerClassName?: string
}

export function Input({
  label,
  hint,
  error,
  leadingIcon,
  trailingSlot,
  containerClassName,
  className,
  id,
  ...rest
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <FieldShell
      id={inputId}
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      className={containerClassName}
    >
      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
            {leadingIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            CONTROL_BASE,
            'h-11',
            leadingIcon ? 'pl-10' : undefined,
            trailingSlot ? 'pr-10' : undefined,
            error ? 'border-danger-600 focus:border-danger-600' : 'border-ink-200',
            className,
          )}
          {...rest}
        />
        {trailingSlot ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
            {trailingSlot}
          </span>
        ) : null}
      </div>
    </FieldShell>
  )
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  containerClassName?: string
}

export function Select({
  label,
  hint,
  error,
  containerClassName,
  className,
  id,
  children,
  ...rest
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <FieldShell
      id={selectId}
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      className={containerClassName}
    >
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={cn(
          CONTROL_BASE,
          'h-11 cursor-pointer appearance-none bg-[length:16px] bg-[right_0.85rem_center] bg-no-repeat pr-10',
          error ? 'border-danger-600' : 'border-ink-200',
          className,
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236f7a6c' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  )
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  containerClassName?: string
}

export function Textarea({
  label,
  hint,
  error,
  containerClassName,
  className,
  id,
  ...rest
}: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return (
    <FieldShell
      id={textareaId}
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      className={containerClassName}
    >
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        className={cn(
          CONTROL_BASE,
          'min-h-24 resize-y py-2.5 leading-relaxed',
          error ? 'border-danger-600' : 'border-ink-200',
          className,
        )}
        {...rest}
      />
    </FieldShell>
  )
}
