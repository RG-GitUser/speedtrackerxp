import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import {
  LayoutDashboard,
  FolderTree,
  Play,
  History,
  LogOut,
  User,
  Code,
  Search,
  X,
  BookOpen,
  FileText,
  CheckCircle2
} from 'lucide-react'
import logo from '../XP.svg'

function Layout() {
  const { user, logout } = useAuth()
  const { folders, testStories, testCases, devTasks, testExecutions } = useData()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search logic
  const query = searchQuery.trim().toLowerCase()
  const isSearching = query.length >= 2

  const matchesQuery = (item, fields) => {
    // Check ID match (partial)
    if (item.id && item.id.toLowerCase().includes(query)) return true
    // Check keyword fields
    return fields.some(field => {
      const val = item[field]
      if (!val) return false
      if (typeof val === 'string') return val.toLowerCase().includes(query)
      if (Array.isArray(val)) {
        return val.some(v => {
          if (typeof v === 'string') return v.toLowerCase().includes(query)
          if (v?.description) return v.description.toLowerCase().includes(query)
          return false
        })
      }
      return false
    })
  }

  const storyResults = isSearching
    ? testStories.filter(s => matchesQuery(s, ['title', 'description', 'userStory', 'assignedTo', 'acceptanceCriteria', 'tags'])).slice(0, 5)
    : []

  const testCaseResults = isSearching
    ? testCases.filter(tc => matchesQuery(tc, ['name', 'description', 'testSteps', 'expectedResult', 'assignedTo'])).slice(0, 5)
    : []

  const devTaskResults = isSearching
    ? devTasks.filter(dt => matchesQuery(dt, ['title', 'description', 'assignedTo', 'tags'])).slice(0, 5)
    : []

  const executionResults = isSearching
    ? testExecutions.filter(ex => {
        const tc = testCases.find(t => t.id === ex.testCaseId)
        if (tc && tc.name.toLowerCase().includes(query)) return true
        return matchesQuery(ex, ['executedBy', 'actualResult', 'notes', 'status', 'environment'])
      }).slice(0, 5)
    : []

  const totalResults = storyResults.length + testCaseResults.length + devTaskResults.length + executionResults.length

  const getFolderName = (folderId) => folders.find(f => f.id === folderId)?.name || ''

  const handleResultClick = (type, item) => {
    setShowResults(false)
    setSearchQuery('')
    switch (type) {
      case 'story':
      case 'testcase':
        navigate('/folders')
        break
      case 'devtask':
        navigate('/devtasks')
        break
      case 'execution':
        navigate('/history')
        break
    }
  }

  const highlightMatch = (text, maxLen = 80) => {
    if (!text) return ''
    const truncated = text.length > maxLen ? text.substring(0, maxLen) + '...' : text
    if (!query) return truncated
    const idx = truncated.toLowerCase().indexOf(query)
    if (idx === -1) return truncated
    return (
      <>
        {truncated.substring(0, idx)}
        <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">{truncated.substring(idx, idx + query.length)}</mark>
        {truncated.substring(idx + query.length)}
      </>
    )
  }

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/folders', icon: FolderTree, label: 'User Stories' },
    { to: '/devtasks', icon: Code, label: 'Dev Tasks' },
    { to: '/execute', icon: Play, label: 'Execute Tests' },
    { to: '/history', icon: History, label: 'History' }
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

            {/* Search + User Info */}
            <div className="flex items-center gap-4 absolute right-6">
              {/* Search Bar */}
              <div ref={searchRef} className="relative">
                <div className="flex items-center bg-gray-800 border border-gray-600 rounded-lg overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all">
                  <Search size={16} className="text-gray-400 ml-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowResults(true)
                    }}
                    onFocus={() => setShowResults(true)}
                    placeholder="Search stories, tests, tasks..."
                    className="bg-transparent text-gray-200 text-sm px-2 py-2 w-64 outline-none placeholder-gray-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setShowResults(false) }}
                      className="text-gray-400 hover:text-gray-200 mr-2"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && isSearching && (
                  <div className="absolute right-0 top-full mt-2 w-[480px] bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[500px] overflow-y-auto z-50">
                    {totalResults === 0 ? (
                      <div className="p-6 text-center text-gray-400">
                        <Search size={32} className="mx-auto mb-2" />
                        <p className="text-sm">No results for "{searchQuery}"</p>
                      </div>
                    ) : (
                      <div>
                        {/* User Stories */}
                        {storyResults.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                              <BookOpen size={14} className="text-blue-600" />
                              <span className="text-xs font-semibold text-blue-700 uppercase">User Stories ({storyResults.length})</span>
                            </div>
                            {storyResults.map(story => (
                              <button
                                key={story.id}
                                onClick={() => handleResultClick('story', story)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900 text-sm">{highlightMatch(story.title)}</span>
                                  {story.priority && (
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                      story.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                      story.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                      'bg-gray-100 text-gray-600'
                                    }`}>{story.priority}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <span className="font-mono">{story.id.slice(-6)}</span>
                                  <span>{getFolderName(story.folderId)}</span>
                                  {story.assignedTo && <span>- {highlightMatch(story.assignedTo, 30)}</span>}
                                </div>
                                {story.userStory && (
                                  <p className="text-xs text-gray-500 mt-1 italic">{highlightMatch(story.userStory, 100)}</p>
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Test Cases */}
                        {testCaseResults.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-green-50 border-b border-green-100 flex items-center gap-2">
                              <FileText size={14} className="text-green-600" />
                              <span className="text-xs font-semibold text-green-700 uppercase">Test Cases ({testCaseResults.length})</span>
                            </div>
                            {testCaseResults.map(tc => {
                              const story = testStories.find(s => s.id === tc.testStoryId)
                              return (
                                <button
                                  key={tc.id}
                                  onClick={() => handleResultClick('testcase', tc)}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900 text-sm">{highlightMatch(tc.name)}</span>
                                    {tc.testType && (
                                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px]">{tc.testType}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="font-mono">{tc.id.slice(-6)}</span>
                                    {story && <span>Story: {story.title}</span>}
                                    {tc.assignedTo && <span>- {highlightMatch(tc.assignedTo, 30)}</span>}
                                  </div>
                                  {tc.description && (
                                    <p className="text-xs text-gray-500 mt-1">{highlightMatch(tc.description, 100)}</p>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}

                        {/* Dev Tasks */}
                        {devTaskResults.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
                              <Code size={14} className="text-purple-600" />
                              <span className="text-xs font-semibold text-purple-700 uppercase">Dev Tasks ({devTaskResults.length})</span>
                            </div>
                            {devTaskResults.map(dt => (
                              <button
                                key={dt.id}
                                onClick={() => handleResultClick('devtask', dt)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900 text-sm">{highlightMatch(dt.title)}</span>
                                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                    dt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    dt.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                    dt.status === 'blocked' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>{dt.status}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <span className="font-mono">{dt.id.slice(-6)}</span>
                                  <span>{getFolderName(dt.folderId)}</span>
                                  {dt.assignedTo && <span>- {highlightMatch(dt.assignedTo, 30)}</span>}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Executions */}
                        {executionResults.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-orange-600" />
                              <span className="text-xs font-semibold text-orange-700 uppercase">Executions ({executionResults.length})</span>
                            </div>
                            {executionResults.map(ex => {
                              const tc = testCases.find(t => t.id === ex.testCaseId)
                              return (
                                <button
                                  key={ex.id}
                                  onClick={() => handleResultClick('execution', ex)}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900 text-sm">{tc?.name || 'Unknown Test'}</span>
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                      ex.status === 'pass' ? 'bg-green-100 text-green-700' :
                                      ex.status === 'fail' ? 'bg-red-100 text-red-700' :
                                      ex.status === 'blocked' ? 'bg-orange-100 text-orange-700' :
                                      'bg-gray-100 text-gray-600'
                                    }`}>{ex.status?.toUpperCase()}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="font-mono">{ex.id.slice(-6)}</span>
                                    <span>{ex.environment}</span>
                                    {ex.executedBy && <span>by {highlightMatch(ex.executedBy, 30)}</span>}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400 text-center border-t">
                          {totalResults} result{totalResults !== 1 ? 's' : ''} found
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Info */}
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
