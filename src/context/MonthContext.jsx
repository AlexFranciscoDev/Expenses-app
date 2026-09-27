import { createContext, useContext, useEffect, useState } from 'react'
import { currentMonthKey, shiftMonth } from '../utils/dates.js'

const MonthContext = createContext(null)
const STORAGE_KEY = 'ledger:selected-month'

function readStoredMonth() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored && /^\d{4}-\d{2}$/.test(stored)) return stored
  } catch {
    // storage unavailable
  }
  return currentMonthKey()
}

export function MonthProvider({ children }) {
  const [month, setMonth] = useState(readStoredMonth)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, month)
    } catch {
      // storage unavailable
    }
  }, [month])

  const value = {
    month,
    setMonth,
    goPrev: () => setMonth((m) => shiftMonth(m, -1)),
    goNext: () => setMonth((m) => shiftMonth(m, 1)),
    goToday: () => setMonth(currentMonthKey()),
    isCurrentMonth: month === currentMonthKey(),
  }

  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>
}

export function useMonth() {
  return useContext(MonthContext)
}
