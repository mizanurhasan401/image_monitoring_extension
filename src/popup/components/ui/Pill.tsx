import { cn } from '@/utils/cn'

interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function Pill({ active, className, children, ...props }: PillProps) {
  return (
    <button
      type="button"
      className={cn(
        'h-7 shrink-0 rounded-lg px-3 text-xs font-medium transition-all duration-150',
        'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        active
          ? 'border-accent bg-accent-muted text-accent'
          : 'border-border-subtle bg-surface-elevated text-text-secondary hover:border-border hover:text-text-primary',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
