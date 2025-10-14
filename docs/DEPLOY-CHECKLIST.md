# DEPLOYMENT CHECKLIST

**Use this checklist before deploying ANY changes to production**

---

## ✅ Pre-Deployment Checklist

### 1. Code Validation

- [ ] **Run Apps Script linter** - No syntax errors
- [ ] **Check for hard-coded cell references** - Use CELL_REFS constants
- [ ] **Review changed formulas** - Verify logic is correct
- [ ] **Check formula syntax** - All parentheses balanced, quotes matched
- [ ] **Verify ARRAYFORMULA usage** - Complex formulas work in arrays

### 2. Automated Testing

- [ ] **Run: Gym Ops → Health Check**
  - Expected: "✅ HEALTH CHECK PASSED"
  - If failed: Fix issues before proceeding

- [ ] **Run: Gym Ops → Validate & Auto-Fix**
  - Expected: 0 failed tests
  - If auto-fixed: Verify fixes are correct
  - If manual fix needed: Address before deploying

- [ ] **Run: Gym Ops → Quick Test**
  - Expected: "✅ All tests passed!"
  - If failed: Review error messages

### 3. Manual Verification

#### DASHBOARD Tab
- [ ] All metrics show values (not 0 or blank)
- [ ] Date range dropdown works (B2)
- [ ] SOURCE ANALYSIS section:
  - [ ] Spend column (G) shows dollar amounts
  - [ ] CPL, CPA, CPS show values or "Organic"
  - [ ] CAC shows values or "Organic"
  - [ ] LTV shows dollar amounts
  - [ ] LTV:CAC shows ratios (e.g., "3.5x")

#### Lead Data Tab
- [ ] Source column (H) auto-populates
- [ ] Trial End column (R) auto-calculates
- [ ] Current Status column (AB) shows correct statuses
- [ ] Checkboxes work (L, N, P, S, X)
- [ ] Dropdowns work (H, J, U, Z)

#### Members Tab
- [ ] Shows active members only
- [ ] No cancelled members visible
- [ ] Summary counts accurate (K4, K5)

#### Settings & Budget Tab
- [ ] Date range calculates correctly (B30, B31)
- [ ] Trial length set (B33)
- [ ] Source list populated (A14:A24)
- [ ] Marketing Budget has data (if applicable)

### 4. Documentation

- [ ] **Update CHANGES.md** with:
  - Date and version
  - Files changed (with line numbers)
  - What changed and why
  - Impact analysis
  - Test results

- [ ] **Update version number** in:
  - [ ] File header comment
  - [ ] ARCHITECTURE.md
  - [ ] README.md (if applicable)

- [ ] **Git commit** with descriptive message:
  ```
  git add .
  git commit -m "Fix: [Brief description]
  
  - Changed: [File] line [X]
  - Impact: [What it affects]
  - Tested: All health checks pass
  
  See CHANGES.md for details"
  ```

### 5. Backup

- [ ] **Copy current production file**:
  - Name: `GYM-OPS-BACKUP-YYYY-MM-DD.gs`
  - Store in: Project root or _archive/

- [ ] **Git tag** (for major changes):
  ```
  git tag v2.2.X
  git push origin v2.2.X
  ```

- [ ] **Note rollback commit**:
  - Record current git commit hash: `git rev-parse HEAD`
  - Write down in CHANGES.md for easy rollback

---

## 🚀 Deployment Process

### Step 1: Deploy to TEST Sheet (If Available)

1. Open TEST Google Sheet
2. Extensions → Apps Script
3. Paste updated code
4. Save
5. Close Apps Script
6. Refresh sheet
7. **Wait 5 minutes**
8. Verify all tabs load correctly
9. Test all formulas manually
10. Check for any #REF! or #ERROR! messages

### Step 2: Deploy to PRODUCTION

1. **Open production Google Sheet**
2. **Extensions → Apps Script**
3. **Select ALL existing code** → DELETE
4. **Copy updated code** → PASTE
5. **Save** (Ctrl/Cmd + S)
6. **Close Apps Script editor**
7. **Refresh Google Sheet** (F5 or Cmd+R)
8. **Wait 30 seconds** for "Gym Ops" menu to appear

### Step 3: Post-Deployment Verification

Within 5 minutes of deployment:

- [ ] **Check DASHBOARD**
  - All metrics populated
  - SOURCE ANALYSIS working
  - No #REF! errors

- [ ] **Check Members tab**
  - Shows active members
  - Summary accurate

- [ ] **Check Lead Data**
  - Auto-calculated columns working
  - Dropdowns functional

- [ ] **Run Health Check**
  - Should pass all tests

- [ ] **Test date range**
  - Change DASHBOARD B2
  - Verify metrics update

### Step 4: Monitor

- [ ] **Check for 24 hours** - No user-reported issues
- [ ] **Review errors** - Check Apps Script execution log
- [ ] **User feedback** - Confirm everything working as expected

---

## ⚠️ Rollback Procedure

If deployment fails or causes issues:

### Immediate Rollback

1. **Open Google Sheet**
2. **Extensions → Apps Script**
3. **Select ALL** → DELETE
4. **Open backup file**: `GYM-OPS-BACKUP-YYYY-MM-DD.gs`
5. **Copy ALL** → PASTE
6. **Save**
7. **Close Apps Script**
8. **Refresh sheet**
9. **Run Health Check** to verify

### Git Rollback

```bash
# Find commit hash from CHANGES.md or:
git log --oneline

# Rollback to previous commit
git checkout [commit-hash] GYM-OPS-ULTRA-COMPLETE.gs

# Commit the rollback
git commit -m "Rollback: Reverted to [commit-hash] due to [reason]"
```

---

## 📋 Common Deployment Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| #REF! errors | Tab renamed or deleted | Verify all tabs exist with correct names |
| Formulas not calculating | Cache issue | Refresh sheet, wait 5 min |
| Dropdown not working | Range reference wrong | Check CELL_REFS constants |
| SOURCE ANALYSIS shows $0 | Marketing Budget empty | Verify data in Settings A40:E100 |
| Menu not appearing | Script not authorized | Re-authorize in Apps Script |

---

## 🎯 Success Criteria

Deployment is successful when:

- ✅ All automated tests pass
- ✅ All manual checks verified
- ✅ No #REF! or #ERROR! messages
- ✅ Users can access and use all features
- ✅ Data displays correctly
- ✅ Formulas calculate as expected
- ✅ No errors in Apps Script execution log

---

## 📞 Emergency Contact

If major issues occur:

1. **Immediate:** Roll back to backup
2. **Document:** Note issue in CHANGES.md
3. **Review:** Check TROUBLESHOOTING.md
4. **Fix:** Address in development
5. **Re-test:** Complete full checklist again
6. **Re-deploy:** Only when all tests pass

---

**Remember:** It's better to delay deployment and test thoroughly than to rush and break production!

**See also:** CHANGES.md, TROUBLESHOOTING.md, TESTING-GUIDE.md

