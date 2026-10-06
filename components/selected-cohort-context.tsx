'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { CohortId } from '@/lib/mock-data'

interface SelectedCohortContextValue {
  selectedCohort: CohortId | null
  setSelectedCohort: (id: CohortId | null) => void
  toggleCohort: (id: CohortId) => void
}

const SelectedCohortContext = createContext<SelectedCohortContextValue>({
  selectedCohort: null,
  setSelectedCohort: () => {},
  toggleCohort: () => {},
})

export function SelectedCohortProvider({ children }: { children: ReactNode }) {
  const [selectedCohort, setSelectedCohort] = useState<CohortId | null>(null)

  const toggleCohort = useCallback((id: CohortId) => {
    setSelectedCohort((prev) => (prev === id ? null : id))
  }, [])

  return (
    <SelectedCohortContext.Provider
      value={{ selectedCohort, setSelectedCohort, toggleCohort }}
    >
      {children}
    </SelectedCohortContext.Provider>
  )
}

export function useSelectedCohort() {
  return useContext(SelectedCohortContext)
}
