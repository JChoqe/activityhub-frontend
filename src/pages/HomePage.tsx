import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { clasesService } from '@/services/clases.service'
import { reservasService } from '@/services/reservas.service'
import { usuarioService } from '@/services/usuario.service'
import type { Clase, Reserva } from '@/types'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? ''

function getImgUrl(foto?: string | null) {
  if (!foto) return null
  return foto.startsWith('http') ? foto : `${BASE_URL}${foto}`
}

function formatDate(date: Date) {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const weekday = cap(date.toLocaleDateString('es-ES', { weekday: 'long' }))
  const day = date.getDate()
  const month = cap(date.toLocaleDateString('es-ES', { month: 'long' }))
  return `${weekday}, ${day} De ${month}`
}

function toDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatTime(str: string) {
  try {
    const d = new Date(str)
    // Use UTC hours to stay consistent with how the backend stores times
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
  } catch {
    return str
  }
}

function apiMsg(e: unknown, fallback: string) {
  if (e && typeof e === 'object' && 'response' in e) {
    const r = (e as { response?: { data?: { message?: string } } }).response
    return r?.data?.message ?? fallback
  }
  return fallback
}

const disciplinaLabel: Record<string, string> = {
  NOGI: 'NOGI',
  MUAY_THAI: 'Muay Thai',
  MMA: 'MMA',
  WRESTLING: 'Wrestling',
}

// ─── ClassCard ─────────────────────────────────────────────────────────────────

interface CardProps {
  clase: Clase
  reserva: Reserva | undefined
  onReservar: () => void
  onCancelar: () => void
  onEliminar: () => void
  isLoading: boolean
  isAdmin: boolean
}

