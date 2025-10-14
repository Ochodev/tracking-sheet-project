# 🎯 Project Context: Gym Operations Tracking Sheet

**Version:** v2.1-beta  
**Code Size:** 4,560 lines  
**Functions:** 54  
**Purpose:** Complete context for AI-assisted development

---

## 📖 PROJECT OVERVIEW

### **What Is This?**
A Google Sheets-based operations management system for gyms and fitness studios. Tracks leads, members, staff performance, marketing ROI, and provides actionable insights through an integrated dashboard.

### **Target Audience:**
- Small to medium gyms (< 5,000 leads)
- Single or multi-location operations
- Teams of 5-20 staff members
- Monthly revenue tracking ($10k-$500k MRR)

### **Core Value Proposition:**
*"Track everything that matters, nothing that doesn't. See it all on one page."*

---

## 🏗️ ARCHITECTURE

### **Technology Stack:**
- **Platform:** Google Sheets (Web-based spreadsheet)
- **Language:** Google Apps Script (JavaScript ES5+)
- **Storage:** Google Drive
- **Integration:** GHL (GoHighLevel) CRM via Workflows

### **System Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                       │
│  (Google Sheets - 12 Tabs, 7 Charts, Custom Menu)      │
└────────────┬────────────────────────────────────────────┘
             │
       ┌─────┴─────┐
       │  Apps     │
       │  Script   │ ← 4,560 lines, 54 functions
       │  Runtime  │
       └─────┬─────┘
             │
    ┌────────┴────────┐
    │   Data Layer    │
    │  Lead Data (26  │
    │     columns)    │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │  GHL Workflow   │
    │  (External CRM) │
    └─────────────────┘
```

---

## 📊 DATA MODEL

### **Primary Data Source: Lead Data Tab**

**26 Columns:**
```
A: Lead ID (from GHL)
B: Created Date
C: First Name
D: Last Name
E: Phone
F: Email
G: DOB
H: Source (auto from UTM)
I: Campaign
J: Staff Owner
K: Location

L: Appt Set? (checkbox)
M: Appt Date
N: Show? (checkbox)
O: Trial Start
P: Trial End (auto-calculated)
Q: Converted? (checkbox)
R: Member Start
S: Membership Type
T: MRR ($)
U: Upfront Fee ($)

