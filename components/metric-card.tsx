import {
  Users,
  CalendarDays,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import type { Metric } from '@/lib/mock-data'

const iconLookup: Record<string, React.ElementType> = {
  users: Users,
  calendar: CalendarDays,
  book: BookOpen,
  alert: AlertTriangle,
}

interface MetricCardProps {
  metric: Metric
}

export function MetricCard({ metric }: MetricCardProps) {
  const Icon = iconLookup[metric.icon] ?? Users
  const isPositive = metric.trendDirection === 'up'
  const isImproving = metric.trendContext === 'improving'

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Icon + label */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--accent)] text-lp-primary">
          <Icon className="size-[18px]" />
        </div>
        <span className="text-sm font-medium text-text-secondary">
          {metric.label}
        </span>
      </div>

      {/* Value */}
      <p className="text-2xl font-bold tabular-nums text-text-primary">
        {metric.value}
      </p>

      {/* Trend */}
      <div className="flex items-center gap-1.5 text-xs font-medium">
        {isPositive ? (
          <TrendingUp
            className={`size-3.5 ${isImproving ? 'text-group-active' : 'text-group-active'}`}
          />
        ) : (
          <TrendingDown
            className={`size-3.5 ${isImproving ? 'text-group-active' : 'text-group-inactive'}`}
          />
        )}
        <span
          className={
            isPositive || isImproving
              ? 'text-group-active'
              : 'text-group-inactive'
          }
        >
          {metric.trend}
        </span>
        <span className="text-text-secondary">vs last period</span>
      </div>
    </div>
  )
}
