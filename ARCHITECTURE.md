# System Architecture - SpeedTesters XP

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                        (React Frontend)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       EXPRESS SERVER                            │
│                     (Node.js Backend)                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Folders    │  │  Test Cases  │  │  Dev Tasks   │        │
│  │   Routes     │  │   Routes     │  │   Routes     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │    Test      │  │   Comments   │  │    Users     │        │
│  │  Executions  │  │   Routes     │  │   Routes     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MongoDB Driver
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   folders    │  │  testcases   │  │  devtasks    │        │
│  │  Collection  │  │  Collection  │  │  Collection  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │testexecutions│  │   comments   │  │    users     │        │
│  │  Collection  │  │  Collection  │  │  Collection  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

```
src/
│
├── App.jsx ──────────────────┐
│                             │
├── contexts/                 │
│   ├── AuthContext.jsx ◄─────┤ Global State Management
│   └── DataContext.jsx ◄─────┤ (React Context API)
│                             │
├── components/               │
│   └── Layout.jsx ◄──────────┤ Navigation & Layout
│                             │
└── pages/                    │
    ├── Dashboard.jsx ◄───────┤
    ├── TestFolders.jsx ◄─────┤ Route Components
    ├── TestExecution.jsx ◄───┤
    ├── TestHistory.jsx ◄─────┤
    ├── DevTasks.jsx ◄────────┤
    └── Login.jsx ◄───────────┘
```

## Data Flow

### Creating a Test Case

```
┌─────────────┐
│    User     │
│  Interface  │
└──────┬──────┘
       │ 1. Fill form & submit
       ▼
┌─────────────┐
│ TestFolders │
│    Page     │
└──────┬──────┘
       │ 2. Call addTestCase()
       ▼
┌─────────────┐
│    Data     │
│  Context    │
└──────┬──────┘
       │ 3. POST /api/testcases
       ▼
┌─────────────┐
│   Express   │
│   Server    │
└──────┬──────┘
       │ 4. Create document
       ▼
┌─────────────┐
│   MongoDB   │
└──────┬──────┘
       │ 5. Return saved doc
       ▼
┌─────────────┐
│    Data     │
│  Context    │
└──────┬──────┘
       │ 6. Update state
       ▼
┌─────────────┐
│     UI      │
│   Updates   │
└─────────────┘
```

### Recording Test Execution

```
┌─────────────┐
│    User     │
│  Executes   │
│    Test     │
└──────┬──────┘
       │ 1. Select test & record result
       ▼
┌─────────────┐
│   Test      │
│ Execution   │
│    Page     │
└──────┬──────┘
       │ 2. Submit execution form
       ▼
┌─────────────┐
│    Data     │
│  Context    │
└──────┬──────┘
       │ 3. POST /api/testexecutions
       ▼
┌─────────────┐
│   Express   │
│   Server    │
└──────┬──────┘
       │ 4. Store execution record
       ▼
┌─────────────┐
│   MongoDB   │
│ testexecutions
└──────┬──────┘
       │ 5. Return saved record
       ▼
┌─────────────┐
│    Test     │
│   History   │
│    Page     │
└─────────────┘
```

## Component Hierarchy

```
App
│
├── AuthProvider
│   │
│   └── DataProvider
│       │
│       ├── Layout
│       │   │
│       │   ├── Navigation Bar
│       │   │   ├── Dashboard Link
│       │   │   ├── Test Cases Link
│       │   │   ├── Dev Tasks Link
│       │   │   ├── Execute Tests Link
│       │   │   └── History Link
│       │   │
│       │   └── Outlet (Route Content)
│       │       │
│       │       ├── Dashboard
│       │       │   ├── Statistics Cards
│       │       │   ├── Recent Runs
│       │       │   ├── Assigned Tests
│       │       │   └── Quick Actions
│       │       │
│       │       ├── TestFolders
│       │       │   ├── Folder Tree
│       │       │   ├── Test Cases List
│       │       │   ├── Folder Modal
│       │       │   └── TestCase Modal
│       │       │
│       │       ├── DevTasks
│       │       │   ├── Task List
│       │       │   └── Task Form
│       │       │
│       │       ├── TestExecution
│       │       │   ├── Test Selection
│       │       │   └── Execution Form
│       │       │       ├── Status Selection
│       │       │       ├── Environment Config
│       │       │       └── Results Entry
│       │       │
│       │       ├── TestHistory
│       │       │   ├── Statistics
│       │       │   ├── Filters
│       │       │   └── Execution List
│       │       │
│       │       └── Login
│       │
│       └── Protected Route
│
└── Router
```

## Database Relationships

