# 🔧 FIX: Health Check Issues

**Sheet:** ggg - Gym Ops  
**Issues Found:** 9 (dropdown corruption + missing backup trigger)  
**Fix Time:** 2 minutes  
**Solution:** Run automated cleanup function

---

## 🎯 WHAT'S WRONG

Your health check found **data corruption** in Settings & Budget dropdown lists:

### **The Problem:**
The dropdown list areas (rows 14-24) are picking up data from the Marketing Budget section (rows 38+), causing:

- ❌ **Blank rows** in dropdowns (60-90 blanks each)
- ❌ **Duplicates** from budget data:
  - "Paid Search", "Paid Social" appearing in Staff column
  - Dollar amounts ($41.23, $42.60) in Cancel Reasons
  - Numbers (28, 30, 31) in Membership Types
- ❌ **Missing backup trigger**

### **Root Cause:**
The health check reads up to 100 rows per dropdown column and doesn't properly stop at section boundaries. It's reading budget data as if it were dropdown data.

---

## ⚡ QUICK FIX (2 Minutes)

### **Option 1: Automated Cleanup** (RECOMMENDED)

**Step 1:** Update Your Apps Script
```
1. Open your Google Sheet
2. Extensions → Apps Script
3. Replace Code.gs with the updated version from your project folder
4. Save (Ctrl+S)
5. Close Apps Script editor
```

**Step 2:** Run the Cleanup
```
1. Reload your Google Sheet (F5)
2. Click: Gym Ops → 🧹 Cleanup Settings Dropdowns
3. Click: YES to confirm
4. Wait for "✅ Cleanup Complete!" message
5. Done!
```

**Step 3:** Verify
```
1. Click: Gym Ops → Run Health Check
2. Should now show: "✅ Health Check Passed"
3. Or minimal issues (just blank rows, no duplicates/corruption)
```

---

### **Option 2: Manual Cleanup** (5-10 minutes)

If you can't deploy the code fix right now:

**Fix Staff Column (B14-B100):**
```
1. Go to Settings & Budget tab
2. Select range B15:B100 (below your staff names)
3. Press Delete
4. Keep only: mike, Coach A, Coach B (or your custom staff)
```

**Fix Types Column (D14-D100):**
```
1. Select range D18:D100 (below PT, Small Group, General, Class Pack)
2. Press Delete
3. Keep only the 4 membership types
```

**Fix Cancel Reasons Column (E14-E100):**
```
1. Select range E20:E100 (below Price, Moved, Injury, Service, Location, Other)
2. Press Delete  
3. Keep only the 6 cancel reasons
```

**Fix Status Values (G14-G100):**
```
1. Select range G20:G100
2. Press Delete
3. Keep only: Lead, Appt Set, Show, Trial, Member, Cancelled
```

**Add Separator:**
```
1. Click cell A36
2. Type: ━━━━━━━━━━━━━━━━━━━━━━
3. Format as gray color
4. This prevents health check from reading too far
```

**Fix Backup Trigger:**
```
1. Extensions → Apps Script
2. Run → setupMonthlyBackup (from dropdown)
3. Grant permissions if prompted
4. Check execution log - should say "trigger created"
```

---

## 🔍 UNDERSTANDING THE ISSUE

### **What Happened:**

The dropdown list columns (A, B, D, E, G) should only have data in rows 14-24. However, the Marketing Budget section starts at row 38 and uses columns A-E for:

| Row | A (Month) | B (Source) | C (Budget) | D (Days) | E (Rate) |
|-----|-----------|------------|------------|----------|----------|
| 40 | 2025-10 | Paid Search | $2,500 | 31 | $80.65 |
| 41 | 2025-10 | Paid Social | $1,500 | 31 | $48.39 |

