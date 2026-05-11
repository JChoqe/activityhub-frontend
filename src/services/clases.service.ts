import api from '@/lib/axios'
import type { Clase, ListResponse } from '@/types'

export const clasesService = {
  getAll: () =>
    api.get<ListResponse<Clase>>('/clases'),

  getById: (id: number) =>
    api.get<Clase>(`/clases/${id}`),

  create: (data: Partial<Clase>) =>
    api.post<{ message: string; clase: Clase }>('/clases', data),

  update: (id: number, data: Partial<Clase>) =>
    api.put<{ message: string; clase: Clase }>(`/clases/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/clases/${id}`),
}