V: Cancelled? (checkbox)
W: Cancel Date
X: Cancel Reason
Y: Notes
Z: Current Status (auto-calculated)
AA: Age in Days (auto)
AB: Lead Score (auto)
AC: Action Needed (auto)
AD: Duplicate? (auto)
AE: Days to Convert (auto)
AF: Last Touchpoint (auto)
```

### **Data Flow:**

```
1. GHL Workflow → _UTM Tracking (Lead ID + UTM data)
2. GHL Workflow → Lead Data (Lead info)
3. Lead Data H (Source) ← VLOOKUP from _UTM Tracking
4. User checks boxes (Appt Set, Show, Converted, Cancelled)
5. onEdit trigger → Auto-fills associated dates
6. Formulas calculate: Trial End, Status, Age, Score
7. DASHBOARD aggregates via COUNTIFS/SUMIFS
8. Charts pull from aggregated data
```

### **Derived Data:**

| Tab | Source | Update Method |
|-----|--------|---------------|
| Members | Lead Data | FILTER (Converted=TRUE, Cancelled≠TRUE) |
| Staff | Lead Data | COUNTIFS by Staff Owner |
| _Data | Lead Data | Daily calculation (active members) |
| _Chart Data | Lead Data | Pre-aggregated for 7 charts |
| _Daily Spend | Marketing | Generated from monthly spend |

---

## 🎯 KEY FEATURES

### **1. Lead Tracking**
- **What:** Capture all leads with 26 data points
- **How:** Manual entry OR GHL workflow automation
- **Validation:** Duplicate detection (phone/email), date chronology
- **Auto-calc:** Source mapping, Trial End, Current Status, Lead Score

### **2. DASHBOARD**
- **What:** One-page morning check with KPIs, action items, alerts
- **Sections:**
  1. Key Metrics (Leads, Set%, Show%, Close%, CAC, MRR)
  2. On-Pace Status (vs monthly targets)
  3. Action Items (no appt set, no shows, trials expiring)
  4. Member Alerts (trials ending, birthdays)
  5. Source Analysis (12 metrics per source)
  6. 7 Analytics Charts
- **Updates:** Real-time via formulas

### **3. Date Range System**
- **What:** Flexible time filtering across all metrics
- **Options:** 9 presets (7d, 14d, 30d, 90d, QTD, YTD, All, Custom)
- **Implementation:** Named ranges (rngStart, rngEnd, rngAsOf)
- **Used By:** All DASHBOARD formulas, charts, reports

### **4. GHL Integration**
- **What:** Automatic lead capture from GHL CRM
- **Method:** GHL Workflows (not webhooks)
- **Two Tables:**
  1. _UTM Tracking (Lead ID, UTM params, standardized source)
  2. Lead Data (lead details)
- **Benefit:** Zero manual data entry, perfect attribution

### **5. Validation System**
- **Duplicate Detection:**
  - Checks phone & email on entry
  - Alerts user with existing lead details
  - Option to continue or cancel
- **Date Chronology:**
  - 5 rules (Appt ≥ Created, Trial ≥ Appt, etc.)
  - Prevents illogical date sequences
  - User override available
- **Format Validation:**
  - Month format (YYYY-MM) for marketing spend
  - Trial length (1-90 days)
  - Date ranges (Start < End)

### **6. Backup & Recovery**
- **Manual Backup:** Creates hidden timestamped sheet
- **Auto Backup:** Monthly trigger (1st of month, 2 AM)
- **Restore:** UI to select and restore from backup
- **Cleanup:** Auto-deletes backups older than specified count

### **7. Export & Reporting**
- **CSV Export:** RFC 4180 compliant, date range filtering
- **Daily Report:** Summary of today's activities
- **Staff Leaderboard:** Performance by staff member

### **8. UX Enhancements**
- **Quick Start Wizard:** 4-step interactive setup
- **Quick Add Lead:** Dialog for fast entry
- **Dark Mode:** Theme toggle for DASHBOARD
- **Visual Cues:** Green background = auto-calculated
- **Smart Defaults:** Auto-fills common fields

---

## 🧩 CODE STRUCTURE

### **File Organization:**

```javascript
/**
 * Code.gs - 4,560 lines
 */

// ============================================================
// SECTION 1: TRIGGERS & INITIALIZATION (Lines 1-800)
// ============================================================
onOpen()                 // Menu creation
onEdit()                 // Auto-fills, validation
initializeTemplate()     // Main setup
quickStartWizard()       // Interactive setup

// ============================================================
// SECTION 2: TAB CREATION (Lines 800-2800)
// ============================================================
createDashboardTab()     // 467 lines
createLeadDataTab()      // 257 lines
createSettingsTab()      // 209 lines
createHelpTab()          // 371 lines
// ... 11 more tab functions

// ============================================================
// SECTION 3: VISUALIZATION (Lines 2800-3000)
// ============================================================
createDashboardCharts()  // 7 charts
createNamedRanges()      // Date filtering
setupDataValidations()   // Dropdowns
applyProtections()       // Column protection

// ============================================================
// SECTION 4: OPERATIONS (Lines 3000-4560)
// ============================================================
// Backup/Restore (5 functions)
// Export/Reports (5 functions)
// Validation (4 functions)
// Quick Actions (3 functions)
// UI Enhancements (3 functions)
// Utilities (2 functions)
```

### **Design Patterns:**

#### **Current Pattern: Procedural**
```javascript
function createDashboardTab(ss) {
  // Delete existing
  let dashboard = ss.getSheetByName('DASHBOARD');
  if (dashboard) ss.deleteSheet(dashboard);
  
  // Create new
  dashboard = ss.insertSheet('DASHBOARD', 0);
  
  // Build content (400+ lines)
  dashboard.getRange('A1').setValue('...');
  dashboard.getRange('A2').setValue('...');
  // ... 200+ more lines
  
  // Format (50+ lines)
  dashboard.setColumnWidth(1, 250);
  // ... more formatting
  
  // Formulas (100+ lines)
  dashboard.getRange('B7').setFormula('=COUNTIFS(...)');
  // ... more formulas
}
```

**Problems:**
- ❌ Lots of repetition across 15 tab functions
- ❌ Hard to test
- ❌ Difficult to modify

#### **Better Pattern: Template-Based** (Future)
```javascript
class TabBuilder {
  addHeader(text) { /* ... */ }
  addSection(title, config) { /* ... */ }
  addFormulas(config) { /* ... */ }
  format(style) { /* ... */ }
}