The health check function reads B14:B100 and doesn't realize row 40+ is a different section, so it reports:
- "Paid Search", "Paid Social" as Staff (they're actually Sources in budget section)
- "$41.23", "$42.60" as Cancel Reasons (they're actually daily rates)
- "30", "31", "28" as Types (they're actually days in month)

### **The Fix:**

**Automated cleanup:**
1. Clears rows 14-24 completely
2. Rewrites with expected dropdown values
3. Removes any stray data between sections
4. Adds visual separator at row 36
5. Sets up backup trigger

**Result:** Clean, organized dropdown lists that health check reads correctly

---

## 📊 EXPECTED RESULTS

### **After Cleanup:**

**Health Check Should Show:**
```
✅ Health Check Passed
No issues detected.
```

**Or Minimal Issues:**
```
(Maybe a few blank rows if your custom lists are shorter than expected - that's OK)
```

**Dropdown Lists Should Contain:**

| Column | Name | Expected Values | Rows |
|--------|------|-----------------|------|
| A14-A24 | Sources | Paid Search, Paid Social, Direct Traffic, etc. | 11 items |
| B14-B16 | Staff | mike, Coach A, Coach B (or your custom names) | 3+ items |
| C14 | Location | ggg (your gym name) | 1 item |
| D14-D17 | Types | PT, Small Group, General, Class Pack | 4 items |
| E14-E19 | Cancel Reasons | Price, Moved, Injury, Service, Location, Other | 6 items |
| G14-G19 | Status | Lead, Appt Set, Show, Trial, Member, Cancelled | 6 items |

**Rows 25-35:** Empty (buffer zone)  
**Row 36:** Separator (━━━━━━)  
**Rows 38+:** Marketing Budget section (untouched)

---

## 🎯 VERIFICATION STEPS

After running cleanup:

**1. Visual Check:**
```
□ Go to Settings & Budget
□ Rows 14-24 have clean dropdown data
□ Row 36 has separator line
□ No stray data in rows 25-35
```

**2. Dropdown Test:**
```
□ Go to Lead Data tab
□ Click any Source cell (column H)
□ Dropdown should show 11 clean sources (no duplicates, no budget data)
□ Click any Staff cell (column J)
□ Dropdown should show only staff names (no "Paid Search")
```

**3. Health Check:**
```
□ Run: Gym Ops → Run Health Check
□ Should pass or show minimal issues
□ NO duplicates reported
□ NO corruption reported
```

**4. Backup Trigger:**
```
□ Extensions → Apps Script
□ Click clock icon (Triggers) on left sidebar
□ Should see: autoMonthlyBackup trigger scheduled
```

---

## 🆘 TROUBLESHOOTING

### Issue: Cleanup function not in menu
**Solution:**
```
You haven't deployed the updated Code.gs yet
Deploy the code first, then reload sheet
Menu item will appear
```

### Issue: Cleanup doesn't fix everything
**Solution:**
```
Use Manual Cleanup (Option 2 above)
Delete rows manually
More control over what's kept
```

### Issue: Health check still shows issues
**Solution:**
```
The health check may be too sensitive
If it's just "blank rows" and counts are low (<10), that's OK
If it's duplicates or corruption, run cleanup again
```

### Issue: Lost custom dropdown values
**Solution:**
```
Cleanup resets to defaults for most lists
To preserve custom values:
1. Note your custom values before cleanup
2. Add them back after in Settings & Budget
3. Or use Manual Cleanup for finer control
```

---

## 📝 QUICK REFERENCE

### **What Cleanup Does:**

✅ **Sources (A14-A24):** Resets to 11 standard sources  
✅ **Staff (B14-B24):** Keeps existing, removes blanks/dupes  
✅ **Location (C14):** Sets to default if empty  
✅ **Types (D14-D17):** Resets to 4 standard types  
✅ **Cancel Reasons (E14-E19):** Resets to 6 standard reasons  
✅ **Status (G14-G19):** Resets to 6 status values  
✅ **Separator:** Adds row 36 separator  
✅ **Backup:** Creates monthly trigger  

### **What It Doesn't Touch:**

📌 Monthly Targets (B3-B11) - preserved  
📌 UTM Mappings (G3-H15) - preserved  
📌 LTV Assumptions (G18-I21) - preserved  
📌 Date Range System (B27-B31) - preserved  
📌 Marketing Budget (A38+) - preserved  
📌 All other tabs - untouched  

---

## 🎯 RECOMMENDED ACTION

**Right Now:**
```
1. Deploy updated Code.gs to your sheet's Apps Script
2. Reload sheet
3. Run: Gym Ops → 🧹 Cleanup Settings Dropdowns
4. Verify with health check
5. ✅ Done in 2 minutes!
```

**Alternative:**
```
Use Manual Cleanup if you can't deploy code yet
Takes 5-10 minutes but gives you more control
```

---

## ✅ SUCCESS CRITERIA

You'll know it worked when:

✅ Health check passes (or shows <5 blank rows only)  
✅ No duplicates reported  
✅ No dollar amounts in non-budget columns  
✅ No "Paid Search" in Staff dropdown  
✅ Backup trigger configured  
✅ Dropdowns work correctly in Lead Data  

---

*Fix Guide Created: October 8, 2025*  
*For: Health check issues in Settings & Budget*  
*Solution: Automated cleanup function*  
*Time: 2 minutes to fix*

