# 🔍 COMPLETE CODE AUDIT REPORT
## Gym Ops Tracker v2.1-beta - Pre-Refactoring Analysis

**Date:** October 9, 2025  
**Purpose:** Document all formulas, identify bugs, establish refactoring baseline  
**Status:** 🚨 **CRITICAL BUGS FOUND**

---

## 🐛 **CRITICAL BUGS IDENTIFIED**

### **BUG #1: LTV Analysis Tab Not Populating** 🔴 CRITICAL

**Location:** `Code.gs` lines 2381, 2385, 2389, 2393, 2397  
**Root Cause:** Using `setValue()` instead of `setFormula()` for QUERY formulas

**Current Code (BROKEN):**
```javascript
sheet.getRange('A4').setValue('=QUERY(\'_LTV Calculations\'!N2:U11, "SELECT * WHERE Col1 IS NOT NULL ORDER BY Col7 DESC", 1)');
```

**Issue:** `setValue()` treats the string as literal text, not as a formula. The cell displays the text `=QUERY(...)` instead of executing the query.

**Fix Required:**
```javascript
sheet.getRange('A4').setFormula('=QUERY(\'_LTV Calculations\'!N2:U11, "SELECT * WHERE Col1 IS NOT NULL ORDER BY Col7 DESC", 1)');
```

**Impact:** 
- LTV by Source section: NOT WORKING ❌
- LTV by Package section: NOT WORKING ❌
- Monthly Churn Rate: NOT WORKING ❌
- Cohort Analysis Monthly: NOT WORKING ❌
- Cohort Analysis Quarterly: NOT WORKING ❌

**All 5 sections** of LTV Analysis tab are broken due to this bug.

---

### **BUG #2: Column Mismatch Issues** 🟠 HIGH

**Location:** Multiple tabs referencing Lead Data columns  
**Root Cause:** Recent addition of "Trial Start Date" column (Q) shifted all subsequent columns

**Affected Formulas:**

#### **_LTV Calculations Tab Issues:**
Lines 2683-2702 reference old column letters that need verification:
- `'Lead Data'!T:T` - Should this be Member Start (T) or has it shifted?
- `'Lead Data'!S:S` - Converted checkbox location needs verification
- `'Lead Data'!Y:Y` - Cancel Date needs verification
- `'Lead Data'!X:X` - Cancelled checkbox needs verification

#### **_Chart Data Tab Issues:**
Multiple formulas may reference wrong columns after the Trial Start Date addition.

#### **_Data Tab Issues:**
Line 2764 references:
```javascript
'Lead Data'!T:T  // Member Start
'Lead Data'!S:S  // Converted
'Lead Data'!Y:Y  // Cancel Date
'Lead Data'!X:X  // Cancelled
```

**Current Column Layout (from constants.gs):**
```
P: Trial Start (checkbox)
Q: Trial Start Date (NEW!)
R: Trial End (auto-calculated)
S: Converted (checkbox)
T: Member Start
U: Membership Type
V: MRR
W: Upfront Fee
X: Cancelled (checkbox)
Y: Cancel Date
Z: Cancel Reason
AA: Notes
AB: Current Status
```

**Verification Needed:** All formulas using columns after P need to be checked for correctness.

---

### **BUG #3: Marketing Data Initialization Issues** 🟡 MEDIUM

**Location:** Setup Wizard and initialization  
**Reported Issue:** "Marketing data issues on initializing template"

**Potential Causes:**
1. **Marketing Budget Format Issues** - Month format validation
2. **Daily Spend Calculation** - May fail on first init
3. **CAC Formula Complexity** - Could error on empty data

**Investigation Required:**
- Review `createMarketingTab()` function
- Check `generateDailySpend()` function
- Validate CAC formulas handle empty marketing data

---

## 📊 **FORMULA INVENTORY BY TAB**

### **1. DASHBOARD Tab** (Line 920-1270)

#### **Date Range System:**
- **B2:** Date range dropdown (data validation from list)
- **B3:** Display formula: `='Settings & Budget'!B30 to !B31`

#### **Today's Snapshot (Rows 4-6):**
- **B5:** Hot Leads count: `=COUNTIFS('Lead Data'!AB:AB,"🔥 HOT",'Lead Data'!Q:Q,FALSE,'Lead Data'!V:V,FALSE)`
  - 🚨 **ISSUE:** Q is now Trial Start Date, should be S (Converted checkbox)
- **D5:** Action items count (complex LET/BYROW formula)
- **F5:** Trials expiring: `=COUNTIFS('Lead Data'!P:P,">="&TODAY(),'Lead Data'!P:P,"<="&TODAY()+3,'Lead Data'!Q:Q,FALSE,'Lead Data'!O:O,"<>")`
  - 🚨 **ISSUE:** Multiple column reference problems
- **B6:** Active MRR: `=SUMIFS('Lead Data'!T:T,'Lead Data'!Q:Q,TRUE,'Lead Data'!V:V,FALSE)`
  - 🚨 **ISSUE:** Q should be S (Converted), V should be X (Cancelled)
- **D6:** LTV:CAC Health indicator
- **F6:** New members (30d)

