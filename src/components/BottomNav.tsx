import { NavLink } from 'react-router-dom'

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  )
}

function StatsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 9v11H1V9h4zm8-5v16H9V4h4zm4 8v8h-4v-8h4zm4-4v12h-4V8h4z" />
    </svg>
  )
}

function NewsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11H7v-2h8v2zm2-4H7v-2h10v2z" />
    </svg>
  )
}

function ShopIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm0 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  )
}

const navItems = [
  { to: '/',             icon: <HomeIcon />,   end: true  },
  { to: '/estadisticas', icon: <StatsIcon />,  end: false },
  { to: '/noticias',     icon: <NewsIcon />,   end: false },
  { to: '/tienda',       icon: <ShopIcon />,   end: false },
  { to: '/perfil',       icon: <PersonIcon />, end: false },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-zinc-900 border-t border-zinc-800 z-50">
      <div className="max-w-md mx-auto flex">
        {navItems.map(({ to, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center py-4 transition-colors ${
                isActive ? 'text-cyan-500' : 'text-zinc-500 hover:text-zinc-300'
              }`
            }
          >
            {icon}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