function createDashboardTab(ss) {
  return new TabBuilder(ss, 'DASHBOARD')
    .addHeader('📊 GYM OPERATIONS DASHBOARD')
    .addSection('KPIs', kpiConfig)
    .addSection('Actions', actionConfig)
    .addCharts(chartConfig)
    .format(dashboardStyle)
    .build();
}
```

**Benefits:**
- ✅ DRY (Don't Repeat Yourself)
- ✅ Testable components
- ✅ Easier to modify
- ✅ ~50% less code

---

## 🔧 DEVELOPMENT WORKFLOW

### **Local Development:**
```bash
# Clone repo
git clone <repo-url>
cd tracking-sheet-project

# Edit Code.gs locally
code Code.gs

# Deploy to Apps Script
# (Manual: Copy/paste into Apps Script editor)
# (Automated: Use clasp CLI)
clasp push

# Test in Google Sheets
# Open sheet → Refresh → Test features
```

### **Testing Approach:**
```javascript
// Currently: Manual testing only
// 1. Run initializeTemplate()
// 2. Manually verify each tab
// 3. Test features one by one

// Future: Automated testing
function runTests() {
  testDateValidation();
  testDuplicateDetection();
  testFormulaGeneration();
  testBackupRestore();
}
```

### **Common Development Tasks:**

**Add new validation rule:**
```javascript
// 1. Add to validateDateChronology()
// 2. Add test case
// 3. Update Help tab documentation
```

**Add new chart:**
```javascript
// 1. Add to createDashboardCharts()
// 2. Position on DASHBOARD
// 3. Add data source to _Chart Data if needed
```

**Add new field to Lead Data:**
```javascript
// 1. Update createLeadDataTab() - add column
// 2. Update createSettingsTab() - add validation if dropdown
// 3. Update DASHBOARD formulas if aggregating
// 4. Update Help tab documentation
```

---

## 📐 FORMULA PATTERNS

### **Common Patterns:**

#### **1. ARRAYFORMULA (Auto-calculation)**
```javascript
// Pattern: Calculate for all rows at once
sheet.getRange('Z2').setFormula(
  '=ARRAYFORMULA(IF(A2:A5000="","",<logic>))'
);

// Used in:
// - H2: Source mapping
// - P2: Trial End calculation
// - Z2: Current Status
// - AA2: Age calculation
// - AB2: Lead Score
// - AC2: Action Needed
```

#### **2. COUNTIFS/SUMIFS (Aggregation)**
```javascript
// Pattern: Count/sum with multiple conditions
'=COUNTIFS(range1, criteria1, range2, criteria2, ...)'

// Used in:
// - DASHBOARD metrics (leads, set rate, close rate)
// - Staff leaderboard (leads per staff)
// - Source analysis (metrics per source)
```

#### **3. FILTER (Dynamic Lists)**
```javascript
// Pattern: Create filtered view
'=FILTER(source_range, condition1, condition2, ...)'

// Used in:
// - Members tab (Converted=TRUE, Cancelled≠TRUE)
// - Action items lists (no appt set, no shows)
```

#### **4. Named Ranges (Date Filtering)**
```javascript
// Pattern: Single source of truth for dates
'>=rngStart' and '<=rngEnd'

// Benefits:
// - Change once, updates everywhere
// - Readable formulas
// - Easy to modify
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Issue 1: #REF! Errors on Init**
**Cause:** Named ranges not created before formulas reference them  
**Solution:** createNamedRanges() runs at end of initialization  
**Prevention:** Always flush() between dependent operations

