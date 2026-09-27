import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getProfile } from '../services/auth.js'
import { listBudgets } from '../services/budgets.js'
import { listCategories } from '../services/categories.js'
import { useAuth } from './AuthContext.jsx'

const DataContext = createContext(null)

/**
 * Holds data shared by every page (profile, categories, budgets) and a `version`
 * counter that pages use to refetch transactions after any change.
 */
export function DataProvider({ children }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [categories, setCategories] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)

  const reloadCategories = useCallback(async () => setCategories(await listCategories()), [])
  const reloadBudgets = useCallback(async () => setBudgets(await listBudgets()), [])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    Promise.all([getProfile(), listCategories(), listBudgets()])
      .then(([p, c, b]) => {
        if (cancelled) return
        setProfile(p)
        setCategories(c)
        setBudgets(b)
        setError(null)
      })
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user])

  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const value = {
    profile,
    setProfile,
    categories,
    categoriesById,
    budgets,
    loading,
    error,
    version,
    /** Call after creating, editing or deleting transactions */
    notifyTransactionsChanged: () => setVersion((v) => v + 1),
    reloadCategories,
    reloadBudgets,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}
