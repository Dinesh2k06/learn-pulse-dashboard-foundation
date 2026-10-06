'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { X } from 'lucide-react'
import { cohorts, cohortColorHex, getCohortPercent, type CohortId } from '@/lib/mock-data'
import { useSelectedCohort } from '@/components/selected-cohort-context'
import { ChartLegend } from '@/components/chart-legend'
import { cn } from '@/lib/utils'

type ViewMode = 'bar' | 'ring'

const TOTAL = 2847

const chartData = cohorts.map((c) => ({
  id: c.id,
  name: c.label,
  count: c.count,
  percent: getCohortPercent(c.count),
  fill: cohortColorHex[c.id],
}))

/* ── Custom Tooltip ── */
function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: (typeof chartData)[0] }>
}) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <span
          className="inline-block size-2.5 rounded-full"
          style={{ backgroundColor: d.fill }}
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-text-primary">{d.name}</span>
      </div>
      <p className="mt-1 text-sm tabular-nums text-text-secondary">
        {d.count.toLocaleString()} learners · {d.percent}%
      </p>
    </div>
  )
}

/* ── Ring center label ── */
function RingCenterLabel({
  viewBox,
}: {
  viewBox?: { cx?: number; cy?: number }
}) {
  const cx = viewBox?.cx ?? 0
  const cy = viewBox?.cy ?? 0
  return (
    <g>
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-text-primary text-2xl font-bold"
      >
        {TOTAL.toLocaleString()}
      </text>
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-text-secondary text-xs"
      >
        Total learners
      </text>
    </g>
  )
}

/* ── Main Component ── */
export function CohortDistributionChart() {
  const [view, setView] = useState<ViewMode>('bar')
  const [hoveredId, setHoveredId] = useState<CohortId | null>(null)
  const { selectedCohort, toggleCohort, setSelectedCohort } = useSelectedCohort()
  const toggleId = 'chart-view'

  const selectedLabel = useMemo(
    () => cohorts.find((c) => c.id === selectedCohort)?.label ?? null,
    [selectedCohort],
  )

  const getOpacity = useCallback(
    (id: CohortId) => {
      if (hoveredId && hoveredId !== id) return 0.4
      if (selectedCohort && selectedCohort !== id) return 0.4
      return 1
    },
    [hoveredId, selectedCohort],
  )

  const handleBarClick = useCallback(
    (data: { id: CohortId }) => {
      toggleCohort(data.id)
    },
    [toggleCohort],
  )

  /* sr-only table for accessibility */
  const summaryText = chartData
    .map((d) => `${d.name}: ${d.count} learners (${d.percent}%)`)
    .join(', ')

  return (
    <section
      className="flex flex-col rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-sm"
      aria-label="Cohort distribution chart"
    >
      {/* Header row */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Cohort Distribution
          </h2>
          <p className="text-sm text-text-secondary">
            Learners grouped by LMS activity pattern
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter chip */}
          {selectedLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-[var(--accent)] px-3 py-1 text-xs font-medium text-lp-primary">
              Filtering: {selectedLabel}
              <button
                type="button"
                onClick={() => setSelectedCohort(null)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-lp-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary"
                aria-label={`Clear ${selectedLabel} filter`}
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {/* Segmented toggle */}
          <div
            role="tablist"
            aria-label="Chart view mode"
            className="inline-flex rounded-lg border border-border-subtle bg-bg-main p-0.5"
          >
            {(['bar', 'ring'] as const).map((mode) => (
              <button
                key={mode}
                role="tab"
                type="button"
                id={`${toggleId}-${mode}`}
                aria-selected={view === mode}
                tabIndex={view === mode ? 0 : -1}
                onClick={() => setView(mode)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault()
                    setView(view === 'bar' ? 'ring' : 'bar')
                  }
                }}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary',
                  view === mode
                    ? 'bg-bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                {mode === 'bar' ? 'Bar' : 'Ring'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div
        role="img"
        aria-label={`Cohort distribution: ${summaryText}`}
        className="relative min-h-[280px] w-full"
      >
        {/* sr-only accessible table */}
        <table className="sr-only">
          <caption>Cohort distribution data</caption>
          <thead>
            <tr>
              <th scope="col">Cohort</th>
              <th scope="col">Learner Count</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.count}</td>
                <td>{d.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        {view === 'bar' ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              margin={{ top: 24, right: 8, bottom: 4, left: -16 }}
              onMouseLeave={() => setHoveredId(null)}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border-subtle)"
                strokeDasharray=""
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-secondary)', fontSize: 13 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'var(--border-subtle)', opacity: 0.3 }}
              />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                label={{
                  position: 'top',
                  fill: 'var(--text-primary)',
                  fontSize: 13,
                  fontWeight: 600,
                  formatter: (v: number) => v.toLocaleString(),
                }}
                isAnimationActive
                animationDuration={600}
                animationEasing="ease-out"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.fill}
                    opacity={getOpacity(entry.id)}
                    style={{ cursor: 'pointer', transition: 'opacity 200ms' }}
                    onMouseEnter={() => setHoveredId(entry.id)}
                    onClick={() => handleBarClick(entry)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="85%"
                paddingAngle={2}
                stroke="var(--bg-surface)"
                strokeWidth={2}
                isAnimationActive
                animationDuration={600}
                animationEasing="ease-out"
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name} ${(percent * 100).toFixed(1)}%`
                }
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.fill}
                    opacity={getOpacity(entry.id)}
                    style={{ cursor: 'pointer', transition: 'opacity 200ms' }}
                    onMouseEnter={() => setHoveredId(entry.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleBarClick(entry)}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              {/* Center label */}
              <text x="50%" y="44%" textAnchor="middle" dominantBaseline="central">
                <tspan
                  className="text-2xl font-bold"
                  fill="var(--text-primary)"
                >
                  {TOTAL.toLocaleString()}
                </tspan>
              </text>
              <text x="50%" y="54%" textAnchor="middle" dominantBaseline="central">
                <tspan
                  className="text-xs"
                  fill="var(--text-secondary)"
                >
                  Total learners
                </tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <ChartLegend
        data={chartData}
        hoveredId={hoveredId}
        onHover={setHoveredId}
        onClick={toggleCohort}
      />
    </section>
  )
}