### **Issue 2: Slow Performance with 5000+ Leads**
**Cause:** Unbounded ARRAYFORMULA (A2:A instead of A2:A5000)  
**Solution:** Bound all ARRAYFORMULA to A2:A5000  
**Prevention:** Always use bounded ranges

### **Issue 3: Date Range Not Updating**
**Cause:** Race condition - formulas calculate before dates set  
**Solution:** updateDateRange() with flush() + sleep()  
**Prevention:** Force recalculation on critical operations

### **Issue 4: Division by Zero Errors**
**Cause:** Calculating CAC/CPL when no leads/members exist  
**Solution:** Wrap in IF(denominator=0, "N/A", calculation)  
**Prevention:** Always check for zero before division

### **Issue 5: Duplicate Detection Not Working**
**Cause:** Comparing different data types (string vs number)  
**Solution:** Convert both to string and lowercase  
**Prevention:** Normalize values before comparison

---

## 🎯 BEST PRACTICES

### **Code Style:**
```javascript
// ✅ Good: Clear, documented
/**
 * Validates date chronology
 * @param {Sheet} sheet - Lead Data sheet
 * @param {number} row - Row being edited
 * @param {number} col - Column being edited
 * @returns {Object|null} Error object or null
 */
function validateDateChronology(sheet, row, col) {
  // Clear logic with comments
  // Early returns for efficiency
  // Comprehensive error handling
}

// ❌ Bad: Unclear, undocumented
function vdc(s,r,c){/*no comments*/}
```

### **Formula Generation:**
```javascript
// ✅ Good: Readable, testable
const formula = `=IF(B11=0,"No Members",` +
  `IFERROR(` +
    `SUMIFS(Marketing!C:C,Marketing!A:A,">="&Settings!B30)` +
    `/B11` +
  `,0))`;
sheet.getRange('B13').setFormula(formula);

// ❌ Bad: Unreadable one-liner
sheet.getRange('B13').setFormula('=IF(B11=0,"No Members",IFERROR(SUMIFS(Marketing!C:C,Marketing!A:A,">="&Settings!B30)/B11,0))');
```

### **Error Handling:**
```javascript
// ✅ Always use try-catch
try {
  // Complex operation
  const result = complexCalculation();
  return result;
} catch (error) {
  // User-friendly message
  SpreadsheetApp.getUi().alert('Error: ' + error.message);
  // Detailed logging
  Logger.log('Function error: ' + error.toString());
  Logger.log('Stack: ' + error.stack);
  // Graceful degradation
  return defaultValue;
}
```

### **Performance:**
```javascript
// ✅ Batch operations
const values = [];
for (let i = 0; i < 100; i++) {
  values.push(['Value ' + i]);
}
sheet.getRange(2, 1, values.length, 1).setValues(values);

// ❌ Individual operations (100x slower)
for (let i = 0; i < 100; i++) {
  sheet.getRange(i+2, 1).setValue('Value ' + i);
}
```

---

## 🚀 FUTURE DEVELOPMENT

### **When Adding New Features:**

1. **Check if it exists** - Review FUNCTION-INVENTORY.md
2. **Design before coding** - Sketch the UX and data flow
3. **Start with test** - Write test case first if possible
4. **Code incrementally** - Build in small, testable chunks
5. **Document as you go** - Update Help tab, CONTEXT.md
6. **Test thoroughly** - Manual testing + edge cases
7. **Get feedback** - User validation before finalizing

### **Refactoring Guidelines:**

1. **Add tests first** - Safety net before changes
2. **Refactor incrementally** - One function at a time
3. **Keep features working** - No breaking changes
4. **Measure performance** - Before/after benchmarks
5. **Document decisions** - Why this approach?

### **Technical Debt To Address:**

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 🔴 High | Add unit testing framework | 16h | Enables safe refactoring |
| 🔴 High | Extract TabBuilder class | 24h | 50% code reduction |
| 🟡 Medium | Formula builder pattern | 12h | Readability |
| 🟡 Medium | On-demand calculations | 12h | Performance |
| 🟢 Low | JSDoc documentation | 8h | Maintainability |

