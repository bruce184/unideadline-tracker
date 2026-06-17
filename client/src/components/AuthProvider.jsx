import { useEffect, useState } from 'react'
import { AuthContext } from '../hooks/authContext'
import { signInWithPassword, signOut, getStoredSession, signUp } from '../services/supabaseAuthService'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSession = () => {
      const session = getStoredSession()
      if (session && session.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    }
    
    loadSession()
  }, [])

  const login = async (email, password) => {
    const session = await signInWithPassword({ email, password })
    setUser(session.user)
  }

  const register = async (email, password) => {
    await signUp({ email, password })
    const session = await signInWithPassword({ email, password })
    setUser(session.user)
  }

  const logout = async () => {
    signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
