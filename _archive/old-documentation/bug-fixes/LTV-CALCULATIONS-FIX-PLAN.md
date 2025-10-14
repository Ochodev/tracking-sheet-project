# _LTV Calculations #REF! Errors - Fix Plan

## Problems Identified

### Issue 1: Monthly Churn (Lines 1116-1126)
**Current:** Generates 12 months of data (rows 16-27)
**Problem:** User wants 24 months
**Range:** `A15:D27` (referenced by LTV Analysis line 1011)

### Issue 2: Cohort Analysis - Monthly (Lines 1129-1141)
**Current:** Generates 12 months of data (rows 16-27)
**Problem:** User wants 24 months
**Range:** `F15:K27` (referenced by LTV Analysis line 1013)

### Issue 3: Cohort Analysis - Quarterly (Lines 1144-1156)
**Current:** Generates 8 quarters of data (rows 16-23)
**Problem:** Should extend to 12 quarters (3 years) to match 24-month timeframe
**Range:** `M15:R23` (referenced by LTV Analysis line 1015)

### Issue 4: Static Rows Not Dynamic
**Problem:** Hard-coded row numbers (27, 23) break if we want ongoing long-term tracking
**Solution:** Need dynamic ranges or SEQUENCE-based approach

---

## Root Cause of #REF! Errors

The LTV Analysis tab QUERIES specific ranges:
```javascript
QUERY('_LTV Calculations'!A15:D27, ...)  // Monthly Churn
QUERY('_LTV Calculations'!F15:K27, ...)  // Cohort Monthly
QUERY('_LTV Calculations'!M15:R23, ...)  // Cohort Quarterly
```

If _LTV Calculations doesn't populate these ranges correctly, or if ranges are misaligned, you get #REF!

---

## Solution: Extend to 24 Months + Make Dynamic

### Fix 1: Monthly Churn (24 months)

**BEFORE (Lines 1119-1126):**
```javascript
for (let i = 11; i >= 0; i--) {
  const row = 27 - i;  // Generates rows 16-27 (12 rows)
  builder
    .addFormula(row, 'A', `DATE(YEAR(TODAY()),MONTH(TODAY())-${i},1)`, { format: 'mmm yyyy' })
    .addFormula(row, 'B', `COUNTIFS(D:D, "<"&A${row}, G:G, "Active") + COUNTIFS(H:H, ">="&A${row}, H:H, "<"&EOMONTH(A${row},0)+1)`)
    .addFormula(row, 'C', `COUNTIFS(H:H, ">="&A${row}, H:H, "<"&EOMONTH(A${row},0)+1)`)
    .addFormula(row, 'D', `IFERROR(C${row}/B${row}, 0)`, { format: '0.0%' });
}
```

**AFTER:**
```javascript
for (let i = 23; i >= 0; i--) {
  const row = 39 - i;  // Generates rows 16-39 (24 rows)
  builder
    .addFormula(row, 'A', `DATE(YEAR(TODAY()),MONTH(TODAY())-${i},1)`, { format: 'mmm yyyy' })
    .addFormula(row, 'B', `COUNTIFS(D:D, "<"&A${row}, G:G, "Active") + COUNTIFS(H:H, ">="&A${row}, H:H, "<"&EOMONTH(A${row},0)+1)`)
    .addFormula(row, 'C', `COUNTIFS(H:H, ">="&A${row}, H:H, "<"&EOMONTH(A${row},0)+1)`)
    .addFormula(row, 'D', `IFERROR(C${row}/B${row}, 0)`, { format: '0.0%' });
}
```

**LTV Analysis Update (Line 1011):**
```javascript
// BEFORE:
.addFormula(31, 'A', "QUERY('_LTV Calculations'!A15:D27, \"SELECT * WHERE Col1 IS NOT NULL ORDER BY Col1 DESC\", 1)")

// AFTER:
.addFormula(31, 'A', "QUERY('_LTV Calculations'!A15:D39, \"SELECT * WHERE Col1 IS NOT NULL ORDER BY Col1 DESC\", 1)")
```

---

### Fix 2: Cohort Analysis - Monthly (24 months)

