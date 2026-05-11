import api from '@/lib/axios'
import type { Producto, PaginatedResponse, Categoria } from '@/types'

export const productosService = {
  getAll: (page = 1, limit = 20, categoria?: Categoria) =>
    api.get<PaginatedResponse<Producto>>('/productos', { params: { page, limit, categoria } }),

  getById: (id: number) =>
    api.get<Producto>(`/productos/${id}`),

  create: (data: Partial<Producto>) =>
    api.post<{ message: string; producto: Producto }>('/productos', data),

  update: (id: number, data: Partial<Producto>) =>
    api.put<{ message: string; producto: Producto }>(`/productos/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/productos/${id}`),

  uploadImagen: (file: File) => {
    const form = new FormData()
    form.append('imagen', file)
    return api.post<{ imagenUrl: string }>('/upload/producto-imagen', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
