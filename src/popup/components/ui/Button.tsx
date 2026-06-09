import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-foreground hover:bg-accent-hover shadow-soft disabled:opacity-50',
  secondary:
    'bg-surface-elevated text-text-primary border border-border hover:bg-surface-tertiary disabled:opacity-50',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary disabled:opacity-50',
  danger:
    'bg-danger-muted text-danger hover:bg-danger/10 border border-danger/20 disabled:opacity-50',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs font-medium gap-1.5',
  md: 'h-9 px-4 text-sm font-medium gap-2',
  icon: 'h-8 w-8 p-0 justify-center',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'sm', children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
