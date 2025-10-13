# 🚀 FRESH INSTALLATION GUIDE
## Installing Gym Ops Tracker on a Brand New Google Sheet

**Time Required:** 10-15 minutes  
**Difficulty:** Easy  
**Prerequisites:** Google account with Google Sheets access

---

## 📋 INSTALLATION OVERVIEW

```
Step 1: Create new Google Sheet (1 min)
        ↓
Step 2: Add Apps Script files (3 min)
        ↓
Step 3: Run initialization (2 min)
        ↓
Step 4: Run Quick Start Wizard (5 min)
        ↓
Step 5: Verify & test (2 min)
        ↓
✅ COMPLETE - Fully functional tracking system!
```

**Total Time:** 10-15 minutes

---

## 🎯 STEP 1: CREATE NEW GOOGLE SHEET

### 1.1 Create the Sheet
```
1. Go to: https://sheets.google.com
2. Click: "+ Blank" (creates new sheet)
3. Sheet opens with name "Untitled spreadsheet"
```

### 1.2 Name Your Sheet (Optional)
```
1. Click "Untitled spreadsheet" at top
2. Type: "My Gym - Ops Tracker" (or your gym name)
3. Press Enter
```

✅ **Checkpoint:** You have a blank Google Sheet open

---

## 🎯 STEP 2: ADD APPS SCRIPT CODE

### 2.1 Open Apps Script Editor
```
1. In your Google Sheet, click: Extensions → Apps Script
2. New tab opens with Apps Script editor
3. You'll see a default Code.gs file with sample code
```

### 2.2 Delete Default Code
```
1. In the Code.gs editor, select ALL text (Ctrl+A or Cmd+A)
2. Press Delete
3. Editor should now be empty
```

### 2.3 Copy Code.gs Content
```
1. Open your local file: Code.gs
2. Select ALL (Ctrl+A or Cmd+A)
3. Copy (Ctrl+C or Cmd+C)
```

### 2.4 Paste into Apps Script Editor
```
1. Click in the Apps Script editor (should be empty)
2. Paste (Ctrl+V or Cmd+V)
3. You should now see all 4,500+ lines of code
```

### 2.5 Add constants.gs File
```
1. In Apps Script editor, click: + (plus icon) next to Files
2. Select: Script
3. Name it: constants
4. Paste the contents of your local constants.gs file
   (If you don't have constants.gs, skip this - Code.gs has defaults)
```

### 2.6 Add healthCheck.gs File
```
1. Click: + (plus icon) next to Files
2. Select: Script
3. Name it: healthCheck
4. Paste the contents of healthCheck.gs
```

### 2.7 Add leadDataService.gs File (If Available)
```
1. Click: + (plus icon) next to Files
2. Select: Script
3. Name it: leadDataService
4. Paste the contents of leadDataService.gs
   (If you don't have this file, skip it)
```

### 2.8 Add onboardingService.gs File (If Available)
```
1. Click: + (plus icon) next to Files
2. Select: Script
3. Name it: onboardingService
4. Paste the contents of onboardingService.gs
   (If you don't have this file, skip it)
```

### 2.9 Save the Project
```
1. Click the Save icon (💾) at top
   OR press Ctrl+S (Cmd+S on Mac)
2. Wait for "Saved" confirmation
3. You may be prompted to name the project
4. Name it: "Gym Ops Tracker"
5. Click: OK
```

✅ **Checkpoint:** Apps Script code is installed and saved

---

## 🎯 STEP 3: FIRST-TIME AUTHORIZATION

### 3.1 Close Apps Script Editor
```
1. Close the Apps Script tab
2. Return to your Google Sheet tab
3. Reload the page (F5 or Ctrl+R)
```

### 3.2 Grant Permissions
```
1. When sheet reloads, you may see: "Authorization Required"
2. Click: Continue
3. Select your Google account
4. Click: Advanced
5. Click: "Go to Gym Ops Tracker (unsafe)"
   (It's safe - it's your own code!)
6. Click: Allow
7. Grant all permissions requested
```

### 3.3 Verify Menu Appears
```
1. Look at the menu bar
2. You should now see: "Gym Ops" menu (between Help and user icon)
3. Click it to see all menu items
```

✅ **Checkpoint:** Gym Ops menu is visible and accessible

---

