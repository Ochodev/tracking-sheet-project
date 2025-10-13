# 🔧 HIGH #6: Duplicate Lead Detection - Implementation Log

## 📋 PRE-IMPLEMENTATION ANALYSIS

### **Current Understanding:**

**Problem:**
- Column AD2 shows "⚠️ CHECK" for duplicates AFTER they're added
- No prevention - user can add same lead multiple times
- Relies on user noticing the warning
- No prompt to merge or cancel

**Current Implementation:**
```javascript
// AD2: Duplicate Check - Flag potential duplicates
sheet.getRange('AD2').setFormula('=ARRAYFORMULA(IF(A2:A5000="","",IF(OR(COUNTIF(E:E,E2:E5000)>1,COUNTIF(F:F,F2:F5000)>1),"⚠️ CHECK","✓")))');
```
- Checks phone (column E) and email (column F)
- Shows warning symbol if duplicate found
- **REACTIVE** (after the fact), not **PROACTIVE** (before adding)

**Risk Level:** 🟡 HIGH
- Duplicate leads skew metrics
- Wasted marketing spend counting same person twice
- Confusion in CRM
- Data quality issues

**Solution Design:**

Enhance `onEdit` trigger to:
1. Detect when user enters phone or email
2. Check for existing leads with same phone/email
3. Show alert with duplicate info
4. Give options: Cancel, Continue Anyway, View Duplicate

**Key Challenge:**
- onEdit triggers on EVERY cell edit
- Must be fast (no lag)
- Only check phone/email columns
- Only check on Lead Data tab

---

## 🎯 STEP 1: DESIGN DETECTION LOGIC

**Status:** ✅ COMPLETE

### **When to Check:**

✅ **Check when:**
- User edits column E (Phone) in Lead Data
- User edits column F (Email) in Lead Data
- Row 2 or higher (not header)

❌ **Don't check when:**
- Other columns edited
- Other tabs
- Header row
- Empty value entered

### **Detection Logic:**

```javascript
1. User enters phone in E5
2. onEdit trigger fires
3. Check if column = E (Phone)
4. Search column E for matching phone
5. If found in different row → Duplicate!
6. Get lead info from duplicate row
7. Show alert with details
8. User chooses: Cancel / Continue / View
```

### **Alert UI Design:**

```
⚠️ Potential Duplicate Lead Found!

A lead with this PHONE already exists:

  Name: John Smith
  Email: john@example.com
  Created: 2025-09-15
  Status: Member
  Row: 45

This might be:
• Same person (duplicate)
• Family member (same phone)
• Old number reassigned (rare)

What would you like to do?

[Cancel Entry]  [Continue Anyway]  [View Lead]
```

---

## 🔨 STEP 2: IMPLEMENTATION PLAN

**Status:** 🔄 READY TO START

### **Implementation Steps:**

1. Create `checkForDuplicate(sheet, row, col, value)` helper function
2. Integrate into existing `onEdit()` trigger
3. Create `showDuplicateAlert(duplicateInfo)` helper
4. Test with various scenarios
5. Handle edge cases

### **Function Design:**

**`checkForDuplicate(sheet, row, col, value)`**
- Returns: `null` (no duplicate) or `duplicateInfo` object
- Fast: Only searches one column
- Ignores current row (user editing their own data)

**`showDuplicateAlert(ui, duplicateInfo, currentRow)`**
- Shows formatted alert
- Returns user choice
- Clears cell if user cancels

### **Edge Cases:**

✅ User editing existing lead (same row) - Skip check
✅ Empty value entered - Skip check
✅ Multiple duplicates found - Show first one
✅ Duplicate is in same row being edited - Ignore
✅ User pastes multiple rows - Check each (might be slow, acceptable)

---

**Ready to implement!**

