import { NavLink, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { NAV_ITEMS, SETTINGS_ITEM } from './navItems.js'
import { useData } from '../../context/DataContext.jsx'

function SideLink({ item }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-brand-soft text-brand' : 'text-ink-soft hover:bg-subtle'
        }`
      }
    >
      <Icon size={19} />
      {item.label}
    </NavLink>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { profile } = useData()
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 xl:flex">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">L</div>
        <span className="text-lg font-semibold tracking-tight">Ledger</span>
      </div>
      <button
        type="button"
        onClick={() => navigate('/transactions/new')}
        className="mb-6 flex h-11 items-center justify-center gap-2 rounded-2xl bg-brand text-sm font-semibold text-white shadow-[0_6px_16px_rgb(47_107_255/0.28)] hover:bg-brand-600"
      >
        <Plus size={18} /> Add transaction
      </button>
      <nav className="flex flex-col gap-1" aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <SideLink key={item.to} item={item} />
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1">
        <SideLink item={SETTINGS_ITEM} />
        {profile?.display_name && <p className="truncate px-3 pt-3 text-xs text-muted">Signed in as {profile.display_name}</p>}
      </div>
    </aside>
  )
}