## 🎯 STEP 4: INITIALIZE THE TEMPLATE

### 4.1 Run Full Setup
```
1. Click: Gym Ops → 🚀 Full Setup (Init + Wizard)
2. Confirmation dialog appears
3. Click: YES to confirm
4. Wait 20-30 seconds for initialization
```

**What Happens:**
- Creates all tabs (DASHBOARD, Lead Data, Settings, etc.)
- Sets up formulas
- Creates named ranges
- Adds data validations
- Applies protections
- Creates 7 charts
- Hides helper tabs

### 4.2 Complete Quick Start Wizard

**The wizard will ask you 6 questions:**

#### Question 1: Gym Name
```
Prompt: "What's your gym or studio name?"
Example: "Elite Fitness Studio"
Enter your gym name → Click OK
```

#### Question 2: Monthly Goal
```
Prompt: "How many new members do you want per month?"
Example: 40
Enter your target → Click OK
```

#### Question 3: Set Monthly Targets
```
Prompt: "Enter targets separated by commas..."
Shows calculated defaults based on your goal
Options:
  - Press OK to accept defaults
  - OR type custom values: "120, 55%, 65%, 45%, 30, $6000"
```

#### Question 4: Marketing Budget
```
Prompt: "What's your total monthly marketing budget?"
Example: 5000 (or 0 if none)
Enter amount → Click OK
```

#### Question 5a: Select Marketing Channels (if budget > 0)
```
Prompt: "Which channels do you want to allocate budget to?"
Example: 1,2 (for Paid Search and Paid Social)
Enter numbers separated by commas → Click OK
```

#### Question 5b: Allocate Budget
```
Prompt: "How to allocate budget?"
Options:
  - YES = Even split across channels
  - NO = Manually enter amount for each channel
Select your preference
```

#### Question 6: Staff Names
```
Prompt: "Enter staff names (comma-separated)"
Example: Sarah, Mike, Jessica
Options:
  - Enter custom names
  - OR press OK for defaults (Front Desk, Coach A, Coach B)
```

#### Question 7: Membership Types
```
Prompt: "Keep default packages?"
Default: PT, Small Group, General, Class Pack
Options:
  - YES = Keep defaults
  - NO = Enter custom types
```

#### Question 8: Sample Data
```
Prompt: "Add 50 sample leads to test the system?"
Recommended: YES (for first-time setup)
You can delete sample data later
Click: YES or NO
```

### 4.3 Setup Complete
```
You'll see: "✅ Setup Complete!"
Dialog shows:
  - Tracker is 100% configured
  - DASHBOARD ready
  - Marketing budget allocated (if entered)
Click: OK
```

✅ **Checkpoint:** Template initialized, wizard complete

---

## 🎯 STEP 5: VERIFY INSTALLATION

### 5.1 Check Tabs Created
```
Look at bottom of sheet - you should see these tabs:
  ✅ DASHBOARD
  ✅ Lead Data
  ✅ Members
  ✅ Import Members
  ✅ LTV Analysis
  ✅ Settings & Budget
```

### 5.2 Check DASHBOARD
```
1. Click: DASHBOARD tab
2. You should see:
   ✅ GYM OPS DASHBOARD header
   ✅ Date range dropdown (set to "Last 30 Days")
   ✅ TODAY'S SNAPSHOT section
   ✅ KEY METRICS table (Leads, Set %, etc.)
   ✅ Target column shows NUMBERS (not "Target" text)
   ✅ If sample data added: Some metrics populated
   ✅ 7 charts at bottom (scroll down to see them)
```

### 5.3 Verify Target Column (CRITICAL)
```
Click on cells C10-C16 and verify they show:
  C10: 70 (or your custom Leads target)
  C11: 60.0% (or your custom Set Rate)
  C12: 70.0% (or your custom Show Rate)
  C13: 50.0% (or your custom Close Rate)
  C14: 20 (or your custom New Members target)
  C15: $3,000 (or your custom MRR)
  C16: $150 (or your custom CAC)

❌ If any show "Target" text:
   Run: Gym Ops → Fix DASHBOARD Formulas
```

### 5.4 Check Lead Data
```
1. Click: Lead Data tab
2. You should see:
   ✅ 32 column headers (Lead ID through Last Touchpoint)
   ✅ If sample data added: 50 rows of sample leads
   ✅ Source column (H) auto-populated
   ✅ Smart columns (Age, Lead Score, Action Needed)
```

