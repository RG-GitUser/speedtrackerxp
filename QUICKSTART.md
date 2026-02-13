# Quick Start Guide

## Get Up and Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`

### 3. Log In
Use one of the demo accounts:

**Admin Account** (Full Access)
- Email: `admin@speedtestersxp.com`
- Password: `admin123`

**Member Account** (Run & View)
- Email: `member@speedtestersxp.com`
- Password: `member123`

### 4. Create Your First Test

1. **Navigate to "Test Folders"** (sidebar)

2. **Create a Folder**:
   - Click "New Folder"
   - Name: `Login Tests`
   - Description: `Tests for user authentication`
   - Click "Create"

3. **Add a Test Case**:
   - Click "Add Test" button on your folder
   - Fill in:
     - Name: `Valid Login`
     - Description: `User can login with correct credentials`
     - Script Path: `tests/auth/login.spec.js`
     - Expected: `User sees dashboard after login`
   - Click "Create"

4. **Expand the Folder**:
   - Click the chevron (▶) next to your folder name
   - See your test case with all details

### 5. Run Your Test

1. **Go to "Execute Tests"** (sidebar)

2. **Select Tests**:
   - Choose "Login Tests" from dropdown
   - Check the "Valid Login" test
   - Click "Run Selected Tests (1)"

3. **Watch Execution**:
   - See real-time status updates
   - View execution logs
   - See pass/fail result

### 6. View History

1. **Go to "Test History"** (sidebar)

2. **Select Your Test Run**:
   - Click on the test run in the list
   - View detailed results
   - See execution time and logs

3. **Add a Comment**:
   - Type a note about the test
   - Click "Send"
   - Your comment appears in the thread

## Next Steps

### Add More Tests
Build out your test suite:
- Create folders for different features
- Add multiple test cases per folder
- Organize by priority or module

### Collaborate with Your Team
- Assign tests to team members
- Share test results
- Discuss failures in comments

### Track Progress
- Check the dashboard for statistics
- Monitor pass rates over time
- Review recent test runs

## Tips & Tricks

### Quick Navigation
- Use the sidebar to jump between pages
- Dashboard shows recent activity
- Click folder names to expand/collapse

### Bulk Operations
- Use "Select All" to run entire folders
- Multi-select tests for batch execution
- Filter history by status

### Organization
- Use descriptive folder names
- Add detailed test descriptions
- Include script paths for reference

### Collaboration
- Assign tests before running
- Add comments with @mentions (future feature)
- Use status filters to find failures

## Customization

### Change Theme Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#0ea5e9', // Change this!
    600: '#0284c7',
    // ...
  }
}
```

### Modify Data Storage
Currently uses LocalStorage. To add backend:
1. Replace `localStorage` calls in `DataContext.jsx`
2. Add API endpoints
3. Update `AuthContext.jsx` for real auth

## Troubleshooting

### Tests Not Showing
- Refresh the page
- Check browser console for errors
- Verify folder was created successfully

### Can't Run Tests
- Make sure folder is selected
- Ensure tests are checked
- Look for disabled button states

### Login Issues
- Double-check email/password
- Try copying from README demo accounts
- Clear browser cache if needed

## Need Help?

- **README.md** - Installation and setup
- **FEATURES.md** - Detailed feature documentation
- **Code Comments** - Implementation details

## Production Deployment

When ready to deploy:

1. Build for production:
```bash
npm run build
```

2. The `dist/` folder contains your app

3. Upload to any static hosting:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - GitHub Pages

4. Configure for SPA routing (all routes → index.html)

---

**Happy Testing!** 🚀
