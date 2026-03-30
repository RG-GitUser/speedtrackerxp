require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import models
const Folder = require('./models/Folder');
const TestCase = require('./models/TestCase');
const TestRun = require('./models/TestRun');
const Comment = require('./models/Comment');
const DevTask = require('./models/DevTask');
const TestExecution = require('./models/TestExecution');
const TestStory = require('./models/TestStory');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://speedtestersxp.xyz',
  'https://speedtestersxp.xyz',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/speedtestersxp')
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// ==================== AUTH ROUTES ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username, active: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json(user.toSafeObject());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (for assignment dropdowns — no passwords returned)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({ active: true }).select('-password -__v');
    res.json(users.map(u => ({ ...u.toObject(), id: u._id })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (admin only — for backend user creation)
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    const user = new User({ username, password, name, role });
    await user.save();
    res.status(201).json(user.toSafeObject());
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Seed default admin user if none exist
(async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const admin = new User({
        username: 'admin',
        password: 'admin123',
        name: 'Admin',
        role: 'admin'
      });
      await admin.save();
      console.log('🔐 Default admin user created (username: admin, password: admin123)');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
})();

// ==================== FOLDER ROUTES ====================

// Get all folders
app.get('/api/folders', async (req, res) => {
  try {
    const folders = await Folder.find().sort({ order: 1 });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create folder
app.post('/api/folders', async (req, res) => {
  try {
    const folder = new Folder(req.body);
    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update folder
app.put('/api/folders/:id', async (req, res) => {
  try {
    const folder = await Folder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    res.json(folder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete folder
app.delete('/api/folders/:id', async (req, res) => {
  try {
    const folder = await Folder.findByIdAndDelete(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    // Also delete associated test cases
    await TestCase.deleteMany({ folderId: req.params.id });
    res.json({ message: 'Folder deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TEST CASE ROUTES ====================

// Get all test cases
app.get('/api/testcases', async (req, res) => {
  try {
    const testCases = await TestCase.find().sort({ order: 1 });
    res.json(testCases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get test cases by folder
app.get('/api/testcases/folder/:folderId', async (req, res) => {
  try {
    const testCases = await TestCase.find({ folderId: req.params.folderId }).sort({ order: 1 });
    res.json(testCases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get test cases by test story
app.get('/api/testcases/story/:testStoryId', async (req, res) => {
  try {
    const testCases = await TestCase.find({ testStoryId: req.params.testStoryId }).sort({ order: 1 });
    res.json(testCases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create test case
app.post('/api/testcases', async (req, res) => {
  try {
    const testCase = new TestCase(req.body);
    await testCase.save();
    res.status(201).json(testCase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update test case
app.put('/api/testcases/:id', async (req, res) => {
  try {
    const testCase = await TestCase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    res.json(testCase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete test case
app.delete('/api/testcases/:id', async (req, res) => {
  try {
    const testCase = await TestCase.findByIdAndDelete(req.params.id);
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    res.json({ message: 'Test case deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TEST RUN ROUTES ====================

// Get all test runs
app.get('/api/testruns', async (req, res) => {
  try {
    const testRuns = await TestRun.find().sort({ createdAt: -1 });
    res.json(testRuns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single test run
app.get('/api/testruns/:id', async (req, res) => {
  try {
    const testRun = await TestRun.findById(req.params.id);
    if (!testRun) {
      return res.status(404).json({ error: 'Test run not found' });
    }
    res.json(testRun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create test run
app.post('/api/testruns', async (req, res) => {
  try {
    const testRun = new TestRun(req.body);
    await testRun.save();
    res.status(201).json(testRun);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update test run
app.put('/api/testruns/:id', async (req, res) => {
  try {
    const testRun = await TestRun.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!testRun) {
      return res.status(404).json({ error: 'Test run not found' });
    }
    res.json(testRun);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update specific test in a run
app.put('/api/testruns/:runId/tests/:testCaseId', async (req, res) => {
  try {
    const testRun = await TestRun.findById(req.params.runId);
    if (!testRun) {
      return res.status(404).json({ error: 'Test run not found' });
    }
    
    const testIndex = testRun.tests.findIndex(
      t => t.testCaseId.toString() === req.params.testCaseId
    );
    
    if (testIndex === -1) {
      return res.status(404).json({ error: 'Test not found in run' });
    }
    
    // Update the test
    Object.assign(testRun.tests[testIndex], req.body);
    await testRun.save();
    
    res.json(testRun);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== COMMENT ROUTES ====================

// Get comments for a test run
app.get('/api/comments/testrun/:testRunId', async (req, res) => {
  try {
    const comments = await Comment.find({ testRunId: req.params.testRunId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all comments
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create comment
app.post('/api/comments', async (req, res) => {
  try {
    const comment = new Comment(req.body);
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete comment
app.delete('/api/comments/:id', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DEV TASK ROUTES ====================

// Get all dev tasks
app.get('/api/devtasks', async (req, res) => {
  try {
    const devTasks = await DevTask.find().sort({ order: 1 });
    res.json(devTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dev tasks by folder
app.get('/api/devtasks/folder/:folderId', async (req, res) => {
  try {
    const devTasks = await DevTask.find({ folderId: req.params.folderId }).sort({ order: 1 });
    res.json(devTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create dev task
app.post('/api/devtasks', async (req, res) => {
  try {
    const devTask = new DevTask(req.body);
    await devTask.save();
    res.status(201).json(devTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update dev task
app.put('/api/devtasks/:id', async (req, res) => {
  try {
    const devTask = await DevTask.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!devTask) {
      return res.status(404).json({ error: 'Dev task not found' });
    }
    res.json(devTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete dev task
app.delete('/api/devtasks/:id', async (req, res) => {
  try {
    const devTask = await DevTask.findByIdAndDelete(req.params.id);
    if (!devTask) {
      return res.status(404).json({ error: 'Dev task not found' });
    }
    res.json({ message: 'Dev task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TEST STORY ROUTES ====================

// Get all test stories
app.get('/api/teststories', async (req, res) => {
  try {
    const testStories = await TestStory.find().sort({ order: 1 });
    res.json(testStories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get test stories by folder
app.get('/api/teststories/folder/:folderId', async (req, res) => {
  try {
    const testStories = await TestStory.find({ folderId: req.params.folderId }).sort({ order: 1 });
    res.json(testStories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create test story
app.post('/api/teststories', async (req, res) => {
  try {
    const testStory = new TestStory(req.body);
    await testStory.save();
    res.status(201).json(testStory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update test story
app.put('/api/teststories/:id', async (req, res) => {
  try {
    const testStory = await TestStory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!testStory) {
      return res.status(404).json({ error: 'Test story not found' });
    }
    res.json(testStory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete test story
app.delete('/api/teststories/:id', async (req, res) => {
  try {
    const testStory = await TestStory.findByIdAndDelete(req.params.id);
    if (!testStory) {
      return res.status(404).json({ error: 'Test story not found' });
    }
    // Also delete associated test cases
    await TestCase.deleteMany({ testStoryId: req.params.id });
    res.json({ message: 'Test story deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TEST EXECUTION ROUTES ====================

// Get all test executions
app.get('/api/testexecutions', async (req, res) => {
  try {
    const testExecutions = await TestExecution.find().sort({ executedAt: -1 });
    res.json(testExecutions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get executions for a specific test case
app.get('/api/testexecutions/testcase/:testCaseId', async (req, res) => {
  try {
    const executions = await TestExecution.find({ testCaseId: req.params.testCaseId }).sort({ executedAt: -1 });
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create test execution
app.post('/api/testexecutions', async (req, res) => {
  try {
    const testExecution = new TestExecution(req.body);
    await testExecution.save();
    res.status(201).json(testExecution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update test execution
app.put('/api/testexecutions/:id', async (req, res) => {
  try {
    const testExecution = await TestExecution.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!testExecution) {
      return res.status(404).json({ error: 'Test execution not found' });
    }
    res.json(testExecution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete test execution
app.delete('/api/testexecutions/:id', async (req, res) => {
  try {
    const testExecution = await TestExecution.findByIdAndDelete(req.params.id);
    if (!testExecution) {
      return res.status(404).json({ error: 'Test execution not found' });
    }
    res.json({ message: 'Test execution deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ==================== PLAYWRIGHT TEST EXECUTION ====================

app.post('/api/execute-playwright-test', async (req, res) => {
  const { testPath } = req.body;
  
  if (!testPath) {
    return res.status(400).json({ error: 'testPath is required' });
  }

  try {
    const { spawn } = require('child_process');
    const path = require('path');
    
    // Navigate to project root (parent of server folder)
    const projectRoot = path.resolve(__dirname, '..');
    
    // Run Playwright test
    const playwrightProcess = spawn('npx', ['playwright', 'test', testPath, '--reporter=json'], {
      cwd: projectRoot,
      shell: true
    });

    let stdout = '';
    let stderr = '';

    playwrightProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    playwrightProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    playwrightProcess.on('close', (code) => {
      try {
        // Parse Playwright JSON output
        const jsonOutput = JSON.parse(stdout);
        
        res.json({
          success: code === 0,
          exitCode: code,
          results: jsonOutput,
          logs: stderr
        });
      } catch (parseError) {
        // If JSON parsing fails, return raw output
        res.json({
          success: code === 0,
          exitCode: code,
          rawOutput: stdout,
          logs: stderr
        });
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 SpeedTesters XP Backend Server`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log(`\n🔧 Manual Test Management System`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  📁 Folders:`);
  console.log(`     GET    /api/folders`);
  console.log(`     POST   /api/folders`);
  console.log(`     PUT    /api/folders/:id`);
  console.log(`     DELETE /api/folders/:id`);
  console.log(`  📝 Test Cases:`);
  console.log(`     GET    /api/testcases`);
  console.log(`     POST   /api/testcases`);
  console.log(`     PUT    /api/testcases/:id`);
  console.log(`     DELETE /api/testcases/:id`);
  console.log(`  ✅ Test Executions:`);
  console.log(`     GET    /api/testexecutions`);
  console.log(`     POST   /api/testexecutions`);
  console.log(`     PUT    /api/testexecutions/:id`);
  console.log(`     DELETE /api/testexecutions/:id`);
  console.log(`  💻 Dev Tasks:`);
  console.log(`     GET    /api/devtasks`);
  console.log(`     POST   /api/devtasks`);
  console.log(`     PUT    /api/devtasks/:id`);
  console.log(`     DELETE /api/devtasks/:id`);
  console.log(`  💬 Comments:`);
  console.log(`     GET    /api/comments`);
  console.log(`     POST   /api/comments`);
  console.log(`     DELETE /api/comments/:id`);
  console.log(`  ❤️  Health:`);
  console.log(`     GET    /api/health\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
