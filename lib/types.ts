import type { LucideIcon } from 'lucide-react'

export type CohortId = 'active' | 'consistent' | 'at-risk' | 'inactive' | string

export interface Metric {
  label: string
  value: string
  trend: string
  trendDirection: 'up' | 'down'
  trendContext?: string
  icon: string
}

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface Cohort {
  id: CohortId
  label: string
  count: number
  color: string
  percent?: number
}

export interface CohortProfile {
  id: CohortId
  description: string
  avgWeeklyActiveDays: number
  avgSessionMins: number
  avgCompletionPct: number
  signal: string
  centroid?: Record<string, number>
}

export interface Student {
  id: string
  name: string
  email: string
  lastLogin: string // ISO string or relative string
  completionPct: number
  cohort: CohortId
  weeklyLogins: number
  avgSessionMins: number
  daysSinceLastLogin?: number
  videoWatchPct?: number
  assignmentsSubmittedRatio?: number
  quizAttempts?: number
  forumPosts?: number
  explanation?: {
    topFeatures: Array<{
      feature: string
      featureLabel: string
      studentValue: number
      datasetMean: number
      direction: 'higher' | 'lower'
    }>
    summary: string
    suggestedAction: string
  }
}

export interface ActivityLog {
  id: string
  timestamp: string
  studentId: string
  studentName: string
  studentEmail: string
  cohort: CohortId
  eventType: 'login' | 'video_watch' | 'quiz_submit' | 'assignment_submit' | 'forum_post'
  courseModule: string
  durationMins: number
}

export interface ClusterQuality {
  k: number
  silhouetteScore: number
  inertia: number
  daviesBouldin: number
  elbowCurve: Array<{ k: number; inertia: number; silhouetteScore: number }>
}

export interface ClusterRunRequest {
  k: number
  features: string[]
}

export interface ClusterRunResponse {
  message: string
  k: number
  cohorts: Cohort[]
  quality: ClusterQuality
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AppSettings {
  clustering: {
    k: number
    features: Record<string, boolean>
    atRiskThresholdDays: number
  }
  notifications: {
    emailDigest: boolean
    atRiskAlertThreshold: number
  }
  profile: {
    name: string
    role: string
    email: string
  }
  modelStatus: {
    isLive: boolean
    lastTrained: string
    apiUrl: string
  }
}
