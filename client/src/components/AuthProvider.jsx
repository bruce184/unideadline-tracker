import { useEffect, useState } from 'react'
import { AuthContext } from '../hooks/authContext'
import { signInWithPassword, signOut, getOrRefreshSession } from '../services/supabaseAuthService'
import { apiRequest } from '../services/apiClient'
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
    // Gọi backend thay vì Supabase trực tiếp
    // Backend dùng admin.createUser() với email_confirm: true → không gửi email
    await apiRequest('/auth/register', {
      method: 'POST',
      auth: false, // public endpoint, chưa có token
      body: { email, password, display_name: displayName },
    })

    // Backend đã confirm email → login bình thường ngay
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