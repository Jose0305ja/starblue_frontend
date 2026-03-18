import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import api from '../api'
import type { Usuario } from '../types'

interface AuthContextType {
  usuario: Usuario | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<Usuario>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('sb_token')
    setToken(null)
    setUsuario(null)
  }, [])

  // Hidratar sesión desde localStorage al montar
  useEffect(() => {
    const savedToken = localStorage.getItem('sb_token')
    if (!savedToken) {
      setIsLoading(false)
      return
    }
    setToken(savedToken)
    api.get('/auth/me')
      .then(res => {
        setUsuario(res.data.data)
      })
      .catch(() => {
        localStorage.removeItem('sb_token')
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string): Promise<Usuario> => {
    const res = await api.post('/auth/login', { email, password })
    const { token: newToken, usuario: newUsuario } = res.data.data
    localStorage.setItem('sb_token', newToken)
    setToken(newToken)
    setUsuario(newUsuario)
    return newUsuario
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      isLoading,
      isAuthenticated: !!usuario,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
