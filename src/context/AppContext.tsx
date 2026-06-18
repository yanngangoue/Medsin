import { createContext, useContext, useState, type ReactNode } from 'react'
import { getCurrentUser, logout as apiLogout } from '../api/mockApi'
import type { User } from '../types'

interface AppContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCurrentUser())

  function logout() {
    apiLogout()
    setUser(null)
  }

  return (
    <AppContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
