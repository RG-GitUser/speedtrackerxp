# Quick Start Guide - SpeedTesters XP

Get up and running with SpeedTesters XP in 5 minutes!

## Prerequisites
- Node.js (v16+)
- MongoDB (running locally or accessible via connection string)

## Installation

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
npm install
```

### 2. Configure Environment

Create `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/speedtestersxp
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### 3. Start Services

**Option A: Using separate terminals**

Terminal 1 - Backend:
```bash
cd server
npm start
```

Terminal 2 - Frontend:
```bash
npm run dev
```

**Option B: One-line start (if you have concurrently installed)**
```bash
npm install -g concurrently
concurrently "cd server && npm start" "npm run dev"
```

### 4. Access the Application

Open your browser and go to:
```
http://localhost:5173
```

## First Time Setup

### Login
Default credentials (you can modify these in the database):
- **Email**: admin@example.com
- **Password**: admin123

### Create Your First Folder
1. Click on **Test Cases** in the navigation
2. Click **New Folder**
3. Enter folder name (e.g., "Login Tests")
4. Add description
5. Click **Create**

### Create Your First Test Case
1. In your folder, click **Add Test**
2. Fill in the form:
   - **Name**: User Login - Valid Credentials
   - **Priority**: High
   - **Test Type**: Functional
   - **Test Steps**:
     ```
     1. Navigate to login page
     2. Enter valid username
     3. Enter valid password
     4. Click login button
     ```
   - **Expected Result**: User successfully logs in and is redirected to dashboard
   - **Acceptance Criteria**: 
     - Login form displays correctly
     - Valid credentials are accepted
     - Dashboard loads after login
3. Click **Create**

### Execute Your First Test
1. Navigate to **Execute Tests**
2. Select your folder
3. Click on the test case you created
4. Record the execution:
   - Select **Pass** or **Fail**
   - Choose **Environment** (e.g., Development)
   - Enter **Version** (e.g., v1.0.0)
   - Select **Device Type** (e.g., Desktop)
   - Add **Actual Result** and any notes
5. Click **Record Execution**

### Create a Dev Task (Optional)
1. Navigate to **Dev Tasks**
2. Select a folder
3. Click **New Task**
4. Fill in:
   - **Title**: Fix login validation
   - **Status**: To Do
   - **Priority**: High
   - **Description**: Add better error handling for invalid credentials
5. Click **Create**

### View Test History
1. Navigate to **History**
2. See all your test executions
3. Use filters to narrow down results
4. Click on any execution to see full details

## Common Use Cases

### Organizing Tests
Create a hierarchical folder structure:
```
📁 Project Name
  ├─ 🏁 Authentication
  │   ├─ Login Tests
  │   └─ Registration Tests
  ├─ 🏁 User Management
  └─ 🏁 API Tests
```

### Linking Tests and Tasks
1. Create a dev task: "Implement password reset"
2. Create test case: "Password Reset Flow"
3. In test case, link to the dev task
4. Now you have traceability between development and testing

### Tracking Test Execution
Execute the same test case multiple times across different:
- Environments (Dev, QA, Staging, Prod)
- Versions (v1.0, v1.1, v2.0)
- Devices (Desktop, Mobile, Tablet)

View trends in the History page!

## Tips & Tricks

### Keyboard Shortcuts
- Press **Enter** when adding acceptance criteria to quickly add the next one

### Best Practices
1. **Use clear, numbered test steps** - Makes manual execution easier
2. **Add acceptance criteria** - Provides clear pass/fail criteria
3. **Link related items** - Connect test cases and dev tasks for traceability
4. **Record detailed actual results** - Helps with debugging failures
5. **Tag and categorize** - Use priorities and test types consistently

### Efficient Test Organization
- Use **folders** to group related tests
- Use **test types** to categorize (Smoke, Regression, etc.)
- Use **priorities** to identify critical tests
- Use **tags** on dev tasks for easy filtering

## Troubleshooting

### Backend won't start
- Check if MongoDB is running: `mongod`
- Verify `.env` file exists and has correct settings
- Check if port 3001 is available

### Frontend won't start
- Check if backend is running first
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check if port 5173 is available

### Can't see data
- Refresh the page
- Check browser console for errors
- Verify backend API is accessible at `http://localhost:3001/api/health`

### Authentication issues
- Clear browser localStorage
- Check user exists in MongoDB: `db.users.find()`
- Reset password in database if needed

## Next Steps

Now that you're set up, explore these features:
- Create a comprehensive test suite
- Execute tests across different environments
- Track your team's testing progress
- Link tests to development work items
- Analyze test execution trends

## Need Help?

- Check the full **README.md** for detailed documentation
- Review **MIGRATION.md** if coming from the old system
- Check MongoDB connection if data isn't persisting
- Look at browser console for frontend errors
- Check terminal output for backend errors

## Quick Reference

### Key Files
- **Backend**: `server/server.js` - Main API server
- **Frontend**: `src/App.jsx` - Main React app
- **Models**: `server/models/*.js` - Database schemas
- **Pages**: `src/pages/*.jsx` - Application pages

### Important URLs
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

### Database Collections
- `folders` - Test folder hierarchy
- `testcases` - Test case definitions
- `testexecutions` - Manual execution records
- `devtasks` - Developer task items
- `users` - User accounts

Happy Testing! 🚀
