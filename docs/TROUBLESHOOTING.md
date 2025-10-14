# TROUBLESHOOTING GUIDE

**Common issues and systematic solutions**  
**Last Updated:** October 14, 2025

---

## 🔍 Quick Diagnosis

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| SOURCE ANALYSIS all $0 | Marketing Budget empty | Add data to Settings A40:E100 |
| #REF! in DASHBOARD | Tab missing/renamed | Check all tabs exist |
| Members tab empty | QUERY broken | Check Members A2 formula |
| Source column blank | H2 formula missing | Re-apply ARRAYFORMULA to Lead Data H2 |
| Date metrics wrong | Date range broken | Check Settings B30/B31 |
| LTV shows $0 | Source not in LTV table | Check _LTV Calculations N:T |
| Dropdowns not working | Validation range wrong | Check Settings dropdown ranges |
| Menu not appearing | Not authorized | Re-authorize in Apps Script |

---

## 🚨 CRITICAL ISSUES

### Issue 1: SOURCE ANALYSIS Columns All Show $0 or Blank

**Symptoms:**
- Spend column (G) shows $0
- CPL, CPA, CPS show blank or 0
- CAC shows blank or 0
- LTV shows $0
- LTV:CAC shows "-"

**Root Causes:**
1. Marketing Budget table is empty
2. Marketing Budget formula references wrong rows
3. Date range not set
4. LTV table missing source entries

**Diagnosis Steps:**
1. Go to Settings & Budget tab
2. Scroll to Marketing Budget section (row 40+)
3. Check if any data entered in columns A-E
4. Check Settings B30/B31 show valid dates
5. Go to _LTV Calculations, check N:T has source data

**Solution:**
```
IF Marketing Budget is empty:
1. Enter months in column A (format: YYYY-MM)
2. Enter source names in column B (from A14:A24)
3. Enter monthly budget in column C
4. Columns D-E auto-calculate

IF Budget has data but Spend still $0:
1. Run: Gym Ops → Validate & Auto-Fix
2. Check error messages
3. Verify formula in DASHBOARD G20
4. Verify date range in Settings B30/B31

IF LTV shows $0:
1. Check _LTV Calculations tab exists
2. Verify N:T range has source names and LTV values
3. Check source names match exactly (case-sensitive)
```

**Prevention:**
- Always fill Marketing Budget when tracking paid sources
- Keep source names consistent across all tabs
- Run Health Check after any structure changes

---

### Issue 2: #REF! Errors Everywhere

**Symptoms:**
- Multiple #REF! errors in DASHBOARD
- Formulas showing #REF! instead of values
- Cannot click on #REF! to see source

**Root Causes:**
1. Tab was renamed (e.g., "Settings & Budget" → "Settings")
2. Tab was deleted
3. Column was deleted from source tab
4. Sheet structure changed

**Diagnosis Steps:**
1. Check all required tabs exist:
   - Settings & Budget
   - Lead Data
   - Members
   - _LTV Calculations
   - _Metrics
   - DASHBOARD
2. Check tab names are EXACTLY correct (case-sensitive)
3. Check for extra spaces in tab names

**Solution:**
```
IF tab was renamed:
1. Rename it back to original name
2. OR update all formulas to new name (risky!)

IF tab was deleted:
1. Run: Gym Ops → Initialize Template V2
2. This recreates missing tabs
3. Re-enter any custom data

IF column was deleted:
1. Restore from backup
2. OR manually fix all affected formulas
```

**Prevention:**
- NEVER rename tabs
- NEVER delete tabs (hide if needed)
- NEVER delete columns (clear data instead)
- Always use backup before major changes

---

### Issue 3: Members Tab Empty or Shows #REF!

**Symptoms:**
- Members tab shows no data
- Members A2 shows #REF! error
- Members tab shows wrong data (includes cancelled)

**Root Causes:**
1. Members A2 QUERY formula broken
2. Lead Data columns S or X moved/deleted
3. Lead Data tab renamed

