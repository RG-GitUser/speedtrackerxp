import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { Play, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react'

function TestExecution() {
  const { folders, testCases, createTestRun, updateTestRun, updateTestInRun, testRuns } = useData()
  const { user } = useAuth()
  const [selectedFolder, setSelectedFolder] = useState('')
  const [selectedTests, setSelectedTests] = useState(new Set())
  const [isRunning, setIsRunning] = useState(false)
  const [currentRunId, setCurrentRunId] = useState(null)

  const folderTests = selectedFolder ? testCases.filter(tc => tc.folderId === selectedFolder) : []
  const currentRun = currentRunId ? testRuns.find(r => r.id === currentRunId) : null

  const toggleTest = (testId) => {
    const newSelected = new Set(selectedTests)
    if (newSelected.has(testId)) {
      newSelected.delete(testId)
    } else {
      newSelected.add(testId)
    }
    setSelectedTests(newSelected)
  }

  const selectAll = () => {
    setSelectedTests(new Set(folderTests.map(t => t.id)))
  }

  const deselectAll = () => {
    setSelectedTests(new Set())
  }

  // Simulate test execution
  const simulateTestExecution = async (runId, testId) => {
    const test = testCases.find(tc => tc.id === testId)
    
    // Start test
    updateTestInRun(runId, testId, {
      status: 'running',
      startTime: new Date().toISOString(),
      logs: [`Starting test: ${test.name}`]
    })

    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Add some log entries
    const logs = [
      `Starting test: ${test.name}`,
      `Executing script: ${test.script}`,
      'Setting up test environment...',
      'Running test assertions...'
    ]

    for (const log of logs) {
      await new Promise(resolve => setTimeout(resolve, 500))
      updateTestInRun(runId, testId, { logs })
    }

    // Random pass/fail (80% pass rate)
    const passed = Math.random() > 0.2
    const finalLogs = [
      ...logs,
      passed ? 'All assertions passed' : 'Assertion failed: Expected behavior not met',
      `Test ${passed ? 'PASSED' : 'FAILED'}`
    ]

    updateTestInRun(runId, testId, {
      status: passed ? 'passed' : 'failed',
      endTime: new Date().toISOString(),
      logs: finalLogs,
      result: passed ? 'success' : 'failure'
    })
  }

  const runTests = async () => {
    if (selectedTests.size === 0) return

    setIsRunning(true)
    const runId = createTestRun(Array.from(selectedTests), user.id)
    setCurrentRunId(runId)

    // Execute tests sequentially
    for (const testId of selectedTests) {
      await simulateTestExecution(runId, testId)
    }

    // Complete the run
    updateTestRun(runId, {
      status: 'completed',
      completedAt: new Date().toISOString()
    })

    setIsRunning(false)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary-800">
          🏎️ Execute Tests
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Select and run test cases at lightning speed</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Tests</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Folder
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => {
                setSelectedFolder(e.target.value)
                setSelectedTests(new Set())
              }}
              className="input"
              disabled={isRunning}
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
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">
                  {selectedTests.size} of {folderTests.length} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    disabled={isRunning}
                    className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    disabled={isRunning}
                    className="text-sm text-gray-600 hover:text-gray-700 disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {folderTests.map(test => (
                  <label
                    key={test.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedTests.has(test.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTests.has(test.id)}
                      onChange={() => toggleTest(test.id)}
                      disabled={isRunning}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{test.name}</p>
                      <p className="text-sm text-gray-600">{test.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={runTests}
                disabled={selectedTests.size === 0 || isRunning}
                className="btn btn-success w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Run Selected Tests ({selectedTests.size})
                  </>
                )}
              </button>
            </>
          )}

          {selectedFolder && folderTests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No test cases in this folder</p>
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>

          {!currentRun ? (
            <div className="text-center py-12 text-gray-500">
              <Play size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Select tests and click "Run" to see results</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {currentRun.tests.map(test => {
                const testCase = testCases.find(tc => tc.id === test.testCaseId)
                
                return (
                  <div key={test.testCaseId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{testCase?.name}</h3>
                      <span className={`flex items-center gap-1 ${
                        test.status === 'passed' ? 'text-green-600' :
                        test.status === 'failed' ? 'text-red-600' :
                        test.status === 'running' ? 'text-blue-600' :
                        'text-gray-400'
                      }`}>
                        {test.status === 'passed' && <CheckCircle2 size={18} />}
                        {test.status === 'failed' && <XCircle size={18} />}
                        {test.status === 'running' && <Loader2 size={18} className="animate-spin" />}
                        <span className="text-sm font-medium capitalize">{test.status}</span>
                      </span>
                    </div>

                    {test.logs && test.logs.length > 0 && (
                      <div className="bg-gray-900 text-gray-100 rounded p-3 text-xs font-mono space-y-1 max-h-48 overflow-y-auto">
                        {test.logs.map((log, i) => (
                          <div key={i}>{log}</div>
                        ))}
                      </div>
                    )}

                    {test.startTime && test.endTime && (
                      <div className="mt-2 text-xs text-gray-500">
                        Duration: {Math.round((new Date(test.endTime) - new Date(test.startTime)) / 1000)}s
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestExecution
