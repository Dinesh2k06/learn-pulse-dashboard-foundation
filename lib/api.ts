import {
  metrics as mockMetrics,
  cohorts as mockCohorts,
  cohortProfiles as mockProfiles,
  mockStudents,
} from './mock-data'
import type {
  Metric,
  Cohort,
  CohortProfile,
  Student,
  ActivityLog,
  ClusterQuality,
  ClusterRunResponse,
  PaginatedResponse,
  AppSettings,
  CohortId,
} from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface ApiStatus {
  isLive: boolean
  message: string
}

export async function checkApiHealth(): Promise<ApiStatus> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2500),
    })
    if (res.ok) {
      return { isLive: true, message: 'Live model connected' }
    }
  } catch {
    // API not reachable
  }
  return { isLive: false, message: 'Demo data mode' }
}

export async function getOverviewMetrics(): Promise<Metric[]> {
  try {
    const res = await fetch(`${API_BASE}/api/metrics`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // fallback
  }
  return mockMetrics
}

export async function getCohorts(): Promise<{
  cohorts: Cohort[]
  profiles: CohortProfile[]
}> {
  try {
    const res = await fetch(`${API_BASE}/api/cohorts`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const data = await res.json()
      return { cohorts: data.cohorts, profiles: data.profiles }
    }
  } catch {
    // fallback
  }
  return { cohorts: mockCohorts, profiles: mockProfiles }
}

export async function getStudents(params: {
  cohort?: CohortId | null
  q?: string
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<Student>> {
  const query = new URLSearchParams()
  if (params.cohort) query.set('cohort', params.cohort)
  if (params.q) query.set('q', params.q)
  if (params.sort) query.set('sort', params.sort)
  if (params.order) query.set('order', params.order)
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  try {
    const res = await fetch(`${API_BASE}/api/students?${query.toString()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3500),
    })
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // fallback
  }

  // Fallback client-side filtering on mockStudents
  let items = [...mockStudents]

  if (params.cohort) {
    items = items.filter((s) => s.cohort === params.cohort)
  }

  if (params.q) {
    const qLower = params.q.toLowerCase()
    items = items.filter(
      (s) =>
        s.name.toLowerCase().includes(qLower) ||
        s.email.toLowerCase().includes(qLower) ||
        s.id.toLowerCase().includes(qLower),
    )
  }

  if (params.sort) {
    const key = params.sort as keyof Student
    const dir = params.order === 'desc' ? -1 : 1
    items.sort((a, b) => {
      const valA = a[key] ?? ''
      const valB = b[key] ?? ''
      if (valA < valB) return -1 * dir
      if (valA > valB) return 1 * dir
      return 0
    })
  }

  const page = params.page || 1
  const pageSize = params.pageSize || 10
  const total = items.length
  const totalPages = Math.ceil(total / pageSize) || 1
  const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize)

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function getStudentById(id: string): Promise<Student | null> {
  try {
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // fallback
  }
  return mockStudents.find((s) => s.id === id) || null
}

export async function getActivityLogs(params: {
  type?: string
  cohort?: CohortId | null
  q?: string
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<ActivityLog>> {
  const query = new URLSearchParams()
  if (params.type) query.set('type', params.type)
  if (params.cohort) query.set('cohort', params.cohort)
  if (params.q) query.set('q', params.q)
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  try {
    const res = await fetch(`${API_BASE}/api/activity-logs?${query.toString()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3500),
    })
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // fallback
  }

  // Fallback logs generator
  const generatedLogs: ActivityLog[] = []
  const types: ActivityLog['eventType'][] = [
    'login',
    'video_watch',
    'quiz_submit',
    'assignment_submit',
    'forum_post',
  ]
  const modules = [
    'Module 1: Introduction to Data Science',
    'Module 2: Machine Learning Fundamentals',
    'Module 3: Neural Networks & Deep Learning',
    'Module 4: Model Evaluation & Metrics',
    'Module 5: Capstone Project Preparation',
  ]

  let idx = 1
  for (const student of mockStudents) {
    for (let i = 0; i < 5; i++) {
      const eventType = types[(idx + i) % types.length]
      const courseModule = modules[(idx * 3 + i) % modules.length]
      const hoursAgo = (idx * 4 + i * 6) % 336
      const date = new Date(Date.now() - hoursAgo * 3600 * 1000)

      generatedLogs.push({
        id: `LOG-${1000 + idx}`,
        timestamp: date.toISOString(),
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        cohort: student.cohort,
        eventType,
        courseModule,
        durationMins: Math.floor(Math.random() * 45) + 5,
      })
      idx++
    }
  }

  let filtered = [...generatedLogs]
  if (params.cohort) filtered = filtered.filter((l) => l.cohort === params.cohort)
  if (params.type && params.type !== 'all') filtered = filtered.filter((l) => l.eventType === params.type)
  if (params.q) {
    const qLower = params.q.toLowerCase()
    filtered = filtered.filter(
      (l) =>
        l.studentName.toLowerCase().includes(qLower) ||
        l.studentEmail.toLowerCase().includes(qLower) ||
        l.courseModule.toLowerCase().includes(qLower),
    )
  }

  const page = params.page || 1
  const pageSize = params.pageSize || 10
  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize) || 1
  const items = filtered.slice((page - 1) * pageSize, page * pageSize)

  return { items, total, page, pageSize, totalPages }
}

export async function getClusterQuality(): Promise<ClusterQuality> {
  try {
    const res = await fetch(`${API_BASE}/api/cluster/quality`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // fallback
  }

  return {
    k: 4,
    silhouetteScore: 0.54,
    inertia: 4120.5,
    daviesBouldin: 0.78,
    elbowCurve: [
      { k: 2, inertia: 7850.2, silhouetteScore: 0.42 },
      { k: 3, inertia: 5400.8, silhouetteScore: 0.49 },
      { k: 4, inertia: 4120.5, silhouetteScore: 0.54 },
      { k: 5, inertia: 3450.1, silhouetteScore: 0.51 },
      { k: 6, inertia: 2980.4, silhouetteScore: 0.47 },
      { k: 7, inertia: 2610.0, silhouetteScore: 0.44 },
      { k: 8, inertia: 2320.6, silhouetteScore: 0.41 },
    ],
  }
}

export async function runClustering(k: number, features: string[]): Promise<ClusterRunResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/cluster/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ k, features }),
    })
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // fallback simulated response
  }

  return {
    message: `Simulated re-clustering with k=${k}`,
    k,
    cohorts: mockCohorts,
    quality: await getClusterQuality(),
  }
}

export function getExportCsvUrl(): string {
  return `${API_BASE}/api/export/students.csv`
}

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, { cache: 'no-store' })
    if (res.ok) return await res.json()
  } catch {
    // fallback
  }

  return {
    clustering: {
      k: 4,
      features: {
        logins_per_week: true,
        avg_session_mins: true,
        days_since_last_login: true,
        completion_pct: true,
        video_watch_pct: true,
        assignments_submitted_ratio: true,
        quiz_attempts: true,
        forum_posts: true,
      },
      atRiskThresholdDays: 5,
    },
    notifications: {
      emailDigest: true,
      atRiskAlertThreshold: 10,
    },
    profile: {
      name: 'Dr. Priya Nair',
      role: 'Course Administrator & Lead ML Instructor',
      email: 'p.nair@learnpulse.edu',
    },
    modelStatus: {
      isLive: false,
      lastTrained: '2026-10-06T18:00:00Z',
      apiUrl: API_BASE,
    },
  }
}

export async function updateAppSettings(settings: Partial<AppSettings>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    return res.ok
  } catch {
    return true // simulated success in fallback mode
  }
}