**Diagnosis Steps:**
1. Go to Members tab
2. Click cell A2
3. Check if formula exists
4. Check for #REF! in formula

**Solution:**
```
IF A2 is blank or has wrong formula:
1. Click Members A2
2. Enter this formula:
   =QUERY('Lead Data'!A:AH, "SELECT * WHERE S=TRUE AND X<>TRUE ORDER BY T DESC", 1)
3. Press Enter
4. Members should populate

IF formula has #REF!:
1. Check Lead Data tab exists
2. Check Lead Data has columns S and X
3. Check Lead Data has at least column AH
4. Run: Gym Ops → Validate & Auto-Fix
```

**Prevention:**
- Don't modify Members A2 formula
- Don't rename Lead Data tab
- Don't delete Lead Data columns S or X

---

## ⚠️ MEDIUM ISSUES

### Issue 4: Source Column (H) Not Auto-Populating

**Symptoms:**
- Lead Data column H shows "⚠️ Not Tracked" for all leads
- Or column H is completely blank

**Root Causes:**
1. H2 formula missing
2. _UTM Tracking tab empty
3. Formula not set as ARRAYFORMULA

**Solution:**
```
1. Go to Lead Data tab
2. Click cell H2
3. Delete any existing content
4. Enter this formula:
   =ARRAYFORMULA(IF(A2:A="","",IFERROR(INDEX('_UTM Tracking'!O:O, MATCH(A2:A, '_UTM Tracking'!A:A, 0)),"⚠️ Not Tracked")))
5. Press Enter
6. Column should populate down

IF still showing "⚠️ Not Tracked":
- This is normal if _UTM Tracking is empty
- Source must be entered manually
- Or use dropdown from Settings A14:A24
```

**Prevention:**
- Don't delete row 2 in Lead Data
- Don't clear H2 formula
- Run validation after initialization

---

### Issue 5: Trial End Dates Not Calculating

**Symptoms:**
- Lead Data column R (Trial End) shows blank
- Trial End not updating when Trial Start entered

**Root Causes:**
1. R2 formula missing
2. Settings B33 (Trial Length) empty
3. Trial Start (Q) not entered as date

**Solution:**
```
1. Check Settings & Budget B33 has a number (e.g., 14)
2. Go to Lead Data R2
3. Enter formula:
   =ARRAYFORMULA(IF(A2:A="","",IF(ISNUMBER(Q2:Q),DATEVALUE(Q2:Q)+'Settings & Budget'!B33,"")))
4. Press Enter

IF still not working:
- Check Trial Start column (Q) has actual dates
- Check dates are formatted as dates, not text
- Check Settings B33 is a number, not text
```

**Prevention:**
- Don't modify R2 formula
- Keep Settings B33 as a number
- Enter dates in proper date format

---

### Issue 6: Date Range Not Working

**Symptoms:**
- Settings B30/B31 show errors or blank
- Metrics don't change when DASHBOARD B2 changed
- All metrics show 0

**Root Causes:**
1. DASHBOARD B2 dropdown missing
2. Settings B30/B31 formulas broken
3. Circular reference

**Solution:**
```
1. Go to DASHBOARD B2
2. Check dropdown exists (click should show options)
3. Select "Last 30 Days"
4. Go to Settings & Budget
5. Check B30 and B31 show dates
6. If blank, check formulas in B30 and B31

TO FIX B30 Formula:
(See CELL-REFERENCE-MAP.md for complete formula)

TO FIX B31 Formula:
=IF(ISBLANK(DASHBOARD!B2),"",IF(DASHBOARD!B2="Custom Range", B29, TODAY()))
```

**Prevention:**
- Don't modify DASHBOARD B2 cell type
- Don't modify Settings B30/B31 formulas
- Always select a preset before using Custom Range

---

## 🟢 MINOR ISSUES

### Issue 7: Dropdowns Not Working

**Symptoms:**
- Lead Data dropdowns don't show options
- Can type anything into dropdown field
- Dropdown shows #REF!

