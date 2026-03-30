import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock,
  Calendar,
  Monitor,
  Code,
  Filter,
  ChevronDown,
  ChevronRight,
  Folder
} from 'lucide-react'
import { format } from 'date-fns'

function TestHistory() {
  const { testExecutions, testCases, folders } = useData()
  const [selectedFolder, setSelectedFolder] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedEnvironment, setSelectedEnvironment] = useState('')
  const [expandedExecution, setExpandedExecution] = useState(null)

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pass': return <CheckCircle2 className="text-green-600" size={20} />
      case 'fail': return <XCircle className="text-red-600" size={20} />
      case 'blocked': return <AlertCircle className="text-orange-600" size={20} />
      case 'skipped': return <Clock className="text-gray-600" size={20} />
      default: return null
    }
  }

  const getStatusBadgeClass = (status) => {
    const classes = {
      'pass': 'bg-green-100 text-green-700 border-green-300',
      'fail': 'bg-red-100 text-red-700 border-red-300',
      'blocked': 'bg-orange-100 text-orange-700 border-orange-300',
      'skipped': 'bg-gray-100 text-gray-700 border-gray-300',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-300'
    }
    return classes[status] || classes['skipped']
  }

  const getEnvironmentColor = (env) => {
    const colors = {
      'production': 'bg-red-50 text-red-700',
      'staging': 'bg-yellow-50 text-yellow-700',
      'development': 'bg-green-50 text-green-700',
      'qa': 'bg-blue-50 text-blue-700',
      'uat': 'bg-purple-50 text-purple-700',
      'local': 'bg-gray-50 text-gray-700'
    }
    return colors[env] || colors['local']
  }

  // Filter executions
  const filteredExecutions = testExecutions.filter(execution => {
    const testCase = testCases.find(tc => tc.id === execution.testCaseId)
    
    if (selectedFolder && testCase?.folderId !== selectedFolder) return false
    if (selectedStatus && execution.status !== selectedStatus) return false
    if (selectedEnvironment && execution.environment !== selectedEnvironment) return false
    
    return true
  })

  // Calculate statistics
  const stats = {
    total: filteredExecutions.length,
    passed: filteredExecutions.filter(e => e.status === 'pass').length,
    failed: filteredExecutions.filter(e => e.status === 'fail').length,
    blocked: filteredExecutions.filter(e => e.status === 'blocked').length,
    passRate: filteredExecutions.length > 0 
      ? Math.round((filteredExecutions.filter(e => e.status === 'pass').length / filteredExecutions.length) * 100)
      : 0
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary-800 flex items-center gap-3">
          <History size={40} />
          Test Execution History
        </h1>
        <p className="text-gray-600 mt-2 text-lg">View and analyze past test executions</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-gray-600 font-medium">Total Executions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 font-medium">Passed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.passed}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 font-medium">Failed</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.failed}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 font-medium">Blocked</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.blocked}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 font-medium">Pass Rate</p>
          <p className="text-3xl font-bold text-primary-600 mt-2">{stats.passRate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Folder
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="input"
            >
              <option value="">All Folders</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="blocked">Blocked</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Environment
            </label>
            <select
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              className="input"
            >
              <option value="">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
              <option value="qa">QA</option>
              <option value="uat">UAT</option>
              <option value="local">Local</option>
            </select>
          </div>
        </div>
      </div>

      {/* Execution List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Execution Records</h2>

        {filteredExecutions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <History size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No test executions found</p>
            <p className="text-sm mt-1">Execute some tests to see history here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExecutions.map(execution => {
              const testCase = testCases.find(tc => tc.id === execution.testCaseId)
              const folder = folders.find(f => f.id === testCase?.folderId)
              const isExpanded = expandedExecution === execution.id

              return (
                <div 
                  key={execution.id} 
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div 
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedExecution(isExpanded ? null : execution.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(execution.status)}
                        <h3 className="font-semibold text-gray-900">
                          {testCase?.name || 'Unknown Test'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(execution.status)}`}>
                          {execution.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {format(new Date(execution.executedAt), 'MMM d, yyyy h:mm a')}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${getEnvironmentColor(execution.environment)}`}>
                          {execution.environment}
                        </span>
                        {execution.version && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            v{execution.version}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Monitor size={14} />
                          {execution.deviceType}
                        </span>
                      </div>

                      {folder && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          <Folder size={12} /> {folder.name}
                        </span>
                      )}
                    </div>

                    <button className="text-gray-400 hover:text-gray-600">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Executed By:</span>
                          <p className="text-gray-600 mt-1">{execution.executedBy}</p>
                        </div>
                        {execution.browser && (
                          <div>
                            <span className="font-semibold text-gray-700">Browser:</span>
                            <p className="text-gray-600 mt-1">{execution.browser}</p>
                          </div>
                        )}
                        {execution.os && (
                          <div>
                            <span className="font-semibold text-gray-700">Operating System:</span>
                            <p className="text-gray-600 mt-1">{execution.os}</p>
                          </div>
                        )}
                        {execution.executionTime && (
                          <div>
                            <span className="font-semibold text-gray-700">Execution Time:</span>
                            <p className="text-gray-600 mt-1">{execution.executionTime} minutes</p>
                          </div>
                        )}
                      </div>

                      {testCase?.testSteps && (
                        <div>
                          <span className="font-semibold text-gray-700">Test Steps:</span>
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{testCase.testSteps}</p>
                        </div>
                      )}

                      {testCase?.expectedResult && (
                        <div>
                          <span className="font-semibold text-gray-700">Expected Result:</span>
                          <p className="text-sm text-gray-600 mt-1">{testCase.expectedResult}</p>
                        </div>
                      )}

                      {execution.actualResult && (
                        <div>
                          <span className="font-semibold text-gray-700">Actual Result:</span>
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{execution.actualResult}</p>
                        </div>
                      )}

                      {execution.notes && (
                        <div>
                          <span className="font-semibold text-gray-700">Notes:</span>
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{execution.notes}</p>
                        </div>
                      )}

                      {execution.defects && execution.defects.length > 0 && (
                        <div>
                          <span className="font-semibold text-gray-700">Defects:</span>
                          <div className="mt-2 space-y-2">
                            {execution.defects.map((defect, idx) => (
                              <div key={idx} className="bg-red-50 border border-red-200 rounded p-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-red-700">ID: {defect.id}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    defect.severity === 'critical' ? 'bg-red-200 text-red-800' :
                                    defect.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                                    'bg-yellow-200 text-yellow-800'
                                  }`}>
                                    {defect.severity}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 mt-1">{defect.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default TestHistory
