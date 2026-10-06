'use client'

import { AlertTriangle, UserX, CalendarDays, Clock, GraduationCap } from 'lucide-react'
import {
  cohorts,
  cohortProfiles,
  cohortColorHex,
  getCohortPercent,
  badgeTokens,
  type CohortId,
} from '@/lib/mock-data'
import { useSelectedCohort } from '@/components/selected-cohort-context'
import { cn } from '@/lib/utils'

const warningIcons: Partial<Record<CohortId, React.ElementType>> = {
  'at-risk': AlertTriangle,
  inactive: UserX,
}

export function CohortSummary() {
  const { selectedCohort, toggleCohort } = useSelectedCohort()

  return (
    <section
      className="flex flex-col rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-sm"
      aria-label="Cohort summary"
    >
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-base font-semibold text-text-primary">
          Cohort Summary
        </h2>
        <p className="text-sm text-text-secondary">
          Average behavior per group
        </p>
      </div>

      {/* Stacked proportion bar */}
      <div
        className="mb-5 flex h-3 w-full overflow-hidden rounded-full"
        role="img"
        aria-label="Proportional distribution of cohorts"
      >
        {cohorts.map((c) => (
          <div
            key={c.id}
            style={{
              width: `${getCohortPercent(c.count)}%`,
              backgroundColor: cohortColorHex[c.id],
            }}
            className="transition-all duration-300 first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>

      {/* Cohort cards */}
      <div className="flex flex-col divide-y divide-border-subtle">
        {cohorts.map((cohort) => {
          const profile = cohortProfiles.find((p) => p.id === cohort.id)!
          const badge = badgeTokens[cohort.id]
          const isSelected = selectedCohort === cohort.id
          const WarningIcon = warningIcons[cohort.id]
          const percent = getCohortPercent(cohort.count)

          return (
            <button
              key={cohort.id}
              type="button"
              onClick={() => toggleCohort(cohort.id)}
              className={cn(
                'group flex flex-col gap-3 px-4 py-4 text-left transition-all first:pt-0 last:pb-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary focus-visible:ring-inset rounded-lg',
                isSelected
                  ? 'bg-[var(--sidebar-active-tint)] ring-1 ring-lp-primary'
                  : 'hover:bg-bg-main',
              )}
            >
              {/* Top row: dot + name + badge */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-block size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: cohortColorHex[cohort.id] }}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-text-primary">
                  {cohort.label}
                </span>
                {WarningIcon && (
                  <WarningIcon
                    className="size-3.5 text-text-secondary"
                    aria-label={`${cohort.label} warning`}
                  />
                )}
                <span
                  className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold leading-tight"
                  style={{
                    backgroundColor: badge.background,
                    color: badge.text,
                  }}
                >
                  {cohort.label}
                </span>
              </div>

              {/* Signal text */}
              <p className="text-xs text-text-secondary">{profile.signal}</p>

              {/* Count + percent */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold tabular-nums text-text-primary">
                  {cohort.count.toLocaleString()}
                </span>
                <span className="text-xs text-text-secondary">
                  learners · {percent}%
                </span>
              </div>

              {/* Mini stats row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center rounded-lg bg-bg-main px-2 py-1.5">
                  <CalendarDays className="mb-0.5 size-3.5 text-text-secondary" aria-hidden="true" />
                  <span className="text-xs font-semibold tabular-nums text-text-primary">
                    {profile.avgWeeklyActiveDays}
                  </span>
                  <span className="text-[10px] text-text-secondary">days/wk</span>
                </div>
                <div className="flex flex-col items-center rounded-lg bg-bg-main px-2 py-1.5">
                  <Clock className="mb-0.5 size-3.5 text-text-secondary" aria-hidden="true" />
                  <span className="text-xs font-semibold tabular-nums text-text-primary">
                    {profile.avgSessionMins}
                  </span>
                  <span className="text-[10px] text-text-secondary">min/sess</span>
                </div>
                <div className="flex flex-col items-center rounded-lg bg-bg-main px-2 py-1.5">
                  <GraduationCap className="mb-0.5 size-3.5 text-text-secondary" aria-hidden="true" />
                  <span className="text-xs font-semibold tabular-nums text-text-primary">
                    {profile.avgCompletionPct}%
                  </span>
                  <span className="text-[10px] text-text-secondary">complete</span>
                </div>
              </div>

              {/* Completion progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-main">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${profile.avgCompletionPct}%`,
                    backgroundColor: cohortColorHex[cohort.id],
                  }}
                />
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
