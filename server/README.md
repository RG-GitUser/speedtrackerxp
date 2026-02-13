# SpeedTesters XP Backend Server

Backend API with MongoDB integration for SpeedTesters XP.

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Create a `.env` file in the `server/` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:

```env
MONGODB_URI=your_mongodb_connection_string_here
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### 3. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:3001`

## MongoDB Connection Strings

### Local MongoDB
```
MONGODB_URI=mongodb://localhost:27017/speedtestersxp
```

### MongoDB Atlas
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speedtestersxp?retryWrites=true&w=majority
```

## API Endpoints

### Folders
- `GET /api/folders` - Get all folders
- `POST /api/folders` - Create folder
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

### Test Cases
- `GET /api/testcases` - Get all test cases
- `GET /api/testcases/folder/:folderId` - Get test cases by folder
- `POST /api/testcases` - Create test case
- `PUT /api/testcases/:id` - Update test case
- `DELETE /api/testcases/:id` - Delete test case

### Test Runs
- `GET /api/testruns` - Get all test runs
- `GET /api/testruns/:id` - Get single test run
- `POST /api/testruns` - Create test run
- `PUT /api/testruns/:id` - Update test run
- `PUT /api/testruns/:runId/tests/:testCaseId` - Update specific test in run

### Comments
- `GET /api/comments` - Get all comments
- `GET /api/comments/testrun/:testRunId` - Get comments for test run
- `POST /api/comments` - Create comment
- `DELETE /api/comments/:id` - Delete comment

### Health Check
- `GET /api/health` - Server health and database status

## Database Schema

### Folder
```javascript
{
  name: String,
  description: String,
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### TestCase
```javascript
{
  folderId: ObjectId,
  name: String,
  description: String,
  script: String,
  expectedBehavior: String,
  assignedTo: String,
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### TestRun
```javascript
{
  createdBy: String,
  status: String,
  tests: [{
    testCaseId: ObjectId,
    status: String,
    startTime: Date,
    endTime: Date,
    logs: [String],
    result: String
  }],
  createdAt: Date,
  completedAt: Date
}
```

### Comment
```javascript
{
  testRunId: ObjectId,
  userId: String,
  userName: String,
  text: String,
  createdAt: Date
}
```

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:3001/api/health

# Get all folders
curl http://localhost:3001/api/folders

# Create a folder
curl -X POST http://localhost:3001/api/folders \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Folder","description":"My test folder"}'
```

### Using Postman

Import these endpoints into Postman and test them individually.

## Troubleshooting

### Connection Issues

If you get connection errors:
1. Check that MongoDB is running (local) or Atlas cluster is active
2. Verify connection string in `.env`
3. Check firewall/network settings
4. Ensure IP is whitelisted in Atlas (if using Atlas)

### Port Already in Use

If port 3001 is in use:
1. Change `PORT=3002` in `.env`
2. Update `API_URL` in frontend DataContext

## Next Steps

After starting the backend, update the frontend to use the API instead of LocalStorage (instructions in main README).
