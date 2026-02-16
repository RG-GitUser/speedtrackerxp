import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import {
  FolderPlus,
  FilePlus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  User
} from 'lucide-react'

function TestFolders() {
  const { folders, testCases, addFolder, updateFolder, deleteFolder, addTestCase, updateTestCase, deleteTestCase } = useData()
  const { user } = useAuth()
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [editingFolder, setEditingFolder] = useState(null)
  const [editingTest, setEditingTest] = useState(null)
  const [selectedFolder, setSelectedFolder] = useState(null)

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleAddFolder = () => {
    setEditingFolder(null)
    setShowFolderModal(true)
  }

  const handleEditFolder = (folder) => {
    setEditingFolder(folder)
    setShowFolderModal(true)
  }

  const handleDeleteFolder = (folderId) => {
    if (confirm('Are you sure? This will delete all test cases in this folder.')) {
      deleteFolder(folderId)
    }
  }

  const handleAddTest = (folderId) => {
    setSelectedFolder(folderId)
    setEditingTest(null)
    setShowTestModal(true)
  }

  const handleEditTest = (test) => {
    setSelectedFolder(test.folderId)
    setEditingTest(test)
    setShowTestModal(true)
  }

  const handleDeleteTest = (testId) => {
    if (confirm('Are you sure you want to delete this test case?')) {
      deleteTestCase(testId)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary-800">
            🗂️ Test Folders
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Organize and manage your test cases</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={handleAddFolder} className="btn btn-primary flex items-center gap-2">
            <FolderPlus size={20} />
            New Folder
          </button>
        )}
      </div>

      {folders.length === 0 ? (
        <div className="card text-center py-12">
          <FolderPlus size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No folders yet</h3>
          <p className="text-gray-600 mb-4">Create your first test folder to get started</p>
          {user?.role === 'admin' && (
            <button onClick={handleAddFolder} className="btn btn-primary">
              Create Folder
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Recursive Folder Tree Component */}
          <FolderTree
            folders={folders}
            testCases={testCases}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            handleAddTest={handleAddTest}
            handleEditFolder={handleEditFolder}
            handleDeleteFolder={handleDeleteFolder}
            handleEditTest={handleEditTest}
            handleDeleteTest={handleDeleteTest}
            userRole={user?.role}
            parentId={null}
            level={0}
          />
        </div>
      )}

      {/* Folder Modal */}
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

      {/* Test Case Modal */}
      {showTestModal && (
        <TestCaseModal
          test={editingTest}
          folderId={selectedFolder}
          onClose={() => setShowTestModal(false)}
          onSave={(data) => {
            if (editingTest) {
              updateTestCase(editingTest.id, data)
            } else {
              addTestCase({ ...data, folderId: selectedFolder })
            }
            setShowTestModal(false)
          }}
        />
      )}
    </div>
  )
}

function FolderTree({ folders, testCases, expandedFolders, toggleFolder, handleAddTest, handleEditFolder, handleDeleteFolder, handleEditTest, handleDeleteTest, userRole, parentId, level }) {
  // Get folders at this level
  const currentLevelFolders = folders.filter(f => f.parentId === parentId)

  return (
    <>
      {currentLevelFolders.map((folder) => {
        const folderTests = testCases.filter(tc => tc.folderId === folder.id)
        const isExpanded = expandedFolders.has(folder.id)
        const hasChildren = folders.some(f => f.parentId === folder.id)
        const indent = level * 24 // Indent by 24px per level

        return (
          <div key={folder.id} style={{ marginLeft: `${indent}px` }}>
            <div className={`card mb-4 ${level > 0 ? 'bg-gray-50 border-l-4 border-primary-400' : ''}`}>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {level > 0 && <span className="text-xl">🏁</span>}
                    <h3 className="text-lg font-semibold text-gray-900">{folder.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{folder.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      {folderTests.length} test {folderTests.length === 1 ? 'case' : 'cases'}
                    </span>
                    {hasChildren && (
                      <span className="text-xs text-primary-600 font-medium">
                        📁 Has subfolders
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddTest(folder.id)}
                    className="btn btn-secondary flex items-center gap-2 text-sm"
                  >
                    <FilePlus size={16} />
                    Add Test
                  </button>
                  {userRole === 'admin' && (
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

              {isExpanded && folderTests.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {folderTests.map((test) => (
                    <div
                      key={test.id}
                      className="bg-white rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{test.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                          <div className="mt-3 space-y-1 text-sm">
                            {test.script && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <span className="font-medium">Script:</span>
                                <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{test.script}</code>
                              </div>
                            )}
                            {test.expectedBehavior && (
                              <div className="flex items-start gap-2 text-gray-700">
                                <span className="font-medium">Expected:</span>
                                <span>{test.expectedBehavior}</span>
                              </div>
                            )}
                            {test.assignedTo && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <User size={14} />
                                <span className="text-xs">Assigned to: {test.assignedTo}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEditTest(test)}
                            className="p-2 text-gray-600 hover:text-primary-600 rounded transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          {userRole === 'admin' && (
                            <button
                              onClick={() => handleDeleteTest(test.id)}
                              className="p-2 text-gray-600 hover:text-red-600 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recursively render child folders */}
            {isExpanded && hasChildren && (
              <FolderTree
                folders={folders}
                testCases={testCases}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                handleAddTest={handleAddTest}
                handleEditFolder={handleEditFolder}
                handleDeleteFolder={handleDeleteFolder}
                handleEditTest={handleEditTest}
                handleDeleteTest={handleDeleteTest}
                userRole={userRole}
                parentId={folder.id}
                level={level + 1}
              />
            )}
          </div>
        )
      })}
    </>
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

  // Filter out the current folder and its children to prevent circular nesting
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
              Folder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., TGC-App Project"
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
              placeholder="Brief description of this test folder..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Folder (Optional)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="input"
            >
              <option value="">📁 Root Level (No Parent)</option>
              {availableParentFolders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.parentId ? '  ├─ ' : '📁 '}{f.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select a parent folder to nest this folder inside it
            </p>
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

function TestCaseModal({ test, folderId, onClose, onSave }) {
  const [name, setName] = useState(test?.name || '')
  const [description, setDescription] = useState(test?.description || '')
  const [script, setScript] = useState(test?.script || '')
  const [expectedBehavior, setExpectedBehavior] = useState(test?.expectedBehavior || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ name, description, script, expectedBehavior })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {test ? 'Edit Test Case' : 'New Test Case'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., User Login Test"
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
              rows={2}
              placeholder="What does this test verify?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Script Path
            </label>
            <input
              type="text"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="input"
              placeholder="e.g., test-scripts/login.js"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Behavior
            </label>
            <textarea
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              className="input"
              rows={2}
              placeholder="What should happen when this test passes?"
            />
          </div>

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
