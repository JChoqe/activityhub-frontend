import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { noticiasService } from '@/services/noticias.service'
import { apiMsg } from '@/lib/utils'
import type { Noticia } from '@/types'

const inputCls =
  'w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500 transition'

export default function NoticiasPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const canCreate = user?.role === 'PROFESOR' || user?.role === 'ADMIN'
  const isAdmin = user?.role === 'ADMIN'

  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)

  // ── modal ──
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ titulo: '', contenido: '' })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    noticiasService
      .getAll()
      .then(({ data }) => setNoticias(data.data))
      .finally(() => setLoading(false))
  }, [])

  const openModal = () => {
    setForm({ titulo: '', contenido: '' })
    setFormError('')
    setShowModal(true)
  }

  const handleCreate = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!form.titulo.trim()) { setFormError('El título es obligatorio'); return }
    if (!form.contenido.trim()) { setFormError('El contenido es obligatorio'); return }
    setFormError('')
    setFormLoading(true)
    try {
      const { data } = await noticiasService.create({
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim(),
      })
      setNoticias((prev) => [data.noticia, ...prev])
      setShowModal(false)
    } catch (e: unknown) {
      setFormError(apiMsg(e, 'Error al publicar la noticia'))
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta noticia?')) return
    setDeleteLoading(id)
    try {
      await noticiasService.delete(id)
      setNoticias((prev) => prev.filter((n) => n.id !== id))
    } catch {
      /* silent */
    } finally {
      setDeleteLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Cargando noticias...</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Novedades</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Últimas noticias</p>
      </div>

      {/* Lista */}
      {noticias.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-12">No hay noticias disponibles</p>
      ) : (
        <div className="space-y-3">
          {noticias.map((n) => (
            <div
              key={n.id}
              onClick={() => navigate(`/noticias/${n.id}`)}
              className="bg-zinc-800 rounded-2xl p-4 relative cursor-pointer active:opacity-80 transition-opacity"
            >
              {isAdmin && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(n.id) }}
                  disabled={deleteLoading === n.id}
                  className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40"
                  title="Eliminar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
              )}

              <h3 className={`text-white font-bold text-base leading-snug ${isAdmin ? 'pr-6' : ''}`}>
                {n.titulo}
              </h3>
              <p className="text-zinc-400 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                {n.contenido}
              </p>
              <p className="text-zinc-500 text-xs mt-3">
                Por{' '}
                {n.autor
                  ? `${n.autor.nombre} ${n.autor.apellido}`
                  : 'Autor desconocido'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Botón publicar */}
      {canCreate && (
        <button
          onClick={openModal}
          className="w-full mt-4 mb-4 flex items-center justify-center gap-2 border border-dashed border-zinc-600 hover:border-cyan-500 hover:text-cyan-500 text-zinc-500 rounded-2xl py-3 text-sm font-medium transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Publicar noticia
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-zinc-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold text-lg">Nueva noticia</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-white text-sm mb-2">
                  Título <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Título de la noticia"
                  value={form.titulo}
                  onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                  maxLength={150}
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">
                  Contenido <span className="text-red-400">*</span>
                </label>
                <textarea
                  placeholder="Escribe el contenido..."
                  value={form.contenido}
                  onChange={(e) => setForm((p) => ({ ...p, contenido: e.target.value }))}
                  rows={5}
                  required
                  className={`${inputCls} resize-none`}
                />
              </div>

              {formError && (
                <p className="text-red-400 text-sm text-center">{formError}</p>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {formLoading ? 'Publicando...' : 'Publicar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
