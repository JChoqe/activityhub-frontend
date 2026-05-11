import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { carritoService } from '@/services/carrito.service'
import type { Carrito, ItemCarrito } from '@/types'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? ''

function getImgUrl(img?: string | null) {
  if (!img) return null
  return img.startsWith('http') ? img : `${BASE_URL}${img}`
}

function apiMsg(e: unknown, fallback: string) {
  if (e && typeof e === 'object' && 'response' in e) {
    const r = (e as { response?: { data?: { message?: string } } }).response
    return r?.data?.message ?? fallback
  }
  return fallback
}

// ─── Item row ──────────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: ItemCarrito
  busy: boolean
  onUpdate: (item: ItemCarrito, nuevaCantidad: number) => void
}

function ItemRow({ item, busy, onUpdate }: ItemRowProps) {
  const imgUrl = getImgUrl(item.producto?.imagen)
  const precio = item.producto?.precio ?? 0

  return (
    <div className="bg-zinc-800 rounded-2xl p-4 flex items-center gap-3">
      {/* Imagen */}
      <div className="w-16 h-16 rounded-xl bg-zinc-700 flex-shrink-0 overflow-hidden">
        {imgUrl ? (
          <img src={imgUrl} alt={item.producto?.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#52525b">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm leading-snug truncate">
          {item.producto?.nombre}
        </p>
        {item.talla && (
          <span className="inline-block text-xs text-zinc-400 border border-zinc-600 rounded-md px-1.5 py-0.5 mt-0.5">
            {item.talla}
          </span>
        )}
        <p className="text-cyan-500 text-sm font-bold mt-1">
          {(precio * item.cantidad).toFixed(2)}€
          {item.cantidad > 1 && (
            <span className="text-zinc-500 font-normal ml-1 text-xs">({precio}€ × {item.cantidad})</span>
          )}
        </p>
      </div>

      {/* Controles de cantidad */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onUpdate(item, item.cantidad - 1)}
          disabled={busy}
          className="w-7 h-7 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H5v-2h14v2z" />
          </svg>
        </button>
        <span className="text-white text-sm w-5 text-center font-medium">{item.cantidad}</span>
        <button
          onClick={() => onUpdate(item, item.cantidad + 1)}
          disabled={busy}
          className="w-7 h-7 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── CarritoPage ───────────────────────────────────────────────────────────────

export default function CarritoPage() {
  const navigate = useNavigate()

  const [carrito, setCarrito] = useState<Carrito | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [completarLoading, setCompletarLoading] = useState(false)
  const [completarMsg, setCompletarMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    carritoService
      .get()
      .then(({ data }) => setCarrito(data))
      .finally(() => setLoading(false))
  }, [])

  const items = carrito?.items ?? []
  const total = items.reduce((sum, i) => sum + (i.producto?.precio ?? 0) * i.cantidad, 0)

  const handleUpdate = async (item: ItemCarrito, nuevaCantidad: number) => {
    if (actionLoading !== null) return
    setActionLoading(item.id)
    try {
      if (nuevaCantidad <= 0) {
        await carritoService.removeItem(item.id)
        setCarrito((prev) =>
          prev ? { ...prev, items: prev.items.filter((i) => i.id !== item.id) } : prev,
        )
      } else {
        await carritoService.updateItem(item.id, nuevaCantidad)
        setCarrito((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.map((i) =>
                  i.id === item.id ? { ...i, cantidad: nuevaCantidad } : i,
                ),
              }
            : prev,
        )
      }
    } catch {
      /* silent */
    } finally {
      setActionLoading(null)
    }
  }

  const handleCompletar = async () => {
    setCompletarLoading(true)
    setCompletarMsg(null)
    try {
      const { data } = await carritoService.completarCompra()
      setCarrito((prev) => (prev ? { ...prev, items: [] } : prev))
      setCompletarMsg({ ok: true, text: data.message })
    } catch (err) {
      setCompletarMsg({ ok: false, text: apiMsg(err, 'Error al completar la compra') })
    } finally {
      setCompletarLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Cargando carrito...</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 pb-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Volver
        </button>
        <h1 className="text-2xl font-bold text-white">Carrito</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Productos de Splinters</p>
      </div>

      {/* Compra completada con éxito */}
      {completarMsg?.ok && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6 text-center mb-4">
          <div className="flex justify-center mb-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#06b6d4">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <p className="text-cyan-400 font-semibold mb-1">¡Compra realizada!</p>
          <p className="text-zinc-400 text-sm mb-4">{completarMsg.text}</p>
          <button
            onClick={() => navigate('/pedidos')}
            className="text-cyan-500 text-sm font-medium hover:text-cyan-400 transition-colors"
          >
            Ver mis pedidos →
          </button>
        </div>
      )}

      {/* Carrito vacío */}
      {items.length === 0 && !completarMsg?.ok && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="#3f3f46">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.1 17 7 17h11v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.46 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          <p className="text-zinc-500 text-sm">Tu carrito está vacío</p>
          <button
            onClick={() => navigate('/tienda')}
            className="text-cyan-500 text-sm font-medium hover:text-cyan-400 transition-colors"
          >
            Ir a la tienda →
          </button>
        </div>
      )}

      {/* Lista de items */}
      {items.length > 0 && (
        <>
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                busy={actionLoading === item.id}
                onUpdate={handleUpdate}
              />
            ))}
          </div>

          {/* Resumen + checkout */}
          <div className="bg-zinc-800 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-zinc-400 text-sm">{items.length} {items.length === 1 ? 'producto' : 'productos'}</span>
              <span className="text-white font-bold text-lg">{total.toFixed(2)}€</span>
            </div>
            <p className="text-zinc-600 text-xs mb-4">Recogida en tienda</p>

            {completarMsg && !completarMsg.ok && (
              <p className="text-red-400 text-xs text-center mb-3">{completarMsg.text}</p>
            )}

            <button
              onClick={handleCompletar}
              disabled={completarLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {completarLoading ? 'Procesando...' : 'Finalizar compra'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
