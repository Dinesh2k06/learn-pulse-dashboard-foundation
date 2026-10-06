'use client'

import type { CohortId } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface LegendItem {
  id: CohortId
  name: string
  count: number
  percent: number
  fill: string
}

interface ChartLegendProps {
  data: LegendItem[]
  hoveredId: CohortId | null
  onHover: (id: CohortId | null) => void
  onClick: (id: CohortId) => void
}

export function ChartLegend({ data, hoveredId, onHover, onClick }: ChartLegendProps) {
  return (
    <div
      className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border-subtle pt-4"
      role="list"
      aria-label="Chart legend"
    >
      {data.map((item) => {
        const dimmed = hoveredId !== null && hoveredId !== item.id
        return (
          <button
            key={item.id}
            type="button"
            role="listitem"
            onClick={() => onClick(item.id)}
            onMouseEnter={() => onHover(item.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(item.id)}
            onBlur={() => onHover(null)}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary',
              dimmed ? 'opacity-40' : 'opacity-100',
            )}
          >
            <span
              className="inline-block size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.fill }}
              aria-hidden="true"
            />
            <span className="font-medium text-text-primary">{item.name}</span>
            <span className="tabular-nums text-text-secondary">
              {item.count.toLocaleString()}
            </span>
            <span className="tabular-nums text-text-secondary">
              ({item.percent}%)
            </span>
          </button>
        )
      })}
    </div>
  )
}
