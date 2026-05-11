import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { productosService } from '@/services/productos.service'
import { carritoService } from '@/services/carrito.service'
import { getImgUrl, apiMsg } from '@/lib/utils'
import type { Producto, Talla, Categoria } from '@/types'

const TALLAS: Talla[] = ['S', 'M', 'L', 'XL', 'XXL']
const CATEGORIAS: Categoria[] = ['ROPA', 'EQUIPAMIENTO', 'ACCESORIOS']
const catLabel: Record<Categoria, string> = {
  ROPA: 'Ropa',
  EQUIPAMIENTO: 'Equipamiento',
  ACCESORIOS: 'Accesorios',
}

const inputCls =
  'w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500 transition'

type TallaState = { enabled: boolean; stock: string }
type FormState = {
  nombre: string
  descripcion: string
  precio: string
  categoria: Categoria
  tallas: Record<Talla, TallaState>
}

function emptyForm(): FormState {
  return {
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'ROPA',
    tallas: {
      S: { enabled: false, stock: '' },
      M: { enabled: false, stock: '' },
      L: { enabled: false, stock: '' },
      XL: { enabled: false, stock: '' },
      XXL: { enabled: false, stock: '' },
    },
  }
}

// ─── ProductoCard ──────────────────────────────────────────────────────────────

interface CardProps {
  producto: Producto
  isAdmin: boolean
  deleting: boolean
  onDelete: (id: number) => void
}

