import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

export interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  label?: string
  className?: string
}

export function Dropdown({ value, options, onChange, label, className }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(v => !v)}
        className="min-w-[108px] justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{label ?? selected?.label}</span>
        <ChevronDown size={14} className={cn('shrink-0 text-text-tertiary transition-transform', open && 'rotate-180')} />
      </Button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 min-w-full overflow-hidden rounded-xl border border-border bg-surface-elevated py-1 shadow-card"
        >
          {options.map(opt => (
            <button
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                'w-full px-3 py-2 text-left text-xs transition-colors',
                opt.value === value
                  ? 'bg-accent-muted text-accent font-medium'
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
