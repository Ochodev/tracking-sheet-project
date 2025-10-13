# 🔧 COLUMN REFERENCE FIX GUIDE
## Systematic Correction of All Formula References

**Problem:** Trial Start Date column (Q) was added, shifting all subsequent columns.  
**Solution:** Comprehensive formula update across all affected tabs.

---

## 📊 **COLUMN MAPPING: OLD vs NEW**

After adding column Q (Trial Start Date), all columns from R onward shifted by +1:

| Purpose | OLD Column | NEW Column | Letter Change |
|---------|------------|------------|---------------|
| Lead ID | A | A | No change |
| Created Date | B | B | No change |
| ... | C-O | C-O | No change |
| Trial Start (checkbox) | P | P | No change |
| **Trial Start Date** | **N/A** | **Q** | **NEW!** |
| Trial End | **P** | **R** | **+1** |
| Converted (checkbox) | **Q** | **S** | **+1** |
| Member Start | **R** | **T** | **+1** |
| Membership Type | **S** | **U** | **+1** |
| MRR | **T** | **V** | **+1** |
| Upfront Fee | **U** | **W** | **+1** |
| Cancelled (checkbox) | **V** | **X** | **+1** |
| Cancel Date | **W** | **Y** | **+1** |
| Cancel Reason | **X** | **Z** | **+1** |
| Notes | **Y** | **AA** | **+1** |
| Current Status | **Z** | **AB** | **+1** |
| Age Days | **AA** | **AC** | **+1** |
| Lead Score | **AB** | **AD** | **+1** |
| Action Needed | **AC** | **AE** | **+1** |
| Duplicate Flag | **AD** | **AF** | **+1** |
| Days to Convert | **AE** | **AG** | **+1** |
| Last Touchpoint | **AF** | **AH** | **+1** |

---

## 🎯 **FIND & REPLACE STRATEGY**

**CAUTION:** Simple find/replace is dangerous because:
- `:Q` appears in date formulas (`">="&...`)
- `:R` appears in ROW functions
- Need context-aware replacement

**Safe Approach:** Search for column references in specific patterns:

### **Pattern 1: COUNTIFS/SUMIFS Column References**
```
'Lead Data'!Q:Q  → 'Lead Data'!S:S  (if referring to Converted)
'Lead Data'!R:R  → 'Lead Data'!T:T  (if referring to Member Start)
'Lead Data'!S:S  → 'Lead Data'!U:U  (if referring to Membership Type)
etc.
```

### **Pattern 2: FILTER Column Ranges**
```
'Lead Data'!A:Z  → 'Lead Data'!A:AB  (if filtering to Current Status)
'Lead Data'!A:AF → 'Lead Data'!A:AH (if filtering all columns)
```

### **Pattern 3: Index/Array References**
```
LeadCol.CONVERTED (old: 18) → (new: 19)
LeadCol.MEMBER_START (old: 19) → (new: 20)
etc.
```

---

## 📋 **FORMULAS TO FIX BY TAB**

### **DASHBOARD Tab**

#### **Row 5 - Hot Leads (B5):**
```javascript
// CURRENT (BROKEN):
=COUNTIFS('Lead Data'!AB:AB,"🔥 HOT",'Lead Data'!Q:Q,FALSE,'Lead Data'!V:V,FALSE)

// FIXED:
=COUNTIFS('Lead Data'!AD:AD,"🔥 HOT",'Lead Data'!S:S,FALSE,'Lead Data'!X:X,FALSE)

// CHANGES:
// AB → AD (Lead Score)
// Q → S (Converted checkbox)
// V → X (Cancelled checkbox)
```

#### **Row 5 - Trials Expiring (F5):**
```javascript
// CURRENT (BROKEN):
=COUNTIFS('Lead Data'!P:P,">="&TODAY(),'Lead Data'!P:P,"<="&TODAY()+3,'Lead Data'!Q:Q,FALSE,'Lead Data'!O:O,"<>")

// FIXED:
=COUNTIFS('Lead Data'!R:R,">="&TODAY(),'Lead Data'!R:R,"<="&TODAY()+3,'Lead Data'!S:S,FALSE,'Lead Data'!Q:Q,"<>")

// CHANGES:
// P → R (Trial End)
// Q → S (Converted checkbox)
// O stays O (Show Date)
```

#### **Row 6 - Active MRR (B6):**
```javascript
// CURRENT (BROKEN):
=SUMIFS('Lead Data'!T:T,'Lead Data'!Q:Q,TRUE,'Lead Data'!V:V,FALSE)

// FIXED:
=SUMIFS('Lead Data'!V:V,'Lead Data'!S:S,TRUE,'Lead Data'!X:X,FALSE)

// CHANGES:
// T → V (MRR)
// Q → S (Converted checkbox)
// V → X (Cancelled checkbox)
```

#### **Row 10-16 - Key Metrics:**
Most are OK, but verify:

**B14 (New Members) - BROKEN:**
```javascript
// CURRENT:
=COUNTIFS('Lead Data'!S:S,">="&'Settings & Budget'!B30,'Lead Data'!S:S,"<="&'Settings & Budget'!B31,'Lead Data'!R:R,TRUE,'Lead Data'!V:V,FALSE)

// FIXED:
=COUNTIFS('Lead Data'!T:T,">="&'Settings & Budget'!B30,'Lead Data'!T:T,"<="&'Settings & Budget'!B31,'Lead Data'!S:S,TRUE,'Lead Data'!X:X,FALSE)

// CHANGES:
// S → T (Member Start date)
// R → S (Converted checkbox)
// V → X (Cancelled checkbox)
```

**B15 (MRR) - BROKEN:**
```javascript
// CURRENT:
=SUMIFS('Lead Data'!T:T,'Lead Data'!R:R,TRUE,'Lead Data'!V:V,FALSE)

// FIXED:
=SUMIFS('Lead Data'!V:V,'Lead Data'!S:S,TRUE,'Lead Data'!X:X,FALSE)

// CHANGES:
// T → V (MRR)
// R → S (Converted checkbox)
// V → X (Cancelled checkbox)
```

#### **Action Items (Rows 20, 25, 30):**

**Row 20 (No Appt Set):**
```javascript
// CURRENT (BROKEN):
=IFERROR(LET(items,FILTER('Lead Data'!C:C&" "&'Lead Data'!D:D,'Lead Data'!B:B<TODAY()-1,'Lead Data'!L:L=FALSE,'Lead Data'!Q:Q=FALSE,'Lead Data'!R:R="",...)

// FIXED:
=IFERROR(LET(items,FILTER('Lead Data'!C:C&" "&'Lead Data'!D:D,'Lead Data'!B:B<TODAY()-1,'Lead Data'!L:L=FALSE,'Lead Data'!S:S=FALSE,'Lead Data'!T:T="",...)

// CHANGES:
// Q → S (Converted checkbox)
// R → T (Member Start)
```

**Row 25 (No Shows):**
```javascript
// CURRENT (BROKEN):
=IFERROR(LET(items,FILTER(...,'Lead Data'!Q:Q=FALSE,'Lead Data'!R:R="",...))

// FIXED:
=IFERROR(LET(items,FILTER(...,'Lead Data'!S:S=FALSE,'Lead Data'!T:T="",...))

// CHANGES: Same as above
```

**Row 30 (Trials Expiring):**
```javascript
// CURRENT (BROKEN):
=IFERROR(LET(items,FILTER(...,'Lead Data'!P:P>=TODAY(),'Lead Data'!P:P<=TODAY()+3,'Lead Data'!Q:Q=FALSE,'Lead Data'!O:O<>"",...)

// FIXED:
=IFERROR(LET(items,FILTER(...,'Lead Data'!R:R>=TODAY(),'Lead Data'!R:R<=TODAY()+3,'Lead Data'!S:S=FALSE,'Lead Data'!Q:Q<>"",...)

// CHANGES:
// P → R (Trial End)
// Q → S (Converted checkbox) 
// O → Q (Trial Start Date) for "has started trial" check
```

---

### **Members Tab**

#### **Main Filter Formula:**
```javascript
// CURRENT:
=FILTER('Lead Data'!A:AH,('Lead Data'!S:S=TRUE)*('Lead Data'!X:X<>TRUE))

// VERIFY: Is this correct?
// S = Converted checkbox (column 19) ✅
// X = Cancelled checkbox (column 24) ✅
// A:AH = All 34 columns ✅

// ACTUALLY CORRECT! No change needed.
```

---

### **_Chart Data Tab**

Need to review all 7 sections. Key issues:

#### **Section 2 - Funnel Conversion (around line 2590):**
```javascript
// Check all references to converted, members, etc.
// Likely need to update R→S, S→T, T→V, V→X patterns
```

#### **Section 3 - Lead Sources (around line 2600):**
```javascript
// Check CAC formulas
// Member count formulas: R→S, S→T
```

#### **Section 4 - Revenue Trend (around line 2670):**
```javascript
// MRR references: T→V
// Cancelled references: V→X, W→Y
```

---

### **_LTV Calculations Tab**

Complex formulas need careful review. Common patterns:

```javascript
// Member Start: R→T
// Converted: Q→S
// Membership Type: S→U
// MRR: T→V
// Cancelled: V→X
// Cancel Date: W→Y
```

---

### **_Metrics Tab**

#### **Net Gain/Loss Formulas (line 2815-2819):**
```javascript
// CURRENT (line 2816):
'Lead Data'!T:T,">="&... // Member Start
'Lead Data'!U:U,"${type}" // Membership Type

// CHECK: 
// T is now Member Start (20) ✅
// U is now Membership Type (21) ✅

// CURRENT (line 2819):
'Lead Data'!Y:Y,">="&... // Cancel Date
'Lead Data'!U:U,"${type}" // Membership Type

// CHECK:
// Y is now Cancel Date (25) ✅
// U is now Membership Type (21) ✅

// ACTUALLY CORRECT! These were updated properly.
```

---

## 🔍 **VERIFICATION CHECKLIST**

After making fixes, verify:

### **1. DASHBOARD Snapshot Section:**
- [ ] Hot Leads count matches manual count
- [ ] Active MRR matches manual sum
- [ ] Trials expiring count is accurate

### **2. DASHBOARD Key Metrics:**
- [ ] New Members count matches Lead Data
- [ ] MRR total is correct
- [ ] CAC calculation runs without error

### **3. DASHBOARD Action Items:**
- [ ] No Appt Set list shows correct leads
- [ ] No Shows list is accurate
- [ ] Trials Expiring list matches

### **4. Members Tab:**
- [ ] Shows only converted, non-cancelled members
- [ ] All 33 columns display correctly

### **5. LTV Analysis Tab:**
- [ ] All 5 sections populate with data
- [ ] No #REF! errors
- [ ] Numbers look reasonable

### **6. Charts:**
- [ ] All 7 charts display data
- [ ] No errors in chart data
- [ ] Trends look correct

---

## 🎯 **IMPLEMENTATION PLAN**

### **Step 1: Create Test Data**
```javascript
// Add to Code.gs
function createTestData() {
  // Generate 10 leads with various statuses
  // Include: new lead, appt set, showed, trial, converted, cancelled
  // Verify column alignment manually
}
```

### **Step 2: Fix LTV Analysis (Quick Win)**
- Change 5 lines: setValue → setFormula
- Test immediately
- Should populate all 5 sections

### **Step 3: Fix DASHBOARD (High Impact)**
- Fix rows 5, 6 (snapshot)
- Fix rows 14, 15 (key metrics)
- Fix rows 20, 25, 30 (action items)
- Test with sample data

### **Step 4: Fix _Chart Data (Medium Impact)**
- Review all 7 sections
- Update column references systematically
- Test charts display correctly

### **Step 5: Fix _LTV Calculations (Complex)**
- Review all formulas carefully
- Test with sample data including conversions and cancellations

### **Step 6: Verify All Tabs**
- Run through complete checklist
- Document any remaining issues

---

**END OF FIX GUIDE**

*Ready to implement fixes systematically*


