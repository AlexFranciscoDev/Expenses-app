import { ArrowLeftRight, ChartPie, House, Settings, Target } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/analytics', label: 'Analytics', icon: ChartPie },
  { to: '/budgets', label: 'Budgets', icon: Target },
]

export const SETTINGS_ITEM = { to: '/settings', label: 'Settings', icon: Settings }