**BEFORE (Lines 1132-1141):**
```javascript
for (let i = 11; i >= 0; i--) {
  const row = 27 - i;  // Generates rows 16-27 (12 rows)
  builder
    .addFormula(row, 'F', `DATE(YEAR(TODAY()),MONTH(TODAY())-${i},1)`, { format: 'mmm yyyy' })
    .addFormula(row, 'G', `COUNTIFS(K:K, F${row})`)
    .addFormula(row, 'H', `COUNTIFS(K:K, F${row}, G:G, "Active")`)
    .addFormula(row, 'I', `IFERROR(AVERAGEIFS(I:I, K:K, F${row}), 0)`, { format: '0.0' })
    .addFormula(row, 'J', `IFERROR(AVERAGEIFS(J:J, K:K, F${row}), 0)`, { format: '$#,##0' })
    .addFormula(row, 'K', `IFERROR(H${row}/G${row}, 0)`, { format: '0.0%' });
}
```

**AFTER:**
```javascript
for (let i = 23; i >= 0; i--) {
  const row = 39 - i;  // Generates rows 16-39 (24 rows)
  builder
    .addFormula(row, 'F', `DATE(YEAR(TODAY()),MONTH(TODAY())-${i},1)`, { format: 'mmm yyyy' })
    .addFormula(row, 'G', `COUNTIFS(K:K, F${row})`)
    .addFormula(row, 'H', `COUNTIFS(K:K, F${row}, G:G, "Active")`)
    .addFormula(row, 'I', `IFERROR(AVERAGEIFS(I:I, K:K, F${row}), 0)`, { format: '0.0' })
    .addFormula(row, 'J', `IFERROR(AVERAGEIFS(J:J, K:K, F${row}), 0)`, { format: '$#,##0' })
    .addFormula(row, 'K', `IFERROR(H${row}/G${row}, 0)`, { format: '0.0%' });
}
```

**LTV Analysis Update (Line 1013):**
```javascript
// BEFORE:
.addFormula(31, 'F', "QUERY('_LTV Calculations'!F15:K27, \"SELECT * WHERE Col1 IS NOT NULL ORDER BY Col1 DESC\", 1)")

// AFTER:
.addFormula(31, 'F', "QUERY('_LTV Calculations'!F15:K39, \"SELECT * WHERE Col1 IS NOT NULL ORDER BY Col1 DESC\", 1)")
```

---

### Fix 3: Cohort Analysis - Quarterly (12 quarters = 3 years)

**BEFORE (Lines 1147-1156):**
```javascript
for (let i = 7; i >= 0; i--) {
  const row = 23 - i;  // Generates rows 16-23 (8 rows)
  builder
    .addFormula(row, 'M', `DATE(YEAR(TODAY()), ROUNDDOWN((MONTH(TODAY())-1)/3,0)*3+1-${i*3}, 1)`, { format: '"Q"Q YYYY' })
    .addFormula(row, 'N', `COUNTIFS(L:L, ">="&M${row}, L:L, "<"&EDATE(M${row}, 3))`)
    .addFormula(row, 'O', `COUNTIFS(L:L, ">="&M${row}, L:L, "<"&EDATE(M${row}, 3), G:G, "Active")`)
    .addFormula(row, 'P', `IFERROR(AVERAGEIFS(I:I, L:L, ">="&M${row}, L:L, "<"&EDATE(M${row}, 3)), 0)`, { format: '0.0' })
    .addFormula(row, 'Q', `IFERROR(AVERAGEIFS(J:J, L:L, ">="&M${row}, L:L, "<"&EDATE(M${row}, 3)), 0)`, { format: '$#,##0' })
    .addFormula(row, 'R', `IFERROR(O${row}/N${row}, 0)`, { format: '0.0%' });
}
```

**AFTER:**
```javascript
for (let i = 11; i >= 0; i--) {
  const row = 27 - i;  // Generates rows 16-27 (12 rows)
  builder
    .addFormula(row, 'M', `DATE(YEAR(TODAY()), ROUNDDOWN((MONTH(TODAY())-1)/3,0)*3+1-${i*3}, 1)`, { format: '"Q"Q YYYY' })
    .addFormula(row, 'N', `COUNTIFS(L:L, ">="&M${row}, L:L, "<"&EDATE(M${row}, 3))`)
    .addFormula(row, 'O', `COUNTIFS(L:L, ">="&M${row}, L:L, "<"&EDATE(M${row}, 3), G:G, "Active")`)
    .addFormula(row, 'P', `IFERROR(AVERAGEIFS(I:I, L:L, ">="&M${row}, L:L, "<"&EDATE(M${row}, 3)), 0)`, { format: '0.0' })
    .addFormula(row, 'Q', `IFERROR(AVERAGEIFS(J:J, L:L, ">="&M${row}, L:L, "<"&EDATE(M${row}, 3)), 0)`, { format: '$#,##0' })
    .addFormula(row, 'R', `IFERROR(O${row}/N${row}, 0)`, { format: '0.0%' });
}
```

