'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  UserX,
  CheckCircle,
  Activity,
  X,
} from 'lucide-react'
import type { Student, CohortId } from '@/lib/types'
import { getStudents, getExportCsvUrl } from '@/lib/api'
import { badgeTokens, cohortColorHex, cohorts } from '@/lib/mock-data'
import { useSelectedCohort } from '@/components/selected-cohort-context'
import { StudentDetailSheet } from '@/components/student-detail-sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StudentTableProps {
  initialCohort?: CohortId | null
  hideTitle?: boolean
}

const warningIcons: Record<string, React.ElementType> = {
  'at-risk': AlertTriangle,
  inactive: UserX,
}

function formatRelativeTime(dateString: string): { relative: string; exact: string } {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return { relative: dateString, exact: dateString }
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  let relative = ''
  if (diffHours < 1) relative = 'Just now'
  else if (diffHours < 24) relative = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  else relative = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return {
    relative,
    exact: date.toLocaleString(),
  }
}

export function StudentTable({ initialCohort, hideTitle = false }: StudentTableProps) {
  const { selectedCohort, setSelectedCohort } = useSelectedCohort()
  const activeCohortFilter = initialCohort !== undefined ? initialCohort : selectedCohort

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sortField, setSortField] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState<number>(1)
  const pageSize = 10

  const [data, setData] = useState<{
    items: Student[]
    total: number
    totalPages: number
  }>({ items: [], total: 0, totalPages: 1 })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [, startTransition] = useTransition()

  // Debounce search query 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setPage(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch students
  const loadStudents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getStudents({
        cohort: activeCohortFilter,
        q: debouncedQuery,
        sort: sortField,
        order: sortOrder,
        page,
        pageSize,
      })
      setData({
        items: res.items,
        total: res.total,
        totalPages: res.totalPages,
      })
    } catch {
      setError('Failed to load student data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [activeCohortFilter, debouncedQuery, sortField, sortOrder, page])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  // Sort toggle
  const handleSort = (field: string) => {
    startTransition(() => {
      if (sortField === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortOrder('asc')
      }
      setPage(1)
    })
  }

  const handleExportCSV = () => {
    window.open(getExportCsvUrl(), '_blank')
  }

  const startCount = data.total === 0 ? 0 : (page - 1) * pageSize + 1
  const endCount = Math.min(page * pageSize, data.total)

  return (
    <section className="flex flex-col rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-border-subtle">
        <div>
          {!hideTitle && (
            <h2 className="text-base font-semibold text-text-primary">
              Student Behavior
            </h2>
          )}
          <p className="text-xs text-text-secondary">
            Showing {startCount}-{endCount} of {data.total.toLocaleString()} learners
          </p>
        </div>

        {/* Search & Export */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="h-9 w-60 rounded-lg border border-border-subtle bg-bg-main pl-9 pr-3 text-xs text-text-primary placeholder:text-text-secondary focus:border-lp-primary focus:outline-none focus:ring-2 focus:ring-lp-primary/20"
            />
          </div>

          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1 text-xs">
            <Download className="size-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Cohort Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-4 pb-4">
        <button
          type="button"
          onClick={() => setSelectedCohort(null)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary',
            activeCohortFilter === null
              ? 'bg-lp-primary text-white shadow-xs'
              : 'bg-bg-main text-text-secondary hover:bg-border-subtle hover:text-text-primary',
          )}
        >
          All (2,847)
        </button>
        {cohorts.map((c) => {
          const isSelected = activeCohortFilter === c.id
          const color = cohortColorHex[c.id]
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCohort(isSelected ? null : c.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary',
                isSelected
                  ? 'ring-2 ring-lp-primary bg-bg-surface text-text-primary shadow-xs font-semibold'
                  : 'bg-bg-main text-text-secondary hover:bg-border-subtle hover:text-text-primary',
              )}
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
              {c.label} ({c.count.toLocaleString()})
            </button>
          )
        })}

        {activeCohortFilter && (
          <button
            type="button"
            onClick={() => setSelectedCohort(null)}
            className="text-xs text-lp-primary hover:underline ml-2 flex items-center gap-0.5"
          >
            <X className="size-3" /> Clear filter
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-border-subtle">
        <table className="w-full text-left border-collapse text-sm">
          <caption className="sr-only">Student Behavior Table</caption>
          <thead>
            <tr className="border-b border-border-subtle bg-bg-main/60 text-xs font-semibold text-text-secondary sticky top-0 backdrop-blur-xs">
              {/* Student */}
              <th scope="col" className="p-3 pl-4">
                <button
                  type="button"
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-text-primary focus:outline-none"
                >
                  Student
                  {sortField === 'name' ? (
                    sortOrder === 'asc' ? <ArrowUp className="size-3 text-lp-primary" /> : <ArrowDown className="size-3 text-lp-primary" />
                  ) : (
                    <ArrowUpDown className="size-3 opacity-40" />
                  )}
                </button>
              </th>

              {/* Last Login */}
              <th scope="col" className="p-3">
                <button
                  type="button"
                  onClick={() => handleSort('lastLogin')}
                  className="flex items-center gap-1 hover:text-text-primary focus:outline-none"
                >
                  Last Login
                  {sortField === 'lastLogin' ? (
                    sortOrder === 'asc' ? <ArrowUp className="size-3 text-lp-primary" /> : <ArrowDown className="size-3 text-lp-primary" />
                  ) : (
                    <ArrowUpDown className="size-3 opacity-40" />
                  )}
                </button>
              </th>

              {/* Course Completion */}
              <th scope="col" className="p-3">
                <button
                  type="button"
                  onClick={() => handleSort('completionPct')}
                  className="flex items-center gap-1 hover:text-text-primary focus:outline-none"
                >
                  Course Completion
                  {sortField === 'completionPct' ? (
                    sortOrder === 'asc' ? <ArrowUp className="size-3 text-lp-primary" /> : <ArrowDown className="size-3 text-lp-primary" />
                  ) : (
                    <ArrowUpDown className="size-3 opacity-40" />
                  )}
                </button>
              </th>

              {/* Weekly Logins */}
              <th scope="col" className="p-3">
                <button
                  type="button"
                  onClick={() => handleSort('weeklyLogins')}
                  className="flex items-center gap-1 hover:text-text-primary focus:outline-none"
                >
                  Weekly Logins
                  {sortField === 'weeklyLogins' ? (
                    sortOrder === 'asc' ? <ArrowUp className="size-3 text-lp-primary" /> : <ArrowDown className="size-3 text-lp-primary" />
                  ) : (
                    <ArrowUpDown className="size-3 opacity-40" />
                  )}
                </button>
              </th>

              {/* Avg. Session */}
              <th scope="col" className="p-3">
                <button
                  type="button"
                  onClick={() => handleSort('avgSessionMins')}
                  className="flex items-center gap-1 hover:text-text-primary focus:outline-none"
                >
                  Avg. Session (min)
                  {sortField === 'avgSessionMins' ? (
                    sortOrder === 'asc' ? <ArrowUp className="size-3 text-lp-primary" /> : <ArrowDown className="size-3 text-lp-primary" />
                  ) : (
                    <ArrowUpDown className="size-3 opacity-40" />
                  )}
                </button>
              </th>

              {/* Behavior Group */}
              <th scope="col" className="p-3 pr-4">
                Behavior Group
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-bg-surface">
            {loading ? (
              // Loading Skeletons
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="p-3 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-slate-200" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-28 rounded bg-slate-200" />
                        <div className="h-3 w-36 rounded bg-slate-100" />
                      </div>
                    </div>
                  </td>
                  <td className="p-3"><div className="h-3.5 w-20 rounded bg-slate-200" /></td>
                  <td className="p-3"><div className="h-3.5 w-24 rounded bg-slate-200" /></td>
                  <td className="p-3"><div className="h-3.5 w-12 rounded bg-slate-200" /></td>
                  <td className="p-3"><div className="h-3.5 w-12 rounded bg-slate-200" /></td>
                  <td className="p-3 pr-4"><div className="h-5 w-20 rounded-full bg-slate-200" /></td>
                </tr>
              ))
            ) : error ? (
              // Error State
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-rose-600">
                    <AlertTriangle className="size-6" />
                    <p className="text-sm font-medium">{error}</p>
                    <Button variant="outline" size="sm" onClick={loadStudents} className="mt-2 gap-1.5">
                      <RefreshCw className="size-3.5" /> Retry
                    </Button>
                  </div>
                </td>
              </tr>
            ) : data.items.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={6} className="p-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-text-secondary">
                    <UserX className="size-8 text-slate-400" />
                    <p className="text-sm font-semibold text-text-primary">No learners match your filters</p>
                    <p className="text-xs">Try adjusting your search term or cohort filter.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCohort(null)
                      }}
                      className="mt-2"
                    >
                      Clear all filters
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              // Student Rows
              data.items.map((student) => {
                const badge = badgeTokens[student.cohort as keyof typeof badgeTokens] || {
                  background: '#E2E8F0',
                  text: '#475569',
                }
                const color = cohortColorHex[student.cohort] || '#475569'
                const { relative, exact } = formatRelativeTime(student.lastLogin)
                const WarningIcon = warningIcons[student.cohort]

                return (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="group cursor-pointer transition-colors hover:bg-bg-main/80 focus:outline-none focus:bg-bg-main"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedStudent(student)
                      }
                    }}
                  >
                    {/* Student Avatar + Name + Email */}
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                          {student.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-text-primary group-hover:text-lp-primary transition-colors">
                            {student.name}
                          </div>
                          <div className="text-[11px] text-text-secondary">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Last Login */}
                    <td className="p-3 text-xs text-text-secondary" title={exact}>
                      {relative}
                    </td>

                    {/* Course Completion Progress Bar */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold tabular-nums text-text-primary w-8 text-right">
                          {student.completionPct}%
                        </span>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border-subtle">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${student.completionPct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Weekly Logins */}
                    <td className="p-3 text-xs font-medium tabular-nums text-text-primary">
                      {student.weeklyLogins} days/wk
                    </td>

                    {/* Avg. Session */}
                    <td className="p-3 text-xs font-medium tabular-nums text-text-primary">
                      {student.avgSessionMins} min
                    </td>

                    {/* Behavior Group Badge */}
                    <td className="p-3 pr-4">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize"
                        style={{ backgroundColor: badge.background, color: badge.text }}
                      >
                        {WarningIcon ? (
                          <WarningIcon className="size-3 shrink-0" />
                        ) : (
                          <CheckCircle className="size-3 shrink-0" />
                        )}
                        {student.cohort}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-4">
          <span className="text-xs text-text-secondary">
            Page {page} of {data.totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="xs"
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous Page"
            >
              <ChevronLeft className="size-3.5" /> Prev
            </Button>
            {Array.from({ length: Math.min(5, data.totalPages) }).map((_, i) => {
              const pNum = i + 1
              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setPage(pNum)}
                  className={cn(
                    'size-7 rounded-md text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary',
                    page === pNum
                      ? 'bg-lp-primary text-white font-bold'
                      : 'text-text-secondary hover:bg-bg-main hover:text-text-primary',
                  )}
                >
                  {pNum}
                </button>
              )
            })}
            <Button
              variant="outline"
              size="xs"
              disabled={page >= data.totalPages || loading}
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              aria-label="Next Page"
            >
              Next <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Sheet Modal */}
      <StudentDetailSheet
        student={selectedStudent}
        open={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
      />
    </section>
  )
}
