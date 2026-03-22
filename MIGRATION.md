# Migration Guide - Automated to Manual Testing System

## Overview

This system has been transformed from an automated Playwright-based testing platform to a comprehensive manual test management system. This guide explains the changes and how to work with the new structure.

## Major Changes

### What Was Removed
- **Automated Playwright Test Execution**: The system no longer executes automated browser tests
- **Real-time Test Runner**: No background test execution processes
- **Test Scripts**: The `script` field has been replaced with `testSteps`
- **Expected Behavior**: Now split into `testSteps` and `expectedResult`

### What Was Added
- **Manual Test Execution Records**: Track each manual test execution with detailed metadata
- **Developer Tasks**: Manage development work items linked to test cases
- **Acceptance Criteria**: Checklist-based criteria for test cases
- **Priority & Test Types**: Categorize test cases by priority and type
- **Environment Tracking**: Record which environment tests were executed in
- **Device & Browser Tracking**: Capture device type, browser, and OS information
- **Version Tracking**: Associate executions with specific software versions
- **Pass/Fail/Blocked Status**: More granular test result states

## Database Schema Changes

### TestCase Model - CHANGED

**Old Fields (Removed):**
```javascript
script: String              // Path to automated test script
expectedBehavior: String    // Generic expected behavior
```

**New Fields (Added):**
```javascript
testSteps: String                    // Step-by-step test instructions
expectedResult: String               // Expected outcome
acceptanceCriteria: [{               // Checklist of criteria
  description: String,
  completed: Boolean
}]
priority: String                     // critical, high, medium, low
testType: String                     // functional, regression, smoke, etc.
relatedDevTaskIds: [String]         // Links to developer tasks
relatedTestCaseIds: [String]        // Links to other test cases
```

**Preserved Fields:**
```javascript
folderId: ObjectId
name: String
description: String
assignedTo: String
order: Number
createdAt: Date
updatedAt: Date
```

### New Models

#### TestExecution
```javascript
{
  testCaseId: ObjectId,              // Reference to TestCase
  executedBy: String,                // Who executed the test
  status: String,                    // pass, fail, blocked, skipped, in-progress
  environment: String,               // production, staging, development, qa, uat, local
  version: String,                   // Software version tested
  deviceType: String,                // desktop, mobile, tablet, api, other
  browser: String,                   // Browser name and version
  os: String,                        // Operating system
  actualResult: String,              // What actually happened
  notes: String,                     // Additional comments
  defects: [{                        // Found defects
    id: String,
    description: String,
    severity: String
  }],
  attachments: [{                    // Screenshots, logs, etc.
    name: String,
    url: String,
    type: String
  }],
  executionTime: Number,             // Minutes taken to execute
  executedAt: Date,
  createdAt: Date
}
```

#### DevTask
```javascript
{
  folderId: ObjectId,
  title: String,
  description: String,
  status: String,                    // todo, in-progress, in-review, completed, blocked
  priority: String,                  // critical, high, medium, low
  assignedTo: String,
  estimatedHours: Number,
  actualHours: Number,
  relatedTestCaseIds: [String],     // Links to test cases
  relatedDevTaskIds: [String],      // Links to other dev tasks
  tags: [String],                   // Categorization tags
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## API Changes

### New Endpoints

**Test Executions:**
```
GET    /api/testexecutions
GET    /api/testexecutions/testcase/:testCaseId
POST   /api/testexecutions
PUT    /api/testexecutions/:id
DELETE /api/testexecutions/:id
```

**Dev Tasks:**
```
GET    /api/devtasks
GET    /api/devtasks/folder/:folderId
POST   /api/devtasks
PUT    /api/devtasks/:id
DELETE /api/devtasks/:id
```

### Modified Endpoints

**Test Cases** - Now accept new fields:
```javascript
POST /api/testcases
PUT  /api/testcases/:id

