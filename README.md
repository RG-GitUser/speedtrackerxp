# SpeedTesters XP - Manual Test Management System

A comprehensive manual testing management platform with modern UI, detailed test case management, developer task tracking, and execution history.

## Features

### Test Case Management
- **Hierarchical folder structure** for organizing test cases
- **Detailed test cases** with:
  - Test steps
  - Expected results
  - Acceptance criteria (checklist)
  - Priority levels (Critical, High, Medium, Low)
  - Test types (Functional, Regression, Smoke, Integration, UI, Performance, Security)
  - Related test cases and dev tasks
  - Assignment tracking

### Manual Test Execution
- **Pass/Fail/Blocked/Skipped** status tracking
- **Environment specification**: Production, Staging, Development, QA, UAT, Local
- **Version tracking** for each execution
- **Device type tracking**: Desktop, Mobile, Tablet, API
- **Browser and OS information**
- **Execution time tracking**
- **Actual results** and notes
- **Defect tracking** with severity levels

### Developer Tasks
- **Task management** integrated with test cases
- **Status tracking**: To Do, In Progress, In Review, Completed, Blocked
- **Priority levels**: Critical, High, Medium, Low
- **Time estimation** and actual hours
- **Bidirectional linking** between dev tasks and test cases
- **Tag support** for categorization

### Test History
- **Complete execution history** with filters
- **Statistics dashboard**: Pass rates, execution counts
- **Filter by**: Folder, Status, Environment
- **Detailed execution records** with expandable details

### Dashboard
- **Quick statistics** overview
- **Recent test runs** summary
- **Assigned tests** view
- **Quick action links**

## Project Structure

```
speedtestersxp/
├── src/
│   ├── components/
│   │   └── Layout.jsx           # Main navigation layout
│   ├── contexts/
│   │   ├── AuthContext.jsx      # Authentication state
│   │   └── DataContext.jsx      # Data management & API calls
│   ├── pages/
│   │   ├── Dashboard.jsx        # Overview dashboard
│   │   ├── TestFolders.jsx      # Test case management
│   │   ├── TestExecution.jsx    # Manual test execution
│   │   ├── TestHistory.jsx      # Execution history
│   │   ├── DevTasks.jsx         # Developer task management
│   │   └── Login.jsx            # Authentication
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # Entry point
├── server/
│   ├── models/
│   │   ├── Folder.js            # Folder schema
│   │   ├── TestCase.js          # Test case schema
│   │   ├── TestExecution.js     # Execution record schema
│   │   ├── DevTask.js           # Developer task schema
│   │   ├── TestRun.js           # (Legacy automated test runs)
│   │   └── Comment.js           # Comment schema
│   └── server.js                # Express server & API routes
└── package.json
```

## Database Models

### TestCase
- **Core fields**: name, description, testSteps, expectedResult
- **Metadata**: priority, testType, assignedTo
- **Relationships**: acceptanceCriteria[], relatedDevTaskIds[], relatedTestCaseIds[]
- **Organization**: folderId, order

### TestExecution
- **Status**: pass, fail, blocked, skipped, in-progress
- **Environment**: production, staging, development, qa, uat, local
- **Context**: version, deviceType, browser, os
- **Results**: actualResult, notes, executionTime
- **Defects**: Array of defect records with severity
- **Audit**: executedBy, executedAt, testCaseId

### DevTask
- **Core fields**: title, description
- **Status**: todo, in-progress, in-review, completed, blocked
- **Metadata**: priority, assignedTo, tags[]
- **Time tracking**: estimatedHours, actualHours
- **Relationships**: relatedTestCaseIds[], relatedDevTaskIds[]
- **Organization**: folderId, order

### Folder
- **Hierarchical structure** with parentId support
- **Metadata**: name, description, order

## API Endpoints

### Test Cases
- `GET /api/testcases` - Get all test cases
- `GET /api/testcases/folder/:folderId` - Get test cases by folder
- `POST /api/testcases` - Create test case
- `PUT /api/testcases/:id` - Update test case
- `DELETE /api/testcases/:id` - Delete test case

### Test Executions
- `GET /api/testexecutions` - Get all executions
- `GET /api/testexecutions/testcase/:testCaseId` - Get executions for test case
- `POST /api/testexecutions` - Create execution record
- `PUT /api/testexecutions/:id` - Update execution
- `DELETE /api/testexecutions/:id` - Delete execution

### Dev Tasks
- `GET /api/devtasks` - Get all dev tasks
- `GET /api/devtasks/folder/:folderId` - Get tasks by folder
- `POST /api/devtasks` - Create dev task
- `PUT /api/devtasks/:id` - Update dev task
- `DELETE /api/devtasks/:id` - Delete dev task

### Folders
- `GET /api/folders` - Get all folders
- `POST /api/folders` - Create folder
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder (cascades to test cases)

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### Backend Setup
```bash
cd server
npm install
```

Create `.env` file in server folder:
```env
MONGODB_URI=mongodb://localhost:27017/speedtestersxp
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

Start the server:
```bash
npm start
```

### Frontend Setup
```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage Guide

### Creating Test Cases
1. Navigate to **Test Cases** page
2. Create a folder structure to organize your tests
3. Click "Add Test" in any folder
4. Fill in test details:
   - Name and description
   - Priority and test type
   - Test steps (numbered list)
   - Expected results
   - Acceptance criteria (add multiple)
   - Link to related dev tasks or test cases

### Executing Tests Manually
1. Navigate to **Execute Tests** page
2. Select a folder
3. Choose a test case to execute
4. Record execution details:
   - Select result: Pass/Fail/Blocked/Skipped
   - Choose environment
   - Specify version, device, browser, OS
   - Enter actual results
   - Add notes or comments
5. Submit to save execution record

### Managing Dev Tasks
1. Navigate to **Dev Tasks** page
2. Select a folder
3. Create tasks with:
   - Title and description
   - Status and priority
   - Assignee and time estimates
   - Tags for categorization
4. Link tasks to test cases for traceability

### Viewing History
1. Navigate to **History** page
2. Use filters to narrow down executions:
   - Filter by folder
   - Filter by status (Pass/Fail/etc.)
   - Filter by environment
3. Click on any execution to see full details
4. View statistics in the dashboard

## Key Benefits

- **No Automated Testing Required** - Purely manual test execution and tracking
- **Complete Traceability** - Link test cases, dev tasks, and execution records
- **Flexible Organization** - Hierarchical folder structure
- **Detailed Tracking** - Capture environment, version, device, and execution details
- **Modern UI** - Clean, intuitive interface with Tailwind CSS
- **Comprehensive History** - Track all test executions over time
- **Team Collaboration** - Assignment tracking and shared visibility

## Technology Stack

- **Frontend**: React, React Router, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose ODM
- **Date Handling**: date-fns

## Future Enhancements

Potential additions:
- File attachments for test executions (screenshots, logs)
- Test case import/export (CSV, Excel)
- Advanced reporting and analytics
- Test plan creation and management
- Email notifications for failed tests
- Integration with issue tracking systems
- Test case templates
- Bulk operations support

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
