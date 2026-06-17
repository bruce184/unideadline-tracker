import { useEffect, useState } from 'react'
import { AuthContext } from '../hooks/authContext'
import { supabase } from '../services/supabase'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (!active) return

      setUser(session?.user ?? null)
      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token)
      }
      setLoading(false)
    }

    const timer = setTimeout(() => {
      loadSession()
    }, 0)

    const { data: { subscription } } = supabase
      ? supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token)
      } else {
        localStorage.removeItem('access_token')
      }
    })
      : { data: { subscription: null } }

    return () => {
      active = false
      clearTimeout(timer)
      subscription?.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    if (!supabase) throw new Error('Supabase client env is not configured')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const register = async (email, password) => {
    if (!supabase) throw new Error('Supabase client env is not configured')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const logout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