// New request body structure:
{
  name: "Login Test",
  description: "Verify user can log in",
  testSteps: "1. Go to login\n2. Enter credentials\n3. Click submit",
  expectedResult: "User is logged in and redirected to dashboard",
  acceptanceCriteria: [
    { description: "Login form visible", completed: false },
    { description: "Error handling works", completed: false }
  ],
  priority: "high",
  testType: "functional",
  assignedTo: "John Doe",
  relatedDevTaskIds: ["task_id_1"],
  relatedTestCaseIds: ["test_id_2"],
  folderId: "folder_id"
}
```

### Deprecated Endpoints (Still Available)

The automated test run endpoints still exist but are no longer used by the frontend:
```
GET  /api/testruns
POST /api/testruns
PUT  /api/testruns/:id
```

These can be removed in a future cleanup if not needed.

## Frontend Changes

### New Pages

1. **DevTasks** (`/devtasks`) - Manage developer tasks
2. **TestExecution** (redesigned) - Manual test execution interface
3. **TestHistory** (redesigned) - Execution history with filtering

### Updated Pages

1. **TestFolders** - Updated test case modal with new fields
2. **Dashboard** - Still shows overview statistics
3. **Layout** - Updated navigation to include Dev Tasks

### Removed Components

- Playwright toggle/integration in TestExecution
- Automated test runner UI
- Real-time test execution logs (automated)

## Migration Steps

### If You Have Existing Data

#### Option 1: Clean Start (Recommended for Testing)
```bash
# Drop the existing database
mongo speedtestersxp
db.dropDatabase()
```

#### Option 2: Migrate Existing Test Cases

If you have existing test cases and want to preserve them:

```javascript
// Run this script in MongoDB shell or create a migration script
db.testcases.updateMany(
  {},
  {
    $rename: { 
      "script": "testSteps",
      "expectedBehavior": "expectedResult"
    },
    $set: {
      priority: "medium",
      testType: "functional",
      acceptanceCriteria: [],
      relatedDevTaskIds: [],
      relatedTestCaseIds: []
    }
  }
)
```

### Setting Up Fresh

1. **Install Dependencies:**
```bash
# Backend
cd server
npm install

# Frontend
npm install
```

2. **Configure Environment:**
Create `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/speedtestersxp
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

3. **Start Services:**
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd server
npm start

# Terminal 3: Start Frontend
npm run dev
```

## Usage Workflow

### Old Workflow (Automated)
1. Create test cases with script paths
2. Select tests to run
3. Click "Run Tests" - automated execution
4. View results in real-time

### New Workflow (Manual)
1. **Create Test Cases** with detailed steps and acceptance criteria
2. **Link to Dev Tasks** for traceability
3. **Execute Tests Manually**:
   - Select test case
   - Perform test steps manually
   - Record result (Pass/Fail/Blocked)
   - Document environment, version, device
   - Add actual results and notes
4. **View Execution History** with filters and analytics

## Benefits of New System

- **Better Documentation**: Detailed test steps and acceptance criteria
- **Environment Tracking**: Know exactly where tests were executed
- **Traceability**: Link test cases to development tasks
- **Flexibility**: Not dependent on automated test infrastructure
- **Historical Data**: Complete execution history with context
- **Team Collaboration**: Clear assignments and status tracking

## Rollback Plan

If you need to revert to the old system:

1. Check out previous git commit:
```bash
git log --oneline  # Find the commit before migration
git checkout <commit-hash>
```

2. The old system files will be restored
3. Your MongoDB data remains intact (folders, old test cases, test runs)

## Support

If you encounter issues during migration:
1. Check MongoDB connection
2. Verify all dependencies are installed
3. Clear browser cache and localStorage
4. Check console for errors
5. Ensure backend is running on port 3001

## Next Steps

1. Create folder structure for your test organization
2. Add test cases with new detailed fields
3. Create related dev tasks
4. Start executing tests and recording results
5. Use history page to analyze test execution trends
