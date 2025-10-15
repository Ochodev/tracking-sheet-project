# GOOGLE SHEETS FORMULA PATTERNS

**Safe patterns for Google Sheets Apps Script**  
**Last Updated:** October 14, 2025

---

## 🎯 Purpose

This guide documents **proven formula patterns** that work reliably in Google Sheets, especially with ARRAYFORMULA.

**Use Case:** Reference this BEFORE writing complex formulas to avoid breaking the sheet.

---

## ✅ SAFE PATTERNS (Use These)

### Pattern 1: ARRAYFORMULA with Simple IF

**Works:** ✅ Single condition checks

```javascript
=ARRAYFORMULA(IF(A2:A="", "", B2:B*2))
```

**Why It Works:** Google Sheets handles simple array operations efficiently.

**Use For:**
- Simple calculations
- Blank row filtering
- Basic conditionals

---

### Pattern 2: VLOOKUP in ARRAYFORMULA

**Works:** ✅ Array lookups

```javascript
=ARRAYFORMULA(IF(A2:A="", "", VLOOKUP(A2:A, Table!A:C, 3, FALSE)))
```

**Why It Works:** VLOOKUP is optimized for array expansion.

**Use For:**
- Looking up values from another tab
- Pulling data from tables
- Source-based lookups

**⚠️ AVOID:** INDEX/MATCH in ARRAYFORMULA (use VLOOKUP instead)

---

### Pattern 3: MAP + LAMBDA for Complex Logic

**Works:** ✅ Per-row complex calculations

```javascript
=ARRAYFORMULA(MAP(A2:A10,
  LAMBDA(value,
    IF(value="", "", value * 2 + 10)
  )
))
```

**Why It Works:** MAP explicitly iterates, LAMBDA processes each item.

**Use For:**
- Complex per-row calculations
- When ARRAYFORMULA alone won't work
- Multi-step logic

**Example:** DASHBOARD Spend formula (lines 1115-1137 in code)

---

### Pattern 4: LET for Readable Complex Formulas

**Works:** ✅ Named intermediate values

```javascript
=LET(
  value1, A2*2,
  value2, B2+10,
  IF(value1>value2, value1, value2)
)
```

**Why It Works:** LET doesn't affect array behavior, just organizes logic.

**Use For:**
- Breaking complex formulas into steps
- Reusing calculated values
- Improving readability

**Example:** DASHBOARD CAC formula (line 1057 in code)

---

### Pattern 5: COUNTIFS/SUMIFS with Date Range

**Works:** ✅ Filtered aggregations

```javascript
=COUNTIFS(
  'Lead Data'!B:B, ">="&'Settings'!$B$30,
  'Lead Data'!B:B, "<="&'Settings'!$B$31,
  'Lead Data'!S:S, TRUE
)
```

**Why It Works:** Native Google Sheets function, highly optimized.

**Use For:**
- Counting with multiple conditions
- Summing with date filters
- All metrics calculations

**Example:** All DASHBOARD metrics use this pattern

---

### Pattern 6: Array Addition Instead of OR()

**Works:** ✅ Boolean logic in arrays

```javascript
// ❌ BAD - OR() doesn't array-expand
=ARRAYFORMULA(IF(OR(A2:A="", B2:B=""), "Blank", "Has Value"))

// ✅ GOOD - Addition of boolean arrays
=ARRAYFORMULA(IF((A2:A="")+(B2:B="")>0, "Blank", "Has Value"))
```

**Why It Works:** `(condition1)+(condition2)` evaluates TRUE as 1, FALSE as 0.

**Use For:**
- Multiple OR conditions in ARRAYFORMULA
- Complex boolean logic
- Array-based conditionals

**Example:** LTV:CAC formula (line 1157 in code)

---

### Pattern 7: QUERY for Filtered Data

**Works:** ✅ SQL-like filtering

```javascript
=QUERY('Lead Data'!A:AH, "SELECT * WHERE S=TRUE AND X<>TRUE ORDER BY T DESC", 1)
```

**Why It Works:** QUERY is optimized for large datasets.

**Use For:**
- Filtering rows with multiple conditions
- Sorting results
- Members tab, LTV Analysis tab

**⚠️ IMPORTANT:** Must include header row count (1) at end

---

## ❌ AVOID THESE PATTERNS

### Anti-Pattern 1: INDEX/MATCH in ARRAYFORMULA

**Breaks:** ❌ Doesn't array-expand properly

```javascript
// ❌ BAD - Often returns only first result
=ARRAYFORMULA(INDEX(Table!C:C, MATCH(A2:A, Table!A:A, 0)))
```

**Fix:** Use VLOOKUP instead (Pattern 2)

**Why It Fails:** INDEX/MATCH isn't designed for array expansion in Google Sheets.

---

### Anti-Pattern 2: OR() in ARRAYFORMULA

**Breaks:** ❌ Doesn't evaluate arrays correctly

```javascript
// ❌ BAD - Only checks first element
=ARRAYFORMULA(IF(OR(A2:A="", B2:B=""), "Blank", "Value"))
```

**Fix:** Use array addition (Pattern 6)

---

### Anti-Pattern 3: Nested ARRAYFORMULA

**Breaks:** ❌ Causes calculation errors

```javascript
// ❌ BAD - Don't nest ARRAYFORMULA
=ARRAYFORMULA(IF(A2:A="", "", ARRAYFORMULA(B2:B*2)))
```

**Fix:** Remove inner ARRAYFORMULA - outer one handles everything

---

### Anti-Pattern 4: Using ROW() Without Awareness

**Risky:** ⚠️ Breaks if rows inserted/deleted

```javascript
// ⚠️ RISKY - ROW() returns absolute row number
=ARRAYFORMULA(IF(A2:A="", "", ROW(A2:A)))
```

**Better:** Use relative references when possible

---

### Anti-Pattern 5: Too Many Volatile Functions

**Slow:** ⚠️ Causes performance issues

```javascript
// ⚠️ SLOW - TODAY() in ARRAYFORMULA recalculates constantly
=ARRAYFORMULA(IF(A2:A="", "", TODAY()-A2:A))
```

**Better:** Calculate once in a cell, reference that cell

**Acceptable:** If needed, it's okay - just be aware of performance cost

---

## 🧪 Testing Complex Formulas

### Before Deploying ANY Complex Formula:

1. **Test in isolated cell first**
   ```
   - Create test data (5-10 rows)
   - Try formula on small range
   - Verify output is correct
   ```

2. **Check array expansion**
   ```
   - Does it populate down automatically?
   - Are all rows calculating?
   - Any #N/A or #REF! errors?
   ```

3. **Test edge cases**
   ```
   - Empty cells → Should show ""
   - Zero values → Should handle gracefully
   - Missing data → Should not error
   ```

4. **Performance check**
   ```
   - Does it calculate quickly?
   - Any "Calculating..." delays?
   - Works with 1000+ rows?
   ```

---

## 📋 Formula Complexity Checklist

Before adding a complex formula, verify:

- [ ] **Pattern matches:** Using a proven pattern from this doc?
- [ ] **No anti-patterns:** Avoiding INDEX/MATCH, OR(), nested ARRAYFORMULA?
- [ ] **Tested isolated:** Works in test cell with sample data?
- [ ] **Edge cases:** Handles empty, zero, missing data?
- [ ] **Performance:** Calculates quickly (< 2 seconds)?
- [ ] **Documented:** Added inline comment explaining logic?
- [ ] **CELL_REFS:** Using constants, not hard-coded cells?
- [ ] **Rollback plan:** Can revert if breaks?

**If any checklist item is NO, reconsider the formula.**

---

## 🔧 Debugging Formula Issues