---

## 📚 RESOURCES

### **Google Apps Script Documentation:**
- [Spreadsheet Service](https://developers.google.com/apps-script/reference/spreadsheet)
- [UI Service](https://developers.google.com/apps-script/reference/base/ui)
- [Charts](https://developers.google.com/apps-script/reference/charts)

### **Project Files:**
- `Code.gs` - Main codebase (4,560 lines)
- `FUNCTION-INVENTORY.md` - All 54 functions documented
- `DEEP-COMPREHENSIVE-REVIEW.md` - Architecture analysis
- `STRATEGIC-SIMPLIFICATION-PLAN.md` - Refactoring plan (removes features)
- `CONTEXT.md` - This file

### **GHL Integration:**
- `GHL-WORKFLOW-GUIDE.md` - Setup instructions

---

## 🎓 KEY INSIGHTS

### **What Makes This Project Special:**

1. ⭐ **Comprehensive Validation** - Prevents bad data at source
2. ⭐ **User-Friendly UX** - Quick actions, wizards, clear error messages
3. ⭐ **Real-Time Dashboard** - One-page check, no navigation needed
4. ⭐ **Flexible Date Filtering** - 9 presets cover all use cases
5. ⭐ **GHL Integration** - Automatic lead capture with perfect attribution

### **What Needs Improvement:**

1. ⚠️ **Code Organization** - Too much repetition, needs DRY refactoring
2. ⚠️ **Testing** - Zero automated tests, all manual
3. ⚠️ **Performance** - Slow with 5000+ leads due to hidden tab recalc
4. ⚠️ **Complexity** - 4,560 lines is overwhelming for new devs
5. ⚠️ **Documentation** - Functions lack JSDoc, hard to understand

### **Lessons Learned:**

1. 💡 **Validation first** - Prevent errors > handle errors
2. 💡 **User experience matters** - Wizards and quick actions make adoption easier
3. 💡 **Test early** - Adding tests after 4,560 lines is hard
4. 💡 **Refactor regularly** - Don't let technical debt accumulate
5. 💡 **Measure performance** - What you don't measure, you can't improve

---

## 🤝 WORKING WITH THIS CODEBASE

### **For New Developers:**

**Day 1:** Read this CONTEXT.md  
**Day 2:** Read FUNCTION-INVENTORY.md  
**Day 3:** Deploy to test sheet, run initializeTemplate()  
**Day 4:** Explore each tab, understand data flow  
**Day 5:** Make small change, test thoroughly  
**Week 2:** Start on refactoring tasks

### **For AI Assistants:**

**Context Priority:**
1. CONTEXT.md (this file) - Overall understanding
2. FUNCTION-INVENTORY.md - What exists
3. Code.gs - Implementation details
4. DEEP-COMPREHENSIVE-REVIEW.md - Analysis and issues

**When Asked To:**
- **Add Feature:** Check FUNCTION-INVENTORY.md first (might exist!)
- **Fix Bug:** Review validation functions, check error handling patterns
- **Refactor:** See STRATEGIC-SIMPLIFICATION-PLAN.md for guidance
- **Optimize:** Focus on tab creation functions (44% of code)

### **For Maintainers:**

**Monthly:** Review open issues, check for performance regressions  
**Quarterly:** Refactor one major section (pick from technical debt list)  
**Yearly:** Major version review, consider architectural changes

---

## 📞 GETTING HELP

**Understanding the code:**
- Read this CONTEXT.md
- Check FUNCTION-INVENTORY.md for specific functions
- Review inline comments in Code.gs

**Making changes:**
- Follow BEST PRACTICES section
- Test thoroughly before deploying
- Update documentation

**Refactoring:**
- See STRATEGIC-SIMPLIFICATION-PLAN.md
- Start with high-impact, low-risk items
- Add tests before major changes

---

**END OF CONTEXT DOCUMENT**

*This document should be the first thing read by anyone working on this project*  
*Updated: October 7, 2025*  
*Next Update: After next major version*
