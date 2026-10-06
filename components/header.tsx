'use client'

import { useState, useEffect } from 'react'
import { Search, Bell, ChevronDown, Download, Activity, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { checkApiHealth, getExportCsvUrl, type ApiStatus } from '@/lib/api'

interface HeaderProps {
  title?: string
  subtitle?: string
  onSearchChange?: (q: string) => void
}

export function Header({
  title = 'Overview',
  subtitle = 'Learner behavior grouped by LMS activity',
  onSearchChange,
}: HeaderProps) {
  const [searchValue, setSearchValue] = useState('')
  const [status, setStatus] = useState<ApiStatus>({
    isLive: false,
    message: 'Checking ML backend…',
  })

  useEffect(() => {
    let isMounted = true
    checkApiHealth().then((res) => {
      if (isMounted) setStatus(res)
    })
    return () => {
      isMounted = false
    }
  }, [])

  const handleSearch = (val: string) => {
    setSearchValue(val)
    if (onSearchChange) {
      onSearchChange(val)
    }
  }

  const handleExport = () => {
    window.open(getExportCsvUrl(), '_blank')
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border-subtle bg-bg-surface/90 px-6 py-4 backdrop-blur-sm lg:px-8">
      {/* Left: title area (offset for mobile hamburger) */}
      <div className="flex items-center gap-3 pl-12 lg:pl-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">
              {title}
            </h1>
            {/* Live Model vs Demo Data chip */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                status.isLive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {status.isLive ? (
                <>
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Cpu className="size-3" /> Live model
                </>
              ) : (
                <>
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  <Activity className="size-3" /> Demo data
                </>
              )}
            </span>
          </div>
          <p className="text-sm text-text-secondary">{subtitle}</p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search learners…"
            className="h-9 w-56 rounded-lg border border-border-subtle bg-bg-main pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-lp-primary focus:outline-none focus:ring-2 focus:ring-lp-primary/20"
          />
        </div>

        {/* Date-range select */}
        <div className="relative hidden sm:block">
          <select
            className="h-9 appearance-none rounded-lg border border-border-subtle bg-bg-surface py-1.5 pr-8 pl-3 text-sm font-medium text-text-primary focus:border-lp-primary focus:outline-none focus:ring-2 focus:ring-lp-primary/20 cursor-pointer"
            defaultValue="30d"
            aria-label="Date range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
        </div>

        {/* Notification bell */}
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" />
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-lp-primary text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* Export Report */}
        <Button className="hidden sm:inline-flex gap-1.5" onClick={handleExport}>
          <Download className="size-4" />
          Export Report
        </Button>
      </div>
    </header>
  )
}