### 5.5 Check Settings & Budget
```
1. Click: Settings & Budget tab
2. You should see:
   ✅ MONTHLY TARGETS section (your values)
   ✅ DROPDOWN LISTS section (sources, staff, types)
   ✅ UTM ATTRIBUTION MAPPING table
   ✅ LTV ASSUMPTIONS table
   ✅ DATE RANGE SYSTEM (auto-calculated)
   ✅ MARKETING BUDGET section (if you entered budget)
```

### 5.6 Test Gym Ops Menu
```
1. Click: Gym Ops menu
2. Verify all items present:
   ✅ Quick Start Wizard
   ✅ Full Setup
   ✅ Quick Add Lead
   ✅ Initialize Template
   ✅ Refresh Dashboards
   ✅ Create Backup Now
   ✅ Export Lead Data to CSV
   ✅ Run Health Check
   ✅ Fix DASHBOARD Formulas ← NEW!
   ✅ Setup Member Filters
   ✅ Add Sample Data
   ✅ View Help
```

### 5.7 Run Health Check
```
1. Click: Gym Ops → Run Health Check
2. You should see: "✅ Health Check Passed"
3. If any issues reported, follow the fix instructions
```

✅ **Checkpoint:** All features verified and working

---

## 🎯 STEP 6: CUSTOMIZE FOR YOUR GYM

### 6.1 Adjust Targets (If Needed)
```
1. Go to: Settings & Budget tab
2. Modify B3-B9 values to match your goals
3. DASHBOARD will update automatically
```

### 6.2 Add Your Staff
```
1. Settings & Budget tab, column B (starting B14)
2. Replace default names with your staff
3. These appear in Lead Data dropdown
```

### 6.3 Customize Membership Types
```
1. Settings & Budget tab, column D (starting D14)
2. Modify to match your packages
3. These appear in Lead Data dropdown
```

### 6.4 Add Marketing Budget (If Not Done)
```
1. Settings & Budget tab, scroll to MARKETING BUDGET section (row 38+)
2. Enter: Month (YYYY-MM format), Source, Monthly Budget
3. Daily Rate auto-calculates
4. Example:
   Row 40: 2025-10 | Paid Search | $2,500
   Row 41: 2025-10 | Paid Social | $1,500
```

### 6.5 Remove Sample Data (If Added)
```
1. Go to Lead Data tab
2. Select rows 2-51 (all sample leads)
3. Right-click → Delete rows
4. Also delete from _UTM Tracking tab if needed
```

✅ **Checkpoint:** Sheet customized for your gym

---

## 🎯 STEP 7: CONNECT GOHIGHLEVEL (OPTIONAL)

### 7.1 View GHL Integration Guide
```
1. Click: Gym Ops → View Help
2. Help tab appears
3. Scroll to: "GOHIGHLEVEL (GHL) INTEGRATION" section
4. Follow the detailed workflow setup instructions
```

### 7.2 Quick GHL Setup Summary
```
Required: 2 workflows in GoHighLevel

Workflow 1: UTM Tracking
  - Trigger: Contact Created
  - Action: Google Sheets → Append Row
  - Tab: _UTM Tracking
  - Fields: Lead ID, UTM data (10 columns)

Workflow 2: Lead Data (5 seconds after Workflow 1)
  - Trigger: Contact Created
  - Delay: 5 seconds
  - Action: Google Sheets → Append Row
  - Tab: Lead Data
  - Fields: Lead ID, Name, Phone, Email, etc. (11 columns)
```

See Help tab for complete field mappings.

✅ **Checkpoint:** GHL integration configured (optional)

---

## 🎯 STEP 8: START USING

### 8.1 Add Your First Real Lead (Manual Entry)
```
1. Go to: Lead Data tab
2. Click cell A2 (first row after headers)
3. Enter data:
   - Lead ID: LEAD-10001 (or any unique ID)
   - Created Date: Today's date
   - First Name: John
   - Last Name: Smith
   - Phone: 555-123-4567
   - Email: john.smith@example.com
   - Source: Select from dropdown
   - Staff Owner: Select from dropdown
4. Press Tab to move to next cell
5. Source column (H) may auto-populate from UTM
6. Other columns auto-calculate (Age, Score, etc.)
```