function ClassCard({ clase, reserva, onReservar, onCancelar, onEliminar, isLoading, isAdmin }: CardProps) {
  const isFull = (clase._count?.reservas ?? 0) >= clase.aforo

  let label = 'Reservar'
  let btnClass = 'bg-cyan-500 hover:bg-cyan-400'
  let action = onReservar
  let disabled = isLoading || (!reserva && isFull)

  if (reserva) {
    if (reserva.enCola) {
      label = 'En cola'
      btnClass = 'bg-orange-500 hover:bg-orange-400'
      action = onCancelar
      disabled = isLoading
    } else {
      label = 'Cancelar'
      btnClass = 'bg-red-500 hover:bg-red-400'
      action = onCancelar
      disabled = isLoading
    }
  }

  const imgUrl = getImgUrl(clase.profesor?.foto)
  const profesorNombre = clase.profesor
    ? `${clase.profesor.nombre} ${clase.profesor.apellido}`
    : 'Sin profesor'
  const displayName = clase.titulo || disciplinaLabel[clase.disciplina] || clase.disciplina

  return (
    <div className="bg-zinc-800 rounded-2xl p-4 flex items-center gap-4 relative">
      {isAdmin && (
        <button
          onClick={onEliminar}
          className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 transition-colors"
          title="Eliminar clase"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      )}
      <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-700 flex-shrink-0">
        {imgUrl ? (
          <img src={imgUrl} alt={profesorNombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-base leading-tight">{displayName}</p>
        <p className="text-zinc-400 text-xs mt-0.5">
          {formatTime(clase.horaInicio)} - {formatTime(clase.horaFin)} • {profesorNombre}
        </p>
        <div className="flex items-center gap-3 mt-2.5">
          <button
            onClick={action}
            disabled={disabled}
            className={`${btnClass} disabled:opacity-50 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors`}
          >
            {isLoading ? '...' : label}
          </button>
          <span className="text-zinc-400 text-xs">
            Disponibles:{' '}
            <span className="text-cyan-400 font-semibold">
              {clase._count?.reservas ?? 0}/{clase.aforo}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Shared input/select styles ────────────────────────────────────────────────

const inputCls =
  'w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500 transition'

// ─── HomePage ──────────────────────────────────────────────────────────────────

const emptyForm = {
  titulo: '',
  disciplina: 'NOGI',
  sala: 'SALA_1',
  fecha: '',
  horaInicio: '',
  horaFin: '',
  aforo: 20,
  profesorId: '',
}

type Professor = { id: number; nombre: string; apellido: string }

export default function HomePage() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const isAdmin = user?.role === 'ADMIN'

  // ── clases & reservas ──
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [allClases, setAllClases] = useState<Clase[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [actionError, setActionError] = useState('')

  // ── modal ──
  const [showModal, setShowModal] = useState(false)
  const [professors, setProfessors] = useState<Professor[]>([])
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clasesRes, reservasRes, perfilRes] = await Promise.all([
          clasesService.getAll(),
          reservasService.getMias(),
          usuarioService.getPerfil(),
        ])
        setAllClases(clasesRes.data.data)
        setReservas(reservasRes.data.data.filter((r) => r.estado === 'RESERVADO'))
        updateUser(perfilRes.data)
      } catch {
        setLoadError(true)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [updateUser])

  const clases = allClases.filter((c) => c.fecha.slice(0, 10) === toDateStr(selectedDate))
  const getReserva = (claseId: number) => reservas.find((r) => r.claseId === claseId)

  const handleReservar = async (claseId: number) => {
    setActionError('')
    setActionLoading(claseId)
    try {
      const { data } = await reservasService.create(claseId)
      setReservas((prev) => [...prev, data.reserva])
      // Only increment confirmed count — queue reservations (enCola=true) don't affect it
      if (!data.reserva.enCola) {
        setAllClases((prev) =>
          prev.map((c) =>
            c.id === claseId ? { ...c, _count: { reservas: (c._count?.reservas ?? 0) + 1 } } : c,
          ),
        )
      }
    } catch (e: unknown) {
      setActionError(apiMsg(e, 'No se pudo completar la reserva'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleEliminar = async (claseId: number) => {
    if (!confirm('¿Eliminar esta clase?')) return
    setActionError('')
    setActionLoading(claseId)
    try {
      await clasesService.delete(claseId)
      setAllClases((prev) => prev.filter((c) => c.id !== claseId))
    } catch (e: unknown) {
      setActionError(apiMsg(e, 'No se pudo eliminar la clase'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelar = async (claseId: number) => {
    const reserva = getReserva(claseId)
    if (!reserva) return
    setActionError('')
    setActionLoading(claseId)
    try {
      await reservasService.cancelar(reserva.id)
      setReservas((prev) => prev.filter((r) => r.id !== reserva.id))
      // Queue reservations (enCola=true) are not counted in _count.reservas,
      // so only decrement when cancelling a confirmed spot
      if (!reserva.enCola) {
        setAllClases((prev) =>
          prev.map((c) =>
            c.id === claseId
              ? { ...c, _count: { reservas: Math.max(0, (c._count?.reservas ?? 0) - 1) } }
              : c,
          ),
        )
      }
    } catch (e: unknown) {
      setActionError(apiMsg(e, 'No se pudo cancelar la reserva'))
    } finally {
      setActionLoading(null)
    }
  }

  // ── modal helpers ──

  const openModal = async () => {
    setForm(emptyForm)
    setFormError('')
    setShowModal(true)
    try {
      const { data } = await usuarioService.getAll(1, 100)
      setProfessors(
        (data.data as Array<Professor & { role: string }>)
          .filter((u) => u.role === 'PROFESOR'),
      )
    } catch {
      /* no professors available */
    }
  }

  const setField = (k: keyof typeof emptyForm, v: string | number) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const validate = () => {
    const t = form.titulo.trim()
    if (!t) return 'El título es obligatorio'
    if (t.length > 100) return 'El título no puede superar 100 caracteres'
    if (!form.fecha) return 'La fecha es obligatoria'
    if (!form.horaInicio) return 'La hora de inicio es obligatoria'
    if (!form.horaFin) return 'La hora de fin es obligatoria'
    if (form.horaFin <= form.horaInicio) return 'La hora fin debe ser posterior a la hora inicio'
    const aforo = Number(form.aforo)
    if (!Number.isInteger(aforo) || aforo < 1 || aforo > 500)
      return 'El aforo debe ser un número entre 1 y 500'
    return null
  }

  const handleCreate = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    const err = validate()
    if (err) { setFormError(err); return }
    setFormError('')
    setFormLoading(true)
    try {
      const payload = {
        titulo: form.titulo.trim(),
        disciplina: form.disciplina as Clase['disciplina'],
        sala: form.sala as Clase['sala'],
        fecha: form.fecha,
        horaInicio: `${form.fecha}T${form.horaInicio}:00.000Z`,
        horaFin: `${form.fecha}T${form.horaFin}:00.000Z`,
        aforo: Number(form.aforo),
        ...(form.profesorId ? { profesorId: Number(form.profesorId) } : {}),
      }
      const { data } = await clasesService.create(payload)
      setAllClases((prev) => [...prev, data.clase])
      setShowModal(false)
    } catch (e: unknown) {
      setFormError(apiMsg(e, 'Error al crear la clase'))
    } finally {
      setFormLoading(false)
    }
  }

  // ── render ──

  const sala1 = clases.filter((c) => c.sala === 'SALA_1')
  const sala2 = clases.filter((c) => c.sala === 'SALA_2')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Cargando clases...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400 text-sm text-center px-4">
          No se pudieron cargar los datos. Comprueba tu conexión e intenta de nuevo.
        </p>
      </div>
    )
  }

  const isToday = toDateStr(selectedDate) === toDateStr(new Date())

  return (
    <div className="px-4 pt-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Hola {user?.nombre}</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Splinters</p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setSelectedDate((d) => addDays(d, -1))}
            className="text-zinc-400 hover:text-white transition-colors p-0.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <p className="text-zinc-400 text-sm">{formatDate(selectedDate)}</p>
          <button
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
            className="text-zinc-400 hover:text-white transition-colors p-0.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      </div>

      <h2 className="text-white font-semibold text-lg mb-4">
        {isToday ? 'Clases disponibles hoy' : `Clases del ${formatDate(selectedDate)}`}
      </h2>

      {actionError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <p className="text-red-400 text-sm">{actionError}</p>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-300 ml-3 flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      )}

      {clases.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-12">No hay clases para este día</p>
      ) : (
        <>
          {sala1.length > 0 && (
            <div className="mb-6">
              <p className="text-cyan-500 text-sm font-semibold mb-3">Sala 1</p>
              <div className="space-y-3">
                {sala1.map((clase) => (
                  <ClassCard
                    key={clase.id}
                    clase={clase}
                    reserva={getReserva(clase.id)}
                    onReservar={() => handleReservar(clase.id)}
                    onCancelar={() => handleCancelar(clase.id)}
                    onEliminar={() => handleEliminar(clase.id)}
                    isLoading={actionLoading === clase.id}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </div>
          )}
          {sala2.length > 0 && (
            <div className="mb-6">
              <p className="text-cyan-500 text-sm font-semibold mb-3">Sala 2</p>
              <div className="space-y-3">
                {sala2.map((clase) => (
                  <ClassCard
                    key={clase.id}
                    clase={clase}
                    reserva={getReserva(clase.id)}
                    onReservar={() => handleReservar(clase.id)}
                    onCancelar={() => handleCancelar(clase.id)}
                    onEliminar={() => handleEliminar(clase.id)}
                    isLoading={actionLoading === clase.id}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Botón admin */}
      {isAdmin && (
        <button
          onClick={openModal}
          className="w-full mt-2 mb-4 flex items-center justify-center gap-2 border border-dashed border-zinc-600 hover:border-cyan-500 hover:text-cyan-500 text-zinc-500 rounded-2xl py-3 text-sm font-medium transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Añadir clase
        </button>
      )}

      {/* Modal crear clase */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-zinc-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold text-lg">Nueva clase</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              {/* Título */}
              <div>
                <label className="block text-white text-sm mb-2">
                  Título <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: NOGI Avanzado"
                  value={form.titulo}
                  onChange={(e) => setField('titulo', e.target.value)}
                  maxLength={100}
                  required
                  className={inputCls}
                />
              </div>

              {/* Disciplina + Sala */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white text-sm mb-2">
                    Disciplina <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.disciplina}
                    onChange={(e) => setField('disciplina', e.target.value)}
                    required
                    className={inputCls}
                  >
                    <option value="NOGI">NOGI</option>
                    <option value="MUAY_THAI">Muay Thai</option>
                    <option value="MMA">MMA</option>
                    <option value="WRESTLING">Wrestling</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">
                    Sala <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.sala}
                    onChange={(e) => setField('sala', e.target.value)}
                    required
                    className={inputCls}
                  >
                    <option value="SALA_1">Sala 1</option>
                    <option value="SALA_2">Sala 2</option>
                  </select>
                </div>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-white text-sm mb-2">
                  Fecha <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.fecha}
                  min={toDateStr(new Date())}
                  onChange={(e) => setField('fecha', e.target.value)}
                  required
                  className={inputCls}
                />
              </div>

              {/* Hora inicio + Hora fin */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white text-sm mb-2">
                    Hora inicio <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.horaInicio}
                    onChange={(e) => setField('horaInicio', e.target.value)}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">
                    Hora fin <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.horaFin}
                    onChange={(e) => setField('horaFin', e.target.value)}
                    required
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Aforo */}
              <div>
                <label className="block text-white text-sm mb-2">
                  Aforo <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  placeholder="20"
                  value={form.aforo}
                  min={1}
                  max={500}
                  onChange={(e) => setField('aforo', e.target.value)}
                  required
                  className={inputCls}
                />
              </div>

              {/* Profesor */}
              <div>
                <label className="block text-white text-sm mb-2">Profesor</label>
                <select
                  value={form.profesorId}
                  onChange={(e) => setField('profesorId', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Sin asignar</option>
                  {professors.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p className="text-red-400 text-sm text-center">{formError}</p>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {formLoading ? 'Creando...' : 'Crear clase'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
