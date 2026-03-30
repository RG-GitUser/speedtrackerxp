import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import {
  Code,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Link as LinkIcon,
  Tag,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  User
} from 'lucide-react'

function DevTasks() {
  const { folders, devTasks, testCases, testStories, users, addDevTask, updateDevTask, deleteDevTask } = useData()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedFolder, setSelectedFolder] = useState('')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [expandedTask, setExpandedTask] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedTo: user?.name || '',
    estimatedHours: '',
    relatedTestStoryIds: [],
    relatedTestCaseIds: [],
    tags: []
  })

  // Get all folder IDs including subfolders recursively
  const getAllFolderIds = (parentId) => {
    const ids = [parentId]
    const children = folders.filter(f => f.parentId === parentId)
    children.forEach(child => {
      ids.push(...getAllFolderIds(child.id))
    })
    return ids
  }

  const folderTasks = selectedFolder
    ? devTasks.filter(t => {
        const allIds = getAllFolderIds(selectedFolder)
        return allIds.includes(t.folderId)
      })
    : []

  // Get stories and test cases for the selected folder (including subfolders)
  const availableStories = selectedFolder
    ? testStories.filter(ts => getAllFolderIds(selectedFolder).includes(ts.folderId))
    : []
  const availableTestCases = selectedFolder
    ? testCases.filter(tc => getAllFolderIds(selectedFolder).includes(tc.folderId))
    : []

  const rootFolders = folders.filter(f => !f.parentId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTask) {
        await updateDevTask(editingTask.id, formData)
      } else {
        await addDevTask({ ...formData, folderId: selectedFolder })
      }
      resetForm()
    } catch (error) {
      console.error('Error saving dev task:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignedTo: user?.name || '',
      estimatedHours: '',
      relatedTestStoryIds: [],
      relatedTestCaseIds: [],
      tags: []
    })
    setIsAddingTask(false)
    setEditingTask(null)
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo || '',
      estimatedHours: task.estimatedHours || '',
      relatedTestStoryIds: task.relatedTestStoryIds || [],
      relatedTestCaseIds: task.relatedTestCaseIds || [],
      tags: task.tags || []
    })
    setIsAddingTask(true)
  }

  const handleDelete = async (taskId) => {
    if (confirm('Are you sure you want to delete this dev task?')) {
      await deleteDevTask(taskId)
    }
  }

  const toggleRelatedStory = (storyId) => {
    const current = formData.relatedTestStoryIds
    if (current.includes(storyId)) {
      setFormData({ ...formData, relatedTestStoryIds: current.filter(id => id !== storyId) })
    } else {
      setFormData({ ...formData, relatedTestStoryIds: [...current, storyId] })
    }
  }

  const toggleRelatedTestCase = (testCaseId) => {
    const current = formData.relatedTestCaseIds
    if (current.includes(testCaseId)) {
      setFormData({ ...formData, relatedTestCaseIds: current.filter(id => id !== testCaseId) })
    } else {
      setFormData({ ...formData, relatedTestCaseIds: [...current, testCaseId] })
    }
  }

  const getStatusBadgeClass = (status) => {
    const classes = {
      'todo': 'bg-gray-100 text-gray-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'in-review': 'bg-purple-100 text-purple-700',
      'completed': 'bg-green-100 text-green-700',
      'blocked': 'bg-red-100 text-red-700'
    }
    return classes[status] || classes.todo
  }

  const getPriorityBadgeClass = (priority) => {
    const classes = {
      'critical': 'bg-red-100 text-red-700 border-red-300',
      'high': 'bg-orange-100 text-orange-700 border-orange-300',
      'medium': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'low': 'bg-green-100 text-green-700 border-green-300'
    }
    return classes[priority] || classes.medium
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary-800 flex items-center gap-3">
          <Code size={40} />
          Developer Tasks
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Manage development tasks and link them to user stories &amp; test cases</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className={isAddingTask ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
              <button
                onClick={() => {
                  if (!selectedFolder) {
                    alert('Please select a project first')
                    return
                  }
                  setIsAddingTask(true)
                }}
                className="btn btn-primary flex items-center gap-2"
                disabled={!selectedFolder}
              >
                <Plus size={20} />
                New Task
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project
              </label>
              <select
                value={selectedFolder}
                onChange={(e) => {
                  setSelectedFolder(e.target.value)
                  resetForm()
                }}
                className="input"
              >
                <option value="">-- Select a project --</option>
                {rootFolders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedFolder && (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {folderTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Code size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No dev tasks in this project</p>
                  </div>
                ) : (
                  folderTasks.map(task => {
                    const isExpanded = expandedTask === task.id
                    const relatedTests = testCases.filter(tc =>
                      task.relatedTestCaseIds?.includes(tc.id)
                    )
                    const relatedStories = testStories.filter(ts =>
                      task.relatedTestStoryIds?.includes(ts.id)
                    )
                    const totalLinked = relatedTests.length + relatedStories.length

                    return (
                      <div
                        key={task.id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(task)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.assignedTo && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs flex items-center gap-1">
                              <User size={12} /> {task.assignedTo}
                            </span>
                          )}
                          {task.estimatedHours && (
                            <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs flex items-center gap-1">
                              <Clock size={12} /> {task.estimatedHours}h
                            </span>
                          )}
                        </div>

                        {task.tags && task.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mt-2">
                            <Tag size={14} className="text-gray-400" />
                            {task.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Related Items */}
                        {totalLinked > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                              <LinkIcon size={14} />
                              {totalLinked} Linked Item{totalLinked !== 1 ? 's' : ''}
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            {isExpanded && (
                              <div className="mt-2 space-y-2">
                                {relatedStories.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                                      <BookOpen size={12} /> User Stories
                                    </p>
                                    <div className="space-y-1">
                                      {relatedStories.map(story => (
                                        <button
                                          key={story.id}
                                          onClick={() => navigate('/folders', { state: { highlightStoryId: story.id, folderId: story.folderId } })}
                                          className="text-xs bg-blue-50 text-blue-800 p-2 rounded flex items-center gap-2 w-full text-left hover:bg-blue-100 transition-colors cursor-pointer"
                                        >
                                          <BookOpen size={12} className="text-blue-500 shrink-0" />
                                          <span className="truncate">{story.title}</span>
                                          <ArrowRight size={12} className="ml-auto shrink-0 opacity-50" />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {relatedTests.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                                      <FileText size={12} /> Test Cases
                                    </p>
                                    <div className="space-y-1">
                                      {relatedTests.map(test => (
                                        <button
                                          key={test.id}
                                          onClick={() => navigate('/folders', { state: { highlightTestCaseId: test.id, testStoryId: test.testStoryId, folderId: test.folderId } })}
                                          className="text-xs bg-green-50 text-green-800 p-2 rounded flex items-center gap-2 w-full text-left hover:bg-green-100 transition-colors cursor-pointer"
                                        >
                                          <FileText size={12} className="text-green-500 shrink-0" />
                                          <span className="truncate">{test.name}</span>
                                          <ArrowRight size={12} className="ml-auto shrink-0 opacity-50" />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Task Form */}
        {isAddingTask && (
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="in-review">In Review</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="input"
                  >
                    <option value="">-- Unassigned --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                    className="input"
                    min="0"
                    step="0.5"
                  />
                </div>

                {/* Related User Stories */}
                {availableStories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <BookOpen size={14} className="text-blue-600" />
                      Related User Stories
                    </label>
                    <div className="max-h-32 overflow-y-auto space-y-1 border border-gray-200 rounded p-2">
                      {availableStories.map(story => (
                        <label key={story.id} className="flex items-center gap-2 p-1 hover:bg-blue-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.relatedTestStoryIds.includes(story.id)}
                            onChange={() => toggleRelatedStory(story.id)}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{story.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Test Cases */}
                {availableTestCases.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <FileText size={14} className="text-green-600" />
                      Related Test Cases
                    </label>
                    <div className="max-h-32 overflow-y-auto space-y-1 border border-gray-200 rounded p-2">
                      {availableTestCases.map(tc => (
                        <label key={tc.id} className="flex items-center gap-2 p-1 hover:bg-green-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.relatedTestCaseIds.includes(tc.id)}
                            onChange={() => toggleRelatedTestCase(tc.id)}
                            className="rounded text-green-600"
                          />
                          <span className="text-sm text-gray-700">{tc.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="btn btn-success flex-1">
                    {editingTask ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DevTasks