### 8.2 Or Use Quick Add Lead
```
1. Click: Gym Ops → Quick Add Lead
2. Dialog opens
3. Fill in: First Name, Last Name, Phone, Source
4. Click: Add Lead
5. Lead automatically added to Lead Data
```

### 8.3 Mark Progress
```
As lead progresses through your funnel:
1. Check "Appt Set?" (L) → Appt Date auto-fills
2. Check "Show?" (N) → Show Date auto-fills
3. Check "Start Trial?" (P) → Trial End auto-calculates
4. Check "Converted?" (Q) → Member Start auto-fills
5. Enter: Membership Type, MRR, Upfront Fee
```

### 8.4 View DASHBOARD
```
1. Click: DASHBOARD tab
2. See your metrics update in real-time
3. Check:
   - Today's Snapshot (hot leads, action items)
   - Key Metrics (leads, conversion rates, etc.)
   - Source Analysis (performance by channel)
   - LTV Metrics (customer value)
   - Staff Performance
   - 7 interactive charts (scroll down)
```

✅ **Checkpoint:** You're tracking leads!

---

## 🎉 INSTALLATION COMPLETE!

### **What You Now Have:**

✅ **Fully Functional Tracking System**
   - 6 visible tabs (DASHBOARD, Lead Data, Members, Settings, LTV, Import)
   - 6 hidden helper tabs (auto-calculations)
   - 32 smart columns in Lead Data
   - Auto-calculated metrics on DASHBOARD
   - 7 interactive analytics charts

✅ **Automation Ready**
   - GoHighLevel integration ready (if needed)
   - Auto-source mapping from UTM
   - Auto-calculated columns
   - Monthly auto-backups
   - Health check monitoring

✅ **Best Practices Built-In**
   - Data validations on key fields
   - Protected formula columns
   - Duplicate lead detection
   - Date chronology validation
   - Formula error auto-fix

---

## 🔧 TROUBLESHOOTING FRESH INSTALL

### Problem: "Script error" when opening
**Solution:**
```
1. Extensions → Apps Script
2. Check for red error indicators
3. Make sure all code pasted correctly
4. Save again
5. Reload sheet
```

### Problem: Menu doesn't appear
**Solution:**
```
1. Reload the sheet (F5 or Ctrl+R)
2. Wait 5 seconds for scripts to load
3. Check if you granted permissions
4. Try: Extensions → Apps Script → Run → onOpen
```

### Problem: "Authorization required"
**Solution:**
```
1. Click: Continue
2. Select your Google account
3. Click: Advanced → Go to Gym Ops Tracker
4. Click: Allow
5. Reload sheet
```

### Problem: Initialization fails
**Solution:**
```
1. Check Apps Script logs: View → Logs
2. Look for error messages
3. Common issues:
   - Missing required files (add them)
   - Syntax error (check code pasted correctly)
   - Permissions not granted (re-authorize)
```

### Problem: DASHBOARD shows "Target" text
**Solution:**
```
Easy fix! Click: Gym Ops → Fix DASHBOARD Formulas
This auto-corrects the formulas
(This bug should NOT occur with the updated code, but fix is available if needed)
```

---

## 📚 POST-INSTALLATION

### **Next Steps:**

1. **Review DASHBOARD** - Familiarize yourself with layout
2. **Customize Settings** - Adjust targets, staff, types to match your gym
3. **Add Real Data** - Start tracking actual leads
4. **Set Up GHL** (optional) - Automate lead entry
5. **Train Team** - Show staff how to update checkboxes
6. **Daily Workflow** - Check DASHBOARD action items each morning

### **Resources:**

**For Using the System:**
- Help tab (Gym Ops → View Help)
- TAB-REFERENCE.md (complete tab documentation)
- GHL-WORKFLOW-GUIDE.md (integration instructions)

**For Understanding:**
- CONTEXT.md (system overview)
- DATA-FLOW.md (how data moves through tabs)
- FUNCTION-INVENTORY.md (what each function does)

**For Troubleshooting:**
- Run: Gym Ops → Run Health Check
- Check: Apps Script logs (View → Logs)
- Review: FORMULA-AUDIT-REPORT.md (if formula issues)

---

## 🎓 UNDERSTANDING THE SYSTEM

### **Key Concepts:**

**Lead Flow:**
```
Lead Created → Appt Set → Show → Trial → Member → (Active/Cancelled)
```

**Tab Purposes:**
```
DASHBOARD = View metrics and action items
Lead Data = Enter and track all leads
Members = View active members only
Settings & Budget = Configure system and budgets
LTV Analysis = Analyze customer lifetime value
Import Members = One-time import of existing members (optional)
```

**Smart Auto-Calculations:**
```
✅ Source = Auto-mapped from UTM data
✅ Trial End = Auto-calculated from Trial Start + length
✅ Current Status = Auto-determined from checkboxes
✅ Age = Auto-calculated days since created
✅ Lead Score = Auto-scored (Hot/Warm/Cold)
✅ Action Needed = Smart next step recommendation
✅ Days to Convert = Auto-calculated conversion time
```

### **Data Validations:**

The system prevents errors with:
- Dropdown lists (Sources, Staff, Types, Reasons)
- Checkbox fields (Appt Set, Show, Converted, etc.)
- Date validation (chronological order checking)
- Duplicate detection (phone/email)
- Number validation (MRR, budgets)

---

## ⚡ QUICK START WORKFLOW

### **For Daily Use:**

**Morning (5 minutes):**
```
1. Open DASHBOARD
2. Check "Today's Snapshot"
3. Review "Action Items"
4. Address urgent items (No Appt Set, No Shows)
```

**Throughout Day:**
```
1. New leads auto-added by GHL (or add manually)
2. Update checkboxes as events happen
3. Mark appointments, shows, trials, conversions
```

**End of Day (2 minutes):**
```
1. Check DASHBOARD "on pace" status
2. Review uncompleted action items
3. Plan follow-ups for tomorrow
```

**Weekly:**
```
1. Review Source Analysis (which channels performing best)
2. Check LTV:CAC ratios
3. Adjust marketing spend based on performance
```

**Monthly:**
```
1. Update marketing budget for next month
2. Review LTV Analysis tab (customer value trends)
3. Check Staff Performance
4. Create manual backup (auto-backup runs monthly)
```

---

## 🆘 GETTING HELP

### **If Something Goes Wrong:**

**Formula Errors:**
```
Run: Gym Ops → Fix DASHBOARD Formulas
OR: Gym Ops → Run Health Check
```

**Lost Data:**
```
Run: Gym Ops → Restore from Backup
Select most recent backup
```

**Need to Start Over:**
```
Run: Gym Ops → Full Setup (Init + Wizard)
WARNING: This recreates all tabs and formulas
Creates backup automatically
```

**Script Issues:**
```
1. Extensions → Apps Script
2. View → Logs (check for errors)
3. Check code is saved
4. Re-authorize if needed
```

---

## 📊 WHAT'S INSTALLED

### **Apps Script Files:**

| File | Purpose | Lines |
|------|---------|-------|
| Code.gs | Main system code | 4,500+ |
| healthCheck.gs | System validation | 250+ |
| constants.gs | Configuration values | 50+ |
| leadDataService.gs | Lead management | 200+ |
| onboardingService.gs | UX improvements | 100+ |

**Total:** ~5,000+ lines of code

### **Sheet Tabs:**

| Tab | Type | Purpose |
|-----|------|---------|
| DASHBOARD | Visible | KPIs, metrics, charts |
| Lead Data | Visible | All leads and tracking |
| Members | Visible | Active members view |
| Settings & Budget | Visible | Configuration |
| LTV Analysis | Visible | Customer value analysis |
| Import Members | Visible | Historical member import |
| _UTM Tracking | Hidden | UTM source mapping |
| _Chart Data | Hidden | Chart data aggregation |
| _LTV Calculations | Hidden | LTV computations |
| _Metrics | Hidden | Net gain/loss calculations |
| _Data | Hidden | Member time series |
| Help | Hidden | Documentation |

**Total:** 12 tabs (6 visible, 6 hidden)

### **Features Enabled:**

✅ Real-time KPI tracking  
✅ Lead-to-member conversion funnel  
✅ Marketing spend tracking  
✅ Source performance analysis  
✅ LTV and churn analysis  
✅ Staff performance tracking  
✅ Automated backups (monthly)  
✅ Health check monitoring  
✅ Auto-fix for formula errors ← NEW!  
✅ GHL integration ready  
✅ 7 interactive charts  
✅ Smart lead scoring  
✅ Action item tracking  
✅ Duplicate detection  
✅ Date validation  
✅ CSV export  