#### **Key Metrics (Rows 10-16):**
- **B10:** Total Leads: `=COUNTIFS('Lead Data'!B:B,">="&'Settings & Budget'!B30,'Lead Data'!B:B,"<="&'Settings & Budget'!B31)` ✅
- **B11:** Set %: Division formula ✅
- **B12:** Show %: Division formula ✅
- **B13:** Close %: Division formula ✅
- **B14:** New Members: `=COUNTIFS('Lead Data'!S:S,">="&...,'Lead Data'!R:R,TRUE,'Lead Data'!V:V,FALSE)`
  - 🚨 **ISSUE:** S should be T (Member Start), R should be S (Converted), V should be X (Cancelled)
- **B15:** MRR: `=SUMIFS('Lead Data'!T:T,'Lead Data'!R:R,TRUE,'Lead Data'!V:V,FALSE)`
  - 🚨 **ISSUE:** T is correct but R should be S, V should be X
- **B16:** CAC: Complex LET formula with daily spend calculation ⚠️ Needs review

#### **Target Column (C10-C16):** ✅ FIXED (Oct 8)
- References Settings B3-B9 correctly

#### **Action Items (Rows 19-50+):**
- Multiple FILTER formulas referencing Lead Data columns
- 🚨 **LIKELY BROKEN:** Column references need verification after Trial Start Date addition

---

### **2. Lead Data Tab** (Line 1272-1528)

#### **Structure:**
- 33 columns (A-AH)
- Headers in row 1
- Data starts row 2

#### **Auto-Calculated Columns:**
- **R (Trial End):** `=ARRAYFORMULA(IF(Q2:Q="",,Q2:Q+Settings!$B$21))` ✅
- **AB (Current Status):** Complex ARRAYFORMULA with nested IFs
- **AC (Age Days):** `=ARRAYFORMULA(IF(A2:A="","",TODAY()-B2:B))` ✅
- **AD (Lead Score):** Complex scoring formula
- **AE (Action Needed):** Status-based logic
- **AF (Duplicate Flag):** Duplicate detection formula
- **AG (Days to Convert):** `=ARRAYFORMULA(IF(A2:A="",,IF(T2:T="","",T2:T-B2:B)))` ✅
- **AH (Last Touchpoint):** Auto-updated by onEdit

---

### **3. Members Tab** (Line 1529-1541)

**Single Formula:**
```javascript
=FILTER('Lead Data'!A:AH,('Lead Data'!S:S=TRUE)*('Lead Data'!X:X<>TRUE))
```
🚨 **ISSUE:** S should remain S (Converted), but X should be checked (was X before, now still X)

Actually, looking at constants.gs:
- S (19): Converted ✅
- X (24): Cancelled ✅

**Correction:** This formula might actually be correct. Need to verify against actual column numbers.

---

### **4. Settings & Budget Tab** (Line 1542-1750)

#### **Targets (B3-B9):**
- Default values set via `setValue()`
- No formulas, just static values

#### **Dropdowns:**
- Sources: A14:A24
- Staff: B14:B23
- Location: C14
- Membership Types: D14:D23
- Cancel Reasons: E14:E19
- Status Values: G14:G19

#### **Date Range:**
- B30: Start Date (formula based on dropdown)
- B31: End Date (formula based on dropdown)

---

### **5. Marketing Tab** (Line 1751-1762)

#### **Structure:**
- Column A: Month (YYYY-MM format)
- Column B: Source
- Column C: Spend Amount
- Column D: Days in Month (formula)
- Column E: Daily Rate (formula)

#### **Formulas:**
- **D (Days):** `=DAY(EOMONTH(DATE(LEFT(A,4),RIGHT(A,2),1),0))`
- **E (Rate):** `=C/D`

---

### **6. _LTV Calculations Tab** (Line 2683+)

**Complex formulas for:**
- LTV by Source (N2:U11)
- LTV by Package (W2:AD6)
- Monthly Churn (A15:D27)
- Cohort Monthly (F15:K27)
- Cohort Quarterly (M15:R23)

🚨 **ISSUE:** Many formulas reference Lead Data columns - need full verification

---

### **7. _Chart Data Tab** (Line 2457-2578)

**7 sections of aggregated data:**
1. Active Members Trend (90 days)
2. Funnel Conversion
3. Lead Sources Distribution
4. Monthly Revenue Trend (12 months)
5. Monthly New Members vs Target
6. Lead Volume by Day of Week
7. Source Performance Matrix

🚨 **ISSUE:** Multiple formulas reference Lead Data columns that may have shifted

---

### **8. _Data Tab** (Line 2753-2768)

**Formula (Line 2764):**
```javascript
=COUNTIFS('Lead Data'!T:T,"<="&A${row},'Lead Data'!S:S,TRUE)-COUNTIFS('Lead Data'!Y:Y,"<="&A${row},'Lead Data'!X:X,TRUE)
```

Referencing:
- T: Member Start (column 20) ✅
- S: Converted (column 19) ✅  
- Y: Cancel Date (column 25) ✅
- X: Cancelled (column 24) ✅

