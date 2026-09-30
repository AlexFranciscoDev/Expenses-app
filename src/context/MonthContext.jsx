import { createContext, useContext, useEffect, useState } from 'react'
import { currentMonthKey, formatMonth, formatRangeLabel, monthRange, payCycleRange, shiftMonth } from '../utils/dates.js'
import { useData } from './DataContext.jsx'

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

/**
 * Tracks the selected calendar month (used everywhere, including budgets, which
 * always stay calendar-based) and an optional "pay cycle" alternative period for
 * Home/Transactions/Analytics, active only once the user sets a payday.
 */
export function MonthProvider({ children }) {
  const { profile } = useData()
  const payday = profile?.payday ?? null

  const [month, setMonth] = useState(readStoredMonth)
  const [periodMode, setPeriodModeState] = useState('calendar')
  const [cycleOffset, setCycleOffset] = useState(0)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, month)
    } catch {
      // storage unavailable
    }
  }, [month])

  // A payday that gets cleared shouldn't leave the app stuck showing cycle data.
  useEffect(() => {
    if (!payday && periodMode === 'payday') setPeriodModeState('calendar')
  }, [payday, periodMode])

  const setPeriodMode = (mode) => {
    setPeriodModeState(mode)
    setCycleOffset(0)
  }

  const calendarRange = monthRange(month)
  const cycleRange = payday ? payCycleRange(payday, cycleOffset) : calendarRange
  const usingCycle = periodMode === 'payday' && Boolean(payday)

  const value = {
    // Calendar month — always available, used as-is by Budgets and category detail.
    month,
    setMonth,
    goPrev: () => setMonth((m) => shiftMonth(m, -1)),
    goNext: () => setMonth((m) => shiftMonth(m, 1)),
    goToday: () => setMonth(currentMonthKey()),
    isCurrentMonth: month === currentMonthKey(),

    // Pay cycle — opt-in alternative period.
    payday,
    periodMode: usingCycle ? 'payday' : 'calendar',
    setPeriodMode,
    cycleOffset,
    goPrevCycle: () => setCycleOffset((o) => o - 1),
    goNextCycle: () => setCycleOffset((o) => o + 1),
    goCurrentCycle: () => setCycleOffset(0),
    isCurrentCycle: cycleOffset === 0,

    // The active period, whichever mode is selected — this is what Home,
    // Transactions ("Month" scope) and Analytics should actually query and label.
    range: usingCycle ? cycleRange : calendarRange,
    rangeLabel: usingCycle ? formatRangeLabel(cycleRange) : formatMonth(month),
    isCurrentPeriod: usingCycle ? cycleOffset === 0 : month === currentMonthKey(),
  }

  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>
}

export function useMonth() {
  return useContext(MonthContext)
}
