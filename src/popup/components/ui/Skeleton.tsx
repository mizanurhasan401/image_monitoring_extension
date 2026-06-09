import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn('rounded-lg skeleton-shimmer', className)} style={style} />
}
