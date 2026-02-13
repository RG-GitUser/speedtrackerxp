# Integration Guide: Connect Real Test Scripts

## Overview

SpeedTesters XP is currently a **test management portal** with simulated execution. To run your actual tests, you need to integrate with your test runner.

## Current State

The app provides:
- ✅ Test organization and metadata
- ✅ Execution tracking and history
- ✅ Team collaboration features
- ⚠️ **Simulated test execution** (needs replacement)

## Integration Options

### Option 1: Backend API Integration (Recommended)

Create a backend service that runs your tests and reports back.

#### 1. Create Backend Server

**Example: Node.js + Express**

```javascript
// server.js
const express = require('express');
const { exec } = require('child_process');
const app = express();

app.post('/api/run-test', async (req, res) => {
  const { testId, scriptPath } = req.body;
  
  // Run your test script
  exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    res.json({
      testId,
      passed: !error,
      logs: stdout.split('\n'),
      error: stderr,
      duration: Date.now() - startTime
    });
  });
});

app.listen(3001, () => console.log('Test runner on port 3001'));
```

#### 2. Update TestExecution.jsx

Replace the `simulateTestExecution` function:

```javascript
// In src/pages/TestExecution.jsx
const executeRealTest = async (runId, testId) => {
  const test = testCases.find(tc => tc.id === testId);
  
  // Start test
  updateTestInRun(runId, testId, {
    status: 'running',
    startTime: new Date().toISOString(),
    logs: [`Starting test: ${test.name}`]
  });

  try {
    // Call your backend API
    const response = await fetch('http://localhost:3001/api/run-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testId: test.id,
        scriptPath: test.script
      })
    });

    const result = await response.json();

    // Update with real results
    updateTestInRun(runId, testId, {
      status: result.passed ? 'passed' : 'failed',
      endTime: new Date().toISOString(),
      logs: result.logs,
      result: result.passed ? 'success' : 'failure'
    });

  } catch (error) {
    updateTestInRun(runId, testId, {
      status: 'failed',
      endTime: new Date().toISOString(),
      logs: [`Error: ${error.message}`],
      result: 'failure'
    });
  }
};
```

### Option 2: Direct Integration (Frontend Only)

If your tests can run in the browser (like Playwright or Puppeteer tests):

```javascript
// Import your test framework
import { runTest } from './test-runner';

const executeRealTest = async (runId, testId) => {
  const test = testCases.find(tc => tc.id === testId);
  
  updateTestInRun(runId, testId, {
    status: 'running',
    startTime: new Date().toISOString(),
    logs: [`Starting test: ${test.name}`]
  });

  // Run your actual test
  const result = await runTest(test.script);

  updateTestInRun(runId, testId, {
    status: result.passed ? 'passed' : 'failed',
    endTime: new Date().toISOString(),
    logs: result.logs,
    result: result.passed ? 'success' : 'failure'
  });
};
```

### Option 3: WebSocket for Real-Time Updates

For long-running tests, use WebSockets:

```javascript
// Backend
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const { testId, scriptPath } = JSON.parse(message);
    
    // Run test and stream logs
    const testProcess = exec(`node ${scriptPath}`);
    
    testProcess.stdout.on('data', (data) => {
      ws.send(JSON.stringify({
        type: 'log',
        testId,
        message: data.toString()
      }));
    });
    
    testProcess.on('close', (code) => {
      ws.send(JSON.stringify({
        type: 'complete',
        testId,
        passed: code === 0
      }));
    });
  });
});
```

## Integration with Popular Test Frameworks

### Jest Tests

```javascript
// backend/test-runner.js
const { run } = require('jest');

async function runJestTest(testPath) {
  const results = await run([testPath], {
    silent: true,
    verbose: false
  });
  
  return {
    passed: results.numFailedTests === 0,
    logs: results.testResults[0].testResults.map(t => 
      `${t.title}: ${t.status}`
    )
  };
}
```

### Playwright Tests

```javascript
// backend/test-runner.js
const { chromium } = require('playwright');

async function runPlaywrightTest(scriptPath) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  
  try {
    // Load and run your test script
    const testModule = require(scriptPath);
    await testModule.run(page);
    
    await browser.close();
    return { passed: true, logs };
  } catch (error) {
    await browser.close();
    return { 
      passed: false, 
      logs: [...logs, `Error: ${error.message}`]
    };
  }
}
```

### Cypress Tests

```javascript
// backend/test-runner.js
const cypress = require('cypress');

async function runCypressTest(spec) {
  const results = await cypress.run({
    spec: spec,
    reporter: 'json'
  });
  
  return {
    passed: results.totalFailed === 0,
    logs: results.runs[0].tests.map(t => 
      `${t.title[0]}: ${t.state}`
    )
  };
}
```

### Selenium Tests

```javascript
// backend/test-runner.js
const { Builder } = require('selenium-webdriver');

async function runSeleniumTest(scriptPath) {
  const driver = await new Builder().forBrowser('chrome').build();
  const logs = [];
  
  try {
    // Load your test
    const test = require(scriptPath);
    await test.execute(driver, (log) => logs.push(log));
    
    await driver.quit();
    return { passed: true, logs };
  } catch (error) {
    await driver.quit();
    return { 
      passed: false, 
      logs: [...logs, `Error: ${error.message}`]
    };
  }
}
```

## Example Test Scripts You Would Write

### Example 1: Simple Node.js Test

```javascript
// test-scripts/auth/login.js
async function testLogin() {
  console.log('Starting login test...');
  
  // Your test logic here
  const response = await fetch('https://api.example.com/login', {
    method: 'POST',
    body: JSON.stringify({ user: 'test', pass: 'test123' })
  });
  
  console.log('Checking response...');
  
  if (response.status === 200) {
    console.log('✓ Login successful');
    return true;
  } else {
    console.log('✗ Login failed');
    return false;
  }
}

module.exports = { run: testLogin };
```

### Example 2: API Test

```javascript
// test-scripts/api/get-users.js
const assert = require('assert');

async function testGetUsers() {
  console.log('Testing GET /api/users endpoint');
  
  const response = await fetch('https://api.example.com/users');
  const data = await response.json();
  
  console.log(`Received ${data.length} users`);
  
  assert(response.status === 200, 'Status should be 200');
  assert(Array.isArray(data), 'Response should be an array');
  assert(data.length > 0, 'Should have at least one user');
  
  console.log('✓ All assertions passed');
  return true;
}

module.exports = { run: testGetUsers };
```

### Example 3: UI Test (Playwright)

```javascript
// test-scripts/ui/dashboard.js
async function testDashboard(page) {
  console.log('Testing dashboard page...');
  
  await page.goto('https://example.com/dashboard');
  console.log('Navigated to dashboard');
  
  const title = await page.title();
  console.log(`Page title: ${title}`);
  
  if (title === 'Dashboard - My App') {
    console.log('✓ Title is correct');
    return true;
  } else {
    console.log('✗ Title is incorrect');
    return false;
  }
}

module.exports = { run: testDashboard };
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/tests.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd speedtestersxp
          npm install
      
      - name: Start test server
        run: |
          npm run dev &
          sleep 5
      
      - name: Run tests via API
        run: |
          curl -X POST http://localhost:3001/api/run-all-tests
```

## Quick Start: Get Running Today

1. **Keep using the simulator** for now (it works great for demos)
2. **Write your test scripts** in a `test-scripts/` folder
3. **Create a simple backend** (Node.js example above)
4. **Update TestExecution.jsx** to call your backend
5. **Test with one script** before doing all of them

## Need Help?

### Common Questions

**Q: Can I use existing test suites?**
A: Yes! The portal just needs to call your tests and capture the output.

**Q: Do tests run in the browser?**
A: Not by default. You need a backend to run most test frameworks.

**Q: Can I use this with my CI/CD?**
A: Yes! Add an API endpoint that your CI/CD calls to trigger tests.

**Q: Is this a replacement for Jest/Cypress/Playwright?**
A: No! This is a management layer on top of your existing test frameworks.

## Architecture Diagram

```
┌─────────────────────────────────────┐
│   SpeedTesters XP (Frontend)        │
│   - Test organization               │
│   - Execution tracking              │
│   - Results visualization           │
│   - Team collaboration              │
└──────────────┬──────────────────────┘
               │ HTTP/WebSocket
               ▼
┌─────────────────────────────────────┐
│   Backend API (Your code)           │
│   - Receives test execution request │
│   - Runs test scripts               │
│   - Streams logs back               │
│   - Reports results                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Test Scripts (Your code)          │
│   - Jest tests                      │
│   - Playwright tests                │
│   - API tests                       │
│   - Custom scripts                  │
└─────────────────────────────────────┘
```

## Summary

**What SpeedTesters XP Does:**
- ✅ Organizes tests into folders
- ✅ Tracks test execution history
- ✅ Visualizes results
- ✅ Enables team collaboration
- ✅ Shows real-time execution progress

**What You Need to Add:**
- ⚠️ Your actual test scripts
- ⚠️ Backend API to run tests
- ⚠️ Integration code (examples above)

The portal is a **management layer** - you bring the tests!
