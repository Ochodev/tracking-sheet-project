# Testing Quick Reference - 10 Phases

**File to Deploy:** `GYM-OPS-ULTRA-COMPLETE-SAFE.gs`  
**Test Each Phase Before Moving to Next**

---

## Phase 1: Trial End Formula

**Test:**
1. Lead Data → R2 has formula? ✓/✗
2. Add date in Q3 → R3 = Q3 + 14? ✓/✗
3. Clear Q3 → R3 becomes empty? ✓/✗

**If Pass:** → Phase 2  
**If Fail:** Report: "Phase 1 failed - R2 shows [error message]"

---

## Phase 2: Members Tab

**Test:**
1. Members → A2 has QUERY formula? ✓/✗
2. Add member (S=TRUE, X=FALSE) → appears in Members? ✓/✗
3. K4 shows correct count? ✓/✗

**If Pass:** → Phase 3  
**If Fail:** Report: "Phase 2 failed - [describe issue]"

---

## Phase 3: Dashboard CAC

**Test:**
1. DASHBOARD → B16 shows number or "-"? (not #ERROR!) ✓/✗
2. Settings → Enter budget for Oct 2024, $3000
3. Add 10 members
4. B16 = $300? ✓/✗

**If Pass:** → Phase 4  
**If Fail:** Report: "Phase 3 failed - B16 shows [value]"

---

## Phase 4: Source Spend

**Test:**
1. Settings → Enter:
   - 2024-10, Paid Search, $2000
2. DASHBOARD → G20 (Paid Search row) shows $2000? ✓/✗

**If Pass:** → Phase 5  
**If Fail:** Report: "Phase 4 failed - G20 shows [value]"

---

## Phase 5: Source CAC

**Test:**
1. DASHBOARD → K20 shows values? ✓/✗
2. Source with $0 spend shows "Organic"? ✓/✗
3. Source with spend shows $ amount? ✓/✗

**If Pass:** → Phase 6  
**If Fail:** Report: "Phase 5 failed - K20 shows [value]"

---

## Phase 6: Source LTV

**Test:**
1. Add 5 members from "Paid Search"
2. DASHBOARD → L20 shows $ value (not 0)? ✓/✗
3. Matches _LTV Calculations? ✓/✗

**If Pass:** → Phase 7  
**If Fail:** Report: "Phase 6 failed - L20 shows [value]"

---

## Phase 7: CPL/CPA/CPS

**Test:**
1. DASHBOARD → H20 = whole dollars? ✓/✗
2. I20 = whole dollars? ✓/✗
3. J20 = whole dollars? ✓/✗
4. Math correct (Spend/Count)? ✓/✗

**If Pass:** → Phase 8  
**If Fail:** Report: "Phase 7 failed - [which column] shows [value]"

---

## Phase 8: LTV Analysis

**Test:**
1. LTV Analysis tab → Row 4 has data? ✓/✗
2. Shows sources with counts? ✓/✗
3. No #REF! errors? ✓/✗

**If Pass:** → Phase 9  
**If Fail:** Report: "Phase 8 failed - [describe issue]"

---

## Phase 9: Sample Leads + UTM

**Test:**
1. Run "Add 20 Sample Leads"
2. Lead Data → Column H shows source names? (not "Not Tracked") ✓/✗
3. Unhide _UTM Tracking → 20 rows added? ✓/✗
4. Column O matches column H? ✓/✗

**If Pass:** → Phase 10  
**If Fail:** Report: "Phase 9 failed - Column H shows [value]"

---

## Phase 10: New Revenue Section

**Test:**
1. DASHBOARD → Row 70 has section header? ✓/✗
2. Add 3 PT members ($200 each)
3. Add 2 General members ($150 each)
4. Row 72 (PT): 3 members, $600 MRR, $200 avg? ✓/✗
5. Row 73 (Small Group): Correct values? ✓/✗
6. Row 74 (General): 2 members, $300 MRR, $150 avg? ✓/✗
7. % of Total adds to 100%? ✓/✗

**If Pass:** ✅ ALL DONE!  
**If Fail:** Report: "Phase 10 failed - [describe issue]"

---

## Quick Test (After All Phases Pass)

1. Add 20 sample leads
2. Go to DASHBOARD
3. All sections populated? ✓/✗
4. No #ERROR! anywhere? ✓/✗
5. No #REF! anywhere? ✓/✗
6. All formulas calculating? ✓/✗

**If all ✓:** 🎉 **SUCCESS!**  
**If any ✗:** Report which section has issues

---

## Deployment (2 Minutes)

1. Copy `GYM-OPS-ULTRA-COMPLETE-SAFE.gs`
2. Extensions → Apps Script
3. Delete all Code.gs
4. Paste new code
5. Save (Cmd+S)
6. Close Apps Script
7. Refresh sheet (F5)
8. Wait 30 sec for menu
9. Gym Ops → Initialize Template V2
10. Done!

---

## If You Get Errors

**Syntax Error in Apps Script:**
- Check you copied the ENTIRE file
- Make sure no characters were cut off
- Try copying in smaller chunks

**#REF! in DASHBOARD:**
- Verify _Metrics tab exists and is hidden
- Verify _LTV Calculations tab exists
- Re-run Initialize if needed

**#ERROR! in formulas:**
- Note which cell (e.g., G20)
- Note which phase
- Report to me with exact error

**Source shows "Not Tracked":**
- Phase 9 might have failed
- Check _UTM Tracking has data
- Verify column O is populated

---

## Success Indicators

After all testing:

✅ All 10 phases passed  
✅ No #ERROR! in any cell  
✅ No #REF! in any cell  
✅ Sample leads populate correctly  
✅ DASHBOARD shows all metrics  
✅ Source Analysis fully functional  
✅ New Revenue section working  

**You should see:**
- DASHBOARD with 8 sections (all working)
- Members showing active members only
- LTV Analysis with populated data
- Settings with marketing budget
- Lead Data with auto-calculated columns

---

**Report Results:**
- "All 10 phases passed! ✅"
- OR: "Phase [X] failed - [specific issue]"

Test systematically and we'll fix any issues immediately!

