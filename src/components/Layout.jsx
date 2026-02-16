import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  FolderTree, 
  Play, 
  History, 
  LogOut,
  User
} from 'lucide-react'
import logo from '../XP.svg'

function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/folders', icon: FolderTree, label: 'Test Folders' },
    { to: '/execute', icon: Play, label: 'Execute Tests' },
    { to: '/history', icon: History, label: 'Test History' }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Header with Logo */}
      <header className="bg-gray-900 shadow-lg">
        <div className="w-full px-6 py-2">
          <div className="flex items-center justify-between" style={{ height: '80px' }}>
            <div className="flex items-center justify-center flex-1">
              <img 
                src={logo} 
                alt="SpeedTesters XP" 
                className="object-contain"
                style={{ height: '280px' }}
              />
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-4 absolute right-6">
              <div className="text-right text-gray-300">
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2 py-1 text-sm bg-white hover:bg-gray-100 text-blue-600 rounded transition-colors"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Navigation Bar */}
        <nav className="bg-gray-800 border-t border-gray-700">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-6 py-4 transition-colors ${
                      isActive
                        ? 'bg-primary-800 text-primary-300 font-medium border-b-2 border-primary-600'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-primary-400'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
