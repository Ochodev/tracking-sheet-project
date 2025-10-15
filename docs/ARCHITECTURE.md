# GYM OPS TRACKER - SYSTEM ARCHITECTURE

**Version:** 2.2.3  
**Last Updated:** October 14, 2025  
**Status:** Production Ready

---

## 📁 File Structure (Source of Truth)

### Production Files

| File | Status | Purpose |
|------|--------|---------|
| **GYM-OPS-ULTRA-COMPLETE.gs** | 🟢 PRODUCTION | Main deployment file - use this for all changes |
| Code.gs | 🟡 LEGACY | Old version, kept for reference only |
| GYM-OPS-ULTRA-COMPLETE-SAFE.gs | 🔵 BACKUP | Backup copy, updated alongside production |

**RULE:** All changes must be made to `GYM-OPS-ULTRA-COMPLETE.gs` first, then optionally synced to SAFE backup.

---

## 🔄 Tab Dependency Tree

Tabs must be created in this order (dependency chain):

```
1. Settings & Budget (no dependencies)
   └─ Provides: Date range, targets, sources, marketing budget
   
2. _UTM Tracking (no dependencies)
   └─ Provides: Lead source mappings
   
3. Lead Data (depends on: Settings, _UTM Tracking)
   └─ Provides: All lead data, conversion tracking
   
4. Import Members (no dependencies)
   └─ Provides: Historical member data
   
5. _LTV Calculations (depends on: Lead Data, Import Members)
   └─ Provides: LTV metrics per source/package
   
6. _Metrics (depends on: Lead Data, Settings)
   └─ Provides: Net gain/loss by membership type
   
7. Members (depends on: Lead Data)
   └─ Provides: Filtered view of active members
   
8. DASHBOARD (depends on: Lead Data, Settings, _Metrics, _LTV Calculations)
   └─ Provides: Executive overview, SOURCE ANALYSIS
   
9. LTV Analysis (depends on: _LTV Calculations)
   └─ Provides: User-facing LTV reports
   
10. Help (no dependencies)
    └─ Provides: User documentation
```

**BREAKING THIS ORDER WILL CAUSE #REF! ERRORS**

---

## 🗂️ Critical Cell References

### Settings & Budget Tab

| Cell/Range | Purpose | Referenced By | Impact if Changed |
|------------|---------|---------------|-------------------|
| **B30** | Start Date (calculated) | All tabs (date filtering) | 🔴 CRITICAL - breaks all metrics |
| **B31** | End Date (calculated) | All tabs (date filtering) | 🔴 CRITICAL - breaks all metrics |
| **B33** | Trial Length (days) | Lead Data R2 | 🟡 MEDIUM - breaks trial end calc |
| **A14:A24** | Source list | Lead Data dropdowns, DASHBOARD | 🟡 MEDIUM - breaks dropdowns |
| **B14:B16** | Staff list | Lead Data dropdowns | 🟢 LOW - only affects dropdowns |
| **D14:D17** | Membership types | Lead Data dropdowns, _Metrics | 🟡 MEDIUM - breaks type tracking |
| **E14:E19** | Cancel reasons | Lead Data dropdowns | 🟢 LOW - only affects dropdowns |
| **A40:A100** | Marketing months | DASHBOARD G20 (Spend) | 🔴 CRITICAL - breaks spend calc |
| **B40:B100** | Marketing sources | DASHBOARD G20 (Spend) | 🔴 CRITICAL - breaks spend calc |
| **C40:C100** | Monthly budgets | Not currently used | 🟢 LOW |
| **D40:D100** | Days in month | Auto-calculated | 🟢 LOW |
| **E40:E100** | Daily rates | DASHBOARD G20 (Spend) | 🔴 CRITICAL - breaks spend calc |

### DASHBOARD Tab

| Cell/Range | Purpose | Referenced By | Impact if Changed |
|------------|---------|---------------|-------------------|
| **B2** | Date range dropdown | Settings B30/B31 | 🔴 CRITICAL - drives all date filtering |
| **A20:A30** | Source list | SOURCE ANALYSIS formulas | 🔴 CRITICAL - breaks analysis |
| **G20:G30** | Spend calculation | H20-M30 (all cost metrics) | 🔴 CRITICAL - breaks CPL, CPA, CPS, CAC |
| **L20:L30** | LTV per source | M20:M30 (LTV:CAC) | 🟡 MEDIUM - breaks LTV:CAC ratio |

### Lead Data Tab

| Cell/Range | Purpose | Referenced By | Impact if Changed |
|------------|---------|---------------|-------------------|
| **H2** | Source formula (ARRAYFORMULA) | Members, DASHBOARD, _Metrics | 🔴 CRITICAL - breaks source tracking |
| **R2** | Trial End formula | DASHBOARD action items | 🟡 MEDIUM - breaks trial tracking |
| **AB2** | Current Status formula | DASHBOARD, Members | 🟡 MEDIUM - breaks status display |
| **Column S** | Converted flag | Members, DASHBOARD, _Metrics | 🔴 CRITICAL - breaks member tracking |
| **Column X** | Cancelled flag | Members, DASHBOARD | 🔴 CRITICAL - breaks member filtering |

### _LTV Calculations Tab

| Cell/Range | Purpose | Referenced By | Impact if Changed |
|------------|---------|---------------|-------------------|
| **N:T** | LTV by source table | DASHBOARD L20 | 🔴 CRITICAL - breaks LTV display |
| **Column 7 (T)** | Avg LTV column | DASHBOARD VLOOKUP | 🔴 CRITICAL - breaks LTV lookup |

---

## 📊 Data Flow Diagram

```
┌─────────────────────┐
│  GoHighLevel CRM    │
│  (External)         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Lead Data          │◄─── Manual entry
│  (Primary data)     │
└──────┬──────────────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌─────────────────────┐      ┌─────────────────────┐
│  Members            │      │  _LTV Calculations  │
│  (Filtered view)    │      │  (Analytics)        │
└─────────────────────┘      └──────┬──────────────┘
                                    │
                                    ▼
                             ┌─────────────────────┐
                             │  LTV Analysis       │
                             │  (User reports)     │
                             └─────────────────────┘
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌─────────────────────┐  ┌─────────────────────┐
│  _Metrics           │  │  DASHBOARD          │
│  (Net gain/loss)    │  │  (Executive view)   │
└─────────────────────┘  └─────────────────────┘
       │                      ▲
       └──────────────────────┘

┌─────────────────────┐
│  Settings & Budget  │
│  (Configuration)    │───► Controls date filtering for ALL tabs
└─────────────────────┘
```

---

## 🔗 What-Depends-On-What Matrix

| If You Change... | This Breaks... | Fix Required |
|------------------|----------------|--------------|
| **Settings B30/B31** | All DASHBOARD metrics, all date-filtered data | Re-verify DASHBOARD B2 dropdown |
| **Settings B33** | Lead Data Trial End column (R) | Re-check trial end dates |
| **Settings A40:E100 structure** | DASHBOARD Spend (G20), all cost metrics | Update G20 formula ranges |
| **Lead Data Column S** | Members tab, DASHBOARD metrics, _Metrics | Re-verify Members QUERY |
| **Lead Data Column X** | Members tab, active member counts | Re-verify Members QUERY |
| **Lead Data H2 formula** | All source-based analytics | Re-apply ARRAYFORMULA |
| **_LTV Calculations N:T** | DASHBOARD LTV column (L20) | Update VLOOKUP range |
| **DASHBOARD row 18-30** | Nothing (this is output only) | None - safe to modify |

---

## ⚠️ Common Breaking Changes

### 1. Moving Marketing Budget Rows

**Problem:** DASHBOARD G20 references `A40:A100`  
**Fix:** Update formula in DASHBOARD G20 to new range  
**Files to change:** GYM-OPS-ULTRA-COMPLETE.gs (line 970)

### 2. Adding/Removing Source List Items

**Problem:** DASHBOARD A20 references `A14:A24`  
**Fix:** Update formula in DASHBOARD A20 to new range  
**Files to change:** GYM-OPS-ULTRA-COMPLETE.gs (line 959)

### 3. Changing Date Range Logic

**Problem:** Settings B30/B31 are calculated from DASHBOARD B2  
**Fix:** Update formula in Settings B30 and B31  
**Files to change:** GYM-OPS-ULTRA-COMPLETE.gs (line 646-648)

---

## 🧪 Validation Points

After making ANY change, run these checks:

1. **Gym Ops → Health Check** - Should show "✅ HEALTH CHECK PASSED"
2. **Gym Ops → Quick Test** - All tests should pass
3. **Gym Ops → Validate & Auto-Fix** - Should show 0 failed tests
4. **Manual check:** DASHBOARD SOURCE ANALYSIS all columns show values (not 0 or blank)
5. **Manual check:** Members tab shows active members
6. **Manual check:** Lead Data Source column (H) auto-populates

---

## 📝 Version History

| Version | Date | Major Changes |
|---------|------|---------------|
| 2.2.3 | Oct 14, 2025 | Added CELL_REFS constants + comprehensive docs |
| 2.2.2 | Oct 14, 2025 | Fixed SOURCE ANALYSIS Spend & LTV formulas |
| 2.2.1 | Oct 13, 2025 | Added auto-validation system |
| 2.2.0 | Oct 12, 2025 | Fixed SOURCE ANALYSIS formulas |
| 2.1.0 | Oct 8, 2025 | Refactored to TabBuilder architecture |
| 2.0.0 | Oct 1, 2025 | Major refactor, removed _Daily Spend |

---

## 🚀 Deployment Process

See **DEPLOY-CHECKLIST.md** for step-by-step deployment guide.

---

## 📞 Support

If something breaks:
1. Check **TROUBLESHOOTING.md** for common issues
2. Run **Gym Ops → Health Check**
3. Check **CELL-REFERENCE-MAP.md** for affected cells
4. Review **CHANGES.md** for recent modifications

