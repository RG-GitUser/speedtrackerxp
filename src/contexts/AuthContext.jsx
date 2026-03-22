import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

const API_URL = 'http://localhost:3001/api'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('speedtestersxp_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Login failed' }
      }

      const userData = await response.json()
      setUser(userData)
      localStorage.setItem('speedtestersxp_user', JSON.stringify(userData))
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Cannot connect to server' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('speedtestersxp_user')
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
