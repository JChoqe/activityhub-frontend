import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold text-gray-900">
          ActivityHub
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/clases"       className="text-sm text-gray-600 hover:text-gray-900">Clases</Link>
          <Link to="/mis-reservas" className="text-sm text-gray-600 hover:text-gray-900">Mis Reservas</Link>
          <Link to="/noticias"     className="text-sm text-gray-600 hover:text-gray-900">Noticias</Link>
          <Link to="/tienda"       className="text-sm text-gray-600 hover:text-gray-900">Tienda</Link>
          <Link to="/estadisticas" className="text-sm text-gray-600 hover:text-gray-900">Estadísticas</Link>

          {(user?.role === 'ADMIN' || user?.role === 'PROFESOR') && (
            <Link to="/admin" className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/carrito" className="text-sm text-gray-600 hover:text-gray-900">🛒 Carrito</Link>
          <Link to="/perfil"  className="text-sm text-gray-600 hover:text-gray-900">
            {user?.nombre}
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
