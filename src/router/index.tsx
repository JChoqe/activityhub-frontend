import { createBrowserRouter } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'

// Layouts
import MainLayout from '@/layouts/MainLayout'

// Páginas públicas
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Páginas privadas
import HomePage from '@/pages/HomePage'
import ClasesPage from '@/pages/clases/ClasesPage'
import MisReservasPage from '@/pages/reservas/MisReservasPage'
import NoticiasPage from '@/pages/noticias/NoticiasPage'
import NoticiaDetailPage from '@/pages/noticias/NoticiaDetailPage'
import TiendaPage from '@/pages/tienda/TiendaPage'
import ProductoDetailPage from '@/pages/tienda/ProductoDetailPage'
import CarritoPage from '@/pages/carrito/CarritoPage'
import PedidosPage from '@/pages/pedidos/PedidosPage'
import PerfilPage from '@/pages/perfil/PerfilPage'
import EstadisticasPage from '@/pages/estadisticas/EstadisticasPage'

// Admin
import AdminPage from '@/pages/admin/AdminPage'

export const router = createBrowserRouter([
  // Rutas públicas
  { path: '/login',    element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // Rutas privadas (cualquier usuario autenticado)
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/',                  element: <HomePage /> },
          { path: '/clases',            element: <ClasesPage /> },
          { path: '/mis-reservas',      element: <MisReservasPage /> },
          { path: '/noticias',          element: <NoticiasPage /> },
          { path: '/noticias/:id',      element: <NoticiaDetailPage /> },
          { path: '/tienda',            element: <TiendaPage /> },
          { path: '/tienda/:id',        element: <ProductoDetailPage /> },
          { path: '/carrito',           element: <CarritoPage /> },
          { path: '/pedidos',           element: <PedidosPage /> },
          { path: '/perfil',            element: <PerfilPage /> },
          { path: '/estadisticas',      element: <EstadisticasPage /> },
        ],
      },
    ],
  },

  // Rutas solo Admin
  {
    element: <PrivateRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/admin', element: <AdminPage /> },
        ],
      },
    ],
  },
])
