import api from '@/lib/axios'
import type { Carrito, Talla } from '@/types'

export const carritoService = {
  get: () =>
    api.get<Carrito>('/carrito'),

  addItem: (productoId: number, cantidad = 1, talla?: Talla) =>
    api.post<{ message: string; carrito: Carrito }>('/carrito/items', { productoId, cantidad, talla }),

  updateItem: (itemId: number, cantidad: number) =>
    api.put<{ message: string }>(`/carrito/items/${itemId}`, { cantidad }),

  removeItem: (itemId: number) =>
    api.delete<{ message: string }>(`/carrito/items/${itemId}`),

  completarCompra: () =>
    api.post<{ message: string; pedido: object }>('/carrito/completar'),
}
