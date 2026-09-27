import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav.jsx'
import Sidebar from './Sidebar.jsx'

export default function AppLayout() {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-32 pt-safe lg:pb-12">
        <div className="mx-auto w-full max-w-md px-4 sm:max-w-2xl sm:px-6 lg:max-w-6xl lg:px-10 lg:pt-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
