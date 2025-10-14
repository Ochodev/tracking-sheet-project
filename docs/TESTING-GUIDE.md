# TESTING GUIDE

**How to validate changes before deployment**  
**Last Updated:** October 14, 2025

---

## 🎯 Testing Philosophy

**Test BEFORE deploying, not after**

Every change should pass:
1. ✅ Automated tests
2. ✅ Manual verification
3. ✅ Impact analysis

**Rule:** If you skip testing, you WILL break production.

---

## 🤖 Automated Testing

### Test Suite Overview

The system includes 3 automated test functions accessible from the "Gym Ops" menu:

| Test | Purpose | When to Run |
|------|---------|-------------|
| **Health Check** | Quick validation of critical systems | Before AND after ANY change |
| **Validate & Auto-Fix** | Comprehensive validation with auto-repair | After initialization or major changes |
| **Quick Test** | Foundation checks (classes, tabs, config) | When troubleshooting or verifying install |

### Running Automated Tests

#### 1. Health Check

**Menu:** Gym Ops → Health Check

**What it checks:**
- All required tabs exist
- No #REF! errors in DASHBOARD
- Basic system operational

**Expected Output:**
```
✅ HEALTH CHECK PASSED!

No issues found.
All systems operational.
```

**If Failed:**
- Note which tab/test failed
- Check TROUBLESHOOTING.md
- Fix issue
- Re-run until pass

#### 2. Validate & Auto-Fix

**Menu:** Gym Ops → Validate & Auto-Fix

**What it checks:**
- Lead Data tab formulas (H2, R2, AB2)
- Members tab QUERY (A2)
- DASHBOARD formulas (B10, B16, A20, G20)
- Settings & Budget structure

**What it auto-fixes:**
- Missing Source formula (Lead Data H2)
- Missing Members QUERY (Members A2)

**Expected Output:**
```
🔍 VALIDATION RESULTS

Total Tests: 15
✅ Passed: 15
❌ Failed: 0

✅ All validation checks passed!
Sheet is fully functional.
```

**If Shows Auto-Fixed:**
- Check what was fixed
- Verify fixes are correct
- Document in CHANGES.md

**If Shows Failures:**
- Review failure details
- Fix manually
- Re-run validation

#### 3. Quick Test

**Menu:** Gym Ops → Quick Test

**What it checks:**
- TabBuilder class working
- FormulaBuilder working
- Required tabs exist
- Settings configured
- DASHBOARD features present
- LTV Analysis wired
- Lead Data dropdowns configured

**Expected Output:**
```
🧪 QUICK TEST RESULTS

✅ TabBuilder class working
✅ FormulaBuilder working
✅ DASHBOARD exists
✅ Lead Data exists
✅ Members exists
✅ Settings & Budget exists
✅ LTV Analysis exists
✅ _LTV Calculations exists
✅ Caching enabled
✅ Settings configured (Trial: 14 days)
✅ Date range system connected
✅ Marketing Budget section exists
✅ DASHBOARD date range working
✅ Source Analysis exists
✅ LTV Analysis wired
✅ Lead Data dropdowns configured

✅ All tests passed! Ready to use!
```

**If Shows Warnings (⚠️):**
- Usually not critical
- Note for future improvement
- Continue if basic functionality works

---

## 👤 Manual Testing

Automated tests don't catch everything. Always manually verify:

### Critical Path Testing

#### Test 1: DASHBOARD Metrics

**Steps:**
1. Open DASHBOARD tab
2. Check date range dropdown (B2) shows options
3. Select "Last 30 Days"
4. Verify all metrics show values (not 0 or blank):
   - Hot Leads (B5)
   - Active MRR (B6)
   - Leads (B10)
   - Set % (B11)
   - Show % (B12)
   - Close % (B13)
   - New Members (B14)
   - MRR (B15)
   - CAC (B16)

**Expected:** All cells show numbers or percentages

**If Failed:** Check Settings B30/B31 have dates

#### Test 2: SOURCE ANALYSIS Section

**Steps:**
1. Scroll to SOURCE ANALYSIS (row 18-30)
2. Check Source List (A20:A30) shows sources
3. Check all columns have values:
   - Leads (B) - numbers
   - Appts (C) - numbers
   - Showed (D) - numbers
   - Show Rate (E) - percentages
   - Close Rate (F) - percentages
   - Spend (G) - dollar amounts or $0
   - CPL (H) - dollar amounts, "Organic", or "-"
   - CPA (I) - dollar amounts, "Organic", or "-"
   - CPS (J) - dollar amounts, "Organic", or "-"
   - CAC (K) - dollar amounts, "Organic", or "-"
   - LTV (L) - dollar amounts or $0
   - LTV:CAC (M) - ratios like "3.5x" or "-"

**Expected:** 
- All columns populated
- No #REF! or #ERROR!
- Values are reasonable (not crazy high/low)

**If Failed:** 
- Spend shows $0 → Check Marketing Budget (Settings A40:E100)
- LTV shows $0 → Check _LTV Calculations N:T

#### Test 3: Lead Data Auto-Calculations

**Steps:**
1. Go to Lead Data tab
2. Add a test row:
   - Lead ID: TEST-001
   - Created Date: Today
   - First Name: Test
   - Last Name: User
   - Phone: 555-1234
3. Check auto-calculated columns:
   - Source (H) - Should show "⚠️ Not Tracked" or a source
   - Current Status (AB) - Should show "Lead"
   - Age (AC) - Should show "🆕 0" or similar
   - Lead Score (AD) - Should show "❄️ COLD" or similar
   - Action Needed (AE) - Should show text
   - Duplicate? (AF) - Should show "✓"

**Expected:** All auto-calculated columns populate

**If Failed:** Check H2, R2, AB2 have ARRAYFORMULA

#### Test 4: Members Tab

**Steps:**
1. Go to Lead Data
2. Find or create a lead
3. Check "Converted?" checkbox (S)
4. Enter Member Start date (T)
5. Go to Members tab
6. Verify lead appears in Members tab
7. Check summary counts (K4, K5) update

**Expected:** 
- Converted lead appears in Members
- Cancelled leads do NOT appear
- Summary accurate

**If Failed:** Check Members A2 has QUERY formula

#### Test 5: Dropdowns

**Steps:**
1. Go to Lead Data
2. Click any cell in Source column (H)
3. Should see dropdown arrow
4. Click arrow, verify sources appear
5. Repeat for:
   - Staff Owner (J)
   - Membership Type (U)
   - Cancel Reason (Z)

**Expected:** All dropdowns show options

**If Failed:** Check Settings & Budget lists (A14:A24, etc.)

#### Test 6: Date Range System

**Steps:**
1. Go to DASHBOARD
2. Note current metrics (B10-B16)
3. Change B2 dropdown to "Last 7 Days"
4. Wait 2 seconds
5. Verify metrics update
6. Change to "Last 90 Days"
7. Verify metrics change again

**Expected:** Metrics recalculate when date range changes

**If Failed:** Check Settings B30/B31 formulas

---

## 🔬 Advanced Testing

### Stress Testing

**Test:** Can system handle large data?

**Steps:**
1. Run: Gym Ops → Add 20 Sample Leads
2. Verify all formulas still work
3. Check performance is acceptable
4. Delete sample leads when done

### Edge Case Testing

**Test:** How system handles unusual inputs

**Scenarios:**
1. Empty Marketing Budget → Spend should show $0
2. Source not in _LTV Calculations → LTV should show $0
3. Zero leads in date range → Metrics should show 0
4. Date range with no data → Should show blank or 0, not #DIV/0!

### Formula Testing

**Test:** Complex formulas work correctly

**How to test G20 (Spend formula):**
```
1. Enter test data in Marketing Budget:
   - Month: 2025-10 (column A)
   - Source: Paid Social (column B)
   - Monthly Budget: $3000 (column C)
   - Days and Daily Rate will auto-calculate

2. Set date range to October 2025

3. Check DASHBOARD G20 for "Paid Social" row

4. Expected: Should show ~$3000 (or pro-rated if partial month)

5. Change date range to September 2025

6. Expected: Should show $0 for October budget
```

---

## 📋 Test Checklist

Use this checklist for every deployment:

### Pre-Deployment Tests

- [ ] Run: Gym Ops → Health Check (PASS)
- [ ] Run: Gym Ops → Validate & Auto-Fix (PASS, 0 failures)
- [ ] Run: Gym Ops → Quick Test (PASS)
- [ ] Manual: DASHBOARD metrics all show values
- [ ] Manual: SOURCE ANALYSIS all columns populated
- [ ] Manual: Members tab shows active members
- [ ] Manual: Lead Data auto-columns work
- [ ] Manual: Dropdowns function
- [ ] Manual: Date range changes metrics
- [ ] No #REF! errors visible
- [ ] No #ERROR! messages visible
- [ ] No #DIV/0! errors visible

### Post-Deployment Tests

- [ ] Wait 5 minutes after deployment
- [ ] Re-run all pre-deployment tests
- [ ] Add test lead, verify auto-calculations
- [ ] Convert test lead, verify Members tab
- [ ] Cancel test lead, verify removal from Members
- [ ] Delete test lead
- [ ] Verify with 1-2 real users

---

## 🐛 Regression Testing

**When:** After ANY code change

**What:** Verify change didn't break unrelated features

**How:**
1. Document what you changed
2. List potentially affected features
3. Test each affected feature manually
4. Test 2-3 unrelated features (spot check)
5. Run full automated test suite

**Example:**
```
Changed: Spend formula (DASHBOARD G20)

Potentially Affected:
- CPL (H20) ✓ Test
- CPA (I20) ✓ Test
- CPS (J20) ✓ Test
- CAC (K20) ✓ Test
- LTV:CAC (M20) ✓ Test

Unrelated Spot Checks:
- Members tab ✓ Test
- Lead Data dropdowns ✓ Test
- Date range ✓ Test
```

---

## 📊 Test Result Documentation

After testing, document results:

### Test Log Template

```markdown
## Test Session: [Date] [Time]

### Change Tested
- File: [filename]
- Lines: [line numbers]
- Description: [what changed]

### Automated Tests
- Health Check: [PASS/FAIL]
- Validate & Auto-Fix: [PASS/FAIL - X failures]
- Quick Test: [PASS/FAIL]

### Manual Tests
- DASHBOARD metrics: [PASS/FAIL]
- SOURCE ANALYSIS: [PASS/FAIL]
- Members tab: [PASS/FAIL]
- Lead Data auto-calc: [PASS/FAIL]
- Dropdowns: [PASS/FAIL]
- Date range: [PASS/FAIL]

### Issues Found
[List any issues discovered]

### Fixes Applied
[List fixes implemented]

### Re-test Results
[Results after fixes]

### Approval
- [ ] All tests pass
- [ ] Ready for deployment
- [ ] Documented in CHANGES.md
```

---

## 🎯 Test Coverage Goals

Aim for:
- ✅ 100% of critical paths tested
- ✅ 80%+ of features tested
- ✅ All automated tests passing
- ✅ Zero #REF! or #ERROR! in production

**Critical Paths:**
1. Lead entry → Auto-calculations
2. Lead conversion → Members tab
3. Date range → Metrics update
4. Marketing Budget → Spend calculation
5. Source tracking → SOURCE ANALYSIS

---

## 🚀 Performance Testing

### Load Time Test

**Acceptable:** Sheet loads in < 10 seconds

**Test:**
1. Close Google Sheets completely
2. Reopen sheet
3. Time from click to fully loaded
4. Should be < 10 seconds

**If Slow:**
- Run: Gym Ops → Optimize Performance
- Check lead count (if > 10,000, expect slower)
- Consider archiving old data

### Formula Calc Test

**Acceptable:** Formulas recalculate in < 5 seconds

**Test:**
1. Change DASHBOARD B2 date range
2. Watch for gray "Calculating..." indicator
3. Time until calculations complete
4. Should be < 5 seconds

**If Slow:**
- Check for circular references
- Simplify complex formulas
- Consider caching

---

## 📞 When Tests Fail

1. **Don't panic** - Failures are opportunities to fix bugs
2. **Document failure** - Note exactly what failed
3. **Check TROUBLESHOOTING.md** - May have solution
4. **Isolate issue** - Which test? Which feature?
5. **Fix systematically** - One issue at a time
6. **Re-test completely** - Don't assume fix works
7. **Document in CHANGES.md** - What broke and how you fixed it

---

## ✅ Definition of "Ready to Deploy"

Code is ready when:
- ✅ All automated tests pass
- ✅ All manual tests pass
- ✅ Regression tests pass
- ✅ Performance acceptable
- ✅ No #REF! or #ERROR! messages
- ✅ Documented in CHANGES.md
- ✅ Backup created
- ✅ Rollback plan documented

**If ANY test fails, DO NOT DEPLOY.**

---

**See also:** DEPLOY-CHECKLIST.md, TROUBLESHOOTING.md, CHANGES.md