function ProductoCard({ producto, isAdmin, deleting, onDelete }: CardProps) {
  const navigate = useNavigate()
  const [selTalla, setSelTalla] = useState<Talla | null>(null)
  const [cartLoading, setCartLoading] = useState(false)
  const [cartMsg, setCartMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const availableTallas = producto.tallas.filter((t) => t.stock > 0)
  const hasTallas = availableTallas.length > 0
  const imgUrl = getImgUrl(producto.imagen)

  const handleCart = async (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (hasTallas && !selTalla) {
      setCartMsg({ ok: false, text: 'Elige una talla' })
      setTimeout(() => setCartMsg(null), 2000)
      return
    }
    setCartLoading(true)
    setCartMsg(null)
    try {
      await carritoService.addItem(producto.id, 1, selTalla ?? undefined)
      setCartMsg({ ok: true, text: '¡Añadido!' })
      setTimeout(() => setCartMsg(null), 2000)
    } catch (err) {
      setCartMsg({ ok: false, text: apiMsg(err, 'Error al añadir') })
    } finally {
      setCartLoading(false)
    }
  }

  return (
    <div
      onClick={() => navigate(`/tienda/${producto.id}`)}
      className="bg-zinc-800 rounded-2xl overflow-hidden cursor-pointer active:opacity-80 transition-opacity"
    >
      {/* Image */}
      <div className="aspect-square bg-zinc-700 relative">
        {imgUrl ? (
          <img src={imgUrl} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#52525b">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        )}
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(producto.id)
            }}
            disabled={deleting}
            className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 rounded-xl p-1.5 text-white transition-colors disabled:opacity-40"
            title="Eliminar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-white font-bold text-sm leading-snug mb-2 line-clamp-2">
          {producto.nombre}
        </p>

        {/* Tallas */}
        {hasTallas && (
          <div className="flex flex-wrap gap-1 mb-2.5" onClick={(e) => e.stopPropagation()}>
            {availableTallas.map((t) => (
              <button
                key={t.talla ?? 'unica'}
                onClick={() =>
                  setSelTalla((prev) => (prev === t.talla ? null : (t.talla ?? null)))
                }
                className={`text-xs px-2 py-0.5 rounded-lg border transition-colors ${
                  selTalla === t.talla
                    ? 'border-cyan-500 text-cyan-500 bg-cyan-500/10'
                    : 'border-zinc-600 text-zinc-400 hover:border-zinc-400'
                }`}
              >
                {t.talla}
              </button>
            ))}
          </div>
        )}

        {cartMsg && (
          <p className={`text-xs mb-1.5 ${cartMsg.ok ? 'text-cyan-400' : 'text-red-400'}`}>
            {cartMsg.text}
          </p>
        )}

        {/* Price + cart */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-cyan-500 font-bold text-base">{producto.precio}€</span>
          <button
            onClick={handleCart}
            disabled={cartLoading}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white p-2 rounded-xl transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.1 17 7 17h11v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.46 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── TiendaPage ────────────────────────────────────────────────────────────────

export default function TiendaPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'

  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    productosService
      .getAll(1, 100)
      .then(({ data }) => setProductos(data.data))
      .finally(() => setLoading(false))
  }, [])

  const grouped = CATEGORIAS.reduce(
    (acc, cat) => {
      acc[cat] = productos.filter((p) => p.categoria === cat)
      return acc
    },
    {} as Record<Categoria, Producto[]>,
  )

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return
    setDeleteLoading(id)
    try {
      await productosService.delete(id)
      setProductos((prev) => prev.filter((p) => p.id !== id))
    } catch {
      /* silent */
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleFileChange = (e: { target: { files: FileList | null } }) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
  }

  const handleCreate = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!form.nombre.trim()) {
      setFormError('El nombre es obligatorio')
      return
    }
    const precio = Number(form.precio)
    if (!form.precio || isNaN(precio) || precio <= 0) {
      setFormError('El precio debe ser un número mayor que 0')
      return
    }
    setFormError('')
    setFormLoading(true)
    try {
      let imagenUrl: string | undefined
      if (imagenFile) {
        const { data: upData } = await productosService.uploadImagen(imagenFile)
        imagenUrl = upData.imagenUrl
      }

      const tallas = TALLAS.filter((t) => form.tallas[t].enabled).map((t) => ({
        talla: t,
        stock: Math.max(0, parseInt(form.tallas[t].stock) || 0),
      }))

      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || undefined,
        precio,
        categoria: form.categoria,
        imagen: imagenUrl,
        tallas,
      } as unknown as Partial<Producto>

      const { data } = await productosService.create(payload)
      setProductos((prev) => [data.producto, ...prev])
      setShowModal(false)
    } catch (err) {
      setFormError(apiMsg(err, 'Error al crear el producto'))
    } finally {
      setFormLoading(false)
    }
  }

  const openModal = () => {
    setForm(emptyForm())
    setImagenFile(null)
    setImagenPreview(null)
    setFormError('')
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Cargando tienda...</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 pb-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-white">Tienda</h1>
          <Link
            to="/carrito"
            className="text-cyan-500 hover:text-cyan-400 transition-colors p-1 -mt-1"
            title="Ver carrito"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.1 17 7 17h11v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.46 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </Link>
        </div>
        <p className="text-zinc-400 text-sm mt-0.5">Productos de Splinters</p>
        <p className="text-zinc-500 text-xs mt-1">Todos los productos se recogen en tienda</p>
      </div>

      {/* Sections by category */}
      {CATEGORIAS.map((cat) => {
        const prods = grouped[cat]
        if (!prods.length) return null
        return (
          <section key={cat} className="mb-8">
            <h2 className="text-cyan-500 font-semibold text-base mb-4">{catLabel[cat]}</h2>
            <div className="grid grid-cols-2 gap-3">
              {prods.map((p) => (
                <ProductoCard
                  key={p.id}
                  producto={p}
                  isAdmin={isAdmin}
                  deleting={deleteLoading === p.id}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )
      })}

      {productos.length === 0 && (
        <p className="text-zinc-500 text-sm text-center py-12">No hay productos disponibles</p>
      )}

      {/* Admin: add button */}
      {isAdmin && (
        <button
          onClick={openModal}
          className="w-full mt-2 mb-4 flex items-center justify-center gap-2 border border-dashed border-zinc-600 hover:border-cyan-500 hover:text-cyan-500 text-zinc-500 rounded-2xl py-3 text-sm font-medium transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Añadir producto
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div className="bg-zinc-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold text-lg">Nuevo producto</h3>
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
              {/* Foto */}
              <div>
                <label className="block text-white text-sm mb-2">Foto del producto</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {imagenPreview ? (
                  <div className="relative">
                    <img
                      src={imagenPreview}
                      alt="preview"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagenFile(null)
                        setImagenPreview(null)
                      }}
                      className="absolute top-2 right-2 bg-black/60 rounded-lg p-1 text-white hover:bg-black/80 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-28 border border-dashed border-zinc-600 hover:border-cyan-500 rounded-xl flex flex-col items-center justify-center gap-1.5 text-zinc-500 hover:text-cyan-500 transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                    <span className="text-xs">Seleccionar imagen</span>
                  </button>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-white text-sm mb-2">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={form.nombre}
                  onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  maxLength={100}
                  required
                  className={inputCls}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-white text-sm mb-2">Descripción</label>
                <textarea
                  placeholder="Descripción opcional..."
                  value={form.descripcion}
                  onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Precio + Categoría */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white text-sm mb-2">
                    Precio (€) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.precio}
                    onChange={(e) => setForm((p) => ({ ...p, precio: e.target.value }))}
                    min="0.01"
                    step="0.01"
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">
                    Categoría <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.categoria}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, categoria: e.target.value as Categoria }))
                    }
                    className={inputCls}
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c}>
                        {catLabel[c]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tallas */}
              <div>
                <label className="block text-white text-sm mb-3">Tallas y stock</label>
                <div className="space-y-2">
                  {TALLAS.map((t) => (
                    <div key={t} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            tallas: {
                              ...p.tallas,
                              [t]: { ...p.tallas[t], enabled: !p.tallas[t].enabled },
                            },
                          }))
                        }
                        className={`w-10 h-8 rounded-lg border text-xs font-medium transition-colors flex-shrink-0 ${
                          form.tallas[t].enabled
                            ? 'border-cyan-500 text-cyan-500 bg-cyan-500/10'
                            : 'border-zinc-600 text-zinc-500 hover:border-zinc-400'
                        }`}
                      >
                        {t}
                      </button>
                      {form.tallas[t].enabled && (
                        <>
                          <input
                            type="number"
                            placeholder="Stock"
                            value={form.tallas[t].stock}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                tallas: {
                                  ...p.tallas,
                                  [t]: { ...p.tallas[t], stock: e.target.value },
                                },
                              }))
                            }
                            min="0"
                            className="flex-1 bg-zinc-800 text-white placeholder-zinc-500 rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500 transition"
                          />
                          <span className="text-zinc-500 text-xs flex-shrink-0">uds.</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="text-red-400 text-sm text-center">{formError}</p>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {formLoading ? 'Creando...' : 'Crear producto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
