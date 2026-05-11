import api from '@/lib/axios'
import type { Reserva, ListResponse } from '@/types'

export const reservasService = {
  getMias: () =>
    api.get<ListResponse<Reserva>>('/reservas/mis-reservas'),

  create: (claseId: number) =>
    api.post<{ message: string; reserva: Reserva }>('/reservas', { claseId }),

  cancelar: (id: number) =>
    api.put<{ message: string }>(`/reservas/${id}/cancelar`),
}
