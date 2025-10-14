# ✅ INSTALLATION VERIFICATION CHECKLIST

**Purpose:** Verify your fresh installation is working correctly  
**Time:** 5 minutes  
**When to use:** After completing fresh install

---

## 📋 CRITICAL CHECKS (Must Pass)

### ✅ **1. Tabs Created**
```
Bottom of sheet should show these tabs:

VISIBLE TABS (6):
□ DASHBOARD
□ Lead Data  
□ Members
□ Import Members
□ LTV Analysis
□ Settings & Budget

To check hidden tabs:
□ Right-click any tab → Should NOT show "Unhide" option
□ (Hidden tabs are working if they exist silently)
```

**Status:** PASS ☐ / FAIL ☐

---

### ✅ **2. Gym Ops Menu**
```
Top menu bar should show "Gym Ops" menu

Click it - should show these items:
□ 🧙 Quick Start Wizard
□ 🚀 Full Setup (Init + Wizard)
□ ➕ Quick Add Lead
□ ⚙️ Initialize Template
□ 🔄 Refresh Dashboards
□ 💾 Create Backup Now
□ 🔄 Restore from Backup
□ 📥 Export Lead Data to CSV
□ 🔍 Run Health Check
□ 🔧 Fix DASHBOARD Formulas ← NEW!
□ 🔍 Setup Member Filters
□ 🧪 Add Sample Data
□ ❓ View Help

Total: 13 menu items
```

**Status:** PASS ☐ / FAIL ☐

---

### ✅ **3. DASHBOARD Target Column** (CRITICAL)

**This is the most important check!**

```
Go to DASHBOARD tab, check cells C10-C16:

C10 (Leads Target):        Should show NUMBER (e.g., 70)    □
C11 (Set Rate Target):     Should show % (e.g., 60.0%)      □
C12 (Show Rate Target):    Should show % (e.g., 70.0%)      □
C13 (Close Rate Target):   Should show % (e.g., 50.0%)      □
C14 (New Members Target):  Should show NUMBER (e.g., 20)    □
C15 (MRR Target):          Should show $ (e.g., $3,000)     □
C16 (CAC Target):          Should show $ (e.g., $150)       □

❌ If ANY show "Target" text instead of number:
   Run: Gym Ops → Fix DASHBOARD Formulas
   
❌ If fix doesn't work:
   See: FORMULA-FIXES-QUICK-REFERENCE.md
```

**Status:** PASS ☐ / FAIL ☐

---

### ✅ **4. No Formula Errors**

```
Scan DASHBOARD for these error codes:

D10-D16 (Goal To Date):   NO #VALUE! errors?   □
E10-E16 (Variance):       NO #VALUE! errors?   □
F10-F16 (Status):         NO #VALUE! errors?   □

All status cells show text like:
  - "BEHIND" or
  - "ON PACE" or  
  - "AHEAD"

NOT error codes like #VALUE!, #REF!, #NAME?
```

**Status:** PASS ☐ / FAIL ☐

---

### ✅ **5. Health Check Passes**

```
Run the automated health check:

1. Click: Gym Ops → Run Health Check
2. Wait for dialog
3. Should show: "✅ Health Check Passed"

If issues reported:
  - Read the issue messages
  - Follow suggested fixes
  - Re-run health check
```

**Status:** PASS ☐ / FAIL ☐

---

## 📊 FUNCTIONAL CHECKS (Should Work)

### ✅ **6. Named Ranges Created**
```
Check if named ranges were created:

1. Click: Data → Named ranges
2. Should see list including:
   □ Target_Leads
   □ Target_SetRate
   □ Target_ShowRate
   □ Target_CloseRate
   □ Target_NewMembers
   □ Target_MRR
   □ Target_CAC
   □ rngStart
   □ rngEnd
   □ MembershipTypes
   
Total: 12+ named ranges
```

**Status:** PASS ☐ / FAIL ☐

---

### ✅ **7. Date Range Dropdown**
```
Test the date range selector:

1. DASHBOARD tab, cell B2
2. Click the cell - dropdown should appear
3. Options should include:
   □ Last 7 Days
   □ Last 14 Days
   □ Last 30 Days
   □ Last 90 Days
   □ Last 6 Months
   □ Last 12 Months
   □ Quarter-to-Date
   □ Year-to-Date
   □ Custom Range
   
4. Select "Last 7 Days"
5. Cell B3 "Showing:" should update with new dates
6. Change back to "Last 30 Days"
```

**Status:** PASS ☐ / FAIL ☐

---

