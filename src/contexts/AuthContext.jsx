import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

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

  const login = (email, password) => {
    // Simple authentication - in production, this would call an API
    const users = [
      { id: '1', email: 'admin@speedtestersxp.com', password: 'admin123', name: 'Admin User', role: 'admin' },
      { id: '2', email: 'member@speedtestersxp.com', password: 'member123', name: 'Team Member', role: 'member' }
    ]

    const foundUser = users.find(u => u.email === email && u.password === password)
    if (foundUser) {
      const userWithoutPassword = { ...foundUser }
      delete userWithoutPassword.password
      setUser(userWithoutPassword)
      localStorage.setItem('speedtestersxp_user', JSON.stringify(userWithoutPassword))
      return true
    }
    return false
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
