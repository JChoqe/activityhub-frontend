import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { usuarioService } from '@/services/usuario.service'
import { getImgUrl, apiMsg } from '@/lib/utils'
import type { Usuario } from '@/types'

const inputCls =
  'w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500 transition'

// ─── Fila de configuración ─────────────────────────────────────────────────────

function SettingRow({
  icon,
  label,
  onClick,
  border = true,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  border?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-zinc-700/50 active:bg-zinc-700 transition-colors ${border ? 'border-b border-zinc-700' : ''}`}
    >
      <span className="text-zinc-400 flex-shrink-0">{icon}</span>
      <span className="flex-1 text-left text-white text-sm">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#71717a">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
      </svg>
    </button>
  )
}

// ─── PerfilPage ────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuthStore()

  const [perfil, setPerfil] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Modal cuenta ──────────────────────────────────────────────────────────────
  const [showCuenta, setShowCuenta] = useState(false)
  const [cuentaTab, setCuentaTab] = useState<'correo' | 'contrasena'>('correo')

  const [emailForm, setEmailForm] = useState({ email: '', passwordActual: '' })
  const [emailError, setEmailError] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailOk, setEmailOk] = useState('')

  const [passForm, setPassForm] = useState({ passwordActual: '', passwordNueva: '', confirmar: '' })
  const [passError, setPassError] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [passOk, setPassOk] = useState('')

  const openCuenta = () => {
    setEmailForm({ email: perfil?.email ?? '', passwordActual: '' })
    setEmailError(''); setEmailOk('')
    setPassForm({ passwordActual: '', passwordNueva: '', confirmar: '' })
    setPassError(''); setPassOk('')
    setCuentaTab('correo')
    setShowCuenta(true)
  }

  const handleEmailSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!emailForm.email.trim()) { setEmailError('El correo es obligatorio'); return }
    if (!emailForm.passwordActual) { setEmailError('Introduce tu contraseña actual'); return }
    setEmailError(''); setEmailOk(''); setEmailLoading(true)
    try {
      await usuarioService.changeEmail({ email: emailForm.email.trim(), passwordActual: emailForm.passwordActual })
      setEmailOk('Correo actualizado correctamente')
      setPerfil((p) => p ? { ...p, email: emailForm.email.trim() } : p)
      setEmailForm((f) => ({ ...f, passwordActual: '' }))
    } catch (err) {
      setEmailError(apiMsg(err, 'Error al actualizar el correo'))
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePassSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!passForm.passwordActual) { setPassError('Introduce tu contraseña actual'); return }
    if (passForm.passwordNueva.length < 6) { setPassError('La nueva contraseña debe tener al menos 6 caracteres'); return }
    if (passForm.passwordNueva !== passForm.confirmar) { setPassError('Las contraseñas no coinciden'); return }
    setPassError(''); setPassOk(''); setPassLoading(true)
    try {
      await usuarioService.changePassword({ passwordActual: passForm.passwordActual, passwordNueva: passForm.passwordNueva })
      setPassOk('Contraseña actualizada correctamente')
      setPassForm({ passwordActual: '', passwordNueva: '', confirmar: '' })
    } catch (err) {
      setPassError(apiMsg(err, 'Error al cambiar la contraseña'))
    } finally {
      setPassLoading(false)
    }
  }

  // ── Modal perfil ───────────────────────────────────────────────────────────────
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({
    nombre: '',
    apellido: '',
    peso: '',
    genero: '',
    nacionalidad: '',
  })
  const [editError, setEditError] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    usuarioService
      .getPerfil()
      .then(({ data }) => setPerfil(data))
      .finally(() => setLoading(false))
  }, [])

  const openEdit = () => {
    if (!perfil) return
    setEditForm({
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      peso: perfil.peso?.toString() ?? '',
      genero: perfil.genero ?? '',
      nacionalidad: perfil.nacionalidad ?? '',
    })
    setEditError('')
    setShowEdit(true)
  }

  const handlePhotoChange = async (e: { target: { files: FileList | null } }) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoLoading(true)
    try {
      const { data } = await usuarioService.uploadFoto(file)
      setPerfil(data.usuario)
      updateUser({ foto: data.usuario.foto })
    } catch {
      /* silent */
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleEditSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!editForm.nombre.trim() || !editForm.apellido.trim()) {
      setEditError('Nombre y apellido son obligatorios')
      return
    }
    setEditLoading(true)
    setEditError('')
    try {
      const { data } = await usuarioService.updatePerfil({
        nombre: editForm.nombre.trim(),
        apellido: editForm.apellido.trim(),
        peso: editForm.peso ? Number(editForm.peso) : undefined,
        genero: editForm.genero || undefined,
        nacionalidad: editForm.nacionalidad.trim() || undefined,
      })
      setPerfil(data.usuario)
      updateUser({ nombre: data.usuario.nombre, apellido: data.usuario.apellido })
      setShowEdit(false)
    } catch (err) {
      setEditError(apiMsg(err, 'Error al actualizar el perfil'))
    } finally {
      setEditLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Cargando perfil...</p>
      </div>
    )
  }

  const fotoUrl = getImgUrl(perfil?.foto)
  const nombreCompleto = perfil ? `${perfil.nombre} ${perfil.apellido}` : ''
  const inicial = perfil?.nombre?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="px-4 pt-8 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Perfil</h1>
      </div>

      {/* Tarjeta principal */}
      <div className="bg-zinc-800 rounded-2xl p-4 mb-4">
        {/* Avatar + info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-600 flex-shrink-0 flex items-center justify-center">
            {fotoUrl ? (
              <img src={fotoUrl} alt={nombreCompleto} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl text-zinc-300 font-semibold">{inicial}</span>
            )}
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-snug">{nombreCompleto}</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {perfil?.peso && (
                <span className="text-xs text-zinc-400 bg-zinc-700 rounded-md px-2 py-0.5">
                  {perfil.peso}kg
                </span>
              )}
              {perfil?.genero && (
                <span className="text-xs text-zinc-400 bg-zinc-700 rounded-md px-2 py-0.5">
                  {perfil.genero}
                </span>
              )}
              {perfil?.nacionalidad && (
                <span className="text-xs text-zinc-400 bg-zinc-700 rounded-md px-2 py-0.5">
                  {perfil.nacionalidad}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Editar */}
        <button
          onClick={openEdit}
          className="w-full bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors mb-3"
        >
          Editar
        </button>

        {/* Membresía + Documentos */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
            </svg>
            Membresía
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
            Documentos
          </button>
        </div>
      </div>

      {/* Panel admin (solo ADMIN) */}
      {user?.role === 'ADMIN' && (
        <div className="bg-zinc-800 rounded-2xl overflow-hidden mb-4">
          <SettingRow
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            }
            label="Gestión de usuarios"
            onClick={() => navigate('/admin')}
            border={false}
          />
        </div>
      )}

      {/* Configuración */}
      <div className="bg-zinc-800 rounded-2xl overflow-hidden mb-4">
        <SettingRow
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          }
          label="Configuración de cuenta"
          onClick={openCuenta}
        />
        <SettingRow
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
            </svg>
          }
          label="Facturación y pago"
          onClick={() => navigate('/pedidos')}
        />
        <SettingRow
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm-1 6v2h2V7h-2zm0 4v6h2v-6h-2z" />
            </svg>
          }
          label="Contactar soporte"
          onClick={() => {}}
          border={false}
        />
      </div>

      {/* Cerrar sesión */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-950/50 hover:bg-red-900/50 border border-red-900/40 text-red-400 font-medium py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
        </svg>
        Cerrar sesión
      </button>

      {/* Modal editar cuenta */}
      {showCuenta && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCuenta(false) }}
        >
          <div className="bg-zinc-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold text-lg">Editar Cuenta</h3>
              <button onClick={() => setShowCuenta(false)} className="text-zinc-400 hover:text-white transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
              {(['correo', 'contrasena'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCuentaTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    cuentaTab === tab
                      ? 'text-cyan-500 border-b-2 border-cyan-500'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab === 'correo' ? 'Correo' : 'Contraseña'}
                </button>
              ))}
            </div>

            <div className="px-6 py-5">
              {/* ── Tab: correo ─────────────────────────────────────── */}
              {cuentaTab === 'correo' && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white text-sm mb-2">Nuevo correo <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      placeholder="nuevo@email.com"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm((p) => ({ ...p, email: e.target.value }))}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">Contraseña actual <span className="text-red-400">*</span></label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={emailForm.passwordActual}
                      onChange={(e) => setEmailForm((p) => ({ ...p, passwordActual: e.target.value }))}
                      required
                      className={inputCls}
                    />
                  </div>
                  {emailError && <p className="text-red-400 text-sm text-center">{emailError}</p>}
                  {emailOk    && <p className="text-cyan-400 text-sm text-center">{emailOk}</p>}
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    {emailLoading ? 'Guardando...' : 'Actualizar correo'}
                  </button>
                </form>
              )}

              {/* ── Tab: contraseña ─────────────────────────────────── */}
              {cuentaTab === 'contrasena' && (
                <form onSubmit={handlePassSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white text-sm mb-2">Contraseña actual <span className="text-red-400">*</span></label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passForm.passwordActual}
                      onChange={(e) => setPassForm((p) => ({ ...p, passwordActual: e.target.value }))}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">Nueva contraseña <span className="text-red-400">*</span></label>
                    <input
                      type="password"
                      placeholder="Mín. 6 caracteres"
                      value={passForm.passwordNueva}
                      onChange={(e) => setPassForm((p) => ({ ...p, passwordNueva: e.target.value }))}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">Confirmar contraseña <span className="text-red-400">*</span></label>
                    <input
                      type="password"
                      placeholder="Repite la nueva contraseña"
                      value={passForm.confirmar}
                      onChange={(e) => setPassForm((p) => ({ ...p, confirmar: e.target.value }))}
                      required
                      className={inputCls}
                    />
                  </div>
                  {passError && <p className="text-red-400 text-sm text-center">{passError}</p>}
                  {passOk    && <p className="text-cyan-400 text-sm text-center">{passOk}</p>}
                  <button
                    type="submit"
                    disabled={passLoading}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    {passLoading ? 'Guardando...' : 'Cambiar contraseña'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal editar perfil */}
      {showEdit && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEdit(false)
          }}
        >
          <div className="bg-zinc-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold text-lg">Editar perfil</h3>
              <button
                onClick={() => setShowEdit(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center">
                    {fotoUrl ? (
                      <img src={fotoUrl} alt={nombreCompleto} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-zinc-300 font-semibold">{inicial}</span>
                    )}
                    {photoLoading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#06b6d4" className="animate-spin">
                          <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={photoLoading}
                    className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 rounded-full p-1.5 transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                      <path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z" />
                    </svg>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Nombre + Apellido */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white text-sm mb-2">
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.nombre}
                    onChange={(e) => setEditForm((p) => ({ ...p, nombre: e.target.value }))}
                    maxLength={50}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">
                    Apellido <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.apellido}
                    onChange={(e) => setEditForm((p) => ({ ...p, apellido: e.target.value }))}
                    maxLength={50}
                    required
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Peso + Género */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white text-sm mb-2">Peso (kg)</label>
                  <input
                    type="number"
                    placeholder="70"
                    value={editForm.peso}
                    onChange={(e) => setEditForm((p) => ({ ...p, peso: e.target.value }))}
                    min="1"
                    max="300"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Género</label>
                  <select
                    value={editForm.genero}
                    onChange={(e) => setEditForm((p) => ({ ...p, genero: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">—</option>
                    <option value="H">H (Hombre)</option>
                    <option value="M">M (Mujer)</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Nacionalidad */}
              <div>
                <label className="block text-white text-sm mb-2">Nacionalidad</label>
                <input
                  type="text"
                  placeholder="España"
                  value={editForm.nacionalidad}
                  onChange={(e) => setEditForm((p) => ({ ...p, nacionalidad: e.target.value }))}
                  maxLength={60}
                  className={inputCls}
                />
              </div>

              {editError && (
                <p className="text-red-400 text-sm text-center">{editError}</p>
              )}

              <button
                type="submit"
                disabled={editLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {editLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
