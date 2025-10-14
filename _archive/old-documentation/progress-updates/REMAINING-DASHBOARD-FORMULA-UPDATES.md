# Remaining DASHBOARD and Chart Data Formula Updates

## Summary
After adding the "Trial Start" date column (Q), all column references after P need to be shifted by +1.

## Column Reference Mapping (OLD → NEW)

| OLD Column | OLD Name | NEW Column | NEW Name |
|------------|----------|------------|----------|
| P | Start Trial? (checkbox) | P | Start Trial? (checkbox) ✓ NO CHANGE |
| (missing) | | Q | **Trial Start (date)** ← NEW! |
| Q | Trial End | R | Trial End |
| R | Converted? | S | Converted? |
| S | Member Start | T | Member Start |
| T | Membership Type | U | Membership Type |
| U | MRR | V | MRR |
| V | Upfront Fee | W | Upfront Fee |
| W | Cancelled? | X | Cancelled? |
| X | Cancel Date | Y | Cancel Date |
| Y | Cancel Reason | Z | Cancel Reason |
| Z | Notes | AA | Notes |

## Search & Replace Operations Needed

### 1. Converted Checkbox (Q → S)
**Search:** `'Lead Data'!Q:Q`  
**Replace:** `'Lead Data'!S:S`  
**Count:** ~20 instances

### 2. Member Start Date (R → T)
**Search:** `'Lead Data'!R:R`  
**Replace:** `'Lead Data'!T:T`  
**Count:** ~25 instances

### 3. Membership Type (S → U)
**Search:** `'Lead Data'!S:S`  
**Replace:** `'Lead Data'!U:U`  
**Count:** ~3 instances

### 4. MRR (T → V)
**Search:** `'Lead Data'!T:T`  
**Replace:** `'Lead Data'!V:V`  
**Count:** ~5 instances

### 5. Upfront Fee (U → W)
**Search:** `'Lead Data'!U:U`  
**Replace:** `'Lead Data'!W:W`  
**Count:** ~3 instances

### 6. Cancelled Checkbox (V → X)
**Search:** `'Lead Data'!V:V`  
**Replace:** `'Lead Data'!X:X`  
**Count:** ~5 instances

### 7. Cancel Date (W → Y)
**Search:** `'Lead Data'!W:W`  
**Replace:** `'Lead Data'!Y:Y`  
**Count:** ~5 instances

## Special Case: Trial Counting

**Line 2644 (and similar):**
```javascript
['Trials', `=COUNTIFS('Lead Data'!O:O,">="&'Settings & Budget'!$B$30,'Lead Data'!O:O,"<="&'Settings & Budget'!$B$31,'Lead Data'!O:O,"<>")`]
```

**Issue:** This is checking O:O (Show Date) for trials, which seems incorrect.

**Options:**
1. Use P:P (Start Trial? checkbox) - `P:P=TRUE`
2. Use Q:Q (Trial Start date) - `Q:Q<>""`

**Recommendation:** Use Q:Q (Trial Start date) as it's more reliable and matches the pattern of Member Start date checks.

**Updated:**
```javascript
['Trials', `=COUNTIFS('Lead Data'!Q:Q,">="&'Settings & Budget'!$B$30,'Lead Data'!Q:Q,"<="&'Settings & Budget'!$B$31,'Lead Data'!Q:Q,"<>")`]
```

## Implementation Order

1. ✅ constants.gs - DONE
2. ✅ onEdit handler - DONE
3. ✅ createLeadDataTab - DONE
4. ✅ createMembersTab - DONE
5. ✅ createLTVCalculationsTab (combined members formula) - DONE
6. ⏳ createDashboardTab - IN PROGRESS (needs formula updates)
7. ⏳ createChartDataTab - PENDING
8. ⏳ createMetricsTab - PENDING (if it references Lead Data)

## Testing Checklist

After updates:
- [ ] Verify DASHBOARD KPIs calculate correctly
- [ ] Check Source Analysis section
- [ ] Check Staff Performance section
- [ ] Verify LTV Analysis tab calculations
- [ ] Test Chart Data formulas
- [ ] Verify Metrics tab (Net Gain/Loss)
- [ ] Full end-to-end test: Lead → Appt → Show → Trial → Member → Cancel

## Status

- Lead Data Tab: ✅ COMPLETE
- Members Tab: ✅ COMPLETE
- LTV Calculations Tab: ✅ COMPLETE
- DASHBOARD Tab: ⏳ NEEDS FORMULA UPDATES (~50-60 references)
- Chart Data Tab: ⏳ NEEDS REVIEW
- Metrics Tab: ⏳ NEEDS REVIEW

---

**Next Steps:**
1. Systematically update all DASHBOARD formulas using search & replace
2. Review and test each section after updates
3. Update Chart Data and Metrics tabs
4. Full regression test
5. Document in CHANGELOG

