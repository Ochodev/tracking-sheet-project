# ⚡ Attribution Issues - Quick Reference
**One-page cheat sheet for developers**

---

## 🔴 CRITICAL (P0) - Fix First

| # | Issue | File:Line | Fix Time | Impact |
|---|-------|-----------|----------|--------|
| 1 | **CAC Attribution Mismatch** | Code.gs:885 | 8-12h | Financial decisions |
| 2 | **Multi-Location Collision** | Code.gs:1518 | 4-6h | Wrong source data |
| 3 | **Trial Date Timezone** | Code.gs:1521 | 1h | Off-by-one errors |
| 4 | **Custom Date Validation** | Code.gs:1074 | 1h | Silent failures |
| 5 | **LTV:CAC Type Error** | Code.gs:971 | 30m | Division errors |

**Total Time:** 15-20 hours

---

## 🟡 HIGH PRIORITY (P1) - Fix Next

| # | Issue | File:Line | Fix Time |
|---|-------|-----------|----------|
| 6 | **5K Row Hard Limit** | Code.gs:1518-1580 | 2-3h |
| 7 | **UTM Case Sensitivity** | Code.gs:2706 | 1h |
| 8 | **Source Analysis Static** | Code.gs:928-953 | 3-4h |
| 9 | **Division Edge Cases** | Multiple | 2h |
| 10 | **Named Range Fragility** | Code.gs:2825 | 1h |

**Total Time:** 9-12 hours

---

## 🔧 QUICK FIXES (<1 hour each)

```javascript
// Fix #3: Trial Date Timezone (30 min)
// Line 1521-1527
// BEFORE:
Q2:Q5000 + 'Settings & Budget'!$B$33
// AFTER:
DATEVALUE(Q2:Q5000) + 'Settings & Budget'!$B$33

// Fix #4: Custom Date Validation (30 min)
// Line 1074-1078
const validation = SpreadsheetApp.newDataValidation()
  .requireDate()
  .requireDateAfter(settings.getRange('B28'))
  .setHelpText('End must be after start')
  .build();
settings.getRange('B29').setDataValidation(validation);

// Fix #5: LTV:CAC Type Check (30 min)
// Line 971
// BEFORE:
IFERROR(AVERAGE(L20:L30)/B16, "-")
// AFTER:
IF(OR(NOT(ISNUMBER(AVERAGE(L20:L30))),NOT(ISNUMBER(B16))),
  "-",
  IFERROR(AVERAGE(L20:L30)/B16, "-"))

// Fix #7: UTM Case Sensitivity (30 min)
// Line 2706
// BEFORE:
VLOOKUP(LOWER(C2:C5000), 'Settings & Budget'!$G$3:$H$100, 2, FALSE)
// AFTER:
VLOOKUP(LOWER(C2:C5000), 
  ARRAYFORMULA({LOWER('Settings & Budget'!$G$3:$G$100), 
                'Settings & Budget'!$H$3:$H$100}), 
  2, FALSE)

// Fix #10: Protect Critical Cells (15 min)
// Add to createSettingsTab()
const protection = settings.getRange('A27:Z33').protect();
protection.setDescription('Critical date range - do not insert rows');
protection.setWarningOnly(true);
```

**Total Quick Fixes Time:** ~3 hours

---

## 📊 TESTING COMMANDS

```javascript
// Test CAC Attribution
// 1. Add lead in October with Created Date = 2025-10-15
// 2. Add marketing spend for October = $1000
// 3. Convert lead in November (Member Start = 2025-11-05)
// 4. Check DASHBOARD CAC for both months
// Expected: CAC attributes to October (lead creation month)

// Test Multi-Location
// 1. Add Lead ID 12345 to _UTM Tracking with Location = "Downtown"
// 2. Add same Lead ID 12345 with Location = "Suburbs"
// 3. Check Lead Data source for each location
// Expected: Both show correct sources (not just first match)

// Test Trial Date
// 1. Set trial start = 2025-10-01
// 2. Check trial end calculation
// Expected: Exactly 2025-10-15 (not 2025-10-14 or 2025-10-16)

// Test Custom Date Validation
// 1. Select "Custom Range"
// 2. Enter Start = 2025-10-15
// 3. Try to enter End = 2025-10-01
// Expected: Validation error prevents entry

// Test LTV:CAC with String
// 1. Set CAC to "⚠️ Spend/0" (string)
// 2. Check LTV:CAC ratio cell
// Expected: Shows "-" not #VALUE! error
```

---

## 🎯 PRIORITY MATRIX

```
                    HIGH IMPACT
                         │
        2 Multi-Location │ 1 CAC Attribution
                         │
        8 Source Dynamic │ 6 5K Row Limit
        ─────────────────┼─────────────────
                         │
        9 Division Cases │ 7 UTM Case
                         │
       10 Named Ranges   │ 3 Trial TZ, 4 Date Val, 5 Type Check
                         │
                    LOW IMPACT

                    ← LOW EFFORT    HIGH EFFORT →
```

**Focus Area:** Top-right quadrant (High Impact, Low Effort first)

---

## 📁 FILE LOCATIONS

### Documentation
- Full analysis: `FORMULA-ATTRIBUTION-ANALYSIS-2025.md` (650 lines)
- Action items: `ATTRIBUTION-ACTION-ITEMS.md` (200 lines)
- Executive summary: `ATTRIBUTION-EXECUTIVE-SUMMARY.md` (300 lines)
- This reference: `ATTRIBUTION-QUICK-REFERENCE.md` (you are here)

### Code Files to Edit
- Main codebase: `Code.gs` (4,560 lines)
- Ultra-complete: `GYM-OPS-ULTRA-COMPLETE.gs` (1,744 lines)
- Constants: `constants.gs`
- Health check: `healthCheck.gs`

### Tabs to Modify
- DASHBOARD (formulas lines 885-971)
- Lead Data (formulas lines 1518-1580)
- Settings & Budget (validation lines 1074-1078)
- _UTM Tracking (mapping line 2706)

---

## 🚀 IMPLEMENTATION WORKFLOW

```bash
# 1. Create backup
cp Code.gs Code.gs.backup.$(date +%Y%m%d)

# 2. Create test environment
# Duplicate entire Google Sheet for testing

# 3. Fix quick wins first (3 hours)
# - Trial timezone
# - Date validation
# - Type checks
# - UTM case sensitivity

# 4. Test quick wins
# Run all test cases above

# 5. Fix critical issues (15-20 hours)
# - CAC attribution (most complex)
# - Multi-location support
# - Source analysis dynamic

# 6. Full system test
# Run health check, verify all metrics

# 7. Deploy to production
# After thorough testing only

# 8. Update documentation
# Note changes in CHANGELOG.md
```

---

## ⚠️ GOTCHAS & WARNINGS

### Don't Do This
- ❌ Don't edit production sheet directly
- ❌ Don't skip testing phase
- ❌ Don't change formula syntax without checking all references
- ❌ Don't insert rows in Settings rows 27-33 (breaks named ranges)
- ❌ Don't rename tabs without updating all formulas

### Always Do This
- ✅ Test in copy of sheet first
- ✅ Verify formulas after changes
- ✅ Run health check after deployment
- ✅ Check all tabs for #REF! errors
- ✅ Document any changes made

---

## 🔍 DEBUGGING TIPS

### If CAC Shows Wrong Value
1. Check Settings B30, B31 (date range)
2. Verify B14 (New Members count)
3. Check _Daily Spend tab has data
4. Verify marketing budget entered for period

### If Source Attribution Wrong
1. Check _UTM Tracking has entry for Lead ID
2. Verify Column O (Standardized Source) populated
3. Check Settings G:H mapping table
4. Verify case matches in mapping

### If Formulas Show #REF!
1. Check all tab names still exist
2. Verify column letters correct
3. Check named ranges still point to correct cells
4. Run "Refresh Dashboards" from menu

### If Performance Slow
1. Check total row count (>5K causes issues)
2. Verify ARRAYFORMULA properly bounded
3. Check hidden tabs not over-calculating
4. Consider lazy loading optimization

---

## 📞 GETTING HELP

**For Questions:**
1. Check full analysis: `FORMULA-ATTRIBUTION-ANALYSIS-2025.md`
2. Review architecture: `ARCHITECTURE-DEEP-DIVE.md`
3. Check bug history: `BUG-FIX-REPORT.md`

**For Implementation:**
1. Follow action items: `ATTRIBUTION-ACTION-ITEMS.md`
2. Reference code examples above
3. Test thoroughly before deploying

**For Stakeholders:**
1. Share executive summary: `ATTRIBUTION-EXECUTIVE-SUMMARY.md`
2. Explain business impact (ROI section)
3. Recommend priority based on their situation

---

## ✅ COMPLETION CHECKLIST

After implementing fixes:

- [ ] All quick wins completed (3 hours)
- [ ] All critical issues fixed (15-20 hours)
- [ ] Full testing performed
- [ ] Health check passes
- [ ] No #REF! or #VALUE! errors
- [ ] CAC attribution tested with sample data
- [ ] Multi-location tested (if applicable)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Stakeholders informed

---

**Print this page and keep at desk for reference** 📄

*Last updated: October 11, 2025*

