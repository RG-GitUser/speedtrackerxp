# MongoDB Setup Guide

## Backend is Ready! Just Add Your MongoDB Connection String

I've created a complete backend with MongoDB integration. Here's how to get it running:

## Quick Start

### 1. Provide Your MongoDB Connection String

You mentioned you have MongoDB info. Once you provide it, we'll add it to the `.env` file.

**You need ONE of these:**

#### Option A: MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/speedtestersxp?retryWrites=true&w=majority
```

#### Option B: Local MongoDB
```
mongodb://localhost:27017/speedtestersxp
```

#### Option C: MongoDB with Authentication
```
mongodb://username:password@host:27017/speedtestersxp
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Create .env File

```bash
cd server
cp .env.example .env
```

Then edit `.env` and paste your MongoDB connection string:

```env
MONGODB_URI=YOUR_CONNECTION_STRING_HERE
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### 4. Start the Backend Server

```bash
# From the server directory
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 SpeedTesters XP Backend Server
📡 Server running on http://localhost:3001
```

### 5. Frontend Automatically Uses MongoDB

The frontend has been updated to use the MongoDB backend automatically!

- No more LocalStorage
- All data saved to MongoDB
- Real-time sync across devices
- Persistent storage

## What's Been Created

### Backend Structure

```
server/
├── models/
│   ├── Folder.js          # Folder schema
│   ├── TestCase.js        # Test case schema
│   ├── TestRun.js         # Test run schema
│   └── Comment.js         # Comment schema
├── server.js              # Main server with all API routes
├── package.json           # Dependencies
├── .env.example           # Template for environment variables
└── README.md              # Backend documentation
```

### API Endpoints (All Ready!)

- **Folders**: GET, POST, PUT, DELETE `/api/folders`
- **Test Cases**: GET, POST, PUT, DELETE `/api/testcases`
- **Test Runs**: GET, POST, PUT `/api/testruns`
- **Comments**: GET, POST, DELETE `/api/comments`

### Frontend Updated

`src/contexts/DataContext.jsx` now:
- ✅ Fetches data from MongoDB via API
- ✅ Saves changes to MongoDB
- ✅ No more LocalStorage
- ✅ Automatic ID conversion (_id ↔ id)

## Getting Your MongoDB Connection String

### If You Have MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `speedtestersxp`

### If You Have Local MongoDB

Your connection string is:
```
mongodb://localhost:27017/speedtestersxp
```

### If You Need MongoDB

**Option 1: MongoDB Atlas (Free Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster (M0)
4. Create a database user
5. Get your connection string

**Option 2: Install Locally**
```bash
# Windows
choco install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
mongod
```

## Testing the Setup

### 1. Check Backend Health

Open your browser or use curl:
```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "database": "connected"
}
```

### 2. Use the Frontend

1. Keep backend running (`npm run dev` in `server/`)
2. Open frontend (http://localhost:3000)
3. Create a folder
4. Check MongoDB - data should be there!

### 3. Verify in MongoDB

**Using MongoDB Compass:**
1. Connect to your database
2. Look for `speedtestersxp` database
3. You should see collections:
   - folders
   - testcases
   - testruns
   - comments

**Using MongoDB Atlas:**
1. Go to your cluster
2. Click "Collections"
3. See your data

## Troubleshooting

### "Connection Refused" Error

**Backend not running:**
```bash
cd server
npm run dev
```

### "MongoDB Connection Error"

**Check your connection string:**
- Is the password correct?
- Is your IP whitelisted (Atlas)?
- Is MongoDB running (local)?

**Atlas IP Whitelist:**
1. Go to Network Access
2. Add your IP address
3. Or add `0.0.0.0/0` (allow all - development only!)

### "CORS Error" in Frontend

Make sure backend `.env` has:
```env
CORS_ORIGIN=http://localhost:3000
```

### Port 3001 Already in Use

Change backend port:
```env
PORT=3002
```

And update frontend `src/contexts/DataContext.jsx`:
```javascript
const API_URL = 'http://localhost:3002/api'
```

## Data Migration from LocalStorage

If you have existing data in LocalStorage that you want to keep:

1. Open browser console on http://localhost:3000
2. Run this to export your data:
```javascript
const data = {
  folders: JSON.parse(localStorage.getItem('speedtestersxp_folders')),
  testcases: JSON.parse(localStorage.getItem('speedtestersxp_testcases')),
  testruns: JSON.parse(localStorage.getItem('speedtestersxp_testruns')),
  comments: JSON.parse(localStorage.getItem('speedtestersxp_comments'))
}
console.log(JSON.stringify(data, null, 2))
```

3. Copy the output
4. Contact me and I'll create a migration script

## Running Both Servers

You need TWO terminals:

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Running on http://localhost:3000

**Terminal 2 - Backend:**
```bash
cd server
npm run dev
```
Running on http://localhost:3001

## Production Deployment

### Backend
- Deploy to: Heroku, Railway, Render, AWS, etc.
- Set environment variables in hosting platform
- Update frontend API_URL to production URL

### Frontend
- Deploy to: Netlify, Vercel, etc.
- Update CORS_ORIGIN in backend to production URL

## Next Steps

1. **Provide your MongoDB connection string**
2. I'll help you set up the `.env` file
3. Start the backend server
4. Your data will be saved to MongoDB!

---

**Ready to connect?** Just paste your MongoDB connection string and we'll get it running! 🚀
