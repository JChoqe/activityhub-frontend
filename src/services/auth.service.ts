import api from '@/lib/axios'
import type { AuthResponse } from '@/types'

export const authService = {
  register: (data: { nombre: string; apellido: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
}
