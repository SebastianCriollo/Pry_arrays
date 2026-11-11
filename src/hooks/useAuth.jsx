import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

// Sesión del dueño. user: undefined = todavía comprobando · null = sin sesión.
const AuthContext = createContext({ user: undefined })
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    api.getUser().then(setUser)
    return api.onAuthChange(setUser) // entra / sale / expira la sesión
  }, [])

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}
