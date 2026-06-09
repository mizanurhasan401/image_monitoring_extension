import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

export interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  options: DropdownOption[]
  value?: string
  onChange?: (value: string) => void
  onSelect?: (value: string) => void
  trigger?: React.ReactNode
  label?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'icon'
  className?: string
  menuClassName?: string
  align?: 'left' | 'right'
}

export function Dropdown({
  options,
  value,
  onChange,
  onSelect,
  trigger,
  label,
  variant = 'secondary',
  size = 'sm',
  className,
  menuClassName,
  align = 'right',
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = value !== undefined ? options.find(o => o.value === value) : undefined
  const handleSelect = onChange ?? onSelect

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleOptionClick(optionValue: string) {
    handleSelect?.(optionValue)
    setOpen(false)
  }

  const display = trigger ?? label ?? selected?.label ?? options[0]?.label

  return (
    <div ref={ref} className={cn('relative', className)}>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(v => !v)}
        className={cn(
          'justify-between gap-1.5',
          !trigger && 'min-w-[96px]',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
          {display}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'shrink-0 text-text-tertiary transition-transform duration-150',
            open && 'rotate-180',
          )}
        />
      </Button>

      {open && (
        <div
          role="listbox"
          className={cn(
            'absolute top-full z-50 mt-1 min-w-full overflow-hidden rounded-xl border border-border bg-surface-elevated py-1 shadow-card',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName,
          )}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onClick={() => handleOptionClick(opt.value)}
              className={cn(
                'w-full px-3 py-2 text-left text-xs transition-colors',
                opt.value === value
                  ? 'bg-accent-muted font-medium text-accent'
                  : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
