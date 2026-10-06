'use client'

import { useState, useEffect } from 'react'
import {
  Sliders,
  Bell,
  User,
  Database,
  Save,
  Check,
  RefreshCw,
  Cpu,
  Mail,
  ShieldCheck,
} from 'lucide-react'

import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { getAppSettings, updateAppSettings, type AppSettings } from '@/lib/api'

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    getAppSettings().then((s) => setSettings(s))
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setIsSaving(true)
    await updateAppSettings(settings)
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleResetDefaults = async () => {
    const defaultSettings: AppSettings = {
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
        isLive: true,
        lastTrained: '2026-10-06T18:30:00Z',
        apiUrl: 'http://localhost:8000',
      },
    }
    setSettings(defaultSettings)
    await updateAppSettings(defaultSettings)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  if (!settings) {
    return (
      <div className="flex min-h-dvh bg-bg-main items-center justify-center">
        <div className="text-sm font-medium text-text-secondary flex items-center gap-2">
          <RefreshCw className="size-4 animate-spin text-lp-primary" /> Loading settings…
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh bg-bg-main">
      <Sidebar />

      <div className="flex flex-1 flex-col lg:pl-64">
        <Header
          title="Settings"
          subtitle="Configure ML clustering hyperparameters, threshold alerts, and administrator preferences"
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6 max-w-5xl">
          {/* Save notification toast */}
          {saveSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-900 shadow-xs animate-in fade-in">
              <Check className="size-4 text-emerald-600 shrink-0" />
              <span>Settings updated successfully! Model parameters saved.</span>
            </div>
          )}

          {/* Card 1: Clustering Configuration */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <Sliders className="size-5 text-lp-primary" />
              <div>
                <h2 className="text-base font-semibold text-text-primary">
                  Clustering Hyperparameters
                </h2>
                <p className="text-xs text-text-secondary">
                  Default cluster count, feature weights, and at-risk threshold rules
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 pt-2">
              {/* k value selector */}
              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">
                  Default Cluster Count (k)
                </label>
                <select
                  value={settings.clustering.k}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      clustering: {
                        ...settings.clustering,
                        k: parseInt(e.target.value),
                      },
                    })
                  }
                  className="h-9 w-full rounded-lg border border-border-subtle bg-bg-main px-3 text-xs font-medium text-text-primary focus:border-lp-primary focus:outline-none focus:ring-2 focus:ring-lp-primary/20"
                >
                  <option value={2}>k = 2 (Binary High/Low)</option>
                  <option value={3}>k = 3 (Tri-Cohort)</option>
                  <option value={4}>k = 4 (Standard LearnPulse Cohorts)</option>
                  <option value={5}>k = 5 (Granular 5-Stage)</option>
                  <option value={6}>k = 6 (Advanced 6-Stage)</option>
                </select>
                <p className="text-[11px] text-text-secondary mt-1">
                  K-Means defaults to k=4 for the 4 core behavior cohorts.
                </p>
              </div>

              {/* At-Risk Threshold Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-text-primary">
                    At-Risk Inactivity Threshold
                  </label>
                  <span className="text-xs font-bold text-lp-primary">
                    {settings.clustering.atRiskThresholdDays} days
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={14}
                  value={settings.clustering.atRiskThresholdDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      clustering: {
                        ...settings.clustering,
                        atRiskThresholdDays: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-lp-primary cursor-pointer"
                />
                <p className="text-[11px] text-text-secondary mt-1">
                  Learners with no activity for more than {settings.clustering.atRiskThresholdDays} days are flagged for early intervention.
                </p>
              </div>
            </div>

            {/* Feature toggles */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-text-primary block mb-2">
                Active Clustering Feature Space
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.keys(settings.clustering.features).map((featKey) => (
                  <label
                    key={featKey}
                    className="flex items-center gap-2 text-xs text-text-secondary bg-bg-main p-2 rounded-lg border border-border-subtle cursor-pointer hover:bg-border-subtle/50"
                  >
                    <input
                      type="checkbox"
                      checked={settings.clustering.features[featKey]}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          clustering: {
                            ...settings.clustering,
                            features: {
                              ...settings.clustering.features,
                              [featKey]: e.target.checked,
                            },
                          },
                        })
                      }
                      className="rounded border-border-subtle text-lp-primary focus:ring-lp-primary size-3.5"
                    />
                    <span className="font-medium capitalize">{featKey.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Notifications */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <Bell className="size-5 text-lp-primary" />
              <div>
                <h2 className="text-base font-semibold text-text-primary">
                  Notification & Alert Thresholds
                </h2>
                <p className="text-xs text-text-secondary">
                  Automated weekly reports and at-risk email alerts
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 pt-2">
              <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-main p-3">
                <div>
                  <div className="text-xs font-semibold text-text-primary">Weekly Digest Email</div>
                  <div className="text-[11px] text-text-secondary">Receive Monday summary report</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailDigest}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        emailDigest: e.target.checked,
                      },
                    })
                  }
                  className="size-4 rounded text-lp-primary focus:ring-lp-primary cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-text-primary">
                    At-Risk Spike Alert Threshold
                  </label>
                  <span className="text-xs font-bold text-amber-700">
                    {settings.notifications.atRiskAlertThreshold}% increase
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={5}
                  value={settings.notifications.atRiskAlertThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        atRiskAlertThreshold: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-lp-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Profile */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <User className="size-5 text-lp-primary" />
              <div>
                <h2 className="text-base font-semibold text-text-primary">
                  Administrator Profile
                </h2>
                <p className="text-xs text-text-secondary">
                  Instructor details for report generation signatures
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-2">
              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">Name</label>
                <input
                  type="text"
                  value={settings.profile.name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      profile: { ...settings.profile, name: e.target.value },
                    })
                  }
                  className="h-9 w-full rounded-lg border border-border-subtle bg-bg-main px-3 text-xs text-text-primary focus:border-lp-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">Role</label>
                <input
                  type="text"
                  value={settings.profile.role}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      profile: { ...settings.profile, role: e.target.value },
                    })
                  }
                  className="h-9 w-full rounded-lg border border-border-subtle bg-bg-main px-3 text-xs text-text-primary focus:border-lp-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Model Status & Data Reset */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <Database className="size-5 text-lp-primary" />
              <div>
                <h2 className="text-base font-semibold text-text-primary">
                  Model Connection & Data Controls
                </h2>
                <p className="text-xs text-text-secondary">
                  Backend API status check and system reset
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 bg-bg-main p-4 rounded-lg border border-border-subtle text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Cpu className="size-4 text-lp-primary" />
                  <span className="font-semibold text-text-primary">API Base URL:</span>
                  <span className="font-mono text-text-secondary">{settings.modelStatus.apiUrl}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>Last model fit: {new Date(settings.modelStatus.lastTrained).toLocaleString()}</span>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handleResetDefaults} className="gap-1 text-xs">
                <RefreshCw className="size-3.5" /> Reset to Defaults
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={handleSave} disabled={isSaving} className="gap-1.5 px-6">
              <Save className="size-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
