import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Send,
  Trash2,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

function TestHistory() {
  const { testRuns, testCases, comments, addComment, deleteComment } = useData()
  const { user } = useAuth()
  const [selectedRun, setSelectedRun] = useState(null)
  const [expandedTests, setExpandedTests] = useState(new Set())
  const [commentText, setCommentText] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredRuns = filterStatus === 'all'
    ? testRuns
    : testRuns.filter(run => run.status === filterStatus)

  const toggleTestDetails = (testId) => {
    const newExpanded = new Set(expandedTests)
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId)
    } else {
      newExpanded.add(testId)
    }
    setExpandedTests(newExpanded)
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!commentText.trim() || !selectedRun) return

    addComment({
      testRunId: selectedRun.id,
      userId: user.id,
      userName: user.name,
      text: commentText
    })
    setCommentText('')
  }

  const runComments = selectedRun
    ? comments.filter(c => c.testRunId === selectedRun.id)
    : []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary-800">
          🏁 Test History
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Track and analyze test runs over time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Runs List */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Test Runs</h2>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="running">Running</option>
              </select>
            </div>

            {filteredRuns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No test runs yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredRuns.map(run => {
                  const passed = run.tests.filter(t => t.status === 'passed').length
                  const failed = run.tests.filter(t => t.status === 'failed').length
                  const total = run.tests.length

                  return (
                    <button
                      key={run.id}
                      onClick={() => {
                        setSelectedRun(run)
                        setExpandedTests(new Set())
                      }}
                      className={`w-full text-left border-2 rounded-lg p-3 transition-colors ${
                        selectedRun?.id === run.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">
                          {format(new Date(run.createdAt), 'MMM d, h:mm a')}
                        </span>
                        <span className={`badge ${
                          run.status === 'completed' ? 'badge-success' :
                          run.status === 'failed' ? 'badge-error' :
                          'badge-info'
                        }`}>
                          {run.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 size={14} />
                          <span>{passed}</span>
                        </div>
                        {failed > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle size={14} />
                            <span>{failed}</span>
                          </div>
                        )}
                        <span className="text-gray-500">/ {total}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Test Run Details */}
        <div className="lg:col-span-2">
          {!selectedRun ? (
            <div className="card text-center py-12">
              <Clock size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a test run</h3>
              <p className="text-gray-600">Choose a test run from the list to view details</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Run Summary */}
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Test Run Details
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(selectedRun.createdAt), 'MMMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <span className={`badge ${
                    selectedRun.status === 'completed' ? 'badge-success' :
                    selectedRun.status === 'failed' ? 'badge-error' :
                    'badge-info'
                  }`}>
                    {selectedRun.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedRun.tests.length}
                    </p>
                    <p className="text-sm text-gray-600">Total Tests</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedRun.tests.filter(t => t.status === 'passed').length}
                    </p>
                    <p className="text-sm text-gray-600">Passed</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {selectedRun.tests.filter(t => t.status === 'failed').length}
                    </p>
                    <p className="text-sm text-gray-600">Failed</p>
                  </div>
                </div>
              </div>

              {/* Test Details */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Cases</h3>
                <div className="space-y-3">
                  {selectedRun.tests.map(test => {
                    const testCase = testCases.find(tc => tc.id === test.testCaseId)
                    const isExpanded = expandedTests.has(test.testCaseId)

                    return (
                      <div key={test.testCaseId} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleTestDetails(test.testCaseId)}
                          className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                        >
                          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          <div className="flex-1 text-left">
                            <h4 className="font-medium text-gray-900">{testCase?.name}</h4>
                            {test.startTime && test.endTime && (
                              <p className="text-xs text-gray-500 mt-1">
                                Duration: {Math.round((new Date(test.endTime) - new Date(test.startTime)) / 1000)}s
                              </p>
                            )}
                          </div>
                          <span className={`flex items-center gap-1 ${
                            test.status === 'passed' ? 'text-green-600' :
                            test.status === 'failed' ? 'text-red-600' :
                            'text-gray-400'
                          }`}>
                            {test.status === 'passed' && <CheckCircle2 size={18} />}
                            {test.status === 'failed' && <XCircle size={18} />}
                            <span className="text-sm font-medium capitalize">{test.status}</span>
                          </span>
                        </button>

                        {isExpanded && test.logs && (
                          <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Test Logs</h5>
                            <div className="bg-gray-900 text-gray-100 rounded p-3 text-xs font-mono space-y-1 max-h-48 overflow-y-auto">
                              {test.logs.map((log, i) => (
                                <div key={i}>{log}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Comments */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Comments
                </h3>

                <div className="space-y-3 mb-4">
                  {runComments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                  ) : (
                    runComments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm text-gray-900">{comment.userName}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                          {comment.userId === user.id && (
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="input flex-1"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send size={16} />
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestHistory
