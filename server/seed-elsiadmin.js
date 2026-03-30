require('dotenv').config();
const mongoose = require('mongoose');
const Folder = require('./models/Folder');
const TestStory = require('./models/TestStory');
const TestCase = require('./models/TestCase');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/speedtestersxp';

// ============================================================
// ElsiAdmin - User Stories & Test Cases Seed Data
// 15 sections, 75 user stories, 115 test cases
// ============================================================

const sections = [
  {
    name: '1. Authentication',
    description: 'Login, registration, session management, and security for ElsiAdmin',
    userStories: [
      { id: 'US-1.1', title: 'New Employee Registration', userStory: 'As a new employee, I want to register an account so that I can access the admin panel.', priority: 'critical' },
      { id: 'US-1.2', title: 'User Login', userStory: 'As a registered user, I want to log in with my email and password so that I can access my dashboard.', priority: 'critical' },
      { id: 'US-1.3', title: 'User Logout', userStory: 'As a logged-in user, I want to log out so that my session is securely ended.', priority: 'high' },
      { id: 'US-1.4', title: 'Session Persistence', userStory: 'As a returning user, I want my session to persist across browser refreshes so that I don\'t have to log in repeatedly.', priority: 'high' },
      { id: 'US-1.5', title: 'Password Visibility Toggle', userStory: 'As a user, I want to toggle password visibility on the login form so that I can verify what I typed.', priority: 'low' },
    ],
    testCases: [
      { id: 'TC-1.1', name: 'Successful registration', description: 'User is on /login page', testSteps: '1. Click "Sign Up" tab\n2. Enter first name, last name, email, password\n3. Click "Sign Up"', expectedResult: 'Account is created, user is redirected to dashboard', priority: 'critical', testType: 'functional', storyRef: 'US-1.1' },
      { id: 'TC-1.2', name: 'Registration with missing fields', description: 'User is on sign-up form', testSteps: '1. Leave one or more fields empty\n2. Click "Sign Up"', expectedResult: 'Error message displayed, form not submitted', priority: 'high', testType: 'functional', storyRef: 'US-1.1' },
      { id: 'TC-1.3', name: 'Registration with duplicate email', description: 'User is on sign-up form', testSteps: '1. Enter an email that already exists\n2. Fill remaining fields\n3. Click "Sign Up"', expectedResult: 'Error message indicating email is already registered', priority: 'high', testType: 'functional', storyRef: 'US-1.1' },
      { id: 'TC-1.4', name: 'Successful login', description: 'Registered user on /login', testSteps: '1. Enter valid email and password\n2. Click "Login"', expectedResult: 'User is redirected to dashboard, JWT token stored in localStorage', priority: 'critical', testType: 'functional', storyRef: 'US-1.2' },
      { id: 'TC-1.5', name: 'Login with invalid credentials', description: 'User on /login', testSteps: '1. Enter incorrect email or password\n2. Click "Login"', expectedResult: 'Error message displayed, user remains on login page', priority: 'high', testType: 'functional', storyRef: 'US-1.2' },
      { id: 'TC-1.6', name: 'Login with empty fields', description: 'User on /login', testSteps: '1. Leave email or password empty\n2. Click "Login"', expectedResult: 'Error message displayed', priority: 'medium', testType: 'functional', storyRef: 'US-1.2' },
      { id: 'TC-1.7', name: 'Password visibility toggle', description: 'User on login form', testSteps: '1. Type password\n2. Click eye icon', expectedResult: 'Password text toggles between hidden and visible', priority: 'low', testType: 'ui', storyRef: 'US-1.5' },
      { id: 'TC-1.8', name: 'Session persistence', description: 'User is logged in', testSteps: '1. Refresh the browser page', expectedResult: 'User remains logged in, token validated via /auth/me', priority: 'high', testType: 'functional', storyRef: 'US-1.4' },
      { id: 'TC-1.9', name: 'Expired token handling', description: 'User has an expired JWT', testSteps: '1. Make any API call', expectedResult: 'Token cleared from localStorage, user redirected to /login', priority: 'high', testType: 'security', storyRef: 'US-1.4' },
      { id: 'TC-1.10', name: 'Logout', description: 'User is logged in', testSteps: '1. Click logout button in sidebar', expectedResult: 'Token cleared, user state reset, document store cleared, redirected to /login', priority: 'high', testType: 'functional', storyRef: 'US-1.3' },
      { id: 'TC-1.11', name: 'Access protected route while unauthenticated', description: 'User is not logged in', testSteps: '1. Navigate to / directly', expectedResult: 'Redirected to /login page', priority: 'critical', testType: 'security', storyRef: 'US-1.2' },
      { id: 'TC-1.12', name: 'Access login while authenticated', description: 'User is logged in', testSteps: '1. Navigate to /login directly', expectedResult: 'Redirected to / (dashboard)', priority: 'medium', testType: 'functional', storyRef: 'US-1.2' },
    ]
  },
  {
    name: '2. Dashboard Home',
    description: 'Main dashboard with stats, recent documents, calendar, announcements, and vacation list',
    userStories: [
      { id: 'US-2.1', title: 'Welcome & Quick Stats', userStory: 'As a user, I want to see a welcome message and quick stats on my dashboard so that I have an overview of activity.', priority: 'medium' },
      { id: 'US-2.2', title: 'Recent Documents', userStory: 'As a user, I want to see recent documents on the dashboard so that I can quickly access my latest work.', priority: 'medium' },
      { id: 'US-2.3', title: 'Calendar Widget', userStory: 'As a user, I want to see a calendar on the dashboard so that I can view upcoming dates at a glance.', priority: 'low' },
      { id: 'US-2.4', title: 'Announcements Feed', userStory: 'As a user, I want to see announcements on the dashboard so that I stay informed about company news.', priority: 'medium' },
      { id: 'US-2.5', title: 'Vacation List Widget', userStory: 'As a user, I want to see the vacation list on the dashboard so that I know who is away.', priority: 'low' },
    ],
    testCases: [
      { id: 'TC-2.1', name: 'Dashboard loads with quick stats', description: 'User is logged in', testSteps: '1. Navigate to /', expectedResult: 'Dashboard displays quick stats section', priority: 'medium', testType: 'functional', storyRef: 'US-2.1' },
      { id: 'TC-2.2', name: 'Recent documents displayed', description: 'User has created documents', testSteps: '1. Navigate to /', expectedResult: 'Recent documents section shows latest documents', priority: 'medium', testType: 'functional', storyRef: 'US-2.2' },
      { id: 'TC-2.3', name: 'Calendar renders', description: 'User is logged in', testSteps: '1. Navigate to /', expectedResult: 'Calendar widget is displayed and functional', priority: 'low', testType: 'ui', storyRef: 'US-2.3' },
      { id: 'TC-2.4', name: 'Announcements feed displayed', description: 'Announcements exist', testSteps: '1. Navigate to /', expectedResult: 'Announcements section shows current announcements', priority: 'medium', testType: 'functional', storyRef: 'US-2.4' },
      { id: 'TC-2.5', name: 'Vacation list displayed', description: 'Vacation requests exist', testSteps: '1. Navigate to /', expectedResult: 'Vacation list section shows upcoming/current vacations', priority: 'low', testType: 'functional', storyRef: 'US-2.5' },
      { id: 'TC-2.6', name: 'Dashboard with no data', description: 'New user, no data', testSteps: '1. Navigate to /', expectedResult: 'Dashboard renders gracefully with empty states', priority: 'medium', testType: 'ui', storyRef: 'US-2.1' },
    ]
  },
  {
    name: '3. User Management (Admin)',
    description: 'Admin functionality to view, add, edit, and delete employee users',
    userStories: [
      { id: 'US-3.1', title: 'View Employee List', userStory: 'As an admin, I want to view a list of all employees so that I can manage the team.', priority: 'high' },
      { id: 'US-3.2', title: 'Add New User', userStory: 'As an admin, I want to add a new user so that new employees can access the system.', priority: 'high' },
      { id: 'US-3.3', title: 'Edit User Details', userStory: 'As an admin, I want to edit a user\'s details so that I can keep employee records up to date.', priority: 'medium' },
      { id: 'US-3.4', title: 'Delete User', userStory: 'As an admin, I want to delete a user so that former employees no longer have access.', priority: 'high' },
      { id: 'US-3.5', title: 'Non-Admin Access Restriction', userStory: 'As a regular user, I should not be able to access the user management page so that sensitive employee data is protected.', priority: 'critical' },
    ],
    testCases: [
      { id: 'TC-3.1', name: 'Admin views user list', description: 'Logged in as admin', testSteps: '1. Navigate to /users', expectedResult: 'List of all users displayed with avatars, names, roles', priority: 'high', testType: 'functional', storyRef: 'US-3.1' },
      { id: 'TC-3.2', name: 'Admin adds a new user', description: 'Logged in as admin, on /users', testSteps: '1. Click "Add User"\n2. Fill in email, password, first name, last name, role, department, employee ID\n3. Submit', expectedResult: 'New user created and appears in the list', priority: 'high', testType: 'functional', storyRef: 'US-3.2' },
      { id: 'TC-3.3', name: 'Admin adds user with missing required fields', description: 'Logged in as admin', testSteps: '1. Click "Add User"\n2. Leave required fields empty\n3. Submit', expectedResult: 'Validation error, user not created', priority: 'medium', testType: 'functional', storyRef: 'US-3.2' },
      { id: 'TC-3.4', name: 'Admin edits a user', description: 'Logged in as admin, on /users', testSteps: '1. Click edit on a user\n2. Modify fields\n3. Save', expectedResult: 'User details updated successfully', priority: 'medium', testType: 'functional', storyRef: 'US-3.3' },
      { id: 'TC-3.5', name: 'Admin deletes a user', description: 'Logged in as admin', testSteps: '1. Click delete on a user\n2. Confirm deletion', expectedResult: 'User removed from the list', priority: 'high', testType: 'functional', storyRef: 'US-3.4' },
      { id: 'TC-3.6', name: 'Non-admin access denied', description: 'Logged in as regular user', testSteps: '1. Navigate to /users', expectedResult: 'Redirected to dashboard home', priority: 'critical', testType: 'security', storyRef: 'US-3.5' },
      { id: 'TC-3.7', name: 'User list shows avatars', description: 'Admin, users exist with profile pics', testSteps: '1. Navigate to /users', expectedResult: 'User avatars displayed correctly next to names', priority: 'low', testType: 'ui', storyRef: 'US-3.1' },
    ]
  },
  {
    name: '4. Profile Management',
    description: 'View and edit user profiles, upload profile pictures and signatures',
    userStories: [
      { id: 'US-4.1', title: 'View Profile', userStory: 'As a user, I want to view my profile so that I can see my current information.', priority: 'medium' },
      { id: 'US-4.2', title: 'Edit Profile Info', userStory: 'As a user, I want to edit my name, email, department, and employee ID so that my profile stays accurate.', priority: 'medium' },
      { id: 'US-4.3', title: 'Upload & Crop Profile Picture', userStory: 'As a user, I want to upload and crop a profile picture so that my account has a photo.', priority: 'low' },
      { id: 'US-4.4', title: 'Add Email Signature', userStory: 'As a user, I want to add an email signature (plain text or HTML) so that it can be used when composing emails.', priority: 'medium' },
      { id: 'US-4.5', title: 'Upload Signature Image', userStory: 'As a user, I want to upload a signature image so that I have a digital signature on file.', priority: 'low' },
      { id: 'US-4.6', title: 'Admin Edit Other Profile', userStory: 'As an admin, I want to edit another user\'s profile so that I can manage employee records.', priority: 'medium' },
    ],
    testCases: [
      { id: 'TC-4.1', name: 'View own profile', description: 'User is logged in', testSteps: '1. Click "My Profile" in sidebar', expectedResult: 'Profile page loads with current user data', priority: 'medium', testType: 'functional', storyRef: 'US-4.1' },
      { id: 'TC-4.2', name: 'Toggle edit mode', description: 'User on profile page', testSteps: '1. Click "Edit" button', expectedResult: 'Form fields become editable', priority: 'medium', testType: 'ui', storyRef: 'US-4.2' },
      { id: 'TC-4.3', name: 'Update basic info', description: 'User in edit mode', testSteps: '1. Modify name, department, employee ID\n2. Click "Save"', expectedResult: 'Profile updated, success feedback shown', priority: 'medium', testType: 'functional', storyRef: 'US-4.2' },
      { id: 'TC-4.4', name: 'Upload profile picture', description: 'User in edit mode', testSteps: '1. Click profile picture upload\n2. Select image\n3. Crop image\n4. Confirm', expectedResult: 'Profile picture updated and displayed', priority: 'medium', testType: 'functional', storyRef: 'US-4.3' },
      { id: 'TC-4.5', name: 'Profile picture crop tool', description: 'User uploading image', testSteps: '1. Upload an image', expectedResult: 'Crop tool appears allowing user to adjust crop area', priority: 'low', testType: 'ui', storyRef: 'US-4.3' },
      { id: 'TC-4.6', name: 'Add plain text signature', description: 'User in edit mode', testSteps: '1. Enter signature in text field\n2. Save', expectedResult: 'Signature saved to user profile', priority: 'medium', testType: 'functional', storyRef: 'US-4.4' },
      { id: 'TC-4.7', name: 'Add HTML signature', description: 'User in edit mode', testSteps: '1. Enter HTML structured signature\n2. Save', expectedResult: 'HTML signature saved and rendered correctly', priority: 'medium', testType: 'functional', storyRef: 'US-4.4' },
      { id: 'TC-4.8', name: 'Upload signature image', description: 'User in edit mode', testSteps: '1. Click signature image upload\n2. Select image', expectedResult: 'Signature image uploaded and stored', priority: 'low', testType: 'functional', storyRef: 'US-4.5' },
      { id: 'TC-4.9', name: 'Admin edits another user\'s profile', description: 'Admin logged in', testSteps: '1. Navigate to /profile/:otherUserId\n2. Edit fields\n3. Save', expectedResult: 'Other user\'s profile updated', priority: 'medium', testType: 'functional', storyRef: 'US-4.6' },
      { id: 'TC-4.10', name: 'Cancel edit without saving', description: 'User in edit mode', testSteps: '1. Modify fields\n2. Click "Cancel"', expectedResult: 'Changes discarded, original values restored', priority: 'medium', testType: 'functional', storyRef: 'US-4.2' },
    ]
  },
  {
    name: '5. Permissions (Admin)',
    description: 'Admin role management - view and change user roles',
    userStories: [
      { id: 'US-5.1', title: 'View Users & Roles', userStory: 'As an admin, I want to view all users and their roles so that I can manage access levels.', priority: 'high' },
      { id: 'US-5.2', title: 'Change User Role', userStory: 'As an admin, I want to change a user\'s role (Admin/User) so that I can grant or revoke admin access.', priority: 'critical' },
      { id: 'US-5.3', title: 'Non-Admin Access Restriction', userStory: 'As a regular user, I should not be able to access the permissions page so that role management is restricted.', priority: 'critical' },
    ],
    testCases: [
      { id: 'TC-5.1', name: 'View permissions table', description: 'Logged in as admin', testSteps: '1. Navigate to /permissions', expectedResult: 'Table of all users with current role displayed', priority: 'high', testType: 'functional', storyRef: 'US-5.1' },
      { id: 'TC-5.2', name: 'Change user role to Admin', description: 'Admin on /permissions', testSteps: '1. Select "Admin" from dropdown for a user\n2. Click "Save"', expectedResult: 'User role updated to Admin', priority: 'critical', testType: 'functional', storyRef: 'US-5.2' },
      { id: 'TC-5.3', name: 'Change user role to User', description: 'Admin on /permissions', testSteps: '1. Select "User" from dropdown for an admin\n2. Click "Save"', expectedResult: 'User role updated to User', priority: 'critical', testType: 'functional', storyRef: 'US-5.2' },
      { id: 'TC-5.4', name: 'Batch role updates', description: 'Admin on /permissions', testSteps: '1. Change multiple users\' roles\n2. Click "Save"', expectedResult: 'All role changes saved in batch', priority: 'medium', testType: 'functional', storyRef: 'US-5.2' },
      { id: 'TC-5.5', name: 'Non-admin access denied', description: 'Regular user logged in', testSteps: '1. Navigate to /permissions', expectedResult: 'Redirected to dashboard home', priority: 'critical', testType: 'security', storyRef: 'US-5.3' },
    ]
  },
  {
    name: '6. Templates',
    description: 'Document template creation, organization, sharing, and management',
    userStories: [
      { id: 'US-6.1', title: 'Create Document Template', userStory: 'As a user, I want to create document templates so that I can reuse document structures.', priority: 'high' },
      { id: 'US-6.2', title: 'Organize Templates in Folders', userStory: 'As a user, I want to organize templates into folders so that they are easy to find.', priority: 'medium' },
      { id: 'US-6.3', title: 'Define Custom Fields', userStory: 'As a user, I want to define custom fields on a template so that users fill in specific data when using it.', priority: 'medium' },
      { id: 'US-6.4', title: 'Share Template', userStory: 'As a user, I want to share a template with specific users so that they can use it too.', priority: 'medium' },
      { id: 'US-6.5', title: 'Mark Template as Public', userStory: 'As a user, I want to mark a template as public so that all users can access it.', priority: 'low' },
      { id: 'US-6.6', title: 'Edit Template', userStory: 'As a user, I want to edit an existing template so that I can refine it over time.', priority: 'medium' },
      { id: 'US-6.7', title: 'Delete Template', userStory: 'As a user, I want to delete a template I no longer need so that the list stays organized.', priority: 'low' },
    ],
    testCases: [
      { id: 'TC-6.1', name: 'Create a template', description: 'User logged in, on /templates', testSteps: '1. Click "Create Template"\n2. Enter name, description\n3. Select/create folder\n4. Add custom fields\n5. Save', expectedResult: 'Template created and appears in list', priority: 'high', testType: 'functional', storyRef: 'US-6.1' },
      { id: 'TC-6.2', name: 'Create template with custom fields', description: 'User on template dialog', testSteps: '1. Click "Add Field"\n2. Define field name and type\n3. Add multiple fields\n4. Save', expectedResult: 'Template saved with all custom fields', priority: 'medium', testType: 'functional', storyRef: 'US-6.3' },
      { id: 'TC-6.3', name: 'Organize template in folder', description: 'User on template dialog', testSteps: '1. Select existing folder or type new folder name\n2. Save', expectedResult: 'Template organized under the specified folder', priority: 'medium', testType: 'functional', storyRef: 'US-6.2' },
      { id: 'TC-6.4', name: 'Edit a template', description: 'Template exists', testSteps: '1. Click edit on template\n2. Modify fields\n3. Save', expectedResult: 'Template updated with new values', priority: 'medium', testType: 'functional', storyRef: 'US-6.6' },
      { id: 'TC-6.5', name: 'Delete a template', description: 'Template exists', testSteps: '1. Click delete on template\n2. Confirm', expectedResult: 'Template removed from list', priority: 'medium', testType: 'functional', storyRef: 'US-6.7' },
      { id: 'TC-6.6', name: 'Share template with users', description: 'Template exists', testSteps: '1. Click share on template\n2. Select users\n3. Confirm', expectedResult: 'Template visible to selected users', priority: 'medium', testType: 'functional', storyRef: 'US-6.4' },
      { id: 'TC-6.7', name: 'Mark template as public', description: 'User on template dialog', testSteps: '1. Check "Public" checkbox\n2. Save', expectedResult: 'Template accessible by all users', priority: 'low', testType: 'functional', storyRef: 'US-6.5' },
      { id: 'TC-6.8', name: 'View templates by folder', description: 'Templates in multiple folders', testSteps: '1. Navigate to /templates', expectedResult: 'Templates grouped by folder', priority: 'medium', testType: 'ui', storyRef: 'US-6.2' },
      { id: 'TC-6.9', name: 'Create template with missing name', description: 'User on template dialog', testSteps: '1. Leave name empty\n2. Try to save', expectedResult: 'Validation error, template not created', priority: 'medium', testType: 'functional', storyRef: 'US-6.1' },
    ]
  },
  {
    name: '7. Documents',
    description: 'Document browsing, folder organization, multi-editor support, and file upload',
    userStories: [
      { id: 'US-7.1', title: 'File System View', userStory: 'As a user, I want to browse my documents in a file system-like view so that I can navigate my files.', priority: 'high' },
      { id: 'US-7.2', title: 'Create Folders', userStory: 'As a user, I want to create folders so that I can organize my documents.', priority: 'high' },
      { id: 'US-7.3', title: 'Multi-Editor Document Creation', userStory: 'As a user, I want to create documents using different editors (text, markdown, spreadsheet) so that I can work in my preferred format.', priority: 'high' },
      { id: 'US-7.4', title: 'File Upload', userStory: 'As a user, I want to upload files so that I can store external documents.', priority: 'medium' },
      { id: 'US-7.5', title: 'Breadcrumb Navigation', userStory: 'As a user, I want breadcrumb navigation so that I can track my location in the folder hierarchy.', priority: 'medium' },
      { id: 'US-7.6', title: 'Local Persistence', userStory: 'As a user, I want my documents to persist locally so that I can access them offline.', priority: 'medium' },
    ],
    testCases: [
      { id: 'TC-7.1', name: 'View document list', description: 'User logged in', testSteps: '1. Navigate to /documents', expectedResult: 'Document/folder list displayed', priority: 'high', testType: 'functional', storyRef: 'US-7.1' },
      { id: 'TC-7.2', name: 'Create a folder', description: 'User on /documents', testSteps: '1. Click "New Folder"\n2. Enter folder name\n3. Confirm', expectedResult: 'Folder created and visible in list', priority: 'high', testType: 'functional', storyRef: 'US-7.2' },
      { id: 'TC-7.3', name: 'Navigate into folder', description: 'Folder exists', testSteps: '1. Click on folder', expectedResult: 'Folder contents displayed, breadcrumb updated', priority: 'medium', testType: 'functional', storyRef: 'US-7.5' },
      { id: 'TC-7.4', name: 'Breadcrumb navigation', description: 'User is in nested folder', testSteps: '1. Click on parent folder in breadcrumb', expectedResult: 'Navigates back to parent folder', priority: 'medium', testType: 'ui', storyRef: 'US-7.5' },
      { id: 'TC-7.5', name: 'Open text editor', description: 'User on /documents', testSteps: '1. Create/open a text document', expectedResult: 'Text editor page loads at /text-editor', priority: 'high', testType: 'functional', storyRef: 'US-7.3' },
      { id: 'TC-7.6', name: 'Open markdown editor', description: 'User on /documents', testSteps: '1. Create/open a markdown document', expectedResult: 'Markdown editor loads at /markdown-editor', priority: 'high', testType: 'functional', storyRef: 'US-7.3' },
      { id: 'TC-7.7', name: 'Open spreadsheet editor', description: 'User on /documents', testSteps: '1. Create/open a spreadsheet', expectedResult: 'Spreadsheet editor loads at /spreadsheet-editor', priority: 'high', testType: 'functional', storyRef: 'US-7.3' },
      { id: 'TC-7.8', name: 'Upload a file', description: 'User on /documents', testSteps: '1. Click upload\n2. Select file', expectedResult: 'File uploaded and appears in document list', priority: 'medium', testType: 'functional', storyRef: 'US-7.4' },
      { id: 'TC-7.9', name: 'Documents persist in localStorage', description: 'User has documents', testSteps: '1. Create document\n2. Refresh page', expectedResult: 'Documents still present after refresh', priority: 'medium', testType: 'functional', storyRef: 'US-7.6' },
      { id: 'TC-7.10', name: 'Export document to PDF', description: 'User has open document', testSteps: '1. Click export/PDF option', expectedResult: 'PDF generated and downloaded', priority: 'medium', testType: 'functional', storyRef: 'US-7.3' },
    ]
  },
  {
    name: '8. Email Signature Builder',
    description: 'Professional email signature creation with templates, customization, and clipboard/profile saving',
    userStories: [
      { id: 'US-8.1', title: 'Build Email Signature', userStory: 'As a user, I want to build a professional email signature so that I can use it in my emails.', priority: 'medium' },
      { id: 'US-8.2', title: 'Choose Signature Templates', userStory: 'As a user, I want to choose from signature templates so that I can pick a design I like.', priority: 'medium' },
      { id: 'US-8.3', title: 'Personalize Signature Fields', userStory: 'As a user, I want to fill in my name, title, department, phone, email, and website so that my signature is personalized.', priority: 'medium' },
      { id: 'US-8.4', title: 'Cursive Name Option', userStory: 'As a user, I want to optionally display my name in cursive so that I can add a personal touch.', priority: 'low' },
      { id: 'US-8.5', title: 'Copy to Clipboard', userStory: 'As a user, I want to copy my signature to the clipboard so that I can paste it into email clients.', priority: 'high' },
      { id: 'US-8.6', title: 'Save to Profile', userStory: 'As a user, I want to save my signature to my profile so that it is used automatically when composing emails.', priority: 'medium' },
    ],
    testCases: [
      { id: 'TC-8.1', name: 'Select Professional template', description: 'User on /signature-builder', testSteps: '1. Select "Professional" template', expectedResult: 'Professional template preview displayed', priority: 'medium', testType: 'functional', storyRef: 'US-8.2' },
      { id: 'TC-8.2', name: 'Select Modern template', description: 'User on /signature-builder', testSteps: '1. Select "Modern" template', expectedResult: 'Modern template preview displayed', priority: 'medium', testType: 'functional', storyRef: 'US-8.2' },
      { id: 'TC-8.3', name: 'Fill in all signature fields', description: 'User on /signature-builder', testSteps: '1. Enter full name, job title, department, phone, email, website', expectedResult: 'Signature preview updates in real-time', priority: 'medium', testType: 'functional', storyRef: 'US-8.3' },
      { id: 'TC-8.4', name: 'Enable cursive name', description: 'User on /signature-builder', testSteps: '1. Check "Cursive Name" checkbox', expectedResult: 'Name displayed in cursive font in preview', priority: 'low', testType: 'ui', storyRef: 'US-8.4' },
      { id: 'TC-8.5', name: 'Copy signature to clipboard', description: 'User has built signature', testSteps: '1. Click "Copy to Clipboard"', expectedResult: 'Signature HTML copied, success message shown', priority: 'high', testType: 'functional', storyRef: 'US-8.5' },
      { id: 'TC-8.6', name: 'Save signature to profile', description: 'User has built signature', testSteps: '1. Click "Save to Profile"', expectedResult: 'Signature saved to user profile', priority: 'medium', testType: 'functional', storyRef: 'US-8.6' },
      { id: 'TC-8.7', name: 'Preview with partial fields', description: 'User fills only some fields', testSteps: '1. Enter only name and email', expectedResult: 'Preview renders with only filled fields, no broken layout', priority: 'medium', testType: 'ui', storyRef: 'US-8.3' },
    ]
  },
  {
    name: '9. Vacations',
    description: 'Vacation request submission, calendar view, and admin approval/rejection/rescheduling',
    userStories: [
      { id: 'US-9.1', title: 'Submit Vacation Request', userStory: 'As a user, I want to submit a vacation request with start date, end date, and reason so that I can request time off.', priority: 'high' },
      { id: 'US-9.2', title: 'View Request Status', userStory: 'As a user, I want to view my vacation requests and their status so that I know if they are approved or pending.', priority: 'high' },
      { id: 'US-9.3', title: 'Calendar View', userStory: 'As a user, I want to see vacations on a calendar view so that I can visualize time-off schedules.', priority: 'medium' },
      { id: 'US-9.4', title: 'Delete Vacation Request', userStory: 'As a user, I want to delete a vacation request so that I can cancel time off I no longer need.', priority: 'medium' },
      { id: 'US-9.5', title: 'Admin View Pending Requests', userStory: 'As an admin, I want to view all pending vacation requests so that I can manage approvals.', priority: 'high' },
      { id: 'US-9.6', title: 'Admin Approve Request', userStory: 'As an admin, I want to approve a vacation request so that the employee\'s time off is confirmed.', priority: 'high' },
      { id: 'US-9.7', title: 'Admin Reject Request', userStory: 'As an admin, I want to reject a vacation request with a reason so that the employee understands why it was denied.', priority: 'high' },
      { id: 'US-9.8', title: 'Admin Reschedule Request', userStory: 'As an admin, I want to reschedule a vacation request with new dates and a reason so that I can suggest alternative dates.', priority: 'medium' },
    ],
    testCases: [
      { id: 'TC-9.1', name: 'Create vacation request', description: 'User logged in, on /vacations', testSteps: '1. Click "New Request"\n2. Select start date, end date\n3. Enter reason\n4. Submit', expectedResult: 'Vacation request created with "pending" status', priority: 'high', testType: 'functional', storyRef: 'US-9.1' },
      { id: 'TC-9.2', name: 'Create request with end date before start date', description: 'User on vacation form', testSteps: '1. Set end date before start date\n2. Submit', expectedResult: 'Validation error displayed', priority: 'medium', testType: 'functional', storyRef: 'US-9.1' },
      { id: 'TC-9.3', name: 'View own vacation requests', description: 'User has submitted requests', testSteps: '1. Navigate to /vacations', expectedResult: 'List of user\'s requests with status shown', priority: 'high', testType: 'functional', storyRef: 'US-9.2' },
      { id: 'TC-9.4', name: 'Calendar view of vacations', description: 'Vacations exist', testSteps: '1. Switch to calendar view', expectedResult: 'Vacations displayed on calendar (react-big-calendar)', priority: 'medium', testType: 'ui', storyRef: 'US-9.3' },
      { id: 'TC-9.5', name: 'Delete a vacation request', description: 'User has a pending request', testSteps: '1. Click delete on a request\n2. Confirm', expectedResult: 'Request removed', priority: 'medium', testType: 'functional', storyRef: 'US-9.4' },
      { id: 'TC-9.6', name: 'Admin views pending requests', description: 'Admin logged in', testSteps: '1. Navigate to /vacations', expectedResult: 'Pending requests section visible', priority: 'high', testType: 'functional', storyRef: 'US-9.5' },
      { id: 'TC-9.7', name: 'Admin approves request', description: 'Admin, pending request exists', testSteps: '1. Click "Approve" on a pending request', expectedResult: 'Status changes to "approved"', priority: 'high', testType: 'functional', storyRef: 'US-9.6' },
      { id: 'TC-9.8', name: 'Admin rejects request with reason', description: 'Admin, pending request exists', testSteps: '1. Click "Reject"\n2. Enter rejection reason\n3. Confirm', expectedResult: 'Status changes to "rejected", reason saved', priority: 'high', testType: 'functional', storyRef: 'US-9.7' },
      { id: 'TC-9.9', name: 'Admin rejects without reason', description: 'Admin, pending request exists', testSteps: '1. Click "Reject"\n2. Leave reason empty\n3. Try to confirm', expectedResult: 'Validation error, reason required', priority: 'medium', testType: 'functional', storyRef: 'US-9.7' },
      { id: 'TC-9.10', name: 'Admin reschedules request', description: 'Admin, pending request exists', testSteps: '1. Click "Reschedule"\n2. Enter new start/end dates and reason\n3. Submit', expectedResult: 'Request updated with new dates, reason saved', priority: 'medium', testType: 'functional', storyRef: 'US-9.8' },
      { id: 'TC-9.11', name: 'Non-admin cannot see approval controls', description: 'Regular user logged in', testSteps: '1. Navigate to /vacations', expectedResult: 'No approve/reject/reschedule buttons visible', priority: 'high', testType: 'security', storyRef: 'US-9.5' },
    ]
  },
  {
    name: '10. Bulletin / News',
    description: 'Company bulletin board with posts, categories, comments, and reactions',
    userStories: [
      { id: 'US-10.1', title: 'View Bulletin Posts', userStory: 'As a user, I want to view bulletin posts so that I stay informed about company news.', priority: 'medium' },
      { id: 'US-10.2', title: 'Create Bulletin Post', userStory: 'As a user, I want to create a bulletin post with a title, message, and category so that I can share news.', priority: 'high' },
      { id: 'US-10.3', title: 'Filter by Category', userStory: 'As a user, I want to filter bulletin posts by category so that I can find relevant posts.', priority: 'medium' },
      { id: 'US-10.4', title: 'Comment on Posts', userStory: 'As a user, I want to comment on bulletin posts so that I can participate in discussions.', priority: 'medium' },
      { id: 'US-10.5', title: 'React to Posts', userStory: 'As a user, I want to react to bulletin posts (like, celebrate, support, insightful) so that I can express my response.', priority: 'low' },
      { id: 'US-10.6', title: 'Edit Own Post', userStory: 'As a user, I want to edit my own bulletin post so that I can correct or update it.', priority: 'medium' },
      { id: 'US-10.7', title: 'Delete Own Post', userStory: 'As a user, I want to delete my own bulletin post so that I can remove outdated content.', priority: 'medium' },
      { id: 'US-10.8', title: 'Delete Own Comment', userStory: 'As a user, I want to delete my own comment so that I can remove something I posted.', priority: 'low' },
    ],
    testCases: [
      { id: 'TC-10.1', name: 'View bulletin posts', description: 'Posts exist', testSteps: '1. Navigate to /bulletin', expectedResult: 'List of bulletin posts displayed', priority: 'medium', testType: 'functional', storyRef: 'US-10.1' },
      { id: 'TC-10.2', name: 'Create a bulletin post', description: 'User logged in', testSteps: '1. Click "Create Post"\n2. Enter title, message\n3. Select category (Notice/Event/Form/Update/General)\n4. Submit', expectedResult: 'Post created and appears in feed', priority: 'high', testType: 'functional', storyRef: 'US-10.2' },
      { id: 'TC-10.3', name: 'Create post with attachment', description: 'User on create post form', testSteps: '1. Enter title, message\n2. Attach file\n3. Submit', expectedResult: 'Post created with attachment', priority: 'medium', testType: 'functional', storyRef: 'US-10.2' },
      { id: 'TC-10.4', name: 'Filter posts by category', description: 'Multiple posts with categories', testSteps: '1. Select a category filter', expectedResult: 'Only posts matching category shown', priority: 'medium', testType: 'functional', storyRef: 'US-10.3' },
      { id: 'TC-10.5', name: 'Add a comment', description: 'Post exists', testSteps: '1. Open a post\n2. Type comment\n3. Submit', expectedResult: 'Comment appears under the post', priority: 'medium', testType: 'functional', storyRef: 'US-10.4' },
      { id: 'TC-10.6', name: 'Delete own comment', description: 'User has posted a comment', testSteps: '1. Click delete on own comment\n2. Confirm', expectedResult: 'Comment removed', priority: 'medium', testType: 'functional', storyRef: 'US-10.8' },
      { id: 'TC-10.7', name: 'React to a post - Like', description: 'Post exists', testSteps: '1. Click "Like" reaction', expectedResult: 'Like count incremented, reaction toggled', priority: 'low', testType: 'functional', storyRef: 'US-10.5' },
      { id: 'TC-10.8', name: 'React to a post - Celebrate', description: 'Post exists', testSteps: '1. Click "Celebrate" reaction', expectedResult: 'Celebrate count incremented', priority: 'low', testType: 'functional', storyRef: 'US-10.5' },
      { id: 'TC-10.9', name: 'Toggle reaction off', description: 'User has reacted to post', testSteps: '1. Click same reaction again', expectedResult: 'Reaction removed, count decremented', priority: 'low', testType: 'functional', storyRef: 'US-10.5' },
      { id: 'TC-10.10', name: 'Edit own post', description: 'User has created a post', testSteps: '1. Click edit on own post\n2. Modify title/message\n3. Save', expectedResult: 'Post updated with new content', priority: 'medium', testType: 'functional', storyRef: 'US-10.6' },
      { id: 'TC-10.11', name: 'Delete own post', description: 'User has created a post', testSteps: '1. Click delete on post\n2. Confirm', expectedResult: 'Post removed from feed', priority: 'medium', testType: 'functional', storyRef: 'US-10.7' },
      { id: 'TC-10.12', name: 'Create post with empty title', description: 'User on create form', testSteps: '1. Leave title empty\n2. Submit', expectedResult: 'Validation error, post not created', priority: 'medium', testType: 'functional', storyRef: 'US-10.2' },
    ]
  },
  {
    name: '11. Emails',
    description: 'Email composition, inbox, sent items, rich text editor, and signature integration',
    userStories: [
      { id: 'US-11.1', title: 'Compose & Send Email', userStory: 'As a user, I want to compose and send an email so that I can communicate with others.', priority: 'high' },
      { id: 'US-11.2', title: 'View Inbox', userStory: 'As a user, I want to view my inbox so that I can read received emails.', priority: 'high' },
      { id: 'US-11.3', title: 'View Sent Emails', userStory: 'As a user, I want to view my sent emails so that I can review messages I have sent.', priority: 'medium' },
      { id: 'US-11.4', title: 'Auto-Include Signature', userStory: 'As a user, I want my email signature automatically included when composing so that every email has my professional signature.', priority: 'medium' },
      { id: 'US-11.5', title: 'Rich Text Editor', userStory: 'As a user, I want to use a rich text editor in email compose so that I can format my messages.', priority: 'medium' },
    ],
    testCases: [
      { id: 'TC-11.1', name: 'Compose and send email', description: 'User logged in', testSteps: '1. Navigate to /emails\n2. Click "Compose" tab\n3. Enter recipient, subject, body\n4. Click "Send"', expectedResult: 'Email sent successfully', priority: 'high', testType: 'functional', storyRef: 'US-11.1' },
      { id: 'TC-11.2', name: 'Compose with missing recipient', description: 'User on compose tab', testSteps: '1. Leave "To" field empty\n2. Enter subject and body\n3. Click "Send"', expectedResult: 'Validation error displayed', priority: 'medium', testType: 'functional', storyRef: 'US-11.1' },
      { id: 'TC-11.3', name: 'Signature auto-populated', description: 'User has saved signature', testSteps: '1. Open compose tab', expectedResult: 'Signature automatically included in email body', priority: 'medium', testType: 'functional', storyRef: 'US-11.4' },
      { id: 'TC-11.4', name: 'View inbox', description: 'User has received emails', testSteps: '1. Click "Inbox" tab', expectedResult: 'List of received emails displayed', priority: 'high', testType: 'functional', storyRef: 'US-11.2' },
      { id: 'TC-11.5', name: 'View sent emails', description: 'User has sent emails', testSteps: '1. Click "Sent" tab', expectedResult: 'List of sent emails displayed', priority: 'medium', testType: 'functional', storyRef: 'US-11.3' },
      { id: 'TC-11.6', name: 'Rich text formatting', description: 'User on compose', testSteps: '1. Type text\n2. Apply bold, italic, etc.', expectedResult: 'Text formatted correctly in editor', priority: 'medium', testType: 'ui', storyRef: 'US-11.5' },
      { id: 'TC-11.7', name: 'Empty inbox state', description: 'User has no emails', testSteps: '1. Click "Inbox" tab', expectedResult: 'Empty state message displayed', priority: 'low', testType: 'ui', storyRef: 'US-11.2' },
    ]
  },
  {
    name: '12. Support Tickets',
    description: 'Support ticket creation, priority levels, and status tracking',
    userStories: [
      { id: 'US-12.1', title: 'Create Support Ticket', userStory: 'As a user, I want to create a support ticket so that I can report issues or request help.', priority: 'high' },
      { id: 'US-12.2', title: 'Set Priority Level', userStory: 'As a user, I want to set a priority level (Low/Medium/High) on my ticket so that urgency is communicated.', priority: 'medium' },
      { id: 'US-12.3', title: 'View Submitted Tickets', userStory: 'As a user, I want to view my submitted tickets so that I can track their status.', priority: 'high' },
      { id: 'US-12.4', title: 'Ticket Status Tracking', userStory: 'As a user, I want to see the status of my ticket so that I know if it is being addressed.', priority: 'medium' },
    ],
    testCases: [
      { id: 'TC-12.1', name: 'Create a support ticket', description: 'User logged in, on /support', testSteps: '1. Click "New Ticket"\n2. Enter title, description\n3. Select priority (Low/Medium/High)\n4. Submit', expectedResult: 'Ticket created and appears in table', priority: 'high', testType: 'functional', storyRef: 'US-12.1' },
      { id: 'TC-12.2', name: 'Create ticket with missing fields', description: 'User on ticket form', testSteps: '1. Leave title or description empty\n2. Submit', expectedResult: 'Validation error, ticket not created', priority: 'medium', testType: 'functional', storyRef: 'US-12.1' },
      { id: 'TC-12.3', name: 'View tickets table', description: 'Tickets exist', testSteps: '1. Navigate to /support', expectedResult: 'Table of tickets displayed with title, priority, status', priority: 'high', testType: 'functional', storyRef: 'US-12.3' },
      { id: 'TC-12.4', name: 'Ticket status tracking', description: 'Ticket exists', testSteps: '1. View ticket in table', expectedResult: 'Status column shows current status', priority: 'medium', testType: 'functional', storyRef: 'US-12.4' },
      { id: 'TC-12.5', name: 'Create ticket with each priority', description: 'User on ticket form', testSteps: '1. Create ticket with "Low"\n2. Create with "Medium"\n3. Create with "High"', expectedResult: 'Each ticket created with correct priority label', priority: 'medium', testType: 'functional', storyRef: 'US-12.2' },
    ]
  },
  {
    name: '13. Analytics',
    description: 'Analytics dashboard with user engagement, document trends, and template popularity charts',
    userStories: [
      { id: 'US-13.1', title: 'User Engagement Chart', userStory: 'As a user, I want to see a user engagement bar chart so that I can understand platform usage.', priority: 'medium' },
      { id: 'US-13.2', title: 'Document Creation Trends', userStory: 'As a user, I want to see document creation trends over time so that I can track productivity.', priority: 'medium' },
      { id: 'US-13.3', title: 'Popular Templates Chart', userStory: 'As a user, I want to see a popular templates chart so that I know which templates are most used.', priority: 'low' },
    ],
    testCases: [
      { id: 'TC-13.1', name: 'Analytics page loads', description: 'User logged in', testSteps: '1. Navigate to /analytics', expectedResult: 'Analytics page renders with charts', priority: 'medium', testType: 'functional', storyRef: 'US-13.1' },
      { id: 'TC-13.2', name: 'User engagement chart', description: 'Data exists', testSteps: '1. View analytics page', expectedResult: 'Bar chart displays user engagement data', priority: 'medium', testType: 'ui', storyRef: 'US-13.1' },
      { id: 'TC-13.3', name: 'Document trends chart', description: 'Documents created over time', testSteps: '1. View analytics page', expectedResult: 'Line chart displays document creation trends', priority: 'medium', testType: 'ui', storyRef: 'US-13.2' },
      { id: 'TC-13.4', name: 'Popular templates chart', description: 'Templates have usage data', testSteps: '1. View analytics page', expectedResult: 'Pie chart displays template popularity', priority: 'low', testType: 'ui', storyRef: 'US-13.3' },
      { id: 'TC-13.5', name: 'Analytics with no data', description: 'No activity data', testSteps: '1. Navigate to /analytics', expectedResult: 'Charts render gracefully with empty/zero state', priority: 'medium', testType: 'ui', storyRef: 'US-13.1' },
    ]
  },
  {
    name: '14. Settings',
    description: 'Application settings including dark mode toggle and theme persistence',
    userStories: [
      { id: 'US-14.1', title: 'Toggle Dark Mode', userStory: 'As a user, I want to toggle dark mode so that I can use the app in my preferred visual style.', priority: 'low' },
    ],
    testCases: [
      { id: 'TC-14.1', name: 'Enable dark mode', description: 'User on /settings, light mode active', testSteps: '1. Toggle dark mode switch on', expectedResult: 'App switches to dark theme', priority: 'low', testType: 'ui', storyRef: 'US-14.1' },
      { id: 'TC-14.2', name: 'Disable dark mode', description: 'User on /settings, dark mode active', testSteps: '1. Toggle dark mode switch off', expectedResult: 'App switches to light theme', priority: 'low', testType: 'ui', storyRef: 'US-14.1' },
      { id: 'TC-14.3', name: 'Theme persists across pages', description: 'Dark mode enabled', testSteps: '1. Navigate to different pages', expectedResult: 'Dark theme remains active on all pages', priority: 'low', testType: 'functional', storyRef: 'US-14.1' },
    ]
  },
  {
    name: '15. Navigation & Layout',
    description: 'Sidebar navigation, admin-only menu items, theme toggle, and active state highlighting',
    userStories: [
      { id: 'US-15.1', title: 'Sidebar Navigation', userStory: 'As a user, I want a sidebar navigation so that I can quickly access all sections of the app.', priority: 'high' },
      { id: 'US-15.2', title: 'Admin-Only Menu Items', userStory: 'As a user, I want admin-only menu items hidden when I am not an admin so that the interface is not cluttered with inaccessible features.', priority: 'high' },
      { id: 'US-15.3', title: 'Dashboard Theme Toggle', userStory: 'As a user, I want a theme toggle accessible from the dashboard so that I can switch themes easily.', priority: 'low' },
    ],
    testCases: [
      { id: 'TC-15.1', name: 'Sidebar displays all menu items', description: 'Admin logged in', testSteps: '1. View sidebar', expectedResult: 'All 13 menu items visible including Users, Permissions', priority: 'high', testType: 'functional', storyRef: 'US-15.1' },
      { id: 'TC-15.2', name: 'Sidebar hides admin items for regular user', description: 'Regular user logged in', testSteps: '1. View sidebar', expectedResult: 'Users and Permissions menu items not visible', priority: 'high', testType: 'security', storyRef: 'US-15.2' },
      { id: 'TC-15.3', name: 'Navigate via sidebar', description: 'User logged in', testSteps: '1. Click each menu item', expectedResult: 'Correct page loads for each item', priority: 'high', testType: 'functional', storyRef: 'US-15.1' },
      { id: 'TC-15.4', name: 'Active menu item highlighted', description: 'User on a specific page', testSteps: '1. View sidebar', expectedResult: 'Current page\'s menu item is visually highlighted', priority: 'medium', testType: 'ui', storyRef: 'US-15.1' },
      { id: 'TC-15.5', name: 'Theme toggle in dashboard', description: 'User logged in', testSteps: '1. Click theme toggle in header', expectedResult: 'Theme switches between light and dark', priority: 'low', testType: 'ui', storyRef: 'US-15.3' },
      { id: 'TC-15.6', name: 'Menu items have correct icons and colors', description: 'User logged in', testSteps: '1. View sidebar', expectedResult: 'Each menu item has its assigned icon and color', priority: 'low', testType: 'ui', storyRef: 'US-15.1' },
    ]
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a parent folder for the ElsiAdmin project
    const parentFolder = new Folder({
      name: 'ElsiAdmin',
      description: 'ElsiAdmin - User Stories & Test Cases (75 stories, 115 test cases)',
      parentId: null,
      order: 0
    });
    await parentFolder.save();
    console.log(`Created parent folder: ElsiAdmin (${parentFolder._id})`);

    let totalStories = 0;
    let totalCases = 0;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      // Create section folder as child of ElsiAdmin
      const folder = new Folder({
        name: section.name,
        description: section.description,
        parentId: parentFolder._id.toString(),
        order: i
      });
      await folder.save();
      console.log(`  Created folder: ${section.name}`);

      // Create user stories (TestStory) and build a map of story IDs
      const storyMap = {};
      for (let j = 0; j < section.userStories.length; j++) {
        const us = section.userStories[j];
        const testStory = new TestStory({
          folderId: folder._id,
          title: `[${us.id}] ${us.title}`,
          description: us.title,
          userStory: us.userStory,
          priority: us.priority,
          status: 'ready',
          tags: ['ElsiAdmin', us.id],
          order: j
        });
        await testStory.save();
        storyMap[us.id] = testStory._id;
        totalStories++;
      }
      console.log(`    Added ${section.userStories.length} user stories`);

      // Create test cases linked to their stories
      for (let k = 0; k < section.testCases.length; k++) {
        const tc = section.testCases[k];
        const testStoryId = storyMap[tc.storyRef];

        const testCase = new TestCase({
          testStoryId: testStoryId,
          folderId: folder._id,
          name: `[${tc.id}] ${tc.name}`,
          description: tc.description,
          testSteps: tc.testSteps,
          expectedResult: tc.expectedResult,
          priority: tc.priority,
          testType: tc.testType,
          acceptanceCriteria: [
            { description: tc.expectedResult, completed: false }
          ],
          order: k
        });
        await testCase.save();
        totalCases++;
      }
      console.log(`    Added ${section.testCases.length} test cases`);
    }

    console.log(`\nSeed complete!`);
    console.log(`  Folders: ${sections.length + 1} (1 parent + ${sections.length} sections)`);
    console.log(`  User Stories: ${totalStories}`);
    console.log(`  Test Cases: ${totalCases}`);

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seed();
