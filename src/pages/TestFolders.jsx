import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import {
  FolderPlus,
  FolderTree,
  Folder,
  FolderOpen,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  User,
  BookOpen,
  FileText,
  Plus,
  ArrowRight,
  Wrench,
  CheckCircle2
} from 'lucide-react'

function TestFolders() {
  const {
    folders,
    testStories,
    testCases,
    devTasks,
    addFolder,
    updateFolder,
    deleteFolder,
    addTestStory,
    updateTestStory,
    deleteTestStory,
    addTestCase,
    updateTestCase,
    deleteTestCase
  } = useData()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [expandedStories, setExpandedStories] = useState(new Set())
  const [highlightedId, setHighlightedId] = useState(null)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [showStoryModal, setShowStoryModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [editingFolder, setEditingFolder] = useState(null)
  const [editingStory, setEditingStory] = useState(null)
  const [editingTest, setEditingTest] = useState(null)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [selectedStory, setSelectedStory] = useState(null)
  const [projectFolderName, setProjectFolderName] = useState('')
  const [projectFolderDescription, setProjectFolderDescription] = useState('')
  const [projectFolderSaving, setProjectFolderSaving] = useState(false)

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const toggleStory = (storyId) => {
    const newExpanded = new Set(expandedStories)
    if (newExpanded.has(storyId)) {
      newExpanded.delete(storyId)
    } else {
      newExpanded.add(storyId)
    }
    setExpandedStories(newExpanded)
  }

  // Deep-link: auto-expand and highlight when navigating from DevTasks or Search
  const getFolderAncestorIds = (folderId) => {
    const ids = []
    let current = folders.find(f => f.id === folderId)
    while (current) {
      ids.push(current.id)
      current = current.parentId ? folders.find(f => f.id === current.parentId) : null
    }
    return ids
  }

  useEffect(() => {
    const state = location.state
    if (!state || folders.length === 0) return

    const { highlightStoryId, highlightTestCaseId } = state

    if (highlightStoryId) {
      const story = testStories.find(s => s.id === highlightStoryId)
      if (story) {
        const ancestorIds = getFolderAncestorIds(story.folderId)
        setExpandedFolders(prev => {
          const next = new Set(prev)
          ancestorIds.forEach(id => next.add(id))
          return next
        })
        setExpandedStories(prev => {
          const next = new Set(prev)
          next.add(story.id)
          return next
        })
        setHighlightedId(story.id)
        setTimeout(() => {
          document.getElementById(`story-${story.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 150)
      }
    }

    if (highlightTestCaseId) {
      const tc = testCases.find(t => t.id === highlightTestCaseId)
      if (tc) {
        const ancestorIds = getFolderAncestorIds(tc.folderId)
        setExpandedFolders(prev => {
          const next = new Set(prev)
          ancestorIds.forEach(id => next.add(id))
          return next
        })
        if (tc.testStoryId) {
          setExpandedStories(prev => {
            const next = new Set(prev)
            next.add(tc.testStoryId)
            return next
          })
        }
        setHighlightedId(tc.id)
        setTimeout(() => {
          document.getElementById(`testcase-${tc.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 150)
      }
    }

    // Clear highlight after 3 seconds
    setTimeout(() => setHighlightedId(null), 3000)
    // Clear state to prevent re-triggering
    navigate('/folders', { replace: true, state: null })
  }, [location.state, folders.length, testStories.length, testCases.length])

  const handleAddFolder = () => {
    setEditingFolder(null)
    setShowFolderModal(true)
  }

  const handleCreateProjectFolder = async (e) => {
    e.preventDefault()
    const name = projectFolderName.trim()
    if (!name) return
    setProjectFolderSaving(true)
    try {
      await addFolder({
        name,
        description: projectFolderDescription.trim() || undefined,
        parentId: null
      })
      setProjectFolderName('')
      setProjectFolderDescription('')
    } catch {
      // DataContext logs errors; keep form so user can retry
    } finally {
      setProjectFolderSaving(false)
    }
  }

  const handleEditFolder = (folder) => {
    setEditingFolder(folder)
    setShowFolderModal(true)
  }

  const handleDeleteFolder = (folderId) => {
    if (confirm('Are you sure? This will delete all user stories and test cases in this folder.')) {
      deleteFolder(folderId)
    }
  }

  const handleAddStory = (folderId) => {
    setSelectedFolder(folderId)
    setEditingStory(null)
    setShowStoryModal(true)
  }

  const handleEditStory = (story) => {
    setSelectedFolder(story.folderId)
    setEditingStory(story)
    setShowStoryModal(true)
  }

  const handleDeleteStory = (storyId) => {
    if (confirm('Are you sure? This will delete all test cases in this user story.')) {
      deleteTestStory(storyId)
    }
  }

  const handleAddTest = (folderId, storyId) => {
    setSelectedFolder(folderId)
    setSelectedStory(storyId)
    setEditingTest(null)
    setShowTestModal(true)
  }

  const handleEditTest = (test) => {
    setSelectedFolder(test.folderId)
    setSelectedStory(test.testStoryId)
    setEditingTest(test)
    setShowTestModal(true)
  }

  const handleDeleteTest = (testId) => {
    if (confirm('Are you sure you want to delete this test case?')) {
      deleteTestCase(testId)
    }
  }

  const rootFolders = folders.filter(f => !f.parentId)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary-800">
            📖 User Stories
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Create user stories and attach test cases
            <span className="ml-3 inline-flex items-center gap-2 text-sm">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{testStories.length} {testStories.length === 1 ? 'story' : 'stories'}</span>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">{testCases.length} test {testCases.length === 1 ? 'case' : 'cases'}</span>
            </span>
          </p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={handleAddFolder} className="btn btn-primary flex items-center gap-2">
            <FolderPlus size={20} />
            New Folder
          </button>
        )}
      </div>

      {user?.role === 'admin' && (
        <section
          className="relative mb-8 overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-md ring-1 ring-black/[0.04]"
          aria-labelledby="project-folder-heading"
        >
          <div
            className="h-1 bg-gradient-to-r from-primary-400 via-primary-600 to-accent-500"
            aria-hidden
          />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-4 sm:gap-5">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200/60"
                  aria-hidden
                >
                  <FolderTree size={28} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600">
                    Structure
                  </p>
                  <h2
                    id="project-folder-heading"
                    className="mt-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl"
                  >
                    New project folder
                  </h2>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-gray-600">
                    Start a top-level folder, then add user stories and test cases underneath. Use one folder per product, release train, or team—whatever matches how you work.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                      Root of the tree
                    </span>
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                      Stories & tests nest inside
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-gray-100 bg-gradient-to-b from-gray-50/90 to-gray-50/40 p-5 sm:p-6">
              <form
                onSubmit={handleCreateProjectFolder}
                className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] lg:items-end lg:gap-6"
              >
                <div>
                  <label
                    htmlFor="project-folder-name"
                    className="mb-1.5 block text-sm font-semibold text-gray-800"
                  >
                    Name
                  </label>
                  <input
                    id="project-folder-name"
                    type="text"
                    value={projectFolderName}
                    onChange={(e) => setProjectFolderName(e.target.value)}
                    className="input bg-white shadow-sm"
                    placeholder="Mobile app — Q2, API platform, Checkout…"
                    autoComplete="off"
                    disabled={projectFolderSaving}
                  />
                </div>
                <div>
                  <label
                    htmlFor="project-folder-description"
                    className="mb-1.5 flex items-baseline gap-2 text-sm font-semibold text-gray-800"
                  >
                    Notes
                    <span className="text-xs font-normal text-gray-500">optional</span>
                  </label>
                  <textarea
                    id="project-folder-description"
                    value={projectFolderDescription}
                    onChange={(e) => setProjectFolderDescription(e.target.value)}
                    className="input min-h-[2.875rem] resize-y bg-white py-2.5 shadow-sm sm:min-h-[2.75rem]"
                    rows={2}
                    placeholder="Context for your team (scope, owner, links…)"
                    autoComplete="off"
                    disabled={projectFolderSaving}
                  />
                </div>
                <div className="lg:pb-0.5">
                  <button
                    type="submit"
                    className="btn btn-primary flex h-[42px] w-full items-center justify-center gap-2 rounded-xl px-6 shadow-md lg:min-w-[200px]"
                    disabled={projectFolderSaving || !projectFolderName.trim()}
                  >
                    {projectFolderSaving ? (
                      'Creating…'
                    ) : (
                      <>
                        Create folder
                        <ArrowRight size={18} strokeWidth={2.25} className="opacity-90" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <BookOpen className="text-blue-600 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900">How it works:</h3>
            <p className="text-sm text-blue-700 mt-1">
              1. Organize work in <strong>Folders</strong> → 2. Create <strong>User Stories</strong> → 3. Attach <strong>Test Cases</strong> to each story
            </p>
          </div>
        </div>
      </div>

      {folders.length === 0 ? (
        <div className="card text-center py-12">
          <FolderPlus size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No folders yet</h3>
          <p className="text-gray-600 mb-4">Create your first folder to organize user stories</p>
          {user?.role === 'admin' && (
            <button onClick={handleAddFolder} className="btn btn-primary">
              Create Folder
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {rootFolders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              folders={folders}
              testStories={testStories}
              testCases={testCases}
              devTasks={devTasks}
              expandedFolders={expandedFolders}
              expandedStories={expandedStories}
              toggleFolder={toggleFolder}
              toggleStory={toggleStory}
              handleAddStory={handleAddStory}
              handleEditFolder={handleEditFolder}
              handleDeleteFolder={handleDeleteFolder}
              handleEditStory={handleEditStory}
              handleDeleteStory={handleDeleteStory}
              handleAddTest={handleAddTest}
              handleEditTest={handleEditTest}
              handleDeleteTest={handleDeleteTest}
              user={user}
              depth={0}
              highlightedId={highlightedId}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showFolderModal && (
        <FolderModal
          folder={editingFolder}
          onClose={() => setShowFolderModal(false)}
          onSave={(data) => {
            if (editingFolder) {
              updateFolder(editingFolder.id, data)
            } else {
              addFolder(data)
            }
            setShowFolderModal(false)
          }}
        />
      )}

      {showStoryModal && (
        <TestStoryModal
          story={editingStory}
          folderId={selectedFolder}
          onClose={() => setShowStoryModal(false)}
          onSave={(data) => {
            if (editingStory) {
              updateTestStory(editingStory.id, data)
            } else {
              addTestStory({ ...data, folderId: selectedFolder })
            }
            setShowStoryModal(false)
          }}
        />
      )}

      {showTestModal && (
        <TestCaseModal
          test={editingTest}
          folderId={selectedFolder}
          storyId={selectedStory}
          onClose={() => setShowTestModal(false)}
          onSave={(data) => {
            if (editingTest) {
              updateTestCase(editingTest.id, data)
            } else {
              addTestCase({ ...data, folderId: selectedFolder, testStoryId: selectedStory })
            }
            setShowTestModal(false)
          }}
        />
      )}
    </div>
  )
}

function FolderCard({
  folder, folders, testStories, testCases, devTasks,
  expandedFolders, expandedStories, toggleFolder, toggleStory,
  handleAddStory, handleEditFolder, handleDeleteFolder,
  handleEditStory, handleDeleteStory,
  handleAddTest, handleEditTest, handleDeleteTest,
  user, depth, highlightedId
}) {
  const folderStories = testStories.filter(ts => ts.folderId === folder.id)
  const childFolders = folders.filter(f => f.parentId === folder.id)
  const isExpanded = expandedFolders.has(folder.id)

  // Recursively count all stories and test cases under this folder (including subfolders)
  const countAllStories = (folderId) => {
    let count = testStories.filter(ts => ts.folderId === folderId).length
    const children = folders.filter(f => f.parentId === folderId)
    children.forEach(child => { count += countAllStories(child.id) })
    return count
  }
  const countAllTestCases = (folderId) => {
    let count = testCases.filter(tc => tc.folderId === folderId).length
    const children = folders.filter(f => f.parentId === folderId)
    children.forEach(child => { count += countAllTestCases(child.id) })
    return count
  }
  const totalStories = countAllStories(folder.id)
  const totalTests = countAllTestCases(folder.id)

  const priorityColors = {
    'critical': 'text-red-600 bg-red-50 border-red-200',
    'high': 'text-orange-600 bg-orange-50 border-orange-200',
    'medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'low': 'text-green-600 bg-green-50 border-green-200'
  }

  const statusColors = {
    'draft': 'bg-gray-100 text-gray-700',
    'ready': 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-purple-100 text-purple-700',
    'completed': 'bg-green-100 text-green-700',
    'blocked': 'bg-red-100 text-red-700'
  }

  return (
    <div className={depth > 0 ? 'ml-6 mt-3' : ''}>
      <div className={depth > 0 ? 'bg-gray-50 rounded-lg p-4 border border-gray-200' : 'card'}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleFolder(folder.id)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              {depth > 0 ? <FolderOpen size={22} className="text-amber-500" /> : <Folder size={22} className="text-amber-500" />}
              <h3 className={`font-semibold text-gray-900 ${depth > 0 ? 'text-base' : 'text-lg'}`}>{folder.name}</h3>
            </div>
            {folder.description && <p className="text-sm text-gray-600 mt-1">{folder.description}</p>}
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-gray-500">
                {totalStories} user {totalStories === 1 ? 'story' : 'stories'}
              </span>
              <span className="text-xs text-gray-500">
                {totalTests} test {totalTests === 1 ? 'case' : 'cases'}
              </span>
              {childFolders.length > 0 && (
                <span className="text-xs text-gray-500">
                  {childFolders.length} sub{childFolders.length === 1 ? 'folder' : 'folders'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAddStory(folder.id)}
              className="btn btn-success flex items-center gap-2 text-sm"
            >
              <BookOpen size={16} />
              New User Story
            </button>
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => handleEditFolder(folder)}
                  className="p-2 text-gray-600 hover:text-primary-600 rounded transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="p-2 text-gray-600 hover:text-red-600 rounded transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Child Subfolders */}
            {childFolders.length > 0 && (
              <div className="space-y-3 mb-4">
                {childFolders.map((childFolder) => (
                  <FolderCard
                    key={childFolder.id}
                    folder={childFolder}
                    folders={folders}
                    testStories={testStories}
                    testCases={testCases}
                    devTasks={devTasks}
                    expandedFolders={expandedFolders}
                    expandedStories={expandedStories}
                    toggleFolder={toggleFolder}
                    toggleStory={toggleStory}
                    handleAddStory={handleAddStory}
                    handleEditFolder={handleEditFolder}
                    handleDeleteFolder={handleDeleteFolder}
                    handleEditStory={handleEditStory}
                    handleDeleteStory={handleDeleteStory}
                    handleAddTest={handleAddTest}
                    handleEditTest={handleEditTest}
                    handleDeleteTest={handleDeleteTest}
                    user={user}
                    depth={depth + 1}
                    highlightedId={highlightedId}
                  />
                ))}
              </div>
            )}

            {/* User Stories */}
            {folderStories.length === 0 && childFolders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No user stories yet</p>
                <button
                  onClick={() => handleAddStory(folder.id)}
                  className="text-primary-600 hover:text-primary-700 text-sm mt-2"
                >
                  Create your first user story
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {folderStories.map((story) => {
                  const storyCases = testCases.filter(tc => tc.testStoryId === story.id)
                  const isStoryExpanded = expandedStories.has(story.id)
                  // Find dev tasks linked to this story (from either direction)
                  const linkedDevTasks = devTasks.filter(dt =>
                    dt.relatedTestStoryIds?.includes(story.id) || story.relatedDevTaskIds?.includes(dt.id)
                  )

                  return (
                    <div key={story.id} id={`story-${story.id}`} className={`bg-white rounded-lg border-l-4 border border-gray-200 transition-all duration-500 ${highlightedId === story.id ? 'border-l-primary-500 ring-2 ring-primary-400 ring-offset-2' : 'border-l-blue-400'}`}>
                      {/* Story Header — always visible */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <button
                          onClick={() => toggleStory(story.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isStoryExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <BookOpen size={16} className="text-blue-500 shrink-0" />
                        <h4 className="font-semibold text-gray-900 text-sm flex-1 truncate">{story.title}</h4>
                        {story.priority && (
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border shrink-0 ${priorityColors[story.priority]}`}>
                            {story.priority}
                          </span>
                        )}
                        {story.status && (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${statusColors[story.status]}`}>
                            {story.status}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 shrink-0">{storyCases.length} tests</span>
                        {linkedDevTasks.length > 0 && (
                          <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <Wrench size={10} /> {linkedDevTasks.length}
                          </span>
                        )}
                        {story.assignedTo && (
                          <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
                            <User size={11} /> {story.assignedTo}
                          </span>
                        )}
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button onClick={() => handleAddTest(folder.id, story.id)} className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors" title="Add test case">
                            <Plus size={15} />
                          </button>
                          <button onClick={() => handleEditStory(story)} className="p-1 text-gray-400 hover:text-primary-600 rounded transition-colors" title="Edit story">
                            <Edit2 size={14} />
                          </button>
                          {user?.role === 'admin' && (
                            <button onClick={() => handleDeleteStory(story.id)} className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors" title="Delete story">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isStoryExpanded && (
                        <div className="border-t border-gray-100">
                          {/* Story Details */}
                          {(story.description || story.userStory || (story.acceptanceCriteria && story.acceptanceCriteria.length > 0)) && (
                            <div className="px-4 py-3 bg-gray-50/50 space-y-2">
                              {story.description && (
                                <p className="text-sm text-gray-600">{story.description}</p>
                              )}
                              {story.userStory && (
                                <p className="text-sm text-blue-700 italic bg-blue-50 rounded px-3 py-2">"{story.userStory}"</p>
                              )}
                              {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                                <div className="space-y-1">
                                  {story.acceptanceCriteria.map((ac, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                      <CheckCircle2 size={12} className="text-green-500 mt-0.5 shrink-0" />
                                      <span>{ac.description}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Test Cases — compact list */}
                          <div className="px-4 py-2">
                            {storyCases.length === 0 ? (
                              <div className="text-center py-4 text-gray-400 text-sm">
                                <p>No test cases yet</p>
                                <button onClick={() => handleAddTest(folder.id, story.id)} className="text-primary-600 hover:text-primary-700 text-xs mt-1">
                                  Add first test case
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                {storyCases.map((test) => {
                                  const testLinkedDevTasks = devTasks.filter(dt =>
                                    dt.relatedTestCaseIds?.includes(test.id) || test.relatedDevTaskIds?.includes(dt.id)
                                  )
                                  const testPriorityColors = {
                                    'critical': 'text-red-600 bg-red-50 border-red-200',
                                    'high': 'text-orange-600 bg-orange-50 border-orange-200',
                                    'medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
                                    'low': 'text-green-600 bg-green-50 border-green-200'
                                  }

                                  return (
                                    <div
                                      key={test.id}
                                      id={`testcase-${test.id}`}
                                      className={`flex items-center gap-2 px-3 py-2 rounded-md group transition-all duration-500 ${highlightedId === test.id ? 'bg-primary-50 ring-2 ring-primary-400' : 'hover:bg-gray-50'}`}
                                    >
                                      <FileText size={14} className="text-gray-400 shrink-0" />
                                      <span className="text-sm text-gray-800 truncate flex-1">{test.name}</span>
                                      {test.priority && (
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0 ${testPriorityColors[test.priority]}`}>
                                          {test.priority}
                                        </span>
                                      )}
                                      {test.testType && (
                                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] shrink-0">
                                          {test.testType}
                                        </span>
                                      )}
                                      {testLinkedDevTasks.length > 0 && (
                                        <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                                          <Wrench size={9} /> {testLinkedDevTasks.length}
                                        </span>
                                      )}
                                      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditTest(test)} className="p-1 text-gray-400 hover:text-primary-600 rounded">
                                          <Edit2 size={12} />
                                        </button>
                                        {user?.role === 'admin' && (
                                          <button onClick={() => handleDeleteTest(test.id)} className="p-1 text-gray-400 hover:text-red-600 rounded">
                                            <Trash2 size={12} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FolderModal({ folder, onClose, onSave }) {
  const { folders } = useData()
  const [name, setName] = useState(folder?.name || '')
  const [description, setDescription] = useState(folder?.description || '')
  const [parentId, setParentId] = useState(folder?.parentId || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ name, description, parentId: parentId || null })
  }

  const availableParentFolders = folders.filter(f => f.id !== folder?.id)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {folder ? 'Edit Folder' : 'New Folder'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Folder Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., User Authentication"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={3}
              placeholder="Brief description of this folder..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {folder ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TestStoryModal({ story, folderId, onClose, onSave }) {
  const { devTasks, folders, users } = useData()
  const [title, setTitle] = useState(story?.title || '')
  const [description, setDescription] = useState(story?.description || '')
  const [userStory, setUserStory] = useState(story?.userStory || '')
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(story?.acceptanceCriteria || [])
  const [priority, setPriority] = useState(story?.priority || 'medium')
  const [status, setStatus] = useState(story?.status || 'draft')
  const [assignedTo, setAssignedTo] = useState(story?.assignedTo || '')
  const [relatedDevTaskIds, setRelatedDevTaskIds] = useState(story?.relatedDevTaskIds || [])
  const [newCriterion, setNewCriterion] = useState('')

  // Get all folder IDs (including parent chain) to find relevant dev tasks
  const getAllRelatedFolderIds = (fId) => {
    const ids = [fId]
    const folder = folders.find(f => f.id === fId)
    if (folder?.parentId) {
      ids.push(...getAllRelatedFolderIds(folder.parentId))
    }
    const children = folders.filter(f => f.parentId === fId)
    children.forEach(child => ids.push(child.id))
    return [...new Set(ids)]
  }
  const relevantFolderIds = folderId ? getAllRelatedFolderIds(folderId) : []
  const availableDevTasks = devTasks.filter(dt => relevantFolderIds.includes(dt.folderId))

  const toggleDevTask = (taskId) => {
    if (relatedDevTaskIds.includes(taskId)) {
      setRelatedDevTaskIds(relatedDevTaskIds.filter(id => id !== taskId))
    } else {
      setRelatedDevTaskIds([...relatedDevTaskIds, taskId])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      title,
      description,
      userStory,
      acceptanceCriteria,
      priority,
      status,
      assignedTo,
      relatedDevTaskIds
    })
  }

  const addAcceptanceCriterion = () => {
    if (newCriterion.trim()) {
      setAcceptanceCriteria([...acceptanceCriteria, { description: newCriterion.trim(), completed: false }])
      setNewCriterion('')
    }
  }

  const removeAcceptanceCriterion = (index) => {
    setAcceptanceCriteria(acceptanceCriteria.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {story ? 'Edit User Story' : 'New User Story'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Story Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="e.g., User Login Flow"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input"
              >
                <option value="draft">Draft</option>
                <option value="ready">Ready</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="input"
              >
                <option value="">-- Unassigned --</option>
                {users.map(u => (
                  <option key={u.id || u._id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={2}
              placeholder="Brief description of this user story..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Story Format
            </label>
            <textarea
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              className="input"
              rows={2}
              placeholder="As a [user], I want to [action], so that [benefit]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: As a registered user, I want to log in with my credentials, so that I can access my account
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acceptance Criteria
            </label>
            <div className="space-y-2">
              {acceptanceCriteria.map((criterion, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                  <span className="flex-1 text-sm">{criterion.description}</span>
                  <button
                    type="button"
                    onClick={() => removeAcceptanceCriterion(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCriterion}
                  onChange={(e) => setNewCriterion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAcceptanceCriterion())}
                  className="input flex-1"
                  placeholder="Add acceptance criterion..."
                />
                <button
                  type="button"
                  onClick={addAcceptanceCriterion}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {availableDevTasks.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔧 Related Dev Tasks
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1 border border-gray-200 rounded p-2">
                {availableDevTasks.map(task => (
                  <label key={task.id} className="flex items-center gap-2 p-1 hover:bg-purple-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={relatedDevTaskIds.includes(task.id)}
                      onChange={() => toggleDevTask(task.id)}
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm">{task.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {story ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TestCaseModal({ test, folderId, storyId, onClose, onSave }) {
  const { devTasks, users } = useData()
  const [name, setName] = useState(test?.name || '')
  const [description, setDescription] = useState(test?.description || '')
  const [testSteps, setTestSteps] = useState(test?.testSteps || '')
  const [expectedResult, setExpectedResult] = useState(test?.expectedResult || '')
  const [priority, setPriority] = useState(test?.priority || 'medium')
  const [testType, setTestType] = useState(test?.testType || 'functional')
  const [assignedTo, setAssignedTo] = useState(test?.assignedTo || '')
  const [relatedDevTaskIds, setRelatedDevTaskIds] = useState(test?.relatedDevTaskIds || [])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ 
      name, 
      description, 
      testSteps, 
      expectedResult,
      priority,
      testType,
      assignedTo,
      relatedDevTaskIds
    })
  }

  const toggleRelatedDevTask = (taskId) => {
    if (relatedDevTaskIds.includes(taskId)) {
      setRelatedDevTaskIds(relatedDevTaskIds.filter(id => id !== taskId))
    } else {
      setRelatedDevTaskIds([...relatedDevTaskIds, taskId])
    }
  }

  const availableDevTasks = devTasks.filter(dt => dt.folderId === folderId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {test ? 'Edit Test Case' : 'New Test Case'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Case Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., Valid Login Test"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Type
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="input"
              >
                <option value="functional">Functional</option>
                <option value="regression">Regression</option>
                <option value="smoke">Smoke</option>
                <option value="integration">Integration</option>
                <option value="ui">UI</option>
                <option value="performance">Performance</option>
                <option value="security">Security</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="input"
              >
                <option value="">-- Unassigned --</option>
                {users.map(u => (
                  <option key={u.id || u._id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={2}
              placeholder="What does this test verify?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Steps
            </label>
            <textarea
              value={testSteps}
              onChange={(e) => setTestSteps(e.target.value)}
              className="input"
              rows={4}
              placeholder="1. Navigate to login page&#10;2. Enter credentials&#10;3. Click login button&#10;4. Verify dashboard loads"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Result
            </label>
            <textarea
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              className="input"
              rows={2}
              placeholder="What should happen when this test passes?"
            />
          </div>

          {availableDevTasks.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Dev Tasks
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1 border border-gray-200 rounded p-2">
                {availableDevTasks.map(task => (
                  <label key={task.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={relatedDevTaskIds.includes(task.id)}
                      onChange={() => toggleRelatedDevTask(task.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{task.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {test ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TestFolders
