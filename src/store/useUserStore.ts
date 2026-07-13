import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Role = 'admin' | 'factory' | 'manager' | 'accountant'

interface User {
  id: string
  name: string
  role: Role
}

interface UserStore {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  clearUser: () => void
  /** Вызывается после успешного логина: синхронизирует флаг авторизации с токеном в localStorage */
  syncAuthFromStorage: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      // Инициализируем isAuthenticated на основании наличия токена в localStorage при первом рендере
      isAuthenticated: !!localStorage.getItem('access_token'),
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false })
      },
      syncAuthFromStorage: () => {
        const token = localStorage.getItem('access_token')
        set({ isAuthenticated: !!token })
      },
    }),
    {
      name: 'user-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }), // Persist only user object
    }
  )
)