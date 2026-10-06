'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { MetricCard } from '@/components/metric-card'
import { CohortDistributionChart } from '@/components/cohort-distribution-chart'
import { CohortSummary } from '@/components/cohort-summary'
import { StudentTable } from '@/components/student-table'
import { SelectedCohortProvider } from '@/components/selected-cohort-context'
import { metrics } from '@/lib/mock-data'

export default function Page() {
  const [globalSearch, setGlobalSearch] = useState('')

  return (
    <SelectedCohortProvider>
      <div className="flex min-h-dvh bg-bg-main">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col lg:pl-64">
          <Header onSearchChange={setGlobalSearch} />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Metric cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((m) => (
                <MetricCard key={m.label} metric={m} />
              ))}
            </div>

            {/* Step 2: Chart + Summary */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <CohortDistributionChart />
              </div>
              <div className="lg:col-span-1">
                <CohortSummary />
              </div>
            </div>

            {/* Step 3: Student Behavior Table */}
            <div>
              <StudentTable hideTitle={false} />
            </div>
          </main>
        </div>
      </div>
    </SelectedCohortProvider>
  )
}
