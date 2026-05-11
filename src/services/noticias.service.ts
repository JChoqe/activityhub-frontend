import api from '@/lib/axios'
import type { Noticia, PaginatedResponse } from '@/types'

export const noticiasService = {
  getAll: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<Noticia>>('/noticias', { params: { page, limit } }),

  getById: (id: number) =>
    api.get<Noticia>(`/noticias/${id}`),

  create: (data: { titulo: string; contenido: string }) =>
    api.post<{ message: string; noticia: Noticia }>('/noticias', data),

  update: (id: number, data: Partial<{ titulo: string; contenido: string }>) =>
    api.put<{ message: string; noticia: Noticia }>(`/noticias/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/noticias/${id}`),
}