```
┌───────────────┐
│    folders    │
│               │
│ - id          │◄──────────┐
│ - name        │           │
│ - parentId    │───┐       │
└───────────────┘   │       │
                    │       │ folderId
                    │       │
        ┌───────────┼───────┼───────────┐
        │           │       │           │
        │           │       │           │
┌───────┴───────┐   │  ┌────┴────────┐  │
│  testcases    │   │  │  devtasks   │  │
│               │   │  │             │  │
│ - id          │   │  │ - id        │  │
│ - folderId    │───┘  │ - folderId  │──┘
│ - name        │      │ - title     │
│ - testSteps   │      │ - status    │
│ - priority    │      │ - priority  │
│ - testType    │      └─────────────┘
│ - acceptance  │           ▲
│   Criteria    │           │ relatedDevTaskIds
│ - relatedDev  │───────────┘
│   TaskIds     │
│ - relatedTest │───┐
│   CaseIds     │   │ Self-reference
└───────┬───────┘   │
        │           │
        │ testCaseId
        │
        ▼
┌───────────────────┐
│ testexecutions    │
│                   │
│ - id              │
│ - testCaseId      │──┐
│ - executedBy      │  │ References TestCase
│ - status          │  │
│ - environment     │  │
│ - version         │  │
│ - deviceType      │  │
│ - actualResult    │  │
│ - notes           │  │
│ - executedAt      │  │
└───────────────────┘  │
                       │
                       └──► Used in TestHistory
                            for filtering & display
```

## State Management

### AuthContext State

```javascript
{
  user: {
    id: String,
    name: String,
    email: String,
    role: String
  },
  loading: Boolean,
  login: Function,
  logout: Function
}
```

### DataContext State

```javascript
{
  // Collections
  folders: Array,
  testCases: Array,
  testExecutions: Array,
  devTasks: Array,
  testRuns: Array,      // Legacy
  comments: Array,
  loading: Boolean,
  
  // Folder operations
  addFolder: Function,
  updateFolder: Function,
  deleteFolder: Function,
  
  // Test case operations
  addTestCase: Function,
  updateTestCase: Function,
  deleteTestCase: Function,
  
  // Test execution operations
  addTestExecution: Function,
  updateTestExecution: Function,
  deleteTestExecution: Function,
  
  // Dev task operations
  addDevTask: Function,
  updateDevTask: Function,
  deleteDevTask: Function,
  
  // Utility
  refreshData: Function
}
```

## API Structure

### REST Endpoints

```
Base URL: http://localhost:3001/api

Folders:
  GET    /folders              - List all folders
  POST   /folders              - Create folder
  PUT    /folders/:id          - Update folder
  DELETE /folders/:id          - Delete folder

Test Cases:
  GET    /testcases            - List all test cases
  GET    /testcases/folder/:id - Get by folder
  POST   /testcases            - Create test case
  PUT    /testcases/:id        - Update test case
  DELETE /testcases/:id        - Delete test case

Test Executions:
  GET    /testexecutions                  - List all executions
  GET    /testexecutions/testcase/:id    - Get by test case
  POST   /testexecutions                  - Record execution
  PUT    /testexecutions/:id              - Update execution
  DELETE /testexecutions/:id              - Delete execution

Dev Tasks:
  GET    /devtasks             - List all tasks
  GET    /devtasks/folder/:id  - Get by folder
  POST   /devtasks             - Create task
  PUT    /devtasks/:id         - Update task
  DELETE /devtasks/:id         - Delete task

Health:
  GET    /health               - Server health check
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐     ┌──────────────┐                    │
│  │   Frontend   │     │   Backend    │                    │
│  │   (React)    │────▶│  (Express)   │                    │
│  │              │     │              │                    │
│  │ Port: 80/443 │     │  Port: 3001  │                    │
│  └──────────────┘     └──────┬───────┘                    │
│                              │                             │
│                              ▼                             │
│                       ┌──────────────┐                    │
│                       │   MongoDB    │                    │
│                       │              │                    │
│                       │ Port: 27017  │                    │
│                       └──────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Security Considerations

1. **Authentication**: JWT-based (via AuthContext)
2. **Authorization**: Role-based access (admin, tester)
3. **API Security**: CORS configured
4. **Data Validation**: Mongoose schema validation
5. **Password Storage**: Should use bcrypt (implement if needed)

## Performance Optimizations

1. **React Context**: Minimizes prop drilling
2. **Data Caching**: Context stores data in memory
3. **Selective Re-renders**: Component-level state when possible
4. **Database Indexing**: Should add indexes on frequently queried fields
5. **API Pagination**: Can be added for large datasets

## Scalability Considerations

Current setup is suitable for:
- Small to medium teams (< 100 users)
- Moderate test volume (< 10,000 test cases)
- Regular execution frequency

For larger scale:
- Add Redis caching
- Implement pagination
- Add database indexing
- Consider microservices
- Add load balancing

---

This architecture provides a solid foundation for manual test management with room for growth and enhancement.
