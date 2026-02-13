import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogIn, AlertCircle } from 'lucide-react'
import logo from '../XPsignin.svg'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const success = login(email, password)
    if (success) {
      navigate('/')
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-primary-900 to-accent-900">
      {/* Large Logo - Fixed Size */}
      <div style={{ marginTop: '-300px', marginBottom: '-220px' }}>
        <img 
          src={logo} 
          alt="SpeedTesters XP" 
          className="mx-auto"
          style={{ width: '1400px', height: 'auto' }}
        />
      </div>
      
      {/* Login Card - Compact */}
      <div className="w-full max-w-md">
        
        {/* Compact Login Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-800">
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
              <LogIn size={20} />
              <span>Sign In</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 font-medium mb-2">Demo Accounts:</p>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-700">Admin Account</p>
                <p className="text-gray-600">admin@speedtestersxp.com / admin123</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-700">Member Account</p>
                <p className="text-gray-600">member@speedtestersxp.com / member123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
