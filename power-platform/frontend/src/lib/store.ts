import { create } from 'zustand'

interface User {
  id: number
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  orgId: number | null
  setAuth: (user: User, token: string) => void
  setOrgId: (orgId: number) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  orgId: parseInt(localStorage.getItem('orgId') || '0') || null,
  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token })
  },
  setOrgId: (orgId) => {
    localStorage.setItem('orgId', orgId.toString())
    set({ orgId })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('orgId')
    set({ user: null, token: null, orgId: null })
  },
}))
