import { create } from 'zustand'
import type { AuthResponse, Usuario } from '@/types'

function isTokenValid(token: string | null, expiresAt: string | null): boolean {
  if (!token || !expiresAt) return false
  return new Date(expiresAt) > new Date()
}

interface AuthState {
  token: string | null
  expiresAt: string | null
  user: AuthResponse['user'] | null
  isAuthenticated: boolean
  login: (data: AuthResponse) => void
  logout: () => void
  updateUser: (data: Partial<Usuario>) => void
}

const storedToken     = localStorage.getItem('token')
const storedExpiresAt = localStorage.getItem('expiresAt')
const tokenValid      = isTokenValid(storedToken, storedExpiresAt)

if (!tokenValid && storedToken) {
  localStorage.removeItem('token')
  localStorage.removeItem('expiresAt')
  localStorage.removeItem('user')
}

export const useAuthStore = create<AuthState>((set) => ({
  token:           tokenValid ? storedToken : null,
  expiresAt:       tokenValid ? storedExpiresAt : null,
  user:            tokenValid ? JSON.parse(localStorage.getItem('user') ?? 'null') : null,
  isAuthenticated: tokenValid,

  login: (data) => {
    localStorage.setItem('token',     data.token)
    localStorage.setItem('expiresAt', data.expiresAt)
    localStorage.setItem('user',      JSON.stringify(data.user))
    set({ token: data.token, expiresAt: data.expiresAt, user: data.user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('expiresAt')
    localStorage.removeItem('user')
    set({ token: null, expiresAt: null, user: null, isAuthenticated: false })
  },

  updateUser: (data) =>
    set((state) => {
      const updated = { ...state.user, ...data } as AuthResponse['user']
      localStorage.setItem('user', JSON.stringify(updated))
      return { user: updated }
    }),
}))