**LTV Analysis Update (Line 1015):**
```javascript
// BEFORE:
.addFormula(31, 'M', "QUERY('_LTV Calculations'!M15:R23, \"SELECT * WHERE Col1 IS NOT NULL ORDER BY Col1 DESC\", 1)")

// AFTER:
.addFormula(31, 'M', "QUERY('_LTV Calculations'!M15:R27, \"SELECT * WHERE Col1 IS NOT NULL ORDER BY Col1 DESC\", 1)")
```

---

### Fix 4: Update Section Headers

**Line 1116:**
```javascript
// BEFORE:
.addRow(14, 'A', 'Monthly Churn Rate (Last 12 Months)', { bold: true })

// AFTER:
.addRow(14, 'A', 'Monthly Churn Rate (Last 24 Months)', { bold: true })
```

**Line 1129:**
```javascript
// BEFORE:
.addRow(14, 'F', 'Cohort Analysis - Monthly', { bold: true })

// AFTER:
.addRow(14, 'F', 'Cohort Analysis - Monthly (Last 24 Months)', { bold: true })
```

**Line 1144:**
```javascript
// BEFORE:
.addRow(14, 'M', 'Cohort Analysis - Quarterly', { bold: true })

// AFTER:
.addRow(14, 'M', 'Cohort Analysis - Quarterly (Last 12 Quarters)', { bold: true })
```

---

### Fix 5: Update LTV Analysis Tab Headers

**Line 1010:**
```javascript
// BEFORE:
.addRow(30, 'A', '📉 Monthly Churn Rate (Last 12 Months)', { bold: true, fontSize: 14 })

// AFTER:
.addRow(30, 'A', '📉 Monthly Churn Rate (Last 24 Months)', { bold: true, fontSize: 14 })
```

**Line 1012:**
```javascript
// BEFORE:
.addRow(30, 'F', '📅 Cohort Analysis - Monthly (Last 12 Months)', { bold: true, fontSize: 14 })

// AFTER:
.addRow(30, 'F', '📅 Cohort Analysis - Monthly (Last 24 Months)', { bold: true, fontSize: 14 })
```

**Line 1014:**
```javascript
// BEFORE:
.addRow(30, 'M', '📅 Cohort Analysis - Quarterly (Last 8 Quarters)', { bold: true, fontSize: 14 })

// AFTER:
.addRow(30, 'M', '📅 Cohort Analysis - Quarterly (Last 12 Quarters)', { bold: true, fontSize: 14 })
```

---

## Dynamic Feeding Solution

### Why It's Already Dynamic ✅

The formulas use relative references like `TODAY()` and `MONTH(TODAY())-${i}`, which means:
- Every day, the date ranges recalculate automatically
- No manual updates needed
- It will work indefinitely

**Example:**
```javascript
DATE(YEAR(TODAY()),MONTH(TODAY())-23,1)
```
- Today (Oct 9, 2025): Shows Oct 2023
- In 1 year (Oct 9, 2026): Shows Oct 2024
- Always shows rolling 24 months!

---

## Summary of Changes

**Files to Update:**
1. `createLTVCalculationsTabV2` (lines 1116-1156) - 3 sections
2. `createLTVAnalysisTabV2` (lines 1010-1015) - 3 QUERY ranges

**Total Changes:**
- 12 loops → 24 months (rows 16-39)
- 8 loops → 12 quarters (rows 16-27)
- 6 range updates in QUERY formulas
- 6 header text updates

**Result:**
- ✅ 24 months of monthly data
- ✅ 12 quarters (3 years) of quarterly data
- ✅ All dynamic (auto-updates daily)
- ✅ No #REF! errors
- ✅ Works long-term without maintenance

---

## Other Areas to Check

### Potential Issue: DASHBOARD Source Analysis
If DASHBOARD references Marketing Budget rows 44-67, those are now dynamic (24 months). Should be OK since we use entire column references.

### Potential Issue: Settings & Budget
Marketing Budget section already generates 24 months (rows 44-67). ✅ Already matches!

### Potential Issue: Members Tab
Uses QUERY with entire columns (A:AH), so dynamic. ✅ No issues.

---

## Ready to Implement?

**Changes Required:** 12 lines in 2 functions  
**Impact:** Fixes #REF! errors, extends to 24 months, maintains dynamic updates  
**Risk:** Low (just extending existing working logic)

Reply to proceed with implementation!

