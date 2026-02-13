/**
 * Example Backend Server for SpeedTesters XP
 * 
 * This is a simple Node.js/Express server that:
 * 1. Receives test execution requests from the frontend
 * 2. Runs your actual test scripts
 * 3. Streams results back to the frontend
 * 
 * To use this:
 * 1. Install dependencies: npm install express cors child_process
 * 2. Start server: node backend-example.js
 * 3. Update TestExecution.jsx to call http://localhost:3001
 */

const express = require('express');
const cors = require('cors');
const { exec, spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store active test runs
const activeRuns = new Map();

/**
 * Run a single test script
 * POST /api/run-test
 * Body: { testId, scriptPath }
 */
app.post('/api/run-test', async (req, res) => {
  const { testId, scriptPath } = req.body;
  
  console.log(`📝 Running test: ${testId}`);
  console.log(`📂 Script: ${scriptPath}`);
  
  const startTime = Date.now();
  const logs = [];
  
  try {
    // Resolve full script path
    const fullPath = path.join(__dirname, scriptPath);
    
    // Execute the test script
    const child = exec(`node ${fullPath}`, {
      cwd: __dirname,
      env: process.env
    });
    
    // Capture stdout
    child.stdout.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      logs.push(...lines);
      console.log(`  ${data.toString().trim()}`);
    });
    
    // Capture stderr
    child.stderr.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      logs.push(...lines.map(line => `ERROR: ${line}`));
      console.error(`  ${data.toString().trim()}`);
    });
    
    // Wait for completion
    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      const passed = code === 0;
      
      console.log(`${passed ? '✅' : '❌'} Test ${passed ? 'PASSED' : 'FAILED'} in ${duration}ms`);
      
      res.json({
        testId,
        passed,
        logs,
        duration,
        exitCode: code
      });
    });
    
    // Handle errors
    child.on('error', (error) => {
      console.error(`❌ Error executing test: ${error.message}`);
      
      res.status(500).json({
        testId,
        passed: false,
        logs: [...logs, `Execution error: ${error.message}`],
        duration: Date.now() - startTime,
        error: error.message
      });
    });
    
  } catch (error) {
    console.error(`❌ Failed to start test: ${error.message}`);
    
    res.status(500).json({
      testId,
      passed: false,
      logs: [`Failed to start test: ${error.message}`],
      duration: Date.now() - startTime,
      error: error.message
    });
  }
});

/**
 * Run multiple tests sequentially
 * POST /api/run-tests
 * Body: { tests: [{ testId, scriptPath }] }
 */
app.post('/api/run-tests', async (req, res) => {
  const { tests } = req.body;
  const runId = `run_${Date.now()}`;
  
  console.log(`🚀 Starting test run: ${runId}`);
  console.log(`📊 Running ${tests.length} tests`);
  
  const results = [];
  
  // Run tests sequentially
  for (const test of tests) {
    console.log(`\n▶️  Running: ${test.scriptPath}`);
    
    const result = await runTest(test.testId, test.scriptPath);
    results.push(result);
    
    console.log(`${result.passed ? '✅' : '❌'} ${result.passed ? 'PASSED' : 'FAILED'}`);
  }
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\n📊 Test run complete: ${passed} passed, ${failed} failed`);
  
  res.json({
    runId,
    results,
    summary: {
      total: tests.length,
      passed,
      failed
    }
  });
});

/**
 * Helper function to run a single test
 */
function runTest(testId, scriptPath) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const logs = [];
    const fullPath = path.join(__dirname, scriptPath);
    
    const child = exec(`node ${fullPath}`, {
      cwd: __dirname,
      env: process.env
    });
    
    child.stdout.on('data', (data) => {
      logs.push(...data.toString().trim().split('\n'));
    });
    
    child.stderr.on('data', (data) => {
      logs.push(...data.toString().trim().split('\n').map(l => `ERROR: ${l}`));
    });
    
    child.on('close', (code) => {
      resolve({
        testId,
        passed: code === 0,
        logs,
        duration: Date.now() - startTime,
        exitCode: code
      });
    });
    
    child.on('error', (error) => {
      resolve({
        testId,
        passed: false,
        logs: [...logs, `Execution error: ${error.message}`],
        duration: Date.now() - startTime,
        error: error.message
      });
    });
  });
}

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Get available test scripts
 * GET /api/scripts
 */
app.get('/api/scripts', (req, res) => {
  // TODO: Scan test-scripts folder and return available scripts
  res.json({
    message: 'Not implemented yet',
    hint: 'Add logic to scan test-scripts folder'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 SpeedTesters XP Backend Server`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  POST http://localhost:${PORT}/api/run-test`);
  console.log(`  POST http://localhost:${PORT}/api/run-tests`);
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`\nReady to execute tests! 🧪\n`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});
