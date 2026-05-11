import api from '@/lib/axios'
import type { Pedido, PaginatedResponse } from '@/types'

export const pedidosService = {
  getMios: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<Pedido>>('/pedidos/mis-pedidos', { params: { page, limit } }),

  getById: (id: number) =>
    api.get<Pedido>(`/pedidos/${id}`),
}
