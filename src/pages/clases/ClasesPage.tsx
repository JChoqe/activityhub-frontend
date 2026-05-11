import { useState, useEffect, useCallback } from 'react'
import { clasesService } from '@/services/clases.service'
import { reservasService } from '@/services/reservas.service'
import { getImgUrl, apiMsg } from '@/lib/utils'
import type { Clase, Disciplina } from '@/types'

const disciplinaLabel: Record<Disciplina, string> = {
  NOGI: 'NOGI',
  MUAY_THAI: 'Muay Thai',
  MMA: 'MMA',
  WRESTLING: 'Wrestling',
}

const disciplinaColor: Record<Disciplina, string> = {
  NOGI: 'bg-blue-500/20 text-blue-400',
  MUAY_THAI: 'bg-red-500/20 text-red-400',
  MMA: 'bg-orange-500/20 text-orange-400',
  WRESTLING: 'bg-purple-500/20 text-purple-400',
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function formatFecha(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatFechaCorta(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

// ─── ClaseCard ─────────────────────────────────────────────────────────────────

interface ClaseCardProps {
  clase: Clase
  onReservar: (clase: Clase) => void
  reservandoId: number | null
  misClaseIds: Set<number>
}

function ClaseCard({ clase, onReservar, reservandoId, misClaseIds }: ClaseCardProps) {
  const reservasActivas = clase._count?.reservas ?? 0
  const plazasLibres = clase.aforo - reservasActivas
  const llena = plazasLibres <= 0
  const yaReservada = misClaseIds.has(clase.id)
  const loading = reservandoId === clase.id
  const fotoProfe = getImgUrl(clase.profesor?.foto)

  return (
    <div className="bg-zinc-800 rounded-2xl p-4">
      {/* Header: disciplina + sala */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${disciplinaColor[clase.disciplina]}`}>
          {disciplinaLabel[clase.disciplina]}
        </span>
        <span className="text-zinc-500 text-xs">{clase.sala.replace('_', ' ')}</span>
      </div>

      {/* Título */}
      <h3 className="text-white font-bold text-base leading-snug mb-2">{clase.titulo}</h3>

      {/* Horario */}
      <div className="flex items-center gap-1.5 text-zinc-400 text-sm mb-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
        </svg>
        <span>{formatHora(clase.horaInicio)} – {formatHora(clase.horaFin)}</span>
      </div>

      {/* Profesor */}
      {clase.profesor && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-600 flex-shrink-0 flex items-center justify-center">
            {fotoProfe ? (
              <img src={fotoProfe} alt={clase.profesor.nombre} className="w-full h-full object-cover" />
            ) : (
              <span className="text-zinc-300 text-xs font-semibold">
                {clase.profesor.nombre.charAt(0)}
              </span>
            )}
          </div>
          <span className="text-zinc-400 text-sm">
            {clase.profesor.nombre} {clase.profesor.apellido}
          </span>
        </div>
      )}

      {/* Aforo + botón */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill={llena ? '#ef4444' : '#71717a'}>
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
          <span className={`text-xs font-medium ${llena ? 'text-red-400' : 'text-zinc-400'}`}>
            {llena ? 'Lleno' : `${plazasLibres} plaza${plazasLibres !== 1 ? 's' : ''}`}
          </span>
        </div>

        {yaReservada ? (
          <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl">
            Reservado
          </span>
        ) : (
          <button
            onClick={() => onReservar(clase)}
            disabled={loading}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 ${
              llena
                ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                : 'bg-cyan-500 hover:bg-cyan-400 text-white'
            }`}
          >
            {loading ? '...' : llena ? 'Cola' : 'Reservar'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── ClasesPage ────────────────────────────────────────────────────────────────

export default function ClasesPage() {
  const [clases, setClases] = useState<Clase[]>([])
  const [misClaseIds, setMisClaseIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [reservandoId, setReservandoId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null)

  const showToast = useCallback((ok: boolean, text: string) => {
    setToast({ ok, text })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    Promise.all([
      clasesService.getAll(),
      reservasService.getMias(),
    ])
      .then(([clasesRes, reservasRes]) => {
        setClases(clasesRes.data.data)
        const ids = new Set(reservasRes.data.data.map((r) => r.claseId))
        setMisClaseIds(ids)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleReservar = async (clase: Clase) => {
    setReservandoId(clase.id)
    try {
      const { data } = await reservasService.create(clase.id)
      setMisClaseIds((prev) => new Set([...prev, clase.id]))
      showToast(true, data.message)
    } catch (err) {
      showToast(false, apiMsg(err, 'Error al realizar la reserva'))
    } finally {
      setReservandoId(null)
    }
  }

  // Agrupar por fecha
  const grouped = clases.reduce<Record<string, Clase[]>>((acc, clase) => {
    const key = clase.fecha
    if (!acc[key]) acc[key] = []
    acc[key].push(clase)
    return acc
  }, {})

  // Obtener fechas únicas ordenadas
  const fechas = Object.keys(grouped).sort()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Cargando clases...</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 pb-6">
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

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Clases</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Próximas sesiones disponibles</p>
      </div>

      {clases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#3f3f46">
            <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
          </svg>
          <p className="text-zinc-500 text-sm">No hay clases programadas</p>
        </div>
      ) : (
        <div className="space-y-6">
          {fechas.map((fecha) => (
            <section key={fecha}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-cyan-500 font-semibold text-sm capitalize">
                  {formatFecha(fecha)}
                </h2>
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-zinc-600 text-xs">{formatFechaCorta(fecha)}</span>
              </div>
              <div className="space-y-3">
                {grouped[fecha].map((clase) => (
                  <ClaseCard
                    key={clase.id}
                    clase={clase}
                    onReservar={handleReservar}
                    reservandoId={reservandoId}
                    misClaseIds={misClaseIds}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
