import { Outlet } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-zinc-900">
      <main className="max-w-md mx-auto pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
