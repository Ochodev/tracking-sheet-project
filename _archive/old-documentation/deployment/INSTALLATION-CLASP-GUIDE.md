# ⚡ CLASP INSTALLATION GUIDE
## Install V2.2 in 5 Minutes Using Google's CLI

**What is clasp?** Google's official command-line tool for Apps Script  
**Why use it?** Upload all files at once, version control, professional workflow  
**Time:** 5 minutes (after initial setup)

---

## 🚀 **METHOD 1: CLASP (RECOMMENDED)**

### **One-Time Setup (10 minutes)**

#### **Step 1: Install Node.js** (if not already installed)
```bash
# Check if you have Node.js
node --version

# If not installed, download from:
# https://nodejs.org/ (LTS version)
```

#### **Step 2: Install clasp**
```bash
npm install -g @google/clasp
```

#### **Step 3: Login to Google**
```bash
clasp login
```
- Opens browser
- Login with Google account
- Allow permissions
- Done!

---

### **Deploy to New Sheet (5 minutes)**

#### **Step 1: Create Apps Script Project**
```bash
cd /Users/ocho-air/Documents/GitHub/tracking-sheet-project

clasp create --title "Gym Ops Tracker V2.2" --type sheets
```

**Output:**
```
Created new Google Sheet: https://docs.google.com/spreadsheets/d/...
Created new Google Sheets Add-on script: https://script.google.com/...
Warning: files in subfolder are not accounted for unless you set a '.claspignore' file.
Cloned 1 file.
└─ appsscript.json
```

#### **Step 2: Create .claspignore file**
```bash
# Create file to exclude documentation
cat > .claspignore << 'EOF'
**/**
!*.gs
!appsscript.json
EOF
```

**What this does:** Only uploads .gs files, ignores all .md files

#### **Step 3: Push All Files**
```bash
clasp push
```

**Output:**
```
Pushing files...
└─ appsscript.json
└─ Code.gs
└─ constants.gs
└─ tabBuilder.gs
└─ formulaBuilder.gs
└─ validationService.gs
└─ tabs-refactored.gs
└─ lead-data-refactored.gs
└─ help-tab-refactored.gs
└─ dashboard-refactored.gs
└─ initialize-v2.gs
└─ member-type-toggle.gs
└─ performance-optimizations.gs
└─ test-harness.gs
└─ healthCheck.gs (if exists)
└─ leadDataService.gs (if exists)
└─ onboardingService.gs (if exists)
Pushed 17 files.
```

#### **Step 4: Open in Browser**
```bash
clasp open
```

**Opens Apps Script editor with ALL files loaded!**

#### **Step 5: Open the Sheet**
```bash
clasp open --webapp
```

**Opens your Google Sheet!**

#### **Step 6: Initialize**
```
1. Refresh sheet (wait 30 sec for menu)
2. Gym Ops → Initialize V2
3. Done! ✅
```

---

### **Deploy to Existing Sheet (3 minutes)**

#### **Option A: Clone existing project**
```bash
# Get your script ID from:
# Extensions → Apps Script → Project Settings → Script ID

clasp clone <YOUR_SCRIPT_ID>

# Copy your new files to the cloned directory
cp *.gs /path/to/cloned/directory/

# Push updates
clasp push
```

#### **Option B: Create new, link to existing**
```bash
# Create new Apps Script project
clasp create --title "Gym Ops V2.2" --type standalone

# Push files
clasp push

# Manually copy script ID
# Go to existing sheet → Extensions → Apps Script
# Replace the container with new script ID
```

---

### **clasp Commands Cheat Sheet**

```bash
# Create new project
clasp create --title "Project Name" --type sheets

# Push all changes
clasp push

# Pull remote changes
clasp pull

# Watch for changes (auto-push)
clasp push --watch

# Open Apps Script editor
clasp open

# Open the spreadsheet
clasp open --webapp

# Deploy as web app
clasp deploy

# List deployments
clasp deployments

# Create version
clasp version "v2.2 release"

# View logs
clasp logs

# Run function
clasp run functionName
```

---

### **Project Structure for clasp**

```
/tracking-sheet-project/
├── .clasp.json              (created by clasp)
├── .claspignore             (optional - what to exclude)
├── appsscript.json          ✅ Upload
├── Code.gs                  ✅ Upload
├── constants.gs             ✅ Upload
├── tabBuilder.gs            ✅ Upload
├── formulaBuilder.gs        ✅ Upload
├── validationService.gs     ✅ Upload
├── tabs-refactored.gs       ✅ Upload
├── lead-data-refactored.gs  ✅ Upload
├── help-tab-refactored.gs   ✅ Upload
├── dashboard-refactored.gs  ✅ Upload
├── initialize-v2.gs         ✅ Upload
├── member-type-toggle.gs    ✅ Upload
├── performance-optimizations.gs ✅ Upload
├── test-harness.gs          ✅ Upload
├── healthCheck.gs           ✅ Upload (if exists)
├── leadDataService.gs       ✅ Upload (if exists)
├── onboardingService.gs     ✅ Upload (if exists)
├── *.md                     ❌ Exclude (docs)
└── _archive/                ❌ Exclude
```

---

### **Benefits of clasp**

