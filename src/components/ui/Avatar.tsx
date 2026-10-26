import { cn } from '@/lib/cn'
import { initials } from '@/lib/format'

export interface AvatarProps {
  name: string
  /** A `bg-*` token such as `bg-brand-600`. */
  accent?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  title?: string
  src?: string
}

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
}

export function Avatar({
  name,
  accent = 'bg-brand-600',
  size = 'md',
  className,
  title,
  src,
}: AvatarProps) {
  return (
    <span
      title={title ?? name}
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ring-2 ring-white',
        SIZE_CLASSES[size],
        !src && accent,
        className,
      )}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initials(name)}
    </span>
  )
}

export interface AvatarStackProps {
  names: string[]
  max?: number
  size?: AvatarProps['size']
  className?: string
}

export function AvatarStack({ names, max = 4, size = 'sm', className }: AvatarStackProps) {
  const shown = names.slice(0, max)
  const overflow = names.length - shown.length

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex -space-x-2">
        {shown.map((name, index) => (
          <Avatar
            key={`${name}-${index}`}
            name={name}
            size={size}
            accent={AVATAR_ACCENTS[index % AVATAR_ACCENTS.length]}
          />
        ))}
      </div>
      {overflow > 0 ? (
        <span className="ml-2 text-xs font-medium text-ink-500">+{overflow}</span>
      ) : null}
    </div>
  )
}

const AVATAR_ACCENTS = [
  'bg-brand-600',
  'bg-harvest-500',
  'bg-info-600',
  'bg-brand-700',
  'bg-harvest-600',
]
