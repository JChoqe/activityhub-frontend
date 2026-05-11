import api from '@/lib/axios'
import type { Usuario, MisEstadisticas, RankingEntry, ListResponse } from '@/types'

export const usuarioService = {
  getPerfil: () =>
    api.get<Usuario>('/usuarios/perfil'),

  updatePerfil: (data: Partial<Usuario>) =>
    api.put<{ message: string; usuario: Usuario }>('/usuarios/perfil', data),

  changePassword: (data: { passwordActual: string; passwordNueva: string }) =>
    api.put<{ message: string }>('/usuarios/perfil/password', data),

  changeEmail: (data: { email: string; passwordActual: string }) =>
    api.put<{ message: string }>('/usuarios/perfil/email', data),

  uploadFoto: (file: File) => {
    const form = new FormData()
    form.append('foto', file)
    return api.post<{ message: string; usuario: Usuario }>('/upload/foto-perfil', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getMisEstadisticas: () =>
    api.get<MisEstadisticas>('/estadisticas/mis-estadisticas'),

  getRanking: () =>
    api.get<ListResponse<RankingEntry>>('/estadisticas/ranking'),

  // Admin
  getAll: (page = 1, limit = 50) =>
    api.get('/usuarios/admin', { params: { page, limit } }),

  changeRol: (id: number, role: string) =>
    api.put(`/usuarios/admin/${id}/rol`, { role }),

  deleteUsuario: (id: number) =>
    api.delete(`/usuarios/admin/${id}`),
}
