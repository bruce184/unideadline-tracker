import { useEffect, useState } from 'react'
import { AuthContext } from '../hooks/authContext'
import { signInWithPassword, signOut, getOrRefreshSession, signUp } from '../services/supabaseAuthService'
import { getCurrentProfile } from '../services/authService'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      const session = await getOrRefreshSession()
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
    const fullProfile = await getCurrentProfile()
    setUser({ ...session.user, ...fullProfile })
  }
 
  const register = async (email, password, displayName) => {
    await signUp({
      email,
      password,
      data: { display_name: displayName },
    })

    const session = await signInWithPassword({ email, password })
    const fullProfile = await getCurrentProfile()
    setUser({ ...session.user, ...fullProfile })
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