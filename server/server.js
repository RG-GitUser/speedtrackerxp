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

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
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

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 SpeedTesters XP Backend Server`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  GET    /api/folders`);
  console.log(`  POST   /api/folders`);
  console.log(`  PUT    /api/folders/:id`);
  console.log(`  DELETE /api/folders/:id`);
  console.log(`  GET    /api/testcases`);
  console.log(`  POST   /api/testcases`);
  console.log(`  PUT    /api/testcases/:id`);
  console.log(`  DELETE /api/testcases/:id`);
  console.log(`  GET    /api/testruns`);
  console.log(`  POST   /api/testruns`);
  console.log(`  PUT    /api/testruns/:id`);
  console.log(`  GET    /api/comments`);
  console.log(`  POST   /api/comments`);
  console.log(`  DELETE /api/comments/:id`);
  console.log(`  GET    /api/health\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
