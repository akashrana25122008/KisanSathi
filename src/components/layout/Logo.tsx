import { cn } from '@/lib/cn'

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  className?: string
}

const MARK_SIZE = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
}

const WORD_SIZE = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
}

/**
 * The KisanSathi mark: a young sprout rising from a furrowed field, drawn
 * inline so the app has no logo asset dependency.
 */
export function Logo({ size = 'md', showWordmark = true, className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-xl bg-brand-600 shadow-sm',
          MARK_SIZE[size],
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 26V13"
            stroke="#F7F8F2"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M16 15c0-4.2 3-7.4 7.4-7.8.3 4.6-2.9 8-7.4 7.8Z"
            fill="#E8B562"
          />
          <path
            d="M15.6 19.4c-.2-3.5-2.6-6.1-6.3-6.4-.2 3.7 2.4 6.5 6.3 6.4Z"
            fill="#7FBD9C"
          />
          <path
            d="M9 27c4-1.6 10-1.6 14 0"
            stroke="#AED7C1"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </span>

      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className={cn('font-bold tracking-tight text-ink-900', WORD_SIZE[size])}>
            Kisan
            <span className="text-brand-600">Sathi</span>
          </span>
          <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.13em] text-ink-400 sm:block">
            Kisan AI &middot; Jobs &middot; Planner
          </span>
        </span>
      ) : null}
    </span>
  )
}
