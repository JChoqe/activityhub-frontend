import { useState, useEffect } from 'react'
import { reservasService } from '@/services/reservas.service'
import { getImgUrl, apiMsg } from '@/lib/utils'
import type { Reserva, Disciplina } from '@/types'

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

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

// ─── ReservaCard ───────────────────────────────────────────────────────────────

interface ReservaCardProps {
  reserva: Reserva
  cancelando: boolean
  onCancelar: (id: number) => void
}

function ReservaCard({ reserva, cancelando, onCancelar }: ReservaCardProps) {
  const clase = reserva.clase
  if (!clase) return null

  const fotoProfe = getImgUrl(clase.profesor?.foto)

  return (
    <div className="bg-zinc-800 rounded-2xl p-4">
      {/* Disciplina + cola */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${disciplinaColor[clase.disciplina]}`}>
          {disciplinaLabel[clase.disciplina]}
        </span>
        {reserva.enCola && (
          <span className="text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-lg">
            Cola #{reserva.posicion}
          </span>
        )}
      </div>

      {/* Título */}
      <h3 className="text-white font-bold text-base leading-snug mb-2">{clase.titulo}</h3>

      {/* Fecha + hora */}
      <div className="flex items-center gap-3 text-zinc-400 text-sm mb-3">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
          </svg>
          <span className="capitalize">{formatFecha(clase.fecha)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
          </svg>
          <span>{formatHora(clase.horaInicio)} – {formatHora(clase.horaFin)}</span>
        </div>
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

      {/* Sala + cancelar */}
      <div className="flex items-center justify-between">
        <span className="text-zinc-500 text-xs">{clase.sala.replace('_', ' ')}</span>
        <button
          onClick={() => onCancelar(reserva.id)}
          disabled={cancelando}
          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors font-medium"
        >
          {cancelando ? 'Cancelando...' : 'Cancelar reserva'}
        </button>
      </div>
    </div>
  )
}

// ─── MisReservasPage ───────────────────────────────────────────────────────────

export default function MisReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelandoId, setCancelandoId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null)

  const showToast = (ok: boolean, text: string) => {
    setToast({ ok, text })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    reservasService
      .getMias()
      .then(({ data }) => setReservas(data.data))
      .finally(() => setLoading(false))
  }, [])

  const handleCancelar = async (id: number) => {
    if (!confirm('¿Cancelar esta reserva?')) return
    setCancelandoId(id)
    try {
      await reservasService.cancelar(id)
      setReservas((prev) => prev.filter((r) => r.id !== id))
      showToast(true, 'Reserva cancelada')
    } catch (err) {
      showToast(false, apiMsg(err, 'Error al cancelar la reserva'))
    } finally {
      setCancelandoId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Cargando reservas...</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 pb-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg ${
            toast.ok ? 'bg-cyan-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mis Reservas</h1>
        {!loading && (
          <p className="text-zinc-400 text-sm mt-0.5">
            {reservas.length === 0
              ? 'No tienes reservas próximas'
              : `${reservas.length} clase${reservas.length !== 1 ? 's' : ''} reservada${reservas.length !== 1 ? 's' : ''}`}
          </p>
        )}
      </div>

      {reservas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#3f3f46">
            <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
          </svg>
          <p className="text-zinc-500 text-sm">No tienes clases reservadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservas.map((reserva) => (
            <ReservaCard
              key={reserva.id}
              reserva={reserva}
              cancelando={cancelandoId === reserva.id}
              onCancelar={handleCancelar}
            />
          ))}
        </div>
      )}
    </div>
  )
}
