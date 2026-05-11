import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { usuarioService } from '@/services/usuario.service'
import type { Role, Usuario } from '@/types'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? ''

function getImgUrl(foto?: string | null) {
  if (!foto) return null
  return foto.startsWith('http') ? foto : `${BASE_URL}${foto}`
}

function apiMsg(e: unknown, fallback: string) {
  if (e && typeof e === 'object' && 'response' in e) {
    const r = (e as { response?: { data?: { message?: string } } }).response
    return r?.data?.message ?? fallback
  }
  return fallback
}

type UsuarioAdmin = Pick<Usuario, 'id' | 'nombre' | 'apellido' | 'email' | 'role' | 'foto'>

const ROLES: Role[] = ['ALUMNO', 'PROFESOR', 'ADMIN']

const roleBadgeCls: Record<Role, string> = {
  ADMIN:    'bg-cyan-500/20 text-cyan-400',
  PROFESOR: 'bg-yellow-500/20 text-yellow-400',
  ALUMNO:   'bg-zinc-700 text-zinc-400',
}

// ─── Fila de usuario ───────────────────────────────────────────────────────────

interface UserRowProps {
  usuario: UsuarioAdmin
  roleLoading: boolean
  deleteLoading: boolean
  onRoleChange: (id: number, role: Role) => void
  onDelete: (id: number, nombre: string) => void
}

function UserRow({ usuario, roleLoading, deleteLoading, onRoleChange, onDelete }: UserRowProps) {
  const imgUrl = getImgUrl(usuario.foto)
  const inicial = usuario.nombre.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-600 flex-shrink-0 flex items-center justify-center">
        {imgUrl ? (
          <img src={imgUrl} alt={usuario.nombre} className="w-full h-full object-cover" />
        ) : (
          <span className="text-zinc-300 text-sm font-semibold">{inicial}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">
          {usuario.nombre} {usuario.apellido}
        </p>
        <p className="text-zinc-500 text-xs truncate">{usuario.email}</p>
      </div>

      {/* Role select */}
      <select
        value={usuario.role}
        onChange={(e) => onRoleChange(usuario.id, e.target.value as Role)}
        disabled={roleLoading}
        className={`text-xs font-medium rounded-lg px-2 py-1.5 border-0 outline-none cursor-pointer disabled:opacity-50 transition-colors ${roleBadgeCls[usuario.role]} bg-transparent`}
        style={{ WebkitAppearance: 'none', appearance: 'none' }}
      >
        {ROLES.map((r) => (
          <option key={r} value={r} className="bg-zinc-800 text-white">
            {r}
          </option>
        ))}
      </select>

      {/* Delete */}
      <button
        onClick={() => onDelete(usuario.id, `${usuario.nombre} ${usuario.apellido}`)}
        disabled={deleteLoading}
        className="text-zinc-600 hover:text-red-400 disabled:opacity-40 transition-colors flex-shrink-0"
        title="Eliminar usuario"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
      </button>
    </div>
  )
}

// ─── AdminPage ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [roleLoading, setRoleLoading] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    usuarioService
      .getAll(1, 100)
      .then(({ data }) => {
        const lista = (data as { data: UsuarioAdmin[] }).data
        setUsuarios(lista.filter((u) => u.id !== currentUser?.id))
      })
      .catch(() => setError('No se pudo cargar la lista de usuarios'))
      .finally(() => setLoading(false))
  }, [currentUser?.id])

  const showToast = (ok: boolean, text: string) => {
    setToast({ ok, text })
    setTimeout(() => setToast(null), 2500)
  }

  const handleRoleChange = async (id: number, role: Role) => {
    setRoleLoading(id)
    try {
      await usuarioService.changeRol(id, role)
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
      showToast(true, 'Rol actualizado')
    } catch (err) {
      showToast(false, apiMsg(err, 'Error al cambiar el rol'))
    } finally {
      setRoleLoading(null)
    }
  }

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return
    setDeleteLoading(id)
    try {
      await usuarioService.deleteUsuario(id)
      setUsuarios((prev) => prev.filter((u) => u.id !== id))
      showToast(true, `${nombre} eliminado`)
    } catch (err) {
      showToast(false, apiMsg(err, 'Error al eliminar el usuario'))
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <div className="px-4 pt-8 pb-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/perfil')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Volver
        </button>
        <h1 className="text-2xl font-bold text-white">Usuarios</h1>
        {!loading && (
          <p className="text-zinc-400 text-sm mt-0.5">{usuarios.length} usuarios registrados</p>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all ${
            toast.ok ? 'bg-cyan-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <p className="text-zinc-500 text-sm">Cargando usuarios...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm text-center py-12">{error}</p>
      )}

      {/* Lista */}
      {!loading && !error && usuarios.length === 0 && (
        <p className="text-zinc-500 text-sm text-center py-12">No hay otros usuarios registrados</p>
      )}

      {!loading && !error && usuarios.length > 0 && (
        <div className="bg-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-700">
          {usuarios.map((u) => (
            <UserRow
              key={u.id}
              usuario={u}
              roleLoading={roleLoading === u.id}
              deleteLoading={deleteLoading === u.id}
              onRoleChange={handleRoleChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