### Symptom: Formula returns #ERROR!

**Causes:**
1. Syntax error (unmatched parentheses, quotes)
2. MAP/LAMBDA syntax wrong
3. Using unsupported function in ARRAYFORMULA

**Fix:**
1. Check syntax carefully
2. Test in simple cell first
3. Simplify formula to find issue

---

### Symptom: Formula returns only first result

**Causes:**
1. Missing ARRAYFORMULA wrapper
2. Using INDEX/MATCH (use VLOOKUP)
3. Function not array-compatible

**Fix:**
1. Wrap in ARRAYFORMULA
2. Replace INDEX/MATCH with VLOOKUP
3. Use MAP/LAMBDA pattern

---

### Symptom: Formula slow or times out

**Causes:**
1. Too many volatile functions (TODAY, NOW, RAND)
2. Referencing entire columns (A:A) unnecessarily
3. Nested complex functions

**Fix:**
1. Reduce volatile functions
2. Use specific ranges (A2:A1000 vs A:A)
3. Simplify or break into steps

---

### Symptom: Formula works in one cell but not as ARRAYFORMULA

**Causes:**
1. Using non-array-compatible function
2. Using OR() instead of array addition
3. Using INDEX/MATCH instead of VLOOKUP

**Fix:**
1. Use MAP/LAMBDA pattern
2. Replace OR() with addition
3. Replace INDEX/MATCH with VLOOKUP

---

## 📚 Real-World Examples from Code

### Example 1: Spend Formula (DASHBOARD G20)

**Location:** GYM-OPS-ULTRA-COMPLETE.gs lines 1115-1137

**Pattern Used:** MAP + LAMBDA + LET

**Why This Pattern:**
- Needs to calculate overlap between date ranges
- Per-source calculation (MAP)
- Multiple intermediate values (LET)
- Complex boolean logic

**Key Insights:**
- Uses `(condition1)*(condition2)` for AND logic
- Filters data with FILTER() before processing
- Nested LAMBDA for second-level iteration

**Testing:** Requires Marketing Budget data to verify

---

### Example 2: LTV Formula (DASHBOARD L20)

**Location:** GYM-OPS-ULTRA-COMPLETE.gs line 1152

**Pattern Used:** VLOOKUP in ARRAYFORMULA

**Why This Pattern:**
- Needs to lookup values from _LTV Calculations
- Must array-expand to all sources
- VLOOKUP works, INDEX/MATCH doesn't

**Key Insight:** Column index is 7 (column T in N:T range)

---

### Example 3: Members QUERY (Members A2)

**Location:** GYM-OPS-ULTRA-COMPLETE.gs line 564

**Pattern Used:** QUERY with WHERE conditions

**Why This Pattern:**
- Filtering large dataset
- Multiple conditions (S=TRUE AND X<>TRUE)
- Sorting by date (ORDER BY T DESC)

**Key Insight:** The `1` at end includes header row

---

## 🎓 Best Practices Summary

1. **Start Simple:** Test with basic formula before making complex
2. **Use Proven Patterns:** Don't invent new patterns - use these
3. **Avoid Anti-Patterns:** INDEX/MATCH, OR(), nested ARRAYFORMULA
4. **Test Thoroughly:** Edge cases, performance, array expansion
5. **Document Inline:** Add comment explaining complex formulas
6. **Use CELL_REFS:** Reference constants, not hard-coded cells
7. **Have Rollback:** Know how to revert if formula breaks

---

## 🆘 When in Doubt

1. Check this document for proven pattern
2. Test in isolated cell with sample data
3. Run Health Check after deploying
4. Document in CHANGES.md
5. Keep backup before major changes

---

**Remember:** Complex formulas are often the source of breaking changes. Use these patterns to prevent issues.

**See also:** CELL-REFERENCE-MAP.md, TROUBLESHOOTING.md, DEPLOY-CHECKLIST.md

