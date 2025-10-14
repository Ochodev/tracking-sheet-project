# Deploy & Test - Step-by-Step Guide

**Time Required:** 30 minutes  
**File to Use:** `GYM-OPS-ULTRA-COMPLETE-SAFE.gs`

---

## STEP 1: Deploy (2 minutes)

1. Open this file in your text editor:
   ```
   GYM-OPS-ULTRA-COMPLETE-SAFE.gs
   ```

2. Select ALL text (Cmd+A or Ctrl+A)

3. Copy (Cmd+C or Ctrl+C)

4. Open your Google Sheet:
   ```
   https://docs.google.com/spreadsheets/d/[your-sheet-id]/edit
   ```

5. Click: **Extensions → Apps Script**

6. In the Code.gs file:
   - Select ALL existing code (Cmd+A)
   - Delete it
   - Paste the new code (Cmd+V)

7. Save (Cmd+S or Ctrl+S)

8. Close the Apps Script tab

9. Back in Google Sheet, refresh the page (F5 or Cmd+R)

10. Wait 30 seconds for "Gym Ops" menu to appear in menu bar

---

## STEP 2: Initialize (1 minute)

1. Click menu: **Gym Ops → Initialize Template V2**

2. Click **YES** to confirm

3. Click **OK** when it says "Creating tabs..."

4. Wait ~30 seconds

5. Click **OK** when initialization completes

6. You should now see 13 tabs at the bottom

---

## STEP 3: Setup Marketing Budget (2 minutes)

1. Go to **Settings & Budget** tab

2. Scroll down to row 42 (Marketing Budget section)

3. Enter ONE month of test data:
   - **A44:** 2024-10 (current month)
   - **B44:** Paid Search (select from dropdown)
   - **C44:** 3000 (monthly budget)
   - **D44:** Should auto-fill "31" (days in month)
   - **E44:** Should auto-fill "96.77" (daily rate)

4. If D44 and E44 auto-calculate → ✅ **PHASE 1 WORKING**

---

## STEP 4: Add Sample Leads (1 minute)

1. Click menu: **Gym Ops → Add 20 Sample Leads**

2. Click **YES** to confirm

3. Wait 5 seconds

4. Click **OK**

5. You should be on Lead Data tab with 20 new rows

---

## STEP 5: Verify Sample Leads (2 minutes)

Check Lead Data tab:

| Column | Expected | Pass? |
|--------|----------|-------|
| H (Source) | Source names (not "Not Tracked") | ✓/✗ |
| R (Trial End) | Blank (no trials started yet) | ✓/✗ |
| AB (Current Status) | Mix of "Lead", "Appt Set", "Member" | ✓/✗ |
| AC (Age Days) | Numbers like 5, 12, 27 | ✓/✗ |

**If all ✓:** → Continue  
**If any ✗:** → STOP, report to me

---

## STEP 6: Test Trial End Formula (3 minutes)

1. In Lead Data, find any row where:
   - P (Start Trial?) = FALSE
   - S (Converted?) = FALSE

2. Click on column P checkbox → Check it

3. Column Q (Trial Start) should auto-fill with today's date

4. Check column R (Trial End):
   - Should show today's date + 14 days
   - Example: Today is Oct 13 → R should show Oct 27

**Pass?** ✓/✗

**If ✗:** Report what R shows

---

## STEP 7: Test Members Tab (2 minutes)

1. Go to **Members** tab

2. Should see a list of active members (those with Converted? = TRUE)

3. Check **Summary box** (K4):
   - Should show count (e.g., "8")
   - Should match number of rows below

4. Check **Active MRR** (K5):
   - Should show total (e.g., "$1,200")

**Pass?** ✓/✗

**If ✗:** Report what you see

---

## STEP 8: Test Dashboard CAC (3 minutes)

1. Go to **DASHBOARD** tab

2. Find row 16 (CAC row in Key Metrics section)

3. Check B16:
   - Should show $ amount OR "-"
   - Should NOT show #ERROR!

4. If it shows "-":
   - Go to Settings & Budget
   - Make sure you entered marketing budget (Step 3)
   - Make sure you have converted members (S=TRUE)
   - Come back to DASHBOARD
   - Verify B16 now shows $ amount

**Pass?** ✓/✗

**If ✗:** Report what B16 shows (exact text or error)

---

## STEP 9: Test Source Analysis (5 minutes)

1. In DASHBOARD, scroll to row 18 (Source Analysis section)

2. Check each column for the "Paid Search" row (should be row 20):

| Column | Metric | Expected | Pass? |
|--------|--------|----------|-------|
| B20 | Leads | Number (e.g., 8) | ✓/✗ |
| C20 | Appts | Number (e.g., 5) | ✓/✗ |
| D20 | Showed | Number (e.g., 3) | ✓/✗ |
| E20 | Show Rate | Percentage (e.g., 60.0%) | ✓/✗ |
| F20 | Close Rate | Percentage (e.g., 33.3%) | ✓/✗ |
| G20 | Spend | Dollar amount (e.g., $3,000) | ✓/✗ |
| H20 | CPL | Dollar amount (e.g., $375) | ✓/✗ |
| I20 | CPA | Dollar amount (e.g., $600) | ✓/✗ |
| J20 | CPS | Dollar amount (e.g., $1,000) | ✓/✗ |
| K20 | CAC | Dollar OR "Organic" OR "-" | ✓/✗ |
| L20 | LTV | Dollar (might be 0 initially) | ✓/✗ |
| M20 | LTV:CAC | Ratio (e.g., "2.5x") OR "-" | ✓/✗ |

**Math Check:**
- CPL should = Spend / Leads (G20 / B20)
- CPA should = Spend / Appts (G20 / C20)
- CPS should = Spend / Shows (G20 / D20)

**If ALL ✓:** → Continue  
**If ANY ✗:** → Report which column shows what

---

## STEP 10: Test Action Items (2 minutes)

In DASHBOARD, check these rows:

| Row | Section | Expected |
|-----|---------|----------|
| 18 | No Appt Set (24h) | List of names OR "None" |
| 22 | No Shows | List of names OR "None" |
| 26 | Trials Expiring (3d) | "None" (no trials yet) |
| 30 | Trials Ending (7d) | "None" (no trials yet) |

**Pass?** ✓/✗

---

## STEP 11: Test New Revenue Section (3 minutes)

1. In DASHBOARD, scroll to row 70

2. Should see: **"NEW REVENUE BY MEMBERSHIP TYPE (Selected Range)"**

3. Check rows 72-75:

| Row | Type | New Members | New MRR | Avg MRR | % Total |
|-----|------|-------------|---------|---------|---------|
| 72 | PT | Number | $ | $ | % |
| 73 | Small Group | Number | $ | $ | % |
| 74 | General | Number | $ | $ | % |
| 75 | Class Pack | Number | $ | $ | % |

4. Verify % Total adds up to 100%

**Pass?** ✓/✗

**If ✗:** Report what's wrong

---

## STEP 12: Test Net Gain/Loss (2 minutes)

1. In DASHBOARD, find row 52 (Net Gain/Loss section)

2. Rows 54-58 should show membership types with:
   - Gains (new members)
   - Losses (cancelled members)
   - Net (gains - losses)
   - % Change

3. Green background = growth  
   Red background = decline

**Pass?** ✓/✗

---

## STEP 13: Test LTV Analysis (2 minutes)

1. Go to **LTV Analysis** tab

2. Check row 4:
   - Should show sources with data
   - NOT blank
   - No #REF! errors

3. Scroll down to other sections:
   - LTV by Package (row 18)
   - Monthly Churn (row 31)
   - Cohort Analysis (row 31)

4. Might show zeros (expected if no historical data)

**Pass?** ✓/✗

---

## STEP 14: Test UTM Tracking (1 minute)

1. Find **_UTM Tracking** tab (hidden - right-click to unhide)

2. Should have 20 rows (matching 20 sample leads)

3. Column O (Final Source) should have source names

4. Compare to Lead Data column H - should match

**Pass?** ✓/✗

---

## Results Summary

After all testing, report:

```
Phase 1 (Trial End): ✓/✗
Phase 2 (Members): ✓/✗
Phase 3 (CAC): ✓/✗
Phase 4 (Spend): ✓/✗
Phase 5 (Source CAC): ✓/✗
Phase 6 (LTV): ✓/✗
Phase 7 (CPL/CPA/CPS): ✓/✗
Phase 8 (LTV Analysis): ✓/✗
Phase 9 (UTM): ✓/✗
Phase 10 (New Revenue): ✓/✗
```

---

## If Everything Passes ✅

**Congratulations!** Your Gym Ops Tracker is fully functional.

**What You Have:**
- Working Lead Data with auto-calculations
- Members tab showing active members
- DASHBOARD with all metrics calculating correctly
- Source Analysis fully functional
- Action Items for daily follow-up
- New Revenue breakdown by type
- Net Gain/Loss tracking
- LTV Analysis with cohorts

**Next Steps:**
1. Clear sample data (delete rows in Lead Data)
2. Start entering real leads
3. Set up Zapier integration (optional)
4. Enter historical members in Import Members tab (optional)

---

## If Something Fails ✗

**Report Format:**

```
FAILED: Phase [number]
Cell: [e.g., DASHBOARD G20]
Shows: [exact value, e.g., "#ERROR!", "0", blank]
Expected: [what it should show]
Screenshot: [if helpful]
```

**I will:**
1. Identify the root cause
2. Provide exact fix
3. You apply and re-test
4. We iterate until it passes

**No more guessing. We'll debug together.**

---

## Time Investment

| Activity | Time |
|----------|------|
| Deploy code | 2 min |
| Initialize | 1 min |
| Setup budget | 2 min |
| Add sample leads | 1 min |
| Test all 10 phases | 20 min |
| **TOTAL** | **26 min** |

**Worth it?** YES - You'll have a production-ready gym operations system.

---

**Ready?** Start with STEP 1 (Deploy).

**Questions?** Read `WHY-THIS-SHOULD-WORK.md` for my approach.

**Issues?** Report phase number and exact error.

**Let's do this. 🚀**

