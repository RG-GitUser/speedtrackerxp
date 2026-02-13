import { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext()

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

// API Base URL - change this if your backend runs on a different port
const API_URL = 'http://localhost:3001/api'

export function DataProvider({ children }) {
  const [folders, setFolders] = useState([])
  const [testCases, setTestCases] = useState([])
  const [testRuns, setTestRuns] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch all data from MongoDB on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [foldersRes, testCasesRes, testRunsRes, commentsRes] = await Promise.all([
        fetch(`${API_URL}/folders`),
        fetch(`${API_URL}/testcases`),
        fetch(`${API_URL}/testruns`),
        fetch(`${API_URL}/comments`)
      ])

      const [foldersData, testCasesData, testRunsData, commentsData] = await Promise.all([
        foldersRes.json(),
        testCasesRes.json(),
        testRunsRes.json(),
        commentsRes.json()
      ])

      // Convert MongoDB _id to id for frontend compatibility
      const formatData = (items) => items.map(item => ({
        ...item,
        id: item._id,
        _id: undefined
      }))

      setFolders(formatData(foldersData))
      setTestCases(formatData(testCasesData))
      setTestRuns(formatData(testRunsData))
      setComments(formatData(commentsData))

    } catch (error) {
      console.error('Error fetching data:', error)
      // Fallback to empty arrays if backend is not available
      setFolders([])
      setTestCases([])
      setTestRuns([])
      setComments([])
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
      setTestCases(testCases.filter(tc => tc.folderId !== id))

    } catch (error) {
      console.error('Error deleting folder:', error)
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
      return formattedRun.id

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

  const value = {
    folders,
    testCases,
    testRuns,
    comments,
    loading,
    addFolder,
    updateFolder,
    deleteFolder,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    createTestRun,
    updateTestRun,
    updateTestInRun,
    addComment,
    deleteComment,
    refreshData: fetchAllData
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
