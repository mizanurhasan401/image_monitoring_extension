import { cn } from '@/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'accent' | 'muted'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide',
        variant === 'default' && 'bg-surface-tertiary text-text-secondary',
        variant === 'accent' && 'bg-accent-muted text-accent',
        variant === 'muted' && 'bg-black/50 text-white backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </span>
  )
}
