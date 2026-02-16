# Nested Folder Organization Guide 📁

## ✅ New Feature: Organize Folders by Project!

You can now create nested folders to organize your test cases by project, feature, or any hierarchy you want!

## 🌳 Example Structure

```
📁 TGC-App Project
  ├── 📁 Authentication Tests
  │   ├── ✓ Login with Valid Credentials
  │   ├── ✓ Signup Form Validation
  │   └── ✓ Password Reset Flow
  ├── 📁 Forms Tests
  │   ├── ✓ Contact Form Submission
  │   └── ✓ Data Validation
  └── 📁 Navigation Tests
      ├── ✓ Header Links Work
      └── ✓ Footer Links Work

📁 SpeedTesters XP Project
  ├── 📁 UI Tests
  │   ├── ✓ Dashboard Loads
  │   └── ✓ Execute Tests Page
  └── 📁 API Tests
      ├── ✓ Create Folder API
      └── ✓ Run Test API

📁 Integration Tests
  └── ✓ End-to-End User Flow
```

## 📝 How to Create Nested Folders

### Option 1: Create Root-Level Folder First

1. Click **"New Folder"** button
2. Enter name: "TGC-App Project"
3. Description: "All tests for the TGC application"
4. **Parent Folder:** Leave as "Root Level (No Parent)"
5. Click **"Create"**

### Option 2: Create Child Folder

1. Click **"New Folder"** button
2. Enter name: "Authentication Tests"
3. Description: "Login, signup, and auth flows"
4. **Parent Folder:** Select "TGC-App Project"
5. Click **"Create"**

The new folder will now appear nested under TGC-App Project!

## 🎨 Visual Features

### Indentation
- Root folders: No indentation, white background
- Child folders: Indented 24px, light gray background with blue left border
- Nested children: Further indented by 24px each level

### Icons
- **📁** = Has subfolders inside
- **└─** = Child folder indicator
- **📂** = Root level folder

### Expand/Collapse
- Click the **▼** or **▶** arrow to show/hide folder contents
- Child folders are revealed when parent is expanded
- Tests are shown when their folder is expanded

## ⚙️ Managing Nested Folders

### Move a Folder
1. Click **Edit** (pencil icon) on any folder
2. Change the **"Parent Folder"** dropdown
3. Click **"Update"**

The folder and all its contents move to the new parent!

### Convert to Root Level
1. Click **Edit** on a child folder
2. Set **"Parent Folder"** to "Root Level (No Parent)"
3. Click **"Update"**

### Delete Parent Folder
When you delete a parent folder:
- ⚠️ All child folders are deleted
- ⚠️ All test cases in all folders are deleted
- You'll see a confirmation warning

## 🎯 Best Practices

### By Project
```
📁 Project A
  ├── 📁 Feature Tests
  └── 📁 Regression Tests
📁 Project B
  ├── 📁 Smoke Tests
  └── 📁 E2E Tests
```

### By Test Type
```
📁 Unit Tests
📁 Integration Tests
  ├── 📁 API Integration
  └── 📁 Database Integration
📁 E2E Tests
  ├── 📁 Critical Paths
  └── 📁 Edge Cases
```

### By Feature
```
📁 User Management
  ├── 📁 Registration
  ├── 📁 Login/Logout
  └── 📁 Profile Management
📁 Content Management
  ├── 📁 Create Content
  └── 📁 Edit Content
```

## 🚀 Tips

1. **Start with Projects**: Create top-level folders for each project/app
2. **Group by Feature**: Use child folders to group related tests
3. **Keep it Flat**: Don't nest more than 2-3 levels deep
4. **Clear Names**: Use descriptive names like "TGC-App - Auth Tests"
5. **Add Descriptions**: Help team members understand each folder's purpose

## 📊 Execute Tests with Nested Folders

On the **Execute Tests** page:
- The folder dropdown shows ALL folders (flat list)
- Tests from child folders are included when you select them
- Folder hierarchy is preserved in the dropdown (indented)

## 🔄 Migrating Existing Folders

Your existing folders are automatically **root-level folders** (no parent). To organize them:

1. Decide on your structure
2. Create new parent folders (e.g., "TGC-App Project")
3. Edit existing folders and set their parent
4. Done! Instant organization

## ✨ Benefits

- **Better Organization**: Keep related tests together
- **Easy Navigation**: Expand only what you need
- **Project Separation**: Clear boundaries between projects
- **Scalability**: Add new projects without cluttering root level
- **Team Clarity**: Everyone knows where to find tests

---

**Your folders are now ready for project-based organization!** 🎉

Refresh your browser and try creating a nested folder structure!
