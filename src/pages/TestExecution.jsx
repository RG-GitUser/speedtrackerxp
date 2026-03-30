import { useState, useEffect } from 'react'
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
  BookOpen,
  FileText,
  FolderOpen,
  Save,
  List,
  User,
  Filter,
  Wrench,
  Search,
  X
} from 'lucide-react'

function TestExecution() {
  const { folders, testStories, testCases, devTasks, users, addTestExecution } = useData()
  const { user } = useAuth()
  const [expandedProjects, setExpandedProjects] = useState(new Set())
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [expandedStories, setExpandedStories] = useState(new Set())
  const [selectedTest, setSelectedTest] = useState(null)
  const [showMyTestsOnly, setShowMyTestsOnly] = useState(false)
  const [assignedUserFilter, setAssignedUserFilter] = useState('')
  const [treeSearchQuery, setTreeSearchQuery] = useState('')
  const [showSteps, setShowSteps] = useState(true)
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

  const rootFolders = folders.filter(f => !f.parentId)
  const isFiltering = showMyTestsOnly || assignedUserFilter || treeSearchQuery.trim()

  // Auto-expand tree when filters/search are active to reveal matching items
  useEffect(() => {
    if (!isFiltering) return

    const query = treeSearchQuery.trim().toLowerCase()
    const matchingProjectIds = new Set()
    const matchingFolderIds = new Set()
    const matchingStoryIds = new Set()

    // Find all test cases that match the current filters
    testCases.forEach(tc => {
      let matches = true
      if (showMyTestsOnly && tc.assignedTo !== user?.name) matches = false
      if (assignedUserFilter && tc.assignedTo !== assignedUserFilter) matches = false
      if (query && !tc.name.toLowerCase().includes(query)) matches = false

      if (matches) {
        // Find the story and folder chain for this test case
        const story = testStories.find(s => s.id === tc.testStoryId)
        if (story) {
          matchingStoryIds.add(story.id)
          // Walk up the folder chain
          let folderId = story.folderId || tc.folderId
          while (folderId) {
            const folder = folders.find(f => f.id === folderId)
            if (!folder) break
            if (folder.parentId) {
              matchingFolderIds.add(folder.id)
              folderId = folder.parentId
            } else {
              matchingProjectIds.add(folder.id)
              folderId = null
            }
          }
        }
      }
    })

    // Also check stories assigned to the filtered user
    if (assignedUserFilter || showMyTestsOnly) {
      const targetUser = assignedUserFilter || user?.name
      testStories.forEach(story => {
        if (story.assignedTo === targetUser) {
          matchingStoryIds.add(story.id)
          let folderId = story.folderId
          while (folderId) {
            const folder = folders.find(f => f.id === folderId)
            if (!folder) break
            if (folder.parentId) {
              matchingFolderIds.add(folder.id)
              folderId = folder.parentId
            } else {
              matchingProjectIds.add(folder.id)
              folderId = null
            }
          }
        }
      })
    }

    // Also check stories matching search query
    if (query) {
      testStories.forEach(story => {
        if (story.title.toLowerCase().includes(query)) {
          matchingStoryIds.add(story.id)
          let folderId = story.folderId
          while (folderId) {
            const folder = folders.find(f => f.id === folderId)
            if (!folder) break
            if (folder.parentId) {
              matchingFolderIds.add(folder.id)
              folderId = folder.parentId
            } else {
              matchingProjectIds.add(folder.id)
              folderId = null
            }
          }
        }
      })
    }

    setExpandedProjects(matchingProjectIds)
    setExpandedFolders(matchingFolderIds)
    setExpandedStories(matchingStoryIds)
  }, [assignedUserFilter, showMyTestsOnly, treeSearchQuery])

  const toggleSet = (set, setFn, id) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setFn(next)
  }

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
        executedBy: user?.name || 'Unknown',
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

  // Get child folders for a given parent
  const getChildFolders = (parentId) => folders.filter(f => f.parentId === parentId)

  // Count all test cases under a folder (including subfolders)
  const countTestsInFolder = (folderId) => {
    let count = testCases.filter(tc => tc.folderId === folderId).length
    const children = getChildFolders(folderId)
    children.forEach(child => { count += countTestsInFolder(child.id) })
    return count
  }

  // Count test cases under a story
  const countTestsInStory = (storyId) => testCases.filter(tc => tc.testStoryId === storyId).length

  // Render a subfolder node in the tree
  const renderSubfolder = (folder, depth = 1) => {
    const childFolders = getChildFolders(folder.id)
    const folderStories = testStories.filter(ts => ts.folderId === folder.id)
    const isExpanded = expandedFolders.has(folder.id)
    const testCount = countTestsInFolder(folder.id)

    return (
      <div key={folder.id} className="border-l-2 border-gray-200">
        <button
          onClick={() => toggleSet(expandedFolders, setExpandedFolders, folder.id)}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {isExpanded ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
          <FolderOpen size={16} className="text-amber-500 shrink-0" />
          <span className="font-medium text-gray-800 text-sm truncate">{folder.name}</span>
          <span className="text-xs text-gray-400 ml-auto shrink-0">{testCount} tests</span>
        </button>

        {isExpanded && (
          <div>
            {/* Nested subfolders */}
            {childFolders.map(child => renderSubfolder(child, depth + 1))}

            {/* User stories in this folder */}
            {folderStories.map(story => renderStory(story, folder.id, depth + 1))}

            {folderStories.length === 0 && childFolders.length === 0 && (
              <p className="text-xs text-gray-400 italic py-2" style={{ paddingLeft: `${(depth + 1) * 16 + 12}px` }}>
                No user stories
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  // Render a user story node
  const renderStory = (story, folderId, depth) => {
    const allStoryCases = testCases.filter(tc => tc.testStoryId === story.id)
    let storyCases = allStoryCases

    // Filter by "my tests"
    if (showMyTestsOnly) {
      storyCases = storyCases.filter(tc => tc.assignedTo === user?.name)
    }
    // Filter by assigned user dropdown
    if (assignedUserFilter) {
      storyCases = storyCases.filter(tc => tc.assignedTo === assignedUserFilter)
    }
    // Filter by search query
    const query = treeSearchQuery.trim().toLowerCase()
    if (query) {
      storyCases = storyCases.filter(tc => tc.name.toLowerCase().includes(query))
    }

    const isExpanded = expandedStories.has(story.id)
    const isStoryAssigned = story.assignedTo === user?.name
    const storyMatchesSearch = query ? story.title.toLowerCase().includes(query) : true
    const storyMatchesUser = assignedUserFilter ? story.assignedTo === assignedUserFilter : true

    // Skip if filters active and nothing matches
    if (showMyTestsOnly && storyCases.length === 0 && !isStoryAssigned) return null
    if (assignedUserFilter && storyCases.length === 0 && story.assignedTo !== assignedUserFilter) return null
    if (query && storyCases.length === 0 && !storyMatchesSearch) return null

    return (
      <div key={story.id}>
        <button
          onClick={() => toggleSet(expandedStories, setExpandedStories, story.id)}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 transition-colors text-left"
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {isExpanded ? <ChevronDown size={14} className="text-blue-400 shrink-0" /> : <ChevronRight size={14} className="text-blue-400 shrink-0" />}
          <BookOpen size={16} className="text-blue-500 shrink-0" />
          <span className="font-medium text-blue-800 text-sm truncate">{story.title}</span>
          {story.assignedTo && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 shrink-0 ${
              isStoryAssigned ? 'bg-primary-100 text-primary-700' :
              (assignedUserFilter && story.assignedTo === assignedUserFilter) ? 'bg-blue-200 text-blue-800' :
              isFiltering ? 'bg-gray-100 text-gray-600' : 'hidden'
            }`}>
              <User size={9} /> {isStoryAssigned ? 'Yours' : story.assignedTo}
            </span>
          )}
          <span className="text-xs text-blue-400 ml-auto shrink-0">{storyCases.length} tests</span>
        </button>

        {isExpanded && (
          <div>
            {storyCases.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2" style={{ paddingLeft: `${(depth + 1) * 16 + 12}px` }}>
                No test cases
              </p>
            ) : (
              storyCases.map(tc => {
                const isSelected = selectedTest?.id === tc.id
                const isAssigned = tc.assignedTo === user?.name
                const isFilteredUser = assignedUserFilter && tc.assignedTo === assignedUserFilter
                const isHighlighted = isAssigned || isFilteredUser
                return (
                  <button
                    key={tc.id}
                    onClick={() => handleTestSelect(tc)}
                    className={`w-full flex items-center gap-2 px-3 py-2 transition-colors text-left ${
                      isSelected
                        ? 'bg-primary-100 border-l-4 border-primary-500'
                        : isHighlighted
                          ? 'bg-blue-50/70 border-l-2 border-blue-400 hover:bg-blue-50'
                          : 'hover:bg-gray-50'
                    }`}
                    style={{ paddingLeft: `${(depth + 1) * 16 + (isSelected ? 8 : 12)}px` }}
                  >
                    <FileText size={14} className={isSelected ? 'text-primary-600 shrink-0' : isHighlighted ? 'text-blue-500 shrink-0' : 'text-gray-400 shrink-0'} />
                    <span className={`text-sm truncate ${isSelected ? 'font-semibold text-primary-800' : 'text-gray-700'}`}>
                      {tc.name}
                    </span>
                    {tc.assignedTo && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 shrink-0 ${
                        isAssigned ? 'bg-primary-100 text-primary-700' :
                        isFilteredUser ? 'bg-blue-100 text-blue-700' :
                        isFiltering ? 'bg-gray-100 text-gray-500' : 'hidden'
                      }`}>
                        <User size={9} /> {isAssigned ? 'You' : tc.assignedTo}
                      </span>
                    )}
                    {tc.priority && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ml-auto shrink-0 ${getPriorityColor(tc.priority)}`}>
                        {tc.priority}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>
    )
  }

  // Find the story for a test case
  const getStoryForTest = (test) => testStories.find(ts => ts.id === test?.testStoryId)
  // Find the folder for a test case
  const getFolderForTest = (test) => folders.find(f => f.id === test?.folderId)

  const selectedStory = getStoryForTest(selectedTest)
  const selectedFolder = getFolderForTest(selectedTest)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary-800 flex items-center gap-3">
          <Play size={40} />
          Execute Tests
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Select a test case from the project tree, then record results</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel - Project Tree */}
        <div className="lg:col-span-4 card p-0 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <List size={16} />
                Project Tree
              </h2>
              <button
                onClick={() => setShowMyTestsOnly(!showMyTestsOnly)}
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-colors ${
                  showMyTestsOnly
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <Filter size={12} />
                {showMyTestsOnly ? 'Showing Mine' : 'My Tests'}
              </button>
            </div>
            {/* Search & Assigned User Filter */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-gray-300 rounded-md flex-1 overflow-hidden focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400">
                <Search size={14} className="text-gray-400 ml-2 shrink-0" />
                <input
                  type="text"
                  value={treeSearchQuery}
                  onChange={(e) => setTreeSearchQuery(e.target.value)}
                  placeholder="Search tests..."
                  className="bg-transparent text-sm px-2 py-1.5 w-full outline-none text-gray-700 placeholder-gray-400"
                />
                {treeSearchQuery && (
                  <button onClick={() => setTreeSearchQuery('')} className="text-gray-400 hover:text-gray-600 mr-1.5">
                    <X size={12} />
                  </button>
                )}
              </div>
              <select
                value={assignedUserFilter}
                onChange={(e) => setAssignedUserFilter(e.target.value)}
                className={`text-xs border rounded-md px-2 py-1.5 bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none ${
                  assignedUserFilter ? 'border-blue-400 text-blue-700 font-medium' : 'border-gray-300 text-gray-700'
                }`}
              >
                <option value="">Assigned To...</option>
                {users.map(u => (
                  <option key={u.id || u._id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="max-h-[700px] overflow-y-auto">
            {rootFolders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FolderOpen size={40} className="mx-auto mb-3" />
                <p className="text-sm">No projects yet</p>
              </div>
            ) : (
              rootFolders.map(project => {
                const isExpanded = expandedProjects.has(project.id)
                const childFolders = getChildFolders(project.id)
                const projectStories = testStories.filter(ts => ts.folderId === project.id)
                const testCount = countTestsInFolder(project.id)

                return (
                  <div key={project.id} className="border-b border-gray-100 last:border-b-0">
                    {/* Project header */}
                    <button
                      onClick={() => toggleSet(expandedProjects, setExpandedProjects, project.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      {isExpanded ? <ChevronDown size={16} className="text-gray-500 shrink-0" /> : <ChevronRight size={16} className="text-gray-500 shrink-0" />}
                      <FolderOpen size={18} className="text-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-gray-900 text-sm block truncate">{project.name}</span>
                        <span className="text-xs text-gray-400">{testCount} test cases</span>
                      </div>
                    </button>

                    {/* Expanded project contents */}
                    {isExpanded && (
                      <div className="pb-2">
                        {/* Child subfolders */}
                        {childFolders.map(folder => renderSubfolder(folder, 1))}

                        {/* Direct stories on the project */}
                        {projectStories.map(story => renderStory(story, project.id, 1))}

                        {childFolders.length === 0 && projectStories.length === 0 && (
                          <p className="text-xs text-gray-400 italic py-2 pl-12">No subfolders or stories</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Panel - Test Details & Execution */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedTest ? (
            <div className="card text-center py-16">
              <Play size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a Test Case</h3>
              <p className="text-gray-400">Choose a test case from the project tree on the left to view its details and record execution</p>
            </div>
          ) : (
            <>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {selectedFolder && (
                  <>
                    <span>{selectedFolder.name}</span>
                    <ChevronRight size={14} />
                  </>
                )}
                {selectedStory && (
                  <>
                    <span className="text-blue-600">{selectedStory.title}</span>
                    <ChevronRight size={14} />
                  </>
                )}
                <span className="text-gray-900 font-medium truncate">{selectedTest.name}</span>
              </div>

              {/* Test Case Detail Card */}
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={20} className="text-primary-600" />
                      <h2 className="text-xl font-bold text-gray-900">{selectedTest.name}</h2>
                    </div>
                    {selectedTest.description && (
                      <p className="text-gray-600 mt-1">{selectedTest.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      {selectedTest.priority && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(selectedTest.priority)}`}>
                          {selectedTest.priority}
                        </span>
                      )}
                      {selectedTest.testType && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-200">
                          {selectedTest.testType}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSteps(!showSteps)}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    {showSteps ? 'Hide' : 'Show'} Steps
                    {showSteps ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                </div>

                {/* Test Details */}
                {showSteps && (
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    {/* 1. User Story */}
                    {selectedStory && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <BookOpen size={16} className="text-blue-600" />
                          User Story
                        </h3>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-sm text-blue-800 italic">"{selectedStory.userStory}"</p>
                        </div>
                      </div>
                    )}

                    {/* 2. Acceptance Criteria */}
                    {selectedTest.acceptanceCriteria && selectedTest.acceptanceCriteria.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Acceptance Criteria</h3>
                        <ul className="space-y-1">
                          {selectedTest.acceptanceCriteria.map((ac, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className={ac.completed ? 'text-green-600' : 'text-gray-400'}>
                                {ac.completed ? '✓' : '○'}
                              </span>
                              <span>{ac.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 3. Test Steps */}
                    {selectedTest.testSteps && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <List size={16} className="text-primary-600" />
                          Test Steps
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          {selectedTest.testSteps.split('\n').map((step, idx) => (
                            <div key={idx} className="flex items-start gap-3 py-1.5">
                              <span className="text-sm text-gray-600">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Expected Result */}
                    {selectedTest.expectedResult && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-green-600" />
                          Expected Result
                        </h3>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <p className="text-sm text-green-800">{selectedTest.expectedResult}</p>
                        </div>
                      </div>
                    )}

                    {/* 5. Related Dev Tasks */}
                    {(() => {
                      const linkedTasks = devTasks.filter(dt =>
                        dt.relatedTestCaseIds?.includes(selectedTest.id) ||
                        selectedTest.relatedDevTaskIds?.includes(dt.id) ||
                        (selectedStory && (dt.relatedTestStoryIds?.includes(selectedStory.id) || selectedStory.relatedDevTaskIds?.includes(dt.id)))
                      )
                      // Deduplicate
                      const uniqueTasks = [...new Map(linkedTasks.map(t => [t.id, t])).values()]
                      const isAssignedToMe = selectedTest.assignedTo === user?.name ||
                        (selectedStory && selectedStory.assignedTo === user?.name)

                      if (uniqueTasks.length === 0 && !isAssignedToMe) return null

                      return (
                        <div>
                          {/* Your Assignment banner when test is assigned to current user */}
                          {isAssignedToMe && (
                            <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-lg p-4 mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <User size={16} className="text-primary-600" />
                                <span className="text-sm font-semibold text-primary-800">Your Assignment</span>
                              </div>
                              {uniqueTasks.length > 0 ? (
                                <div className="space-y-1">
                                  {uniqueTasks.map(task => (
                                    <div key={task.id} className="flex items-center gap-2 text-sm">
                                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                                        task.status === 'completed' ? 'bg-green-500' :
                                        task.status === 'in-progress' ? 'bg-blue-500' :
                                        task.status === 'blocked' ? 'bg-red-500' :
                                        'bg-gray-400'
                                      }`} />
                                      <span className="text-gray-700">{task.title}</span>
                                      <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                        task.status === 'blocked' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>{task.status}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-primary-600">No linked dev tasks</p>
                              )}
                            </div>
                          )}

                          {/* Standard related dev tasks (when not assigned to user) */}
                          {!isAssignedToMe && uniqueTasks.length > 0 && (
                            <div>
                              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                                <Wrench size={14} /> Related Dev Tasks ({uniqueTasks.length})
                              </h3>
                              <div className="space-y-1">
                                {uniqueTasks.map(task => (
                                  <div key={task.id} className="bg-purple-50 rounded-lg px-3 py-2 border border-purple-200 flex items-center justify-between">
                                    <span className="text-sm text-purple-800">{task.title}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                      task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                      task.status === 'blocked' ? 'bg-red-100 text-red-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>{task.status}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>

              {/* Execution Form */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Save size={20} className="text-primary-600" />
                  Record Execution
                </h2>

                <form onSubmit={handleSubmitExecution} className="space-y-4">
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestExecution
