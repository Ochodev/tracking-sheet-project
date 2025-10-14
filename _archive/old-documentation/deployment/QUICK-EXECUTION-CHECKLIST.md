# ⚡ QUICK EXECUTION CHECKLIST

**Time:** 30 minutes | **Difficulty:** Easy | **Risk:** Low

---

## 🎯 THE 3-STEP FIX

### **STEP 1: Fix the Code** (5 min)
```
1. Open Google Sheet
2. Extensions → Apps Script
3. Find line ~1009 (search for "Targets - Fixed")
4. Replace the loop with 7 explicit lines
5. Save (Ctrl+S)
```

**Copy this code:**
```javascript
sheet.getRange('C10').setFormula('=IFERROR(\'Settings & Budget\'!B3,"⚠️ Setup")'); // Leads
sheet.getRange('C11').setFormula('=IFERROR(\'Settings & Budget\'!B4,"⚠️ Setup")'); // Set Rate
sheet.getRange('C12').setFormula('=IFERROR(\'Settings & Budget\'!B5,"⚠️ Setup")'); // Show Rate
sheet.getRange('C13').setFormula('=IFERROR(\'Settings & Budget\'!B6,"⚠️ Setup")'); // Close Rate
sheet.getRange('C14').setFormula('=IFERROR(\'Settings & Budget\'!B7,"⚠️ Setup")'); // New Members
sheet.getRange('C15').setFormula('=IFERROR(\'Settings & Budget\'!B8,"⚠️ Setup")'); // MRR
sheet.getRange('C16').setFormula('=IFERROR(\'Settings & Budget\'!B9,"⚠️ Setup")'); // CAC
```

### **STEP 2: Make Testing Copy** (2 min)
```
1. File → Make a copy
2. Name: "test gym - Gym Ops (TESTING)"
3. Work in the copy first
```

### **STEP 3: Fix 7 Formulas** (8 min)
```
In DASHBOARD tab, update cells C10-C16:

C10: B2 → B3 (Leads: should show 70)
C11: B2 → B4 (Set %: should show 60%)
C12: B2 → B5 (Show %: should show 70%)
C13: B2 → B6 (Close %: should show 50%)
C14: B2 → B7 (Members: should show 20)
C15: B2 → B8 (MRR: should show $3,000)
C16: B2 → B9 (CAC: should show $150)
```

**Result:** D, E, F columns auto-fix! ✅

---

## ✅ SUCCESS CHECK

After Step 3, verify:
- [ ] C10-C16 show **numbers** (not "Target")
- [ ] D10-D16 show **numbers** (not #VALUE!)
- [ ] E10-E16 show **numbers** (not #VALUE!)
- [ ] F10-F16 show **status** (not #VALUE!)

If YES to all → **Apply to production sheet!**

---

## 🔄 APPLY TO PRODUCTION

Repeat Step 3 in original sheet → **DONE!** 🎉

---

**See EXECUTE-NOW.md for detailed instructions**

