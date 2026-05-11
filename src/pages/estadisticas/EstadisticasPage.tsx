import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { usuarioService } from '@/services/usuario.service'
import { getImgUrl } from '@/lib/utils'
import type { MisEstadisticas, RankingEntry } from '@/types'

const disciplinaLabel: Record<string, string> = {
  NOGI: 'NOGI',
  MUAY_THAI: 'Muay Thai',
  MMA: 'MMA',
  WRESTLING: 'Wrestling',
}

// ─── Trophy badge ──────────────────────────────────────────────────────────────

function PositionBadge({ pos }: { pos: number }) {
  if (pos === 1) {
    return (
      <span className="w-8 h-8 flex items-center justify-center flex-shrink-0">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#FFD700">
          <path d="M19 5h-2V3H7v2H5C3.9 5 3 5.9 3 7v1c0 2.55 1.92 4.63 4.39 4.94C8.22 14.6 9.97 16 12 16s3.78-1.4 4.61-3.06C18.08 12.63 20 10.55 20 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3c-1.2-.5-2-1.64-2-2zm14 0c0 .96-.8 1.95-2 2.43V7h2v1z" />
          <path d="M12 18c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2zm-3 3h6v1H9z" fill="#FFD700" />
        </svg>
      </span>
    )
  }
  if (pos === 2) {
    return (
      <span className="w-8 h-8 flex items-center justify-center flex-shrink-0">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#B0B8C1">
          <path d="M19 5h-2V3H7v2H5C3.9 5 3 5.9 3 7v1c0 2.55 1.92 4.63 4.39 4.94C8.22 14.6 9.97 16 12 16s3.78-1.4 4.61-3.06C18.08 12.63 20 10.55 20 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3c-1.2-.5-2-1.64-2-2zm14 0c0 .96-.8 1.95-2 2.43V7h2v1z" />
          <path d="M12 18c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2zm-3 3h6v1H9z" fill="#B0B8C1" />
        </svg>
      </span>
    )
  }
  if (pos === 3) {
    return (
      <span className="w-8 h-8 flex items-center justify-center flex-shrink-0">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#CD7F32">
          <path d="M19 5h-2V3H7v2H5C3.9 5 3 5.9 3 7v1c0 2.55 1.92 4.63 4.39 4.94C8.22 14.6 9.97 16 12 16s3.78-1.4 4.61-3.06C18.08 12.63 20 10.55 20 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3c-1.2-.5-2-1.64-2-2zm14 0c0 .96-.8 1.95-2 2.43V7h2v1z" />
          <path d="M12 18c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2zm-3 3h6v1H9z" fill="#CD7F32" />
        </svg>
      </span>
    )
  }
  return (
    <span className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
      <span className="text-zinc-400 text-xs font-bold">{pos}</span>
    </span>
  )
}

// ─── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ foto, nombre }: { foto?: string | null; nombre: string }) {
  const url = getImgUrl(foto)
  return (
    <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-600 flex-shrink-0 flex items-center justify-center">
      {url ? (
        <img src={url} alt={nombre} className="w-full h-full object-cover" />
      ) : (
        <span className="text-zinc-300 text-xs font-semibold">
          {nombre.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}

// ─── EstadisticasPage ──────────────────────────────────────────────────────────

export default function EstadisticasPage() {
  const user = useAuthStore((s) => s.user)

  const [stats, setStats] = useState<MisEstadisticas | null>(null)
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, rankingRes] = await Promise.all([
          usuarioService.getMisEstadisticas(),
          usuarioService.getRanking(),
        ])
        setStats(statsRes.data)
        setRanking(rankingRes.data.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Cargando estadísticas...</p>
      </div>
    )
  }

  const maxAsistencias = stats
    ? Math.max(...stats.estadisticas.map((e) => e.asistencias), 1)
    : 1

  return (
    <div className="px-4 pt-8 pb-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Estadísticas</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Tu actividad en Splinters</p>
      </div>

      {/* Clases por tipo */}
      <section className="mb-8">
        <h2 className="text-cyan-500 font-semibold text-base mb-5">Clases por tipo</h2>

        {stats && stats.estadisticas.length > 0 ? (
          <div className="space-y-5">
            {stats.estadisticas.map((e) => {
              const pct = Math.round((e.asistencias / maxAsistencias) * 100)
              return (
                <div key={e.disciplina}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-white text-sm">
                      {disciplinaLabel[e.disciplina] ?? e.disciplina}
                    </span>
                    <span className="text-zinc-400 text-xs">{e.asistencias} clases</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-3">
                    <div
                      className="bg-cyan-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">Aún no tienes clases registradas</p>
        )}
      </section>

      {/* Ranking del mes */}
      <section>
        <h2 className="text-cyan-500 font-semibold text-base mb-4">Ranking del mes</h2>

        {ranking.length > 0 ? (
          <div className="bg-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-700">
            {ranking.map((entry) => {
              const isMe = entry.usuario?.id === user?.id
              const nombre = entry.usuario
                ? `${entry.usuario.nombre} ${entry.usuario.apellido}`
                : 'Usuario'
              return (
                <div key={entry.posicion} className="flex items-center gap-3 px-4 py-3.5">
                  <PositionBadge pos={entry.posicion} />
                  <Avatar foto={entry.usuario?.foto} nombre={nombre} />
                  <span
                    className={`flex-1 text-sm font-medium ${
                      isMe ? 'text-cyan-400' : 'text-white'
                    }`}
                  >
                    {nombre}
                  </span>
                  <span className="text-zinc-400 text-sm font-medium">
                    {entry.reservas} pts
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">No hay datos de ranking este mes</p>
        )}
      </section>
    </div>
  )
}
