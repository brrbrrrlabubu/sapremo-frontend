import { create } from 'zustand'

type Role = 'admin' | 'factory' | 'manager' | 'accountant'

interface User {
    id: string
    name: string
    role: Role
}

interface UserStore {
    user: User | null
    setUser: (user: User) => void
    clearUser: () => void
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
}))