---

## 🎯 SUCCESS CRITERIA

### **You'll Know Installation Worked When:**

1. ✅ All 12 tabs created (6 visible)
2. ✅ Gym Ops menu appears with all items
3. ✅ DASHBOARD shows metrics and charts
4. ✅ Target column (C10-C16) shows NUMBERS
5. ✅ No #VALUE! or #REF! errors visible
6. ✅ Health check passes
7. ✅ Can add leads (manually or via Quick Add)
8. ✅ Metrics update when data changes
9. ✅ Formulas auto-calculate
10. ✅ Charts display at bottom of DASHBOARD

---

## 📈 ESTIMATED TIME BREAKDOWN

```
Create Google Sheet:        1 minute
Copy Apps Script code:      3 minutes
Authorization:              2 minutes
Run Full Setup:             2 minutes
Complete Wizard:            5 minutes
Verify Installation:        2 minutes
────────────────────────────────────
TOTAL:                      15 minutes
```

**With customization:** +10-15 minutes  
**With GHL setup:** +20-30 minutes  
**Complete setup:** 45-60 minutes total

---

## 🎓 WHAT MAKES THIS INSTALLATION SPECIAL

### **Formula Audit Improvements Included:**

✅ **Auto-Fix Technology**
   - Detects broken formulas on sheet open
   - Corrects them automatically
   - No user intervention needed

✅ **Multi-Layer Defense**
   - Prevention (correct code)
   - Detection (health check)
   - Correction (auto-fix)
   - Manual fix (menu option)
   - Named ranges (future-proof)

✅ **User-Friendly**
   - Transparent operation
   - Toast notifications
   - Clear error messages
   - One-click fixes

✅ **Battle-Tested**
   - Root cause identified and fixed
   - 200+ pages of audit documentation
   - Multiple solution angles evaluated
   - Comprehensive testing completed

---

## ✅ INSTALLATION CHECKLIST

Use this to track your progress:

- [ ] Created new Google Sheet
- [ ] Named the sheet
- [ ] Opened Apps Script editor
- [ ] Pasted Code.gs content
- [ ] Added healthCheck.gs
- [ ] Added other script files (if available)
- [ ] Saved all files
- [ ] Granted authorization
- [ ] Gym Ops menu appears
- [ ] Ran Full Setup (Init + Wizard)
- [ ] Completed all wizard questions
- [ ] Setup complete dialog appeared
- [ ] Verified DASHBOARD created
- [ ] Checked Target column shows numbers
- [ ] Verified all tabs created
- [ ] Ran health check (passed)
- [ ] Tested adding a lead
- [ ] Customized settings
- [ ] Removed sample data (if desired)
- [ ] Bookmarked the sheet
- [ ] Shared with team (if applicable)

**Total Checked:** _____ / 20

**Installation Status:** 
- 20/20 = ✅ Complete and verified
- 15-19/20 = ⚠️ Mostly done, check remaining items
- <15/20 = ⏳ Continue installation

---

## 🚀 YOU'RE READY!

**Congratulations!** Your Gym Ops Tracker is fully installed and ready to use.

**Key Features:**
- 📊 Real-time performance tracking
- 🎯 Goal monitoring with variance analysis
- 💰 Marketing ROI and CAC tracking
- 📈 Customer lifetime value analysis
- 🔔 Daily action items and alerts
- 📉 7 interactive analytics charts
- 🔧 Self-healing formulas (auto-fix)
- 💾 Automatic monthly backups

**Next Steps:**
1. Start entering your leads
2. Track them through your funnel
3. Watch DASHBOARD metrics update
4. Make data-driven decisions!

---

**Questions?**
- See: Help tab (Gym Ops → View Help)
- Run: Gym Ops → Run Health Check
- Review: Documentation files in project folder

---

*Fresh Installation Guide v1.0*  
*Created: October 8, 2025*  
*For: Gym Ops Tracker v2.1-beta*  
*With: Formula Audit improvements included*

**🎉 ENJOY YOUR NEW TRACKING SYSTEM! 🎉**

