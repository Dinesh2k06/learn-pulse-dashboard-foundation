'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  Calendar,
  Clock,
  BookOpen,
} from 'lucide-react'

import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { SelectedCohortProvider } from '@/components/selected-cohort-context'
import { Button } from '@/components/ui/button'
import { getActivityLogs } from '@/lib/api'
import type { ActivityLog, CohortId } from '@/lib/types'
import { badgeTokens, cohortColorHex, cohorts } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCohortFilter, setSelectedCohortFilter] = useState<CohortId | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const loadLogs = async () => {
    setLoading(true)
    const res = await getActivityLogs({
      type: selectedType,
      cohort: selectedCohortFilter,
      q: searchQuery,
      page,
      pageSize,
    })
    setLogs(res.items)
    setTotal(res.total)
    setTotalPages(res.totalPages)
    setLoading(false)
  }

  useEffect(() => {
    loadLogs()
  }, [selectedType, selectedCohortFilter, searchQuery, page])

  // Mock aggregated events per day chart data
  const eventsPerDayData = [
    { day: 'Mon', active: 450, consistent: 620, 'at-risk': 120, inactive: 30 },
    { day: 'Tue', active: 510, consistent: 680, 'at-risk': 140, inactive: 25 },
    { day: 'Wed', active: 480, consistent: 650, 'at-risk': 110, inactive: 20 },
    { day: 'Thu', active: 530, consistent: 710, 'at-risk': 130, inactive: 15 },
    { day: 'Fri', active: 490, consistent: 640, 'at-risk': 95, inactive: 18 },
    { day: 'Sat', active: 380, consistent: 420, 'at-risk': 60, inactive: 10 },
    { day: 'Sun', active: 420, consistent: 490, 'at-risk': 80, inactive: 12 },
  ]

  const eventTypeLabels: Record<string, string> = {
    login: 'LMS Login',
    video_watch: 'Video Watch',
    quiz_submit: 'Quiz Submission',
    assignment_submit: 'Assignment Submission',
    forum_post: 'Forum Discussion',
  }

  return (
    <SelectedCohortProvider>
      <div className="flex min-h-dvh bg-bg-main">
        <Sidebar />

        <div className="flex flex-1 flex-col lg:pl-64">
          <Header
            title="Activity Logs"
            subtitle="Real-time event stream of student LMS interactions and session durations"
          />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Events per Day Chart */}
            <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                    <Activity className="size-4 text-lp-primary" /> Daily Activity Events by Cohort
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Total weekly LMS interactions split across active, consistent, at-risk, and inactive cohorts
                  </p>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={eventsPerDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="active" stackId="1" stroke={cohortColorHex['active']} fill={cohortColorHex['active']} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="consistent" stackId="1" stroke={cohortColorHex['consistent']} fill={cohortColorHex['consistent']} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="at-risk" stackId="1" stroke={cohortColorHex['at-risk']} fill={cohortColorHex['at-risk']} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="inactive" stackId="1" stroke={cohortColorHex['inactive']} fill={cohortColorHex['inactive']} fillOpacity={0.7} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Event Table Container */}
            <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-sm">
              {/* Table Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-subtle">
                <h2 className="text-base font-semibold text-text-primary">
                  Recent LMS Event Log ({total.toLocaleString()})
                </h2>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setPage(1)
                      }}
                      placeholder="Search student or module…"
                      className="h-9 w-52 rounded-lg border border-border-subtle bg-bg-main pl-9 pr-3 text-xs text-text-primary placeholder:text-text-secondary focus:border-lp-primary focus:outline-none focus:ring-2 focus:ring-lp-primary/20"
                    />
                  </div>

                  {/* Event Type Filter */}
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value)
                      setPage(1)
                    }}
                    className="h-9 rounded-lg border border-border-subtle bg-bg-surface px-3 text-xs font-medium text-text-primary focus:border-lp-primary focus:outline-none focus:ring-2 focus:ring-lp-primary/20"
                  >
                    <option value="all">All Event Types</option>
                    <option value="login">LMS Login</option>
                    <option value="video_watch">Video Watch</option>
                    <option value="quiz_submit">Quiz Submission</option>
                    <option value="assignment_submit">Assignment Submission</option>
                    <option value="forum_post">Forum Post</option>
                  </select>

                  {/* Cohort Filter */}
                  <select
                    value={selectedCohortFilter || 'all'}
                    onChange={(e) => {
                      setSelectedCohortFilter(e.target.value === 'all' ? null : (e.target.value as CohortId))
                      setPage(1)
                    }}
                    className="h-9 rounded-lg border border-border-subtle bg-bg-surface px-3 text-xs font-medium text-text-primary focus:border-lp-primary focus:outline-none focus:ring-2 focus:ring-lp-primary/20"
                  >
                    <option value="all">All Cohorts</option>
                    {cohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-border-subtle mt-4">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-bg-main border-b border-border-subtle text-text-secondary font-semibold">
                    <tr>
                      <th className="p-3 pl-4">Timestamp</th>
                      <th className="p-3">Student</th>
                      <th className="p-3">Cohort</th>
                      <th className="p-3">Event Type</th>
                      <th className="p-3">Course / Module</th>
                      <th className="p-3 pr-4">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle bg-bg-surface">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="p-3 pl-4"><div className="h-3.5 w-24 bg-slate-200 rounded" /></td>
                          <td className="p-3"><div className="h-3.5 w-32 bg-slate-200 rounded" /></td>
                          <td className="p-3"><div className="h-3.5 w-16 bg-slate-200 rounded" /></td>
                          <td className="p-3"><div className="h-3.5 w-24 bg-slate-200 rounded" /></td>
                          <td className="p-3"><div className="h-3.5 w-40 bg-slate-200 rounded" /></td>
                          <td className="p-3 pr-4"><div className="h-3.5 w-12 bg-slate-200 rounded" /></td>
                        </tr>
                      ))
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-secondary">
                          No activity logs found for selected filters.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => {
                        const badge = badgeTokens[log.cohort as keyof typeof badgeTokens] || {
                          background: '#E2E8F0',
                          text: '#475569',
                        }
                        const dt = new Date(log.timestamp)

                        return (
                          <tr key={log.id} className="hover:bg-bg-main/50 transition-colors">
                            <td className="p-3 pl-4 font-mono text-text-secondary">
                              {dt.toLocaleDateString()} {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-text-primary">{log.studentName}</div>
                              <div className="text-[10px] text-text-secondary">{log.studentEmail}</div>
                            </td>
                            <td className="p-3">
                              <span
                                className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize"
                                style={{ backgroundColor: badge.background, color: badge.text }}
                              >
                                {log.cohort}
                              </span>
                            </td>
                            <td className="p-3 font-medium text-text-primary capitalize">
                              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                                {eventTypeLabels[log.eventType] || log.eventType}
                              </span>
                            </td>
                            <td className="p-3 text-text-secondary truncate max-w-xs" title={log.courseModule}>
                              {log.courseModule}
                            </td>
                            <td className="p-3 pr-4 font-medium tabular-nums text-text-primary">
                              {log.durationMins} mins
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-4">
                  <span className="text-xs text-text-secondary">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={page === 1 || loading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="size-3.5" /> Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={page >= totalPages || loading}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SelectedCohortProvider>
  )
}
