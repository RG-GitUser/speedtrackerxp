import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { Play, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react'

function TestExecution() {
  const { folders, testCases, createTestRun, updateTestRun, updateTestInRun, testRuns, refreshData } = useData()
  const { user } = useAuth()
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('')
  const [selectedTests, setSelectedTests] = useState(new Set())
  const [isRunning, setIsRunning] = useState(false)
  const [currentRun, setCurrentRun] = useState(null)
  const [error, setError] = useState(null)
  const [usePlaywright, setUsePlaywright] = useState(false)

  // Get root folders (projects)
  const projectFolders = folders.filter(f => !f.parentId)
  
  // Get child folders of selected project
  const childFolders = selectedProject 
    ? folders.filter(f => f.parentId === selectedProject) 
    : []
  
  // Get tests for selected folder (or all tests in project if no specific folder selected)
  const folderTests = selectedFolder 
    ? testCases.filter(tc => tc.folderId === selectedFolder)
    : selectedProject && childFolders.length === 0
    ? testCases.filter(tc => tc.folderId === selectedProject)
    : []
  
  // Helper to refresh current run from latest data
  const refreshCurrentRun = async (runId) => {
    // Small delay to ensure backend has updated
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Fetch latest data
    const response = await fetch(`http://localhost:3001/api/testruns/${runId}`)
    const updatedRun = await response.json()
    const formattedRun = { ...updatedRun, id: updatedRun._id }
    setCurrentRun(formattedRun)
    console.log('🔄 Refreshed current run:', formattedRun)
  }
  
  // Update currentRun whenever testRuns changes
  useEffect(() => {
    if (currentRun && currentRun.id) {
      const updatedRun = testRuns.find(r => r.id === currentRun.id)
      if (updatedRun) {
        console.log('Syncing current run from testRuns:', updatedRun)
        setCurrentRun(updatedRun)
      }
    }
  }, [testRuns])
  
  // Debug logging
  useEffect(() => {
    console.log('TestExecution state updated:', {
      currentRun: currentRun ? { id: currentRun.id, testsCount: currentRun.tests?.length } : null,
      testRunsCount: testRuns.length
    })
  }, [currentRun, testRuns])

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
    await updateTestInRun(runId, testId, {
      status: 'running',
      startTime: new Date().toISOString(),
      logs: [`Starting test: ${test.name}`]
    })
    await refreshCurrentRun(runId)

    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Add some log entries
    const logs = [
      `Starting test: ${test.name}`,
      `Executing script: ${test.script}`,
      'Setting up test environment...',
      'Running test assertions...'
    ]

    for (const log of logs) {
      await new Promise(resolve => setTimeout(resolve, 100))
      await updateTestInRun(runId, testId, { logs })
      await refreshCurrentRun(runId)
    }

    // Random pass/fail (80% pass rate)
    const passed = Math.random() > 0.2
    const finalLogs = [
      ...logs,
      passed ? 'All assertions passed' : 'Assertion failed: Expected behavior not met',
      `Test ${passed ? 'PASSED' : 'FAILED'}`
    ]

    await updateTestInRun(runId, testId, {
      status: passed ? 'passed' : 'failed',
      endTime: new Date().toISOString(),
      logs: finalLogs,
      result: passed ? 'success' : 'failure'
    })
    await refreshCurrentRun(runId)
  }

  // Execute real Playwright test
  const executePlaywrightTest = async (runId, testId) => {
    const test = testCases.find(tc => tc.id === testId)
    
    console.log('🎭 PLAYWRIGHT MODE: Executing real browser test for:', test.name)
    
    // Start test
    await updateTestInRun(runId, testId, {
      status: 'running',
      startTime: new Date().toISOString(),
      logs: [`🎭 Starting Playwright test: ${test.name}`, `📂 Test file: ${test.script || 'tests/app-navigation.spec.js'}`, `🚀 Launching browser...`]
    })
    await refreshCurrentRun(runId)

    try {
      console.log('📡 Calling Playwright API endpoint...')
      const response = await fetch('http://localhost:3001/api/execute-playwright-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testPath: test.script || 'tests/app-navigation.spec.js'
        })
      })

      console.log('📦 Playwright API response received')
      const result = await response.json()
      console.log('🎭 Playwright result:', result)
      
      // Parse Playwright results
      const passed = result.success
      const logs = [
        `🎭 Starting Playwright test: ${test.name}`,
        `📂 Test file: ${test.script || 'tests/app-navigation.spec.js'}`,
        `🚀 Launching browser...`,
        ...(result.logs ? result.logs.split('\n').filter(l => l.trim()) : []),
        passed ? '✅ All Playwright tests passed' : '❌ Some Playwright tests failed',
        `Exit code: ${result.exitCode}`
      ]

      await updateTestInRun(runId, testId, {
        status: passed ? 'passed' : 'failed',
        endTime: new Date().toISOString(),
        logs,
        result: passed ? 'success' : 'failure'
      })
      await refreshCurrentRun(runId)

    } catch (error) {
      console.error('❌ Playwright execution error:', error)
      await updateTestInRun(runId, testId, {
        status: 'failed',
        endTime: new Date().toISOString(),
        logs: [
          `🎭 Starting Playwright test: ${test.name}`,
          `❌ Error executing Playwright test`,
          `Error: ${error.message}`,
          'Make sure your app is running and the test file exists'
        ],
        result: 'failure'
      })
      await refreshCurrentRun(runId)
    }
  }

  const runTests = async () => {
    if (selectedTests.size === 0) return

    setIsRunning(true)
    setError(null)
    
    try {
      console.log('Creating test run for tests:', Array.from(selectedTests))
      const newRun = await createTestRun(Array.from(selectedTests), user.id)
      console.log('Test run created:', newRun)
      
      if (!newRun || !newRun.id) {
        throw new Error('Failed to create test run. Is the backend server running on port 3001?')
      }
      
      setCurrentRun(newRun)
      console.log('CurrentRun set to:', newRun)

      // Execute tests sequentially
      for (const testId of selectedTests) {
        console.log('Executing test:', testId)
        if (usePlaywright) {
          await executePlaywrightTest(newRun.id, testId)
        } else {
          await simulateTestExecution(newRun.id, testId)
        }
      }

      // Complete the run
      await updateTestRun(newRun.id, {
        status: 'completed',
        completedAt: new Date().toISOString()
      })
      console.log('Test run completed')
    } catch (err) {
      console.error('Error running tests:', err)
      setError(err.message || 'Failed to run tests. Please ensure the backend server is running.')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header with cool racing image */}
      <div className="mb-8 flex items-center justify-between relative overflow-hidden">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-primary-800">
            Execute Tests
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Select and run test cases at lightning speed</p>
        </div>
        <div className="ml-8">
          <img 
            src="/src/testingtime.png" 
            alt="Speed Testing" 
            className="w-64 h-64 object-contain transition-opacity duration-300 hover:opacity-100"
            style={{ 
              filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))',
              transform: 'scaleX(-1)',
              opacity: 0.9
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Tests</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Project Folder
            </label>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value)
                setSelectedFolder('')
                setSelectedTests(new Set())
              }}
              className="input"
              disabled={isRunning}
            >
              <option value="">-- Select a project --</option>
              {projectFolders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  📁 {folder.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProject && childFolders.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Test Folder (Optional)
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
                <option value="">-- All tests in project --</option>
                {childFolders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    🏁 {folder.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to see all tests in the project
              </p>
            </div>
          )}

          {selectedProject && folderTests.length > 0 && (
            <>
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePlaywright}
                    onChange={(e) => setUsePlaywright(e.target.checked)}
                    disabled={isRunning}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    🎭 Use Playwright (Real Browser Tests)
                  </span>
                </label>
                <p className="text-xs text-gray-600 mt-1 ml-6">
                  {usePlaywright 
                    ? 'Will execute actual Playwright tests in real browser' 
                    : 'Will simulate test execution with random results'}
                </p>
              </div>

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
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">Error running tests</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                      <p className="text-xs text-red-600 mt-2">
                        💡 Tip: Make sure the backend server is running with <code className="bg-red-100 px-1 rounded">npm start</code> in the server folder
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {selectedProject && folderTests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No test cases in this folder</p>
            </div>
          )}
          
          {!selectedProject && (
            <div className="text-center py-8 text-gray-400">
              <Play size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Select a project folder to begin</p>
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
            {currentRun && (
              <div className="flex items-center gap-2 text-sm">
                {usePlaywright ? (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                    🎭 Playwright Mode
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    ⚡ Simulation Mode
                  </span>
                )}
              </div>
            )}
          </div>

          {!currentRun ? (
            <div className="text-center py-12 text-gray-500">
              <Play size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Select tests and click "Run" to see results</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {currentRun.tests && currentRun.tests.length > 0 ? (
                currentRun.tests.map(test => {
                  const testCase = testCases.find(tc => tc.id === test.testCaseId)
                  const isPlaywrightTest = test.logs && test.logs.some(log => log.includes('🎭'))
                  
                  return (
                    <div key={test.testCaseId} className={`border-2 rounded-lg p-4 ${
                      isPlaywrightTest ? 'border-purple-200 bg-purple-50/30' : 'border-gray-200'
                    }`}>
                      {/* Header with test name and status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isPlaywrightTest && <span className="text-purple-600">🎭</span>}
                            <h3 className="font-semibold text-gray-900">{testCase?.name || `Test ${test.testCaseId}`}</h3>
                          </div>
                          {testCase?.description && (
                            <p className="text-xs text-gray-600">{testCase.description}</p>
                          )}
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium ${
                          test.status === 'passed' ? 'bg-green-100 text-green-700' :
                          test.status === 'failed' ? 'bg-red-100 text-red-700' :
                          test.status === 'running' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {test.status === 'passed' && <CheckCircle2 size={16} />}
                          {test.status === 'failed' && <XCircle size={16} />}
                          {test.status === 'running' && <Loader2 size={16} className="animate-spin" />}
                          <span className="text-xs font-semibold uppercase">{test.status}</span>
                        </span>
                      </div>

                      {/* Test logs with enhanced formatting */}
                      {test.logs && test.logs.length > 0 && (
                        <div className="mb-3">
                          <div className="bg-gray-900 rounded-lg p-4 text-xs font-mono max-h-64 overflow-y-auto">
                            {test.logs.map((log, i) => {
                              // Color code different types of log messages
                              let logClass = 'text-gray-300'
                              
                              if (log.includes('✅') || log.toLowerCase().includes('passed')) {
                                logClass = 'text-green-400 font-semibold'
                              } else if (log.includes('❌') || log.toLowerCase().includes('failed')) {
                                logClass = 'text-red-400 font-semibold'
                              } else if (log.includes('🎭')) {
                                logClass = 'text-purple-400'
                              } else if (log.includes('🚀') || log.includes('📂') || log.includes('📡')) {
                                logClass = 'text-blue-400'
                              } else if (log.toLowerCase().includes('error')) {
                                logClass = 'text-red-300'
                              } else if (log.toLowerCase().includes('warning')) {
                                logClass = 'text-yellow-300'
                              }
                              
                              return (
                                <div key={i} className={`py-0.5 ${logClass}`}>
                                  <span className="text-gray-500 mr-2">{i + 1}.</span>
                                  {log}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Test metadata */}
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        {test.startTime && test.endTime && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">⏱️ Duration:</span>
                            <span className="font-mono font-semibold text-gray-900">
                              {Math.round((new Date(test.endTime) - new Date(test.startTime)) / 1000)}s
                            </span>
                          </div>
                        )}
                        {testCase?.script && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">📄 Script:</span>
                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                              {testCase.script}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No tests in this run</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestExecution
