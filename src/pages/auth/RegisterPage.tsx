import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authService.register(form)
      login(data)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">

        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white tracking-wide">activityHub</h1>
          <p className="text-gray-400 text-sm mt-1">Crea tu cuenta</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white text-sm mb-2">Nombre</label>
              <input
                type="text"
                placeholder="Juan"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-2">Apellido</label>
              <input
                type="text"
                placeholder="García"
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Correo electrónico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500 transition"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        {/* Login */}
        <p className="text-center text-zinc-500 text-sm mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-cyan-500 hover:text-cyan-400">
            Inicia sesión
          </Link>
        </p>

      </div>
    </div>
  )
}
