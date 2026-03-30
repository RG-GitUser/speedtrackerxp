import { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext()

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

// API Base URL — relative '/api' in production (same-domain proxy), full URL in dev
const API_URL = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api'

export function DataProvider({ children }) {
  const [folders, setFolders] = useState([])
  const [testStories, setTestStories] = useState([])
  const [testCases, setTestCases] = useState([])
  const [testRuns, setTestRuns] = useState([])
  const [comments, setComments] = useState([])
  const [devTasks, setDevTasks] = useState([])
  const [testExecutions, setTestExecutions] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch all data from MongoDB on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [foldersRes, testStoriesRes, testCasesRes, testRunsRes, commentsRes, devTasksRes, testExecutionsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/folders`),
        fetch(`${API_URL}/teststories`),
        fetch(`${API_URL}/testcases`),
        fetch(`${API_URL}/testruns`),
        fetch(`${API_URL}/comments`),
        fetch(`${API_URL}/devtasks`),
        fetch(`${API_URL}/testexecutions`),
        fetch(`${API_URL}/users`)
      ])

      const [foldersData, testStoriesData, testCasesData, testRunsData, commentsData, devTasksData, testExecutionsData, usersData] = await Promise.all([
        foldersRes.json(),
        testStoriesRes.json(),
        testCasesRes.json(),
        testRunsRes.json(),
        commentsRes.json(),
        devTasksRes.json(),
        testExecutionsRes.json(),
        usersRes.json()
      ])

      // Convert MongoDB _id to id for frontend compatibility
      const formatData = (items) => items.map(item => ({
        ...item,
        id: item._id,
        _id: undefined
      }))

      setFolders(formatData(foldersData))
      setTestStories(formatData(testStoriesData))
      setTestCases(formatData(testCasesData))
      setTestRuns(formatData(testRunsData))
      setComments(formatData(commentsData))
      setDevTasks(formatData(devTasksData))
      setTestExecutions(formatData(testExecutionsData))
      setUsers(formatData(usersData))

    } catch (error) {
      console.error('Error fetching data:', error)
      // Fallback to empty arrays if backend is not available
      setFolders([])
      setTestStories([])
      setTestCases([])
      setTestRuns([])
      setComments([])
      setDevTasks([])
      setTestExecutions([])
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Folder operations
  const addFolder = async (folder) => {
    try {
      const response = await fetch(`${API_URL}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...folder,
          order: folders.length
        })
      })

      const newFolder = await response.json()
      const formattedFolder = { ...newFolder, id: newFolder._id }
      setFolders([...folders, formattedFolder])
      return formattedFolder

    } catch (error) {
      console.error('Error adding folder:', error)
      throw error
    }
  }

  const updateFolder = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/folders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const updatedFolder = await response.json()
      setFolders(folders.map(f => f.id === id ? { ...updatedFolder, id: updatedFolder._id } : f))

    } catch (error) {
      console.error('Error updating folder:', error)
      throw error
    }
  }

  const deleteFolder = async (id) => {
    try {
      await fetch(`${API_URL}/folders/${id}`, {
        method: 'DELETE'
      })

      setFolders(folders.filter(f => f.id !== id))
      setTestStories(testStories.filter(ts => ts.folderId !== id))
      setTestCases(testCases.filter(tc => tc.folderId !== id))

    } catch (error) {
      console.error('Error deleting folder:', error)
      throw error
    }
  }

  // Test story operations
  const addTestStory = async (testStory) => {
    try {
      const folderTestStories = testStories.filter(ts => ts.folderId === testStory.folderId)
      
      const response = await fetch(`${API_URL}/teststories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testStory,
          order: folderTestStories.length
        })
      })

      const newTestStory = await response.json()
      const formattedTestStory = { ...newTestStory, id: newTestStory._id }
      setTestStories([...testStories, formattedTestStory])
      return formattedTestStory

    } catch (error) {
      console.error('Error adding test story:', error)
      throw error
    }
  }

  const updateTestStory = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/teststories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const updatedTestStory = await response.json()
      setTestStories(testStories.map(ts => ts.id === id ? { ...updatedTestStory, id: updatedTestStory._id } : ts))

    } catch (error) {
      console.error('Error updating test story:', error)
      throw error
    }
  }

  const deleteTestStory = async (id) => {
    try {
      await fetch(`${API_URL}/teststories/${id}`, {
        method: 'DELETE'
      })

      setTestStories(testStories.filter(ts => ts.id !== id))
      setTestCases(testCases.filter(tc => tc.testStoryId !== id))

    } catch (error) {
      console.error('Error deleting test story:', error)
      throw error
    }
  }

  // Test case operations
  const addTestCase = async (testCase) => {
    try {
      const folderTestCases = testCases.filter(tc => tc.folderId === testCase.folderId)
      
      const response = await fetch(`${API_URL}/testcases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testCase,
          order: folderTestCases.length,
          assignedTo: testCase.assignedTo || null
        })
      })

      const newTestCase = await response.json()
      const formattedTestCase = { ...newTestCase, id: newTestCase._id }
      setTestCases([...testCases, formattedTestCase])
      return formattedTestCase

    } catch (error) {
      console.error('Error adding test case:', error)
      throw error
    }
  }

  const updateTestCase = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/testcases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const updatedTestCase = await response.json()
      setTestCases(testCases.map(tc => tc.id === id ? { ...updatedTestCase, id: updatedTestCase._id } : tc))

    } catch (error) {
      console.error('Error updating test case:', error)
      throw error
    }
  }

  const deleteTestCase = async (id) => {
    try {
      await fetch(`${API_URL}/testcases/${id}`, {
        method: 'DELETE'
      })

      setTestCases(testCases.filter(tc => tc.id !== id))

    } catch (error) {
      console.error('Error deleting test case:', error)
      throw error
    }
  }

  // Test run operations
  const createTestRun = async (selectedTests, userId) => {
    try {
      const response = await fetch(`${API_URL}/testruns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createdBy: userId,
          status: 'running',
          tests: selectedTests.map(testId => ({
            testCaseId: testId,
            status: 'pending',
            startTime: null,
            endTime: null,
            logs: [],
            result: null
          }))
        })
      })

      const newRun = await response.json()
      const formattedRun = { ...newRun, id: newRun._id }
      setTestRuns([formattedRun, ...testRuns])
      return formattedRun  // Return the full object instead of just the ID

    } catch (error) {
      console.error('Error creating test run:', error)
      throw error
    }
  }

  const updateTestRun = async (runId, updates) => {
    try {
      const response = await fetch(`${API_URL}/testruns/${runId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const updatedRun = await response.json()
      setTestRuns(testRuns.map(run => run.id === runId ? { ...updatedRun, id: updatedRun._id } : run))

    } catch (error) {
      console.error('Error updating test run:', error)
      throw error
    }
  }

  const updateTestInRun = async (runId, testCaseId, updates) => {
    try {
      const response = await fetch(`${API_URL}/testruns/${runId}/tests/${testCaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const updatedRun = await response.json()
      setTestRuns(testRuns.map(run => run.id === runId ? { ...updatedRun, id: updatedRun._id } : run))

    } catch (error) {
      console.error('Error updating test in run:', error)
      throw error
    }
  }

  // Comment operations
  const addComment = async (comment) => {
    try {
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      })

      const newComment = await response.json()
      const formattedComment = { ...newComment, id: newComment._id }
      setComments([...comments, formattedComment])
      return formattedComment

    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }

  const deleteComment = async (id) => {
    try {
      await fetch(`${API_URL}/comments/${id}`, {
        method: 'DELETE'
      })

      setComments(comments.filter(c => c.id !== id))

    } catch (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  }

  // Dev task operations
  const addDevTask = async (devTask) => {
    try {
      const folderDevTasks = devTasks.filter(dt => dt.folderId === devTask.folderId)
      
      const response = await fetch(`${API_URL}/devtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...devTask,
          order: folderDevTasks.length
        })
      })

      const newDevTask = await response.json()
      const formattedDevTask = { ...newDevTask, id: newDevTask._id }
      setDevTasks([...devTasks, formattedDevTask])
      return formattedDevTask

    } catch (error) {
      console.error('Error adding dev task:', error)
      throw error
    }
  }

  const updateDevTask = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/devtasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const updatedDevTask = await response.json()
      setDevTasks(devTasks.map(dt => dt.id === id ? { ...updatedDevTask, id: updatedDevTask._id } : dt))

    } catch (error) {
      console.error('Error updating dev task:', error)
      throw error
    }
  }

  const deleteDevTask = async (id) => {
    try {
      await fetch(`${API_URL}/devtasks/${id}`, {
        method: 'DELETE'
      })

      setDevTasks(devTasks.filter(dt => dt.id !== id))

    } catch (error) {
      console.error('Error deleting dev task:', error)
      throw error
    }
  }

  // Test execution operations
  const addTestExecution = async (testExecution) => {
    try {
      const response = await fetch(`${API_URL}/testexecutions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testExecution)
      })

      const newExecution = await response.json()
      const formattedExecution = { ...newExecution, id: newExecution._id }
      setTestExecutions([formattedExecution, ...testExecutions])
      return formattedExecution

    } catch (error) {
      console.error('Error adding test execution:', error)
      throw error
    }
  }

  const updateTestExecution = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/testexecutions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const updatedExecution = await response.json()
      setTestExecutions(testExecutions.map(te => te.id === id ? { ...updatedExecution, id: updatedExecution._id } : te))

    } catch (error) {
      console.error('Error updating test execution:', error)
      throw error
    }
  }

  const deleteTestExecution = async (id) => {
    try {
      await fetch(`${API_URL}/testexecutions/${id}`, {
        method: 'DELETE'
      })

      setTestExecutions(testExecutions.filter(te => te.id !== id))

    } catch (error) {
      console.error('Error deleting test execution:', error)
      throw error
    }
  }

  const value = {
    folders,
    testStories,
    testCases,
    testRuns,
    comments,
    devTasks,
    testExecutions,
    users,
    loading,
    addFolder,
    updateFolder,
    deleteFolder,
    addTestStory,
    updateTestStory,
    deleteTestStory,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    createTestRun,
    updateTestRun,
    updateTestInRun,
    addComment,
    deleteComment,
    addDevTask,
    updateDevTask,
    deleteDevTask,
    addTestExecution,
    updateTestExecution,
    deleteTestExecution,
    refreshData: fetchAllData
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
