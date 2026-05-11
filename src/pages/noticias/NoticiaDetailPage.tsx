import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { noticiasService } from '@/services/noticias.service'
import type { Noticia } from '@/types'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? ''

function getImgUrl(foto?: string | null) {
  if (!foto) return null
  return foto.startsWith('http') ? foto : `${BASE_URL}${foto}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function NoticiaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [noticia, setNoticia] = useState<Noticia | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    noticiasService
      .getById(Number(id))
      .then(({ data }) => setNoticia(data))
      .catch(() => setError('No se pudo cargar la noticia'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Cargando...</p>
      </div>
    )
  }

  if (error || !noticia) {
    return (
      <div className="px-4 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Volver
        </button>
        <p className="text-zinc-500 text-sm text-center py-12">{error || 'Noticia no encontrada'}</p>
      </div>
    )
  }

  const autorNombre = noticia.autor
    ? `${noticia.autor.nombre} ${noticia.autor.apellido}`
    : 'Autor desconocido'
  const autorFotoUrl = getImgUrl(noticia.autor?.foto)

  return (
    <div className="px-4 pt-8 pb-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        Volver
      </button>

      {/* Title */}
      <h1 className="text-2xl font-bold text-white leading-snug mb-4">
        {noticia.titulo}
      </h1>

      {/* Author row */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-zinc-800">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-700 flex-shrink-0 flex items-center justify-center">
          {autorFotoUrl ? (
            <img src={autorFotoUrl} alt={autorNombre} className="w-full h-full object-cover" />
          ) : (
            <span className="text-zinc-300 text-xs font-semibold">
              {autorNombre.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <p className="text-white text-sm font-medium">{autorNombre}</p>
          <p className="text-zinc-500 text-xs">{formatDate(noticia.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
        {noticia.contenido}
      </p>
    </div>
  )
}
