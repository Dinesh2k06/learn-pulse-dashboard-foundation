'use client'

import { X, User, Mail, Calendar, Clock, BookOpen, Video, FileCheck, HelpCircle, MessageSquare, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { Student } from '@/lib/types'
import { badgeTokens, cohortColorHex } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'

interface StudentDetailSheetProps {
  student: Student | null
  open: boolean
  onClose: () => void
}

export function StudentDetailSheet({ student, open, onClose }: StudentDetailSheetProps) {
  if (!open || !student) return null

  const badge = badgeTokens[student.cohort as keyof typeof badgeTokens] || {
    background: '#E2E8F0',
    text: '#475569',
  }
  const colorHex = cohortColorHex[student.cohort] || '#475569'

  const featuresList = [
    { label: 'Weekly Logins', value: `${student.weeklyLogins} days/wk`, icon: Calendar },
    { label: 'Avg Session Mins', value: `${student.avgSessionMins} mins`, icon: Clock },
    { label: 'Days Inactive', value: `${student.daysSinceLastLogin ?? 0} days`, icon: AlertTriangle },
    { label: 'Course Completion', value: `${student.completionPct}%`, icon: BookOpen },
    { label: 'Video Watch Rate', value: `${student.videoWatchPct ?? 0}%`, icon: Video },
    { label: 'Assignment Rate', value: `${Math.round((student.assignmentsSubmittedRatio ?? 0) * 100)}%`, icon: FileCheck },
    { label: 'Quiz Attempts', value: `${student.quizAttempts ?? 0}`, icon: HelpCircle },
    { label: 'Forum Posts', value: `${student.forumPosts ?? 0}`, icon: MessageSquare },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      {/* Overlay click to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Sheet content */}
      <aside
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border-subtle bg-bg-surface p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-label={`Student Profile: ${student.name}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border-subtle pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-lg border border-slate-200">
              {student.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">{student.name}</h3>
              <p className="text-xs text-text-secondary flex items-center gap-1">
                <Mail className="size-3" /> {student.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-main hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary"
            aria-label="Close panel"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Cohort Badge + Summary */}
        <div className="mt-4 rounded-xl border border-border-subtle p-4 bg-bg-main/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Behavior Cohort
            </span>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold capitalize shadow-xs inline-flex items-center gap-1.5"
              style={{ backgroundColor: badge.background, color: badge.text }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: colorHex }} />
              {student.cohort}
            </span>
          </div>

          {/* Completion Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-text-secondary">Overall Completion</span>
              <span className="text-text-primary font-bold">{student.completionPct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border-subtle">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${student.completionPct}%`, backgroundColor: colorHex }}
              />
            </div>
          </div>
        </div>

        {/* Why this group explanation */}
        {student.explanation && (
          <div className="mt-5 rounded-xl border border-lp-primary/20 bg-indigo-50/50 p-4">
            <h4 className="text-sm font-semibold text-lp-primary flex items-center gap-1.5 mb-2">
              <CheckCircle className="size-4" /> Why this group?
            </h4>
            <p className="text-xs text-text-primary leading-relaxed mb-3">
              {student.explanation.summary}
            </p>

            {/* Top feature drivers */}
            <div className="space-y-1.5">
              {student.explanation.topFeatures.map((f, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] bg-white/80 p-2 rounded-md border border-indigo-100">
                  <span className="font-medium text-text-primary">{f.featureLabel}</span>
                  <span className="flex items-center gap-1 font-semibold">
                    {f.studentValue} (avg {f.datasetMean})
                    {f.direction === 'higher' ? (
                      <ArrowUpRight className="size-3 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="size-3 text-rose-600" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Action */}
        {student.explanation?.suggestedAction && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-1">
              <AlertTriangle className="size-3.5 text-amber-600" /> Suggested Action
            </h4>
            <p className="text-xs font-medium text-amber-950">
              {student.explanation.suggestedAction}
            </p>
          </div>
        )}

        {/* 8 Features Grid */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
            All 8 Behavior Metrics
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            {featuresList.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-2.5 rounded-lg border border-border-subtle bg-bg-surface p-2.5">
                  <div className="flex size-7 items-center justify-center rounded-md bg-bg-main text-text-secondary">
                    <Icon className="size-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-text-secondary">{item.label}</div>
                    <div className="text-xs font-bold text-text-primary">{item.value}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-auto border-t border-border-subtle pt-4 flex gap-2">
          <Button className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </aside>
    </div>
  )
}