**This looks correct!**

---

## 🎯 **COLUMN VERIFICATION MATRIX**

Based on `constants.gs` (the source of truth):

| Column | Letter | Name | Formulas Reference As |
|--------|--------|------|----------------------|
| 16 | P | Trial Start (checkbox) | P:P ✅ |
| 17 | Q | Trial Start Date | Q:Q ✅ |
| 18 | R | Trial End | R:R ✅ |
| 19 | S | Converted (checkbox) | S:S ✅ |
| 20 | T | Member Start | T:T ✅ |
| 21 | U | Membership Type | U:U ✅ |
| 22 | V | MRR | V:V ✅ |
| 23 | W | Upfront Fee | W:W ✅ |
| 24 | X | Cancelled (checkbox) | X:X ✅ |
| 25 | Y | Cancel Date | Y:Y ✅ |
| 26 | Z | Cancel Reason | Z:Z ✅ |
| 27 | AA | Notes | AA:AA ✅ |
| 28 | AB | Current Status | AB:AB ✅ |

**Key Issue:** The DASHBOARD formulas reference `Q:Q` for "Converted" but Q is now "Trial Start Date". This is the column mismatch problem!

---

## 🔧 **FIXES REQUIRED**

### **Priority 1: Critical Bugs** 🔴

1. **Fix LTV Analysis QUERY formulas** - Change `setValue()` to `setFormula()`
   - Lines: 2381, 2385, 2389, 2393, 2397
   - Impact: Restores all 5 sections of LTV Analysis

2. **Fix DASHBOARD column references** - Update after Trial Start Date addition
   - Hot Leads formula (B5)
   - Trials Expiring formula (F5)
   - Active MRR formula (B6)
   - New Members formula (B14)
   - MRR formula (B15)
   - Multiple action item formulas

### **Priority 2: High Impact** 🟠

3. **Verify and fix _Chart Data formulas**
   - All 7 sections may have column mismatches

4. **Verify and fix _LTV Calculations formulas**
   - Complex formulas with many column references

5. **Fix Members tab filter**
   - Verify column references are correct

### **Priority 3: Validation** 🟡

6. **Marketing initialization**
   - Test with empty marketing data
   - Validate CAC formulas handle zero cases
   - Check daily spend generation

7. **Create test harness**
   - Validate all formulas produce expected results
   - Check with sample data

---

## 📋 **NEXT STEPS**

1. ✅ **Complete this audit** - DONE
2. **Create column reference fix script** - Map old → new
3. **Fix LTV Analysis setValue bug** - 5 line changes
4. **Fix all DASHBOARD column references** - ~15 formulas
5. **Fix all _Chart Data column references** - ~20 formulas
6. **Fix all _LTV Calculations column references** - ~30 formulas
7. **Test with sample data** - Verify all fixes
8. **Create test harness** - Prevent future regressions

---

## 🎯 **REFACTORING STRATEGY**

Given these bugs, here's the optimal approach:

### **Phase 1: Fix Critical Bugs First** (Do Now)
1. Fix LTV Analysis setValue → setFormula
2. Fix all column mismatches (comprehensive sweep)
3. Validate with test data
4. Document fixes

### **Phase 2: Create Test Harness** (Do Next)
1. Sample data generator
2. Formula output validator
3. Column reference checker
4. Automated regression tests

### **Phase 3: Refactor Architecture** (Do After Fixes)
1. Extract common patterns
2. Build TabBuilder class
3. Refactor one tab at a time
4. Test after each change

---

## 💡 **KEY INSIGHTS**

### **Why These Bugs Exist:**

1. **LTV Analysis Bug:** Likely copy/paste error. `setValue()` vs `setFormula()` is subtle.

2. **Column Mismatch Bug:** Adding the Trial Start Date column (Q) shifted everything after it, but formulas weren't comprehensively updated. The fix on Oct 8 only addressed DASHBOARD Target formulas, not all affected formulas.

3. **Inconsistent Column References:** Some formulas were updated correctly (like _Data tab), others weren't (like DASHBOARD snapshot).

### **Why This Needs Systematic Fixing:**

- **33 columns** in Lead Data
- **100+ formulas** reference these columns
- **Manual find/replace is error-prone**
- Need **automated verification**

### **The Refactoring Will Help Because:**

- Template-based tab creation → Consistent formula patterns
- Formula builder → Less error-prone
- Test harness → Catch issues immediately
- Configuration-driven → Easier to update

---

## 📊 **AUDIT SUMMARY**

| Category | Count | Status |
|----------|-------|--------|
| **Critical Bugs** | 1 | LTV Analysis not working |
| **High Priority Issues** | 1 | Column mismatches across multiple tabs |
| **Medium Priority Issues** | 1 | Marketing initialization |
| **Total Functions** | 54 | As documented |
| **Total Formulas Generated** | ~300+ | Need comprehensive fix |
| **Tabs Affected** | 6+ | DASHBOARD, LTV Analysis, _Chart Data, _LTV Calculations, Members, _Metrics |

---

**END OF AUDIT REPORT**

*Next: Create comprehensive fix script to address all column reference issues*


