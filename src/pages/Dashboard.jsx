import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { 
  FolderTree, 
  FileCheck, 
  Play, 
  CheckCircle2, 
  XCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'

function Dashboard() {
  const { folders, testCases, testRuns, loading } = useData()
  const { user } = useAuth()

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalFolders = folders.length
  const totalTestCases = testCases.length
  const totalRuns = testRuns.length

  // Recent test runs (last 5)
  const recentRuns = testRuns.slice(0, 5)

  // Pass/Fail statistics
  const passedTests = testRuns.reduce((sum, run) => {
    return sum + run.tests.filter(t => t.status === 'passed').length
  }, 0)

  const failedTests = testRuns.reduce((sum, run) => {
    return sum + run.tests.filter(t => t.status === 'failed').length
  }, 0)

  const totalTestsRun = passedTests + failedTests
  const passRate = totalTestsRun > 0 ? Math.round((passedTests / totalTestsRun) * 100) : 0

  // Tests assigned to current user
  const myAssignedTests = testCases.filter(tc => tc.assignedTo === user?.id)

  const stats = [
    { label: 'Test Folders', value: totalFolders, icon: FolderTree, color: 'bg-primary-800' },
    { label: 'Test Cases', value: totalTestCases, icon: FileCheck, color: 'bg-primary-700' },
    { label: 'Total Runs', value: totalRuns, icon: Play, color: 'bg-primary-600' },
    { label: 'Pass Rate', value: `${passRate}%`, icon: TrendingUp, color: 'bg-green-600' }
  ]

  return (
    <div className="p-8">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-primary-800/10 rounded-lg -z-10"></div>
        <h1 className="text-4xl font-bold text-primary-800">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2 text-lg">🏁 Welcome back, {user?.name}! Ready to accelerate your testing?</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Test Runs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Test Runs</h2>
            <Link to="/history" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>

          {recentRuns.length === 0 ? (
            <div className="text-center py-8">
              <Clock size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No test runs yet</p>
              <Link to="/execute" className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block">
                Run your first test
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRuns.map((run) => {
                const passed = run.tests.filter(t => t.status === 'passed').length
                const failed = run.tests.filter(t => t.status === 'failed').length
                const total = run.tests.length

                return (
                  <Link
                    key={run.id}
                    to={`/history?run=${run.id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        {format(new Date(run.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                      <span className={`badge ${
                        run.status === 'completed' ? 'badge-success' :
                        run.status === 'failed' ? 'badge-error' :
                        'badge-info'
                      }`}>
                        {run.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 size={16} />
                        <span>{passed} passed</span>
                      </div>
                      {failed > 0 && (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle size={16} />
                          <span>{failed} failed</span>
                        </div>
                      )}
                      <span className="text-gray-500">of {total}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* My Assigned Tests */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Assigned Tests</h2>
            <Link to="/folders" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>

          {myAssignedTests.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No tests assigned to you</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myAssignedTests.map((test) => {
                const folder = folders.find(f => f.id === test.folderId)
                return (
                  <div
                    key={test.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="font-medium text-gray-900">{test.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                    {folder && (
                      <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {folder.name}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/folders" className="card hover:shadow-md transition-shadow cursor-pointer group">
          <FolderTree size={32} className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-gray-900">Manage Test Folders</h3>
          <p className="text-sm text-gray-600 mt-1">Organize and create test cases</p>
        </Link>

        <Link to="/execute" className="card hover:shadow-md transition-shadow cursor-pointer group">
          <Play size={32} className="text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-gray-900">Execute Tests</h3>
          <p className="text-sm text-gray-600 mt-1">Run test cases and see results</p>
        </Link>

        <Link to="/history" className="card hover:shadow-md transition-shadow cursor-pointer group">
          <Clock size={32} className="text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-gray-900">View History</h3>
          <p className="text-sm text-gray-600 mt-1">Track test runs over time</p>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
