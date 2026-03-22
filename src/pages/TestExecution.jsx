import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock,
  ChevronRight,
  ChevronDown,
  Link as LinkIcon,
  Save
} from 'lucide-react'

function TestExecution() {
  const { folders, testCases, devTasks, addTestExecution } = useData()
  const { user } = useAuth()
  const [selectedFolder, setSelectedFolder] = useState('')
  const [selectedTest, setSelectedTest] = useState(null)
  const [expandedTest, setExpandedTest] = useState(null)
  const [executionData, setExecutionData] = useState({
    status: '',
    environment: 'development',
    version: '',
    deviceType: 'desktop',
    browser: '',
    os: '',
    actualResult: '',
    notes: '',
    executionTime: ''
  })

  const folderTests = selectedFolder 
    ? testCases.filter(tc => tc.folderId === selectedFolder) 
    : []

  const handleTestSelect = (test) => {
    setSelectedTest(test)
    setExecutionData({
      status: '',
      environment: 'development',
      version: '',
      deviceType: 'desktop',
      browser: '',
      os: '',
      actualResult: '',
      notes: '',
      executionTime: ''
    })
  }

  const handleSubmitExecution = async (e) => {
    e.preventDefault()
    
    if (!executionData.status) {
      alert('Please select a test result status')
      return
    }

    try {
      await addTestExecution({
        testCaseId: selectedTest.id,
        executedBy: user?.id || user?.name || 'Unknown',
        ...executionData,
        executionTime: executionData.executionTime ? parseFloat(executionData.executionTime) : null
      })
      
      alert('Test execution recorded successfully!')
      setSelectedTest(null)
      setExecutionData({
        status: '',
        environment: 'development',
        version: '',
        deviceType: 'desktop',
        browser: '',
        os: '',
        actualResult: '',
        notes: '',
        executionTime: ''
      })
    } catch (error) {
      console.error('Error recording test execution:', error)
      alert('Failed to record test execution')
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pass': return <CheckCircle2 className="text-green-600" size={20} />
      case 'fail': return <XCircle className="text-red-600" size={20} />
      case 'blocked': return <AlertCircle className="text-orange-600" size={20} />
      case 'skipped': return <Clock className="text-gray-600" size={20} />
      default: return null
    }
  }

  const getStatusButtonClass = (status) => {
    const base = "flex-1 py-3 px-4 rounded-lg font-medium transition-all border-2 flex items-center justify-center gap-2"
    const selected = executionData.status === status ? "ring-4 ring-offset-2" : "opacity-70 hover:opacity-100"
    
    const colors = {
      'pass': 'bg-green-100 border-green-500 text-green-700 ring-green-300',
      'fail': 'bg-red-100 border-red-500 text-red-700 ring-red-300',
      'blocked': 'bg-orange-100 border-orange-500 text-orange-700 ring-orange-300',
      'skipped': 'bg-gray-100 border-gray-500 text-gray-700 ring-gray-300'
    }
    
    return `${base} ${colors[status]} ${selected}`
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'text-red-600 bg-red-50 border-red-200',
      'high': 'text-orange-600 bg-orange-50 border-orange-200',
      'medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'low': 'text-green-600 bg-green-50 border-green-200'
    }
    return colors[priority] || colors.medium
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary-800 flex items-center gap-3">
          <Play size={40} />
          Manual Test Execution
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Execute test cases manually and record results</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Case Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Test Case</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Folder
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => {
                setSelectedFolder(e.target.value)
                setSelectedTest(null)
              }}
              className="input"
            >
              <option value="">-- Select a folder --</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {selectedFolder && folderTests.length > 0 && (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {folderTests.map(test => {
                const isExpanded = expandedTest === test.id
                const isSelected = selectedTest?.id === test.id
                const relatedDevTasks = devTasks.filter(dt => 
                  dt.relatedTestCaseIds?.includes(test.id)
                )
                
                return (
                  <div 
                    key={test.id}
                    className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleTestSelect(test)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{test.name}</h3>
                          {test.priority && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(test.priority)}`}>
                              {test.priority}
                            </span>
                          )}
                        </div>
                        {test.description && (
                          <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                        )}
                        {test.testType && (
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {test.testType}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedTest(isExpanded ? null : test.id)
                        }}
                        className="text-gray-400 hover:text-gray-600 ml-2"
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-300 space-y-3 text-sm">
                        {test.testSteps && (
                          <div>
                            <span className="font-semibold text-gray-700">Test Steps:</span>
                            <p className="mt-1 text-gray-600 whitespace-pre-wrap">{test.testSteps}</p>
                          </div>
                        )}
                        
                        {test.expectedResult && (
                          <div>
                            <span className="font-semibold text-gray-700">Expected Result:</span>
                            <p className="mt-1 text-gray-600">{test.expectedResult}</p>
                          </div>
                        )}
                        
                        {test.acceptanceCriteria && test.acceptanceCriteria.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-700">Acceptance Criteria:</span>
                            <ul className="mt-1 space-y-1">
                              {test.acceptanceCriteria.map((ac, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className={ac.completed ? 'text-green-600' : 'text-gray-400'}>
                                    {ac.completed ? '✓' : '○'}
                                  </span>
                                  <span className="text-gray-600">{ac.description}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {relatedDevTasks.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-700 flex items-center gap-1">
                              <LinkIcon size={14} />
                              Related Dev Tasks ({relatedDevTasks.length}):
                            </span>
                            <div className="mt-1 space-y-1">
                              {relatedDevTasks.map(task => (
                                <div key={task.id} className="text-xs bg-purple-50 p-2 rounded">
                                  {task.title}
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

          {selectedFolder && folderTests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No test cases in this folder</p>
            </div>
          )}
          
          {!selectedFolder && (
            <div className="text-center py-8 text-gray-400">
              <Play size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Select a folder to begin</p>
            </div>
          )}
        </div>

        {/* Execution Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Record Execution</h2>

          {!selectedTest ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle2 size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Select a test case to record execution</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitExecution} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-1">{selectedTest.name}</h3>
                <p className="text-sm text-blue-700">{selectedTest.description}</p>
              </div>

              {/* Test Result Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Test Result *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExecutionData({ ...executionData, status: 'pass' })}
                    className={getStatusButtonClass('pass')}
                  >
                    <CheckCircle2 size={20} />
                    Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => setExecutionData({ ...executionData, status: 'fail' })}
                    className={getStatusButtonClass('fail')}
                  >
                    <XCircle size={20} />
                    Fail
                  </button>
                  <button
                    type="button"
                    onClick={() => setExecutionData({ ...executionData, status: 'blocked' })}
                    className={getStatusButtonClass('blocked')}
                  >
                    <AlertCircle size={20} />
                    Blocked
                  </button>
                  <button
                    type="button"
                    onClick={() => setExecutionData({ ...executionData, status: 'skipped' })}
                    className={getStatusButtonClass('skipped')}
                  >
                    <Clock size={20} />
                    Skipped
                  </button>
                </div>
              </div>

              {/* Environment & Version */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Environment *
                  </label>
                  <select
                    value={executionData.environment}
                    onChange={(e) => setExecutionData({ ...executionData, environment: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                    <option value="qa">QA</option>
                    <option value="uat">UAT</option>
                    <option value="local">Local</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={executionData.version}
                    onChange={(e) => setExecutionData({ ...executionData, version: e.target.value })}
                    className="input"
                    placeholder="e.g., v1.2.3"
                  />
                </div>
              </div>

              {/* Device & Browser */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Type *
                  </label>
                  <select
                    value={executionData.deviceType}
                    onChange={(e) => setExecutionData({ ...executionData, deviceType: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                    <option value="api">API</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Browser
                  </label>
                  <input
                    type="text"
                    value={executionData.browser}
                    onChange={(e) => setExecutionData({ ...executionData, browser: e.target.value })}
                    className="input"
                    placeholder="e.g., Chrome 120"
                  />
                </div>
              </div>

              {/* OS & Execution Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operating System
                  </label>
                  <input
                    type="text"
                    value={executionData.os}
                    onChange={(e) => setExecutionData({ ...executionData, os: e.target.value })}
                    className="input"
                    placeholder="e.g., Windows 11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Execution Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={executionData.executionTime}
                    onChange={(e) => setExecutionData({ ...executionData, executionTime: e.target.value })}
                    className="input"
                    min="0"
                    step="0.1"
                    placeholder="e.g., 5.5"
                  />
                </div>
              </div>

              {/* Actual Result */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Result
                </label>
                <textarea
                  value={executionData.actualResult}
                  onChange={(e) => setExecutionData({ ...executionData, actualResult: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Describe what actually happened during the test..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes / Comments
                </label>
                <textarea
                  value={executionData.notes}
                  onChange={(e) => setExecutionData({ ...executionData, notes: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Additional notes, observations, or issues..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="btn btn-success flex-1 flex items-center justify-center gap-2"
                  disabled={!executionData.status}
                >
                  <Save size={20} />
                  Record Execution
                </button>
                <button 
                  type="button" 
                  onClick={() => setSelectedTest(null)} 
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestExecution
