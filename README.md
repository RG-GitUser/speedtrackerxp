# SpeedTesters XP - Testing Portal

A comprehensive React web application for managing, executing, and tracking software tests with team collaboration features.

## Features

### 🗂️ Test Organization
- **Folders & Cases**: Organize test cases into folders by category or feature
- **Detailed Test Cases**: Add scripts, descriptions, and expected behaviors
- **Easy Management**: Create, edit, and delete folders and test cases

### ▶️ Test Execution
- **Selective Execution**: Choose specific test cases to run
- **Real-time Results**: Watch tests execute with live status updates
- **Detailed Logs**: View execution logs for debugging
- **Visual Feedback**: Clear pass/fail indicators

### 📊 Test History & Tracking
- **Complete History**: Track all test runs over time
- **Detailed Results**: View pass/fail statistics and duration
- **Filter & Search**: Find specific test runs quickly
- **Analytics**: Monitor pass rates and trends

### 👥 Team Collaboration
- **Comments**: Discuss test results with your team
- **Assignments**: Assign test cases to team members
- **Role-Based Access**: Admin and Member roles with different permissions
- **Shared Visibility**: Everyone stays informed

### 🎨 Modern UI/UX
- Clean, intuitive interface
- Responsive design
- Real-time updates
- Beautiful visual indicators

## Demo Accounts

### Admin Account
- **Email**: admin@speedtestersxp.com
- **Password**: admin123
- **Permissions**: Full access (create/edit/delete folders and tests)

### Member Account
- **Email**: member@speedtestersxp.com
- **Password**: member123
- **Permissions**: Run tests, add comments, view history

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

4. Log in with one of the demo accounts

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technology Stack

- **React 18** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons
- **date-fns** - Date formatting
- **LocalStorage** - Data persistence (can be upgraded to backend)

## Project Structure

```
speedtestersxp/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with sidebar
│   ├── contexts/
│   │   ├── AuthContext.jsx     # Authentication state
│   │   └── DataContext.jsx     # Data management
│   ├── pages/
│   │   ├── Dashboard.jsx       # Overview & statistics
│   │   ├── TestFolders.jsx     # Manage test folders
│   │   ├── TestExecution.jsx   # Run tests
│   │   ├── TestHistory.jsx     # View past runs
│   │   └── Login.jsx           # Authentication
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Usage Guide

### Creating Test Folders

1. Navigate to "Test Folders"
2. Click "New Folder"
3. Enter name and description
4. Click "Create"

### Adding Test Cases

1. Open a folder
2. Click "Add Test"
3. Fill in test details:
   - Name
   - Description
   - Script path (optional)
   - Expected behavior
4. Click "Create"

### Running Tests

1. Go to "Execute Tests"
2. Select a folder
3. Choose test cases to run (or select all)
4. Click "Run Selected Tests"
5. Watch real-time execution
6. View results and logs

### Viewing History

1. Navigate to "Test History"
2. Click on any test run
3. View detailed results
4. Expand test cases to see logs
5. Add comments for team discussion

## Data Persistence

Currently uses browser LocalStorage for data persistence. This means:
- ✅ Data persists across browser sessions
- ✅ No server setup required
- ✅ Works offline
- ⚠️ Data is per-browser (not synced across devices)
- ⚠️ Clearing browser data will reset the app

### Upgrading to Backend

To add backend support:
1. Replace LocalStorage calls in `DataContext.jsx` with API calls
2. Add authentication endpoint in `AuthContext.jsx`
3. Deploy backend API (Node.js, Python, etc.)

## Customization

### Colors
Edit `tailwind.config.js` to change the primary color scheme.

### Demo Data
The app includes sample test folders and cases. To disable:
- Remove `initializeDemoData()` call in `DataContext.jsx`

### Authentication
Current authentication is simple (demo accounts). For production:
- Implement proper backend authentication
- Add JWT tokens or session management
- Connect to your user database

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

## Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ for efficient software testing
# speedtrackerxp