✅ **Fast:** Upload all files in seconds  
✅ **Version Control:** Works with Git  
✅ **Professional:** Industry standard  
✅ **Watch Mode:** Auto-push on save  
✅ **Easy Updates:** One command to deploy  
✅ **Team Friendly:** Share project easily  
✅ **Rollback:** Easy to revert changes  

---

### **Common Issues & Solutions**

#### **Issue: "clasp: command not found"**
```bash
# Solution 1: Reinstall globally
npm install -g @google/clasp

# Solution 2: Use npx
npx @google/clasp push
```

#### **Issue: "User has not enabled the Apps Script API"**
```bash
# Solution:
# 1. Go to https://script.google.com/home/usersettings
# 2. Enable "Google Apps Script API"
# 3. Try again
```

#### **Issue: "Push failed"**
```bash
# Solution: Force push
clasp push --force
```

#### **Issue: "No credentials found"**
```bash
# Solution: Re-login
clasp login
```

---

## 📦 **METHOD 2: SINGLE FILE APPROACH**

If you don't want to use clasp, combine everything into one file.

### **Create master-bundle.gs**

```javascript
// ============================================================
// FOUNDATION: TabBuilder
// ============================================================
class TabBuilder {
  // ... paste entire tabBuilder.gs content ...
}

// ============================================================
// FOUNDATION: FormulaBuilder
// ============================================================
var FormulaBuilder = {
  // ... paste entire formulaBuilder.gs content ...
};

// ============================================================
// FOUNDATION: ValidationService
// ============================================================
var ValidationService = (function() {
  // ... paste entire validationService.gs content ...
})();

// ============================================================
// REFACTORED TABS: Members, _Data, _Metrics, etc.
// ============================================================
function createMembersTabV2(ss) {
  // ... paste from tabs-refactored.gs ...
}

function createDataTabV2(ss) {
  // ... paste from tabs-refactored.gs ...
}

// ... paste all other functions ...

// ============================================================
// FEATURES: Member Type Toggle
// ============================================================
function createMembersTabV2WithToggle(ss) {
  // ... paste from member-type-toggle.gs ...
}

// ============================================================
// FEATURES: Performance Optimizations
// ============================================================
var PerformanceConfig = {
  // ... paste from performance-optimizations.gs ...
};

// ============================================================
// TESTING: Test Harness
// ============================================================
function testAll() {
  // ... paste from test-harness.gs ...
}

// ============================================================
// INITIALIZATION
// ============================================================
function initializeTemplateV2(silent) {
  // ... paste from initialize-v2.gs ...
}
```

### **Then in Apps Script:**
1. Extensions → Apps Script
2. Replace Code.gs with master-bundle.gs
3. Keep constants.gs separate
4. Save
5. Done!

**Pros:** Only 2 files to manage  
**Cons:** Harder to maintain, 3,000+ line file

---

## 🔗 **METHOD 3: GITHUB + APPS SCRIPT**

### **If you have GitHub repo:**

1. **Enable GitHub integration in Apps Script**
   - Apps Script → Project Settings
   - Enable GitHub integration (if available)

2. **Connect to repo**
   - Connect to your GitHub repo
   - Auto-sync

**Note:** This feature may not be available in all regions

---

## 📊 **COMPARISON**

| Method | Time | Difficulty | Best For |
|--------|------|------------|----------|
| **clasp** | 5 min | Easy (after setup) | Teams, version control |
| **Single File** | 10 min | Easy | Simple deployments |
| **Manual Upload** | 20 min | Easy | One-time test |
| **GitHub** | Varies | Medium | Open source projects |

---

## 🎯 **RECOMMENDED WORKFLOW**

### **For Development:**
```bash
# Use clasp with watch mode
clasp push --watch
```
- Edit locally in VS Code
- Auto-syncs to Apps Script
- Instant updates

### **For Production:**
```bash
# Create version
clasp version "v2.2 production"

# Deploy
clasp push

# Test
clasp open --webapp
```

### **For Teams:**
```bash
# 1. Developer pushes to Git
git push origin main

# 2. Team member pulls
git pull

# 3. Team member deploys
clasp push
```

---

## ⚡ **QUICK START WITH CLASP**

**Complete setup in 5 commands:**

```bash
# 1. Install clasp (one-time)
npm install -g @google/clasp

# 2. Login (one-time)
clasp login

# 3. Create project
cd /Users/ocho-air/Documents/GitHub/tracking-sheet-project
clasp create --title "Gym Ops V2.2" --type sheets

# 4. Push all files
clasp push

# 5. Open
clasp open
```

**Done! All files uploaded!** 🎉

---

## 💡 **MY RECOMMENDATION**

**Use clasp!** Here's why:

1. **Professional:** Industry standard
2. **Fast:** 5 minutes vs 20 minutes
3. **Git-friendly:** Works with version control
4. **Team-friendly:** Easy collaboration
5. **Maintainable:** Easy updates
6. **Future-proof:** Google's official tool

**Setup once, benefit forever!**

---

*clasp Installation Guide*  
*Time: 5 minutes (after setup)*  
*Difficulty: Easy*  
*Recommended: ⭐⭐⭐⭐⭐*


