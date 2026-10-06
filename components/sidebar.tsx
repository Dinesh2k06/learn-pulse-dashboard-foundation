'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, GraduationCap } from 'lucide-react'
import { navItems } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        className="fixed top-4 left-4 z-50 flex size-10 items-center justify-center rounded-lg bg-bg-surface text-text-primary shadow-md lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-dvh w-64 flex-col border-r border-border-subtle bg-bg-surface transition-transform duration-200 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Close (mobile only) */}
        <button
          type="button"
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-md text-text-secondary hover:text-text-primary lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
        >
          <X className="size-5" />
        </button>

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 px-6 pt-6 pb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-lp-primary text-white shadow-sm">
            <GraduationCap className="size-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-text-primary">
            LearnPulse
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary',
                  isActive
                    ? 'bg-[var(--sidebar-active-tint)] text-lp-primary'
                    : 'text-text-secondary hover:bg-muted hover:text-text-primary',
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-lp-primary" />
                )}
                <Icon className="size-[18px] shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border-subtle px-6 py-4">
          <p className="text-xs text-text-secondary">© 2026 LearnPulse ML</p>
        </div>
      </aside>
    </>
  )
}