### ✅ **8. Sample Data (If Added)**
```
If you added sample data during wizard:

Go to Lead Data tab:
□ Should see 50 rows of data (rows 2-51)
□ Names like: John Smith, Sarah Johnson, etc.
□ Various sources (Paid Search, Organic, etc.)
□ Some checked boxes (Appt Set, Show, Converted)
□ Source column (H) auto-populated
□ Age column (AA) shows days
□ Lead Score (AB) shows 🔥/🟡/❄️

Go to DASHBOARD:
□ Metrics should show non-zero values
□ Charts should display data
```

**Status:** PASS ☐ / FAIL ☐ / N/A (no sample data) ☐

---

### ✅ **9. Charts Created**
```
Scroll to bottom of DASHBOARD tab:

Should see 7 charts:
□ Chart 1: Leads by Source Over Time (Area chart)
□ Chart 2: Funnel Conversion (Column chart)
□ Chart 3: Revenue Trends (Combo chart)
□ Chart 4: CAC by Source (Bar chart)
□ Chart 5: Monthly New Members vs Target (Combo chart)
□ Chart 6: Lead Volume by Day of Week (Column chart)
□ Chart 7: Source Performance Matrix (Bubble chart)

Charts may be empty if no data yet - that's OK
```

**Status:** PASS ☐ / FAIL ☐

---

### ✅ **10. Quick Add Lead Function**
```
Test the quick add feature:

1. Click: Gym Ops → ➕ Quick Add Lead
2. Dialog should open with form
3. Enter test data:
   - First Name: Test
   - Last Name: User
   - Phone: 555-TEST
   - Source: (select any)
4. Click: Add Lead
5. Should see: "Lead added successfully!"
6. Check Lead Data tab - new row should appear
7. Delete the test lead (right-click row → Delete)
```

**Status:** PASS ☐ / FAIL ☐

---

## 🔍 ADVANCED CHECKS (Nice to Have)

### ✅ **11. Auto-Calculations Working**
```
In Lead Data, check row 2 has formulas in:

Column H (Source):        Formula starts with =ARRAYFORMULA  □
Column P (Trial End):     Formula starts with =ARRAYFORMULA  □
Column Z (Current Status): Formula starts with =ARRAYFORMULA  □
Column AA (Age):          Formula starts with =ARRAYFORMULA  □
Column AB (Lead Score):   Formula starts with =ARRAYFORMULA  □
Column AC (Action Needed): Formula starts with =ARRAYFORMULA  □
Column AD (Duplicate?):   Formula starts with =ARRAYFORMULA  □
Column AE (Days to Convert): Formula starts with =ARRAYFORMULA  □

These should auto-fill down as you add leads
```

**Status:** PASS ☐ / FAIL ☐

---

### ✅ **12. Protections Applied**
```
Try to edit auto-calculated columns:

1. Lead Data, click cell H2 (Source column)
2. Try to type something
3. Should see: Warning about editing protected range
   (You can still edit, but you get warned)

Protected columns in Lead Data:
□ H (Source)
□ P (Trial End)  
□ Z (Current Status)
```

**Status:** PASS ☐ / FAIL ☐

---

### ✅ **13. Members Tab Filter**
```
Check Members tab:

1. Click: Members tab
2. Should show same columns as Lead Data
3. But ONLY shows rows where:
   - Converted? = TRUE
   - Cancelled? = FALSE
4. Should be filtered view (only active members)

If sample data added:
□ Shows ~15-20 members (subset of 50 leads)
```

**Status:** PASS ☐ / FAIL ☐

---

### ✅ **14. Settings Values Present**
```
Go to Settings & Budget tab

Check MONTHLY TARGETS section (rows 2-11):
□ B3 (Leads): Has number (e.g., 200)
□ B4 (Set Rate): Has decimal/% (e.g., 0.60 or 60%)
□ B5 (Show Rate): Has decimal/% (e.g., 0.70 or 70%)
□ B6 (Close Rate): Has decimal/% (e.g., 0.50 or 50%)
□ B7 (New Members): Has number (e.g., 42)
□ B8 (MRR): Has dollar amount (e.g., 4500)
□ B9 (CAC): Has dollar amount (e.g., 150)

NONE should be empty or show "Target" text
```

**Status:** PASS ☐ / FAIL ☐

---

### ✅ **15. LTV Analysis Tab**
```
Click: LTV Analysis tab

Should see sections:
□ "LTV by Source (All-Time Data)" table
□ "LTV by Package Type (All-Time Data)" table
□ "Monthly Churn Rate (Last 12 Months)" table
□ "Cohort Analysis - Monthly" table
□ "Cohort Analysis - Quarterly" table
□ Instructions at bottom

Tables may show zeros if no member data yet - that's expected
Should NOT show #REF! errors
```

**Status:** PASS ☐ / FAIL ☐

---

## 🎯 SCORING YOUR INSTALLATION

### **Critical Checks (1-5):**
Must ALL pass for working installation:
- [ ] All 5 critical checks passed

**If any critical check fails:**
→ Installation incomplete
→ Fix the issue before proceeding
→ See troubleshooting section below

### **Functional Checks (6-10):**
Should pass for full functionality:
- Passed: _____ / 5

**If 4-5 pass:** ✅ Good installation  
**If 2-3 pass:** ⚠️ Partial - fix remaining issues  
**If 0-1 pass:** ❌ Major issues - review installation steps  

### **Advanced Checks (11-15):**
Nice to have, but not critical:
- Passed: _____ / 5

**If all pass:** 🎉 Perfect installation!

---

## 🎯 OVERALL ASSESSMENT

```
Critical Checks:    _____ / 5  (Must be 5/5)
Functional Checks:  _____ / 5  (Should be 4+/5)
Advanced Checks:    _____ / 5  (Nice bonus)
────────────────────────────────────
TOTAL SCORE:        _____ / 15

15/15 = 🎉 Perfect installation
12-14 = ✅ Excellent - minor items to fix
9-11  = ⚠️ Good - address failed checks
6-8   = ⚠️ Needs work - review install steps
<6    = ❌ Major issues - reinstall recommended
```

---

## 🔧 COMMON ISSUES & FIXES

### Issue: "Target" text in C10-C16
**Fix:**
```
Run: Gym Ops → Fix DASHBOARD Formulas
Click: YES to confirm
Wait for "Fix Complete!" message
```

### Issue: #VALUE! errors in dashboard
**Fix:**
```
Usually caused by Target column issue above
Fix C10-C16 first, then D/E/F columns auto-fix
```

### Issue: Menu doesn't appear
**Fix:**
```
1. Reload sheet (F5)
2. Wait 10 seconds
3. Check Apps Script is saved
4. Check permissions granted
5. Try: Extensions → Apps Script → Run → onOpen
```

### Issue: Charts don't show
**Fix:**
```
1. Scroll to bottom of DASHBOARD (row 100+)
2. Charts may be there but empty (need data)
3. Add sample data: Gym Ops → Add Sample Data
4. Charts should populate
```

### Issue: Named ranges missing
**Fix:**
```
Run: Gym Ops → Initialize Template
Click: YES
This recreates named ranges
```

### Issue: LTV Analysis shows #REF!
**Fix:**
```
This indicates hidden tabs weren't created
Run: Gym Ops → Initialize Template
This recreates all helper tabs
```

### Issue: Sample data didn't add
**Fix:**
```
Run: Gym Ops → Add Sample Data (for testing)
Click: YES
50 leads will be added
```

---

## 🧪 TEST SCENARIOS

### **Test 1: Add a Lead**
```
1. Go to Lead Data tab
2. Click cell A2
3. Enter:
   - Lead ID: TEST-001
   - Created Date: Today
   - First Name: John
   - Last Name: Test
   - Phone: 555-0000
   - Source: (select from dropdown)
4. Press Enter/Tab to next row
5. Check:
   □ Source (H) auto-populates (or shows warning)
   □ Age (AA) calculates automatically
   □ Lead Score (AB) shows 🔥/🟡/❄️
   □ Current Status (Z) shows "Lead"
6. Delete test row when done
```

**Result:** PASS ☐ / FAIL ☐

---

### **Test 2: Mark Progress**
```
Using row with test lead (or sample data):

1. Check "Appt Set?" checkbox (column L)
   □ Appt Date (M) auto-fills with today
   
2. Check "Show?" checkbox (column N)
   □ Current Status (Z) changes to "Show"
   
3. Check "Converted?" checkbox (Q)
   □ Member Start (R) auto-fills
   □ Current Status (Z) changes to "Member"
   
4. Uncheck all boxes (return to original state)
```

**Result:** PASS ☐ / FAIL ☐

---

### **Test 3: Date Range Changes**
```
On DASHBOARD:

1. Note current value of B10 (Leads count)
2. Click B2 (Date Range dropdown)
3. Change to "Last 7 Days"
4. Cell B3 should update with new date range
5. B10 (Leads) value may change (fewer days)
6. Change back to "Last 30 Days"
7. B10 should return to original value
```

**Result:** PASS ☐ / FAIL ☐

---

### **Test 4: Health Check**
```
1. Click: Gym Ops → Run Health Check
2. Wait for dialog (may take 5-10 seconds)
3. Should show one of:
   □ "✅ Health Check Passed" (ideal)
   □ OR list of issues with fix instructions

If issues reported:
  - Note what they are
  - Follow suggested fixes
  - Re-run health check
  - Should pass after fixes applied
```

**Result:** PASS ☐ / FAIL ☐

---

### **Test 5: Formula Auto-Fix**
```
Test the self-healing feature:

1. Go to DASHBOARD
2. Click C10
3. In formula bar, change B3 to B2 (intentionally break it)
4. Press Enter
5. C10 should now show "Target" (broken)
6. Close the Google Sheet tab completely
7. Reopen the sheet (fresh page load)
8. Wait for sheet to load
9. Check C10:
   □ Should show number again (auto-fixed!)
   □ Should see toast: "Auto-fixed X formulas"
10. Click C10, formula bar should show B3 (corrected)
```

**Result:** PASS ☐ / FAIL ☐

---

## 📈 PERFORMANCE CHECKS

### ✅ **P1. Sheet Loads Quickly**
```
□ Sheet opens in < 10 seconds
□ No excessive "Loading..." messages
□ Formulas calculate promptly
```

### ✅ **P2. Scrolling is Smooth**
```
□ Can scroll DASHBOARD smoothly
□ Can scroll Lead Data without lag
□ Charts render without delay
```

### ✅ **P3. Apps Script Responds**
```
□ Menu items respond immediately when clicked
□ Dialogs open within 1-2 seconds
□ Functions complete in reasonable time (<30 sec)
```

**Performance Score:** _____ / 3

---

## 🎯 FINAL VERIFICATION

### **Installation Quality:**

```
Critical Checks (5):      _____ / 5  ← Must be 5/5
Functional Checks (10):   _____ / 10 ← Should be 8+/10
Test Scenarios (5):       _____ / 5  ← Should be 4+/5
Performance (3):          _____ / 3  ← Should be 2+/3
─────────────────────────────────────
TOTAL:                    _____ / 23

23/23 = 🏆 Perfect installation!
20-22 = ✅ Excellent
15-19 = ✅ Good - minor fixes needed
10-14 = ⚠️ Functional - address issues
<10   = ❌ Needs attention - review install
```

---

## ✅ SIGN-OFF

### **Installation Completed By:**
- Name: _______________________
- Date: _______________________
- Time Taken: _________ minutes

### **Installation Quality:**
- Critical Checks: _____ / 5
- Overall Score: _____ / 23
- Status: ☐ PASS / ☐ FAIL

### **Issues Encountered:**
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

### **Fixes Applied:**
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

### **Ready for Production Use?**
☐ YES - All critical checks passed  
☐ NO - Issues remain (document above)  
☐ PARTIAL - Working but with minor issues  

---

## 📞 IF VERIFICATION FAILS

### **Critical Check Failed?**

**Stop and fix immediately:**
1. Document which check failed
2. Review the fix instructions for that check
3. Apply the fix
4. Re-run the verification
5. Don't proceed until critical checks pass

### **Multiple Failures?**

**Consider reinstalling:**
```
1. File → Make a copy (backup current attempt)
2. Start fresh with new blank sheet
3. Follow FRESH-INSTALL-GUIDE.md carefully
4. Double-check each step
5. Verify as you go (not just at end)
```

### **Still Having Issues?**

**Review these docs:**
- FRESH-INSTALL-GUIDE.md (detailed install steps)
- TROUBLESHOOTING section in each guide
- Apps Script logs (Extensions → Apps Script → View → Logs)
- FORMULA-AUDIT-REPORT.md (if formula errors)

---

## 🎉 SUCCESSFUL VERIFICATION

### **If All Critical Checks Passed:**

**Congratulations! Your installation is complete and verified.**

**You now have:**
- ✅ Fully functional Gym Ops Tracker
- ✅ Self-healing formulas
- ✅ Automated backups
- ✅ Health monitoring
- ✅ Ready for production use

**Next Steps:**
1. Remove sample data (if you want)
2. Start entering real leads
3. Train your team on usage
4. Set up GHL integration (optional)
5. Start making data-driven decisions!

---

## 📊 VERIFICATION HISTORY

**Keep a log of verifications:**

| Date | Verifier | Score | Status | Notes |
|------|----------|-------|--------|-------|
| _______ | _______ | __/23 | ______ | _____________ |
| _______ | _______ | __/23 | ______ | _____________ |
| _______ | _______ | __/23 | ______ | _____________ |

**Recommended:** Re-verify after major changes or updates

---

*Installation Verification Checklist v1.0*  
*Created: October 8, 2025*  
*Use after fresh installation*  
*Ensures all features working correctly*

**✅ VERIFY BEFORE GOING LIVE!**

