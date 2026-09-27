import { Suspense, lazy } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import ErrorNotice from './components/ui/ErrorNotice.jsx'
import Spinner from './components/ui/Spinner.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { DataProvider, useData } from './context/DataContext.jsx'
import { MonthProvider } from './context/MonthContext.jsx'
import BudgetsPage from './pages/BudgetsPage.jsx'
import CategoriesPage from './pages/CategoriesPage.jsx'
import CategoryDetailPage from './pages/CategoryDetailPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import TransactionDetailPage from './pages/TransactionDetailPage.jsx'
import TransactionFormPage from './pages/TransactionFormPage.jsx'
import TransactionsPage from './pages/TransactionsPage.jsx'

// Charts (Recharts) load only when Analytics is opened
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx'))

function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner className="h-dvh" />
  if (!user) return <Navigate to="/login" replace />
  return (
    <DataProvider>
      <MonthProvider>
        <DataGate />
      </MonthProvider>
    </DataProvider>
  )
}

/** Waits for categories/budgets before rendering pages */
function DataGate() {
  const { loading, error } = useData()
  if (loading) return <Spinner className="h-dvh" />
  if (error) return <ErrorNotice error={error} onRetry={() => window.location.reload()} />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/transactions/new" element={<TransactionFormPage />} />
        <Route path="/transactions/:id/edit" element={<TransactionFormPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transactions/:id" element={<TransactionDetailPage />} />
          <Route
            path="/analytics"
            element={
              <Suspense fallback={<Spinner className="h-96" />}>
                <AnalyticsPage />
              </Suspense>
            }
          />
          <Route path="/analytics/category/:id" element={<CategoryDetailPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/categories" element={<CategoriesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
