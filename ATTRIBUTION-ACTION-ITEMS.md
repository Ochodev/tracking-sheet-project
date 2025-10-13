# 🎯 Attribution & Formula Issues - Action Items
**Created:** October 11, 2025  
**Source:** FORMULA-ATTRIBUTION-ANALYSIS-2025.md  
**Status:** Ready for Implementation

---

## 🚨 CRITICAL (Fix This Week)

### 1. CAC Attribution Window Misalignment ⚠️
**Priority:** P0 | **Severity:** HIGH | **Time:** 8-12 hours

**Problem:** Marketing spend and member conversions use different time windows.

**Example:**
- Month 1: Spend $1,000 → 0 conversions → CAC = "Spend/0"
- Month 2: Spend $0 → 10 conversions → CAC = $0 (wrong! should be $100)

**Fix:** Implement cohort-based attribution linking spend month to lead creation month.

**Files to Edit:**
- `Code.gs` lines 885-889 (DASHBOARD CAC)
- `Code.gs` lines 928-953 (Source Analysis CAC)

**Implementation Options:**
1. 30-day rolling attribution window
2. Lead creation month → Member conversion cohort matching
3. Add "Lead Created Date" tracking to attribution

---

### 2. Multi-Location Attribution Collision 🏢
**Priority:** P0 | **Severity:** CRITICAL for multi-location gyms | **Time:** 4-6 hours

**Problem:** Same Lead ID from different locations overwrites source attribution.

**Example:**
- Location A: Lead 12345, utm_source = "fb_ad"
- Location B: Lead 12345, utm_source = "google"
- Result: Only first occurrence (fb_ad) is used

**Fix:** Add Location column to _UTM Tracking, use composite key (Lead ID + Location).

**Files to Edit:**
- `Code.gs` line 1518 (Lead Data source lookup)
- `_UTM Tracking` tab structure (add Location column)
- All MATCH formulas using Lead ID

**Implementation:**
```javascript
// Current:
MATCH(A2:A, '_UTM Tracking'!A:A, 0)

// New:
MATCH(A2:A&"|"&K2:K, '_UTM Tracking'!A:A&"|"&LocationCol, 0)
```

---

### 3. Trial End Date Timezone Bug 🕒
**Priority:** P2 | **Severity:** MEDIUM | **Time:** 1 hour

**Problem:** Date arithmetic doesn't normalize timezone, causes off-by-one errors.

**Fix:** Add DATEVALUE() wrapper:

**Files to Edit:**
- `Code.gs` lines 1521-1527 (Trial End calculation)

**Change:**
```javascript
// Before:
Q2:Q5000 + 'Settings & Budget'!$B$33

// After:
DATEVALUE(Q2:Q5000) + 'Settings & Budget'!$B$33
```

---

### 4. Custom Date Range Validation ⏰
**Priority:** P2 | **Severity:** MEDIUM | **Time:** 1 hour

**Problem:** No validation prevents End Date < Start Date. All metrics show 0 with no error.

**Fix:** Add data validation + formula check.

**Files to Edit:**
- `Code.gs` lines 1074-1078 (Settings B28, B29)

**Implementation:**
```javascript
// Add validation:
const validation = SpreadsheetApp.newDataValidation()
  .requireDate()
  .requireDateAfter(settings.getRange('B28'))
  .build();
settings.getRange('B29').setDataValidation(validation);

// Add formula check in B31:
IF(AND(B27="Custom Range", B29<B28), 
  "⚠️ ERROR: End before Start", 
  [existing formula])
```

---

### 5. LTV:CAC Type Check 🔢
**Priority:** P2 | **Severity:** MEDIUM | **Time:** 30 min

**Problem:** Division attempts when CAC = "Spend/0" (string) instead of number.

**Fix:** Add ISNUMBER() check before division.

**Files to Edit:**
- `Code.gs` line 971 (LTV:CAC ratio)

**Change:**
```javascript
// Before:
IFERROR(AVERAGE(L20:L30)/B16, "-")

// After:
IF(OR(NOT(ISNUMBER(AVERAGE(L20:L30))),NOT(ISNUMBER(B16))),
  "-",
  IFERROR(AVERAGE(L20:L30)/B16, "-"))
```

---

## 📋 HIGH PRIORITY (Fix This Month)

### 6. ARRAYFORMULA 5,000 Row Hard Limit
**Problem:** System stops auto-calculating after row 5,000. Undocumented limitation.

**Quick Fix:** 
1. Increase to 10,000 rows (change A2:A5000 → A2:A10000)
2. Add warning in UI at row 9,500
3. Document in Help tab

**Files:** All ARRAYFORMULA in `Code.gs` lines 1518-1580

---

### 7. UTM Mapping Case Sensitivity
**Problem:** LOWER() applied to input but not lookup table. "FB_AD" vs "fb_ad" mismatch.

**Fix:** Apply LOWER() to Settings lookup column:
```javascript
VLOOKUP(LOWER(C2:C5000), 
  ARRAYFORMULA({LOWER('Settings & Budget'!$G$3:$G$100), 
                'Settings & Budget'!$H$3:$H$100}), 
  2, FALSE)
```

**Files:** `Code.gs` line 2706 (_UTM Tracking O2)

---

### 8. Source Analysis Dynamic Ranges
**Problem:** Hard-coded to 11 sources. Adding 12th source makes it invisible.

**Fix:** Make ARRAYFORMULA dynamic using source count.

**Implementation:**
1. Add helper cell "SourceCount" = COUNTA('Settings & Budget'!A14:A100)
2. Use INDIRECT to create dynamic ranges

**Files:** `Code.gs` lines 928-953

---

### 9. Division by Zero - Remaining Edge Cases
**Locations to fix:**
- Close Rate with 0 shows (line 858) → show "N/A" not "0%"
- Staff Performance close rates → add checks
- Any IFERROR(x/y, 0) → change to check denominator first

---

### 10. Protect Critical Cells
**Problem:** Named ranges break if rows inserted above Settings row 30.

**Fix:** Protect rows 27-33 in Settings tab:
```javascript
const protection = settings.getRange('A27:Z33').protect();
protection.setDescription('Critical date range cells - do not insert rows');
protection.setWarningOnly(true);
```

**Files:** Add to `createSettingsTab()` function

---

## 🛠️ QUICK WINS (< 1 hour each)

| Issue | Time | Impact | File:Line |
|-------|------|--------|-----------|
| Trial timezone bug | 30 min | Medium | Code.gs:1521 |
| Custom date validation | 30 min | Medium | Code.gs:1074 |
| LTV:CAC type check | 30 min | Medium | Code.gs:971 |
| UTM case sensitivity | 30 min | Medium | Code.gs:2706 |
| Protect critical cells | 15 min | Medium | Code.gs:createSettingsTab |
| Document 5K limit | 15 min | Low | Help tab |

**Total Quick Wins Time:** ~3 hours  
**Total Impact:** 6 issues fixed

---

## 📊 TESTING CHECKLIST

After implementing fixes, test:

### CAC Attribution
- [ ] Create lead in Month 1
- [ ] Convert to member in Month 2
- [ ] Verify CAC attributes to correct month
- [ ] Check both DASHBOARD and Source Analysis

### Multi-Location
- [ ] Add same Lead ID to two locations
- [ ] Verify both show correct source attribution
- [ ] Check location-specific CAC calculations

### Trial End Date
- [ ] Set trial start during DST transition
- [ ] Verify trial end date is exactly +14 days
- [ ] Check "trials ending soon" alerts

### Custom Date Range
- [ ] Enter End < Start
- [ ] Verify error message displays
- [ ] Confirm metrics show 0 with clear warning

### LTV:CAC Ratio
- [ ] Set CAC to "Spend/0"
- [ ] Verify LTV:CAC shows "-" not error
- [ ] Check with numeric CAC value

---

## 🎓 IMPLEMENTATION ORDER

**Week 1: Critical Issues (P0)**
1. Day 1-2: CAC Attribution (12 hours)
2. Day 3: Multi-Location Support (6 hours)
3. Day 4: Testing & Validation (4 hours)
4. Day 5: Quick Wins (3 hours)

**Week 2-4: High Priority (P1)**
5. Week 2: Dynamic Source Analysis (4 hours)
6. Week 3: 5K Row Limit increase (3 hours)
7. Week 4: Remaining edge cases (8 hours)

**Total Estimated Time:** 40 hours

---

## 📝 NOTES

**Before Starting:**
1. Create backup of current Code.gs
2. Test in copy of sheet, not production
3. Review FORMULA-ATTRIBUTION-ANALYSIS-2025.md for full context
4. Have sample data ready for testing

**After Completion:**
1. Update documentation
2. Add new tests
3. Update CHANGELOG.md
4. Run full system health check

**References:**
- Full Analysis: `FORMULA-ATTRIBUTION-ANALYSIS-2025.md`
- Bug History: `BUG-FIX-REPORT.md`
- Architecture: `ARCHITECTURE-DEEP-DIVE.md`

---

**Last Updated:** October 11, 2025  
**Next Review:** After P0 fixes implemented

