'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import {
  Sparkles,
  Table as TableIcon,
  BarChart3,
  Cpu,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { StudentTable } from '@/components/student-table'
import { SelectedCohortProvider } from '@/components/selected-cohort-context'
import { Button } from '@/components/ui/button'
import { getCohorts, getClusterQuality, runClustering } from '@/lib/api'
import type { Cohort, CohortProfile, ClusterQuality } from '@/lib/types'
import { cohortColorHex, badgeTokens } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function CohortsPage() {
  const [cohortsList, setCohortsList] = useState<Cohort[]>([])
  const [profilesList, setProfilesList] = useState<CohortProfile[]>([])
  const [quality, setQuality] = useState<ClusterQuality | null>(null)

  const [kValue, setKValue] = useState<number>(4)
  const [showDataTable, setShowDataTable] = useState<boolean>(false)
  const [isRetraining, setIsRetraining] = useState<boolean>(false)

  const [featuresState, setFeaturesState] = useState<Record<string, boolean>>({
    logins_per_week: true,
    avg_session_mins: true,
    days_since_last_login: true,
    completion_pct: true,
    video_watch_pct: true,
    assignments_submitted_ratio: true,
    quiz_attempts: true,
    forum_posts: true,
  })

  const loadData = async () => {
    const data = await getCohorts()
    setCohortsList(data.cohorts)
    setProfilesList(data.profiles)
    const qData = await getClusterQuality()
    setQuality(qData)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRetrain = async () => {
    setIsRetraining(true)
    const activeFeatures = Object.keys(featuresState).filter((f) => featuresState[f])
    const res = await runClustering(kValue, activeFeatures)
    setCohortsList(res.cohorts)
    setQuality(res.quality)
    setIsRetraining(false)
  }

  // Centroid comparison normalized data for grouped bar chart (0 - 100)
  const comparisonFeatures = [
    { key: 'completion_pct', label: 'Completion %' },
    { key: 'video_watch_pct', label: 'Video Watch %' },
    { key: 'assignments_submitted_ratio', label: 'Assignment Rate %' },
    { key: 'logins_per_week', label: 'Weekly Logins (x10)' },
    { key: 'avg_session_mins', label: 'Avg Session (min)' },
    { key: 'quiz_attempts', label: 'Quiz Attempts (x5)' },
    { key: 'forum_posts', label: 'Forum Posts (x3)' },
  ]

  const chartData = comparisonFeatures.map((feat) => {
    const item: Record<string, any> = { feature: feat.label }
    profilesList.forEach((prof) => {
      const val = prof.centroid?.[feat.key] ?? 0
      if (feat.key === 'assignments_submitted_ratio') item[prof.id] = Math.round(val * 100)
      else if (feat.key === 'logins_per_week') item[prof.id] = Math.round(val * 10)
      else if (feat.key === 'quiz_attempts') item[prof.id] = Math.round(val * 5)
      else if (feat.key === 'forum_posts') item[prof.id] = Math.round(val * 3)
      else item[prof.id] = Math.round(val)
    })
    return item
  })

  return (
    <SelectedCohortProvider>
      <div className="flex min-h-dvh bg-bg-main">
        <Sidebar />

        <div className="flex flex-1 flex-col lg:pl-64">
          <Header
            title="Student Cohorts"
            subtitle="K-Means clustering profile comparison and model evaluation"
          />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* 4 Large Cohort Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cohortsList.map((cohort) => {
                const profile = profilesList.find((p) => p.id === cohort.id)
                const badge = badgeTokens[cohort.id as keyof typeof badgeTokens] || {
                  background: '#E2E8F0',
                  text: '#475569',
                }
                const color = cohortColorHex[cohort.id] || '#475569'

                return (
                  <div
                    key={cohort.id}
                    className="flex flex-col justify-between rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-bold capitalize inline-flex items-center gap-1.5"
                          style={{ backgroundColor: badge.background, color: badge.text }}
                        >
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
                          {cohort.label}
                        </span>
                        <span className="text-xs font-semibold text-text-secondary">
                          {cohort.percent ?? 0}% share
                        </span>
                      </div>

                      <div className="text-2xl font-bold tabular-nums text-text-primary mt-1">
                        {cohort.count.toLocaleString()}
                        <span className="text-xs font-normal text-text-secondary ml-1">learners</span>
                      </div>

                      <p className="text-xs text-text-secondary mt-2 min-h-[36px] line-clamp-2">
                        {profile?.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-subtle grid grid-cols-3 gap-1 text-center">
                      <div>
                        <div className="text-[10px] text-text-secondary">Active Days</div>
                        <div className="text-xs font-bold text-text-primary">
                          {profile?.avgWeeklyActiveDays}d/wk
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-secondary">Session</div>
                        <div className="text-xs font-bold text-text-primary">
                          {profile?.avgSessionMins}m
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-secondary">Complete</div>
                        <div className="text-xs font-bold text-text-primary">
                          {profile?.avgCompletionPct}%
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Middle Row: Cohort Comparison Chart + Model Quality Card */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Cohort Comparison Chart (2 cols) */}
              <div className="lg:col-span-2 flex flex-col rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">
                      Cohort Feature Comparison
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Normalized centroids across the 8 behavior features (0-100 scale)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setShowDataTable(!showDataTable)}
                    className="gap-1 text-xs"
                  >
                    {showDataTable ? <BarChart3 className="size-3.5" /> : <TableIcon className="size-3.5" />}
                    {showDataTable ? 'Show Chart' : 'Show Data Table'}
                  </Button>
                </div>

                {!showDataTable ? (
                  <div className="min-h-[300px] w-full pt-2">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                        <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
                        <XAxis dataKey="feature" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} angle={-15} textAnchor="end" />
                        <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} domain={[0, 100]} />
                        <Tooltip />
                        {cohortsList.map((c) => (
                          <Bar
                            key={c.id}
                            dataKey={c.id}
                            name={c.label}
                            fill={cohortColorHex[c.id]}
                            radius={[4, 4, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border-subtle mt-2">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-bg-main border-b border-border-subtle text-text-secondary font-semibold">
                        <tr>
                          <th className="p-2.5">Feature</th>
                          {cohortsList.map((c) => (
                            <th key={c.id} className="p-2.5">{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle">
                        {chartData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-bg-main/50">
                            <td className="p-2.5 font-medium text-text-primary">{row.feature}</td>
                            {cohortsList.map((c) => (
                              <td key={c.id} className="p-2.5 font-mono text-text-secondary">{row[c.id]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Model Quality Card (1 col) */}
              <div className="flex flex-col justify-between rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-sm">
                <div>
                  <h2 className="text-base font-semibold text-text-primary flex items-center gap-1.5">
                    <Cpu className="size-4 text-lp-primary" /> Model Evaluation
                  </h2>
                  <p className="text-xs text-text-secondary mb-4">
                    K-Means clustering validation metrics
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center mb-5">
                    <div className="rounded-lg border border-border-subtle bg-bg-main p-2.5">
                      <div className="text-[10px] text-text-secondary font-medium">Silhouette</div>
                      <div className="text-sm font-bold text-emerald-600 tabular-nums">
                        {quality?.silhouetteScore ?? 0.54}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border-subtle bg-bg-main p-2.5">
                      <div className="text-[10px] text-text-secondary font-medium">Davies-Bouldin</div>
                      <div className="text-sm font-bold text-lp-primary tabular-nums">
                        {quality?.daviesBouldin ?? 0.78}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border-subtle bg-bg-main p-2.5">
                      <div className="text-[10px] text-text-secondary font-medium">Inertia</div>
                      <div className="text-sm font-bold text-text-primary tabular-nums">
                        {quality?.inertia ? Math.round(quality.inertia) : 4120}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xs font-semibold text-text-primary mb-2">
                    Elbow Curve (k = 2 to 8)
                  </h3>
                  <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={quality?.elbowCurve || []}>
                        <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" />
                        <XAxis dataKey="k" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} hide />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="inertia"
                          stroke="var(--lp-primary)"
                          strokeWidth={2}
                          dot={{ r: 3, fill: 'var(--lp-primary)' }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle text-[11px] text-text-secondary flex items-center justify-between">
                  <span>Optimal k identified at k=4</span>
                  <span className="font-semibold text-lp-primary">Random seed: 42</span>
                </div>
              </div>
            </div>

            {/* Re-run Clustering Panel */}
            <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                    <Sparkles className="size-4 text-lp-primary" /> Re-run Clustering Experiment
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Select cluster count (k) and feature space to retrain the K-Means algorithm live
                  </p>
                </div>

                <Button
                  onClick={handleRetrain}
                  disabled={isRetraining}
                  className="gap-2"
                >
                  <RefreshCw className={cn('size-4', isRetraining && 'animate-spin')} />
                  {isRetraining ? 'Retraining...' : 'Run K-Means Model'}
                </Button>
              </div>

              {/* k-Value selector */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border-subtle">
                <span className="text-xs font-semibold text-text-primary">Cluster Count (k):</span>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 4, 5, 6, 7, 8].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKValue(k)}
                      className={cn(
                        'size-8 rounded-lg text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary',
                        kValue === k
                          ? 'bg-lp-primary text-white shadow-xs'
                          : 'bg-bg-main text-text-secondary hover:bg-border-subtle hover:text-text-primary',
                      )}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature checkboxes */}
              <div>
                <span className="text-xs font-semibold text-text-primary block mb-2">Included Features:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.keys(featuresState).map((featKey) => (
                    <label
                      key={featKey}
                      className="flex items-center gap-2 text-xs text-text-secondary bg-bg-main p-2 rounded-lg border border-border-subtle cursor-pointer hover:bg-border-subtle/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={featuresState[featKey]}
                        onChange={(e) =>
                          setFeaturesState((prev) => ({
                            ...prev,
                            [featKey]: e.target.checked,
                          }))
                        }
                        className="rounded border-border-subtle text-lp-primary focus:ring-lp-primary size-3.5"
                      />
                      <span className="font-medium capitalize">
                        {featKey.replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <AlertCircle className="size-4 shrink-0 text-amber-600" />
                <span>
                  Note: Retraining re-calculates all learner cluster assignments across the dashboard in real-time.
                </span>
              </div>
            </div>

            {/* Reusable Student Table */}
            <div>
              <StudentTable hideTitle={false} />
            </div>
          </main>
        </div>
      </div>
    </SelectedCohortProvider>
  )
}
