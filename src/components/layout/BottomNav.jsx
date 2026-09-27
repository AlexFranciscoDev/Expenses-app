import { NavLink, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { NAV_ITEMS } from './navItems.js'

function NavItem({ item }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-medium transition-colors ${
          isActive ? 'text-brand' : 'text-muted hover:text-ink-soft'
        }`
      }
    >
      <Icon size={21} strokeWidth={2} />
      <span>{item.label}</span>
    </NavLink>
  )
}

export default function BottomNav() {
  const navigate = useNavigate()
  const [first, second, third, fourth] = NAV_ITEMS
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-safe lg:hidden" aria-label="Main">
      <div className="mx-auto mb-2 flex max-w-md items-center rounded-[1.75rem] border border-line bg-surface/95 px-2 py-1.5 shadow-float backdrop-blur">
        <NavItem item={first} />
        <NavItem item={second} />
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={() => navigate('/transactions/new')}
            aria-label="Add transaction"
            className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_rgb(47_107_255/0.4)] ring-4 ring-canvas transition-transform active:scale-95"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
        </div>
        <NavItem item={third} />
        <NavItem item={fourth} />
      </div>
    </nav>
  )
}