**Solution:**
```
1. Go to Settings & Budget
2. Verify dropdown lists have data:
   - A14:A24 (Sources)
   - B14:B16 (Staff)
   - D14:D17 (Types)
   - E14:E19 (Cancel Reasons)
3. If missing, re-enter list items
4. Run: Gym Ops → Initialize Template V2
5. Re-apply dropdowns
```

---

### Issue 8: Menu Not Appearing

**Symptoms:**
- "Gym Ops" menu doesn't show in toolbar
- Menu disappeared after refresh

**Solution:**
```
1. Refresh the page (F5)
2. Wait 30 seconds for authorization
3. If still not appearing:
   a. Extensions → Apps Script
   b. Save the script (Ctrl+S)
   c. Close Apps Script
   d. Refresh Google Sheet
   e. Click any cell
   f. Menu should appear in ~30 seconds
```

---

### Issue 9: Performance Slow with Many Leads

**Symptoms:**
- Sheet takes long to load
- Formulas slow to calculate
- Typing has delay

**Solution:**
```
1. Run: Gym Ops → Optimize Performance
2. This enables caching
3. OR manually:
   a. Extensions → Apps Script
   b. Find PerformanceConfig
   c. Set ENABLE_CACHING: true
   d. Save
```

---

## 🔧 Systematic Debugging Approach

When encountering ANY issue:

### Step 1: Run Automated Tests
```
1. Gym Ops → Health Check
2. Gym Ops → Validate & Auto-Fix
3. Gym Ops → Quick Test
4. Note any failures
```

### Step 2: Check Documentation
```
1. Review ARCHITECTURE.md for dependencies
2. Check CELL-REFERENCE-MAP.md for affected cells
3. Review CHANGES.md for recent modifications
```

### Step 3: Verify Structure
```
1. All required tabs exist
2. Tab names are exact
3. Critical cells have formulas
4. Settings & Budget configured
```

### Step 4: Check Data
```
1. Marketing Budget has entries
2. Source lists populated
3. Date range set
4. LTV Calculations has data
```

### Step 5: Isolate Issue
```
1. Which tab shows the problem?
2. Which cell/formula is affected?
3. What changed recently?
4. Does it affect one row or all rows?
```

### Step 6: Fix and Test
```
1. Apply fix from this guide
2. Run Health Check
3. Test manually
4. Document in CHANGES.md
```

---

## 🆘 When All Else Fails

### Nuclear Option: Fresh Start

```
1. Backup current sheet (File → Make a copy)
2. Open Apps Script
3. Delete all code
4. Copy GYM-OPS-ULTRA-COMPLETE.gs
5. Paste into Apps Script
6. Save
7. Close Apps Script
8. Refresh sheet
9. Run: Gym Ops → Initialize Template V2
10. Re-enter data from backup
```

### Restore from Backup

```
1. Find latest backup file
2. Open Apps Script
3. Delete all code
4. Copy backup code
5. Paste
6. Save
7. Refresh sheet
```

---

## 📞 Support Resources

1. **ARCHITECTURE.md** - System structure and dependencies
2. **CELL-REFERENCE-MAP.md** - Complete cell documentation
3. **DEPLOY-CHECKLIST.md** - Pre-deployment validation
4. **TESTING-GUIDE.md** - How to test changes
5. **CHANGES.md** - Recent modifications log

---

## 🎯 Prevention Best Practices

1. **ALWAYS** run Health Check before making changes
2. **ALWAYS** backup before major changes
3. **NEVER** rename tabs
4. **NEVER** delete columns (clear data instead)
5. **NEVER** modify critical formulas without testing
6. **USE** CELL_REFS constants instead of hard-coding
7. **DOCUMENT** all changes in CHANGES.md
8. **TEST** in non-production sheet first (if available)
9. **FOLLOW** DEPLOY-CHECKLIST.md procedures
10. **VERIFY** with automated tests after every change

---

**Last Resort:** If you cannot solve the issue, restore from backup and try again with better documentation of steps taken.

