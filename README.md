# 🏋️ Gym Ops Tracker v2.2.3 - Production Ready

**Google Sheets + Apps Script for Gyms & Studios**

Complete operations tracker with comprehensive documentation, automated validation, and self-healing formulas.

**Version:** 2.2.3 Ultra-Complete  
**Code Size:** 2,580 lines (51% reduction from v2.1)  
**Status:** Production ready with automated testing

---

## 📚 DOCUMENTATION (START HERE)

**New to the project?** Read these docs in order:

1. **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System structure, dependencies, critical cells
2. **[CELL-REFERENCE-MAP.md](docs/CELL-REFERENCE-MAP.md)** - Complete cell reference guide
3. **[FORMULA-PATTERNS.md](docs/FORMULA-PATTERNS.md)** - ⭐ Safe formula patterns (prevents breaking changes)
4. **[DEPLOY-CHECKLIST.md](docs/DEPLOY-CHECKLIST.md)** - Pre-deployment validation steps
5. **[TESTING-GUIDE.md](docs/TESTING-GUIDE.md)** - How to test changes
6. **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues and solutions
7. **[CHANGES.md](docs/CHANGES.md)** - Change log and history

**Making changes?** Follow this workflow:
1. Read ARCHITECTURE.md → understand dependencies
2. Make changes using CELL_REFS constants
3. Follow DEPLOY-CHECKLIST.md → test thoroughly
4. Document in CHANGES.md → track what changed
5. If issues → check TROUBLESHOOTING.md

**Key Principle:** Test BEFORE deploying, not after!

---

## 📁 File Structure

| File | Status | Purpose |
|------|--------|---------|
| **GYM-OPS-ULTRA-COMPLETE.gs** | 🟢 PRODUCTION | Single source file - deploy this |

**Rule:** This is the only active code file. All development happens here.

**Version Control:** We use git for backups and version history. Old versions are in `_archive/`.

---

## ✨ What Changed in v2.0

**SIMPLER:**
- ✅ 8 tabs instead of 16 (50% fewer)
- ✅ 25 columns instead of 37 (32% fewer fields)
- ✅ One DASHBOARD for everything (not 3+ tabs)
- ✅ Quick Start Wizard (2-minute setup)
- ✅ Auto-created charts (no manual work)
- ✅ Formula-based (no complex triggers)

**REMOVED:**
- ❌ Mappings, Cohorts, Snapshots tabs
- ❌ onEdit auto-stamping complexity
- ❌ All sheet protections
- ❌ Lead ID, duplicate timestamp columns

**RESULT:** 60% faster setup, 2x faster daily use.

---

## 🚀 2-Minute Install

```
1. Create new Google Sheet
2. Extensions → Apps Script
3. Copy GYM-OPS-ULTRA-COMPLETE.gs from repo → Paste → Save
4. Refresh sheet (F5)
5. Wait 30 seconds for "Gym Ops" menu to appear
6. Click: Gym Ops → Initialize V2
7. Done! ✅ All 13 tabs created!
```

**Features:**
- ✅ Automated validation & auto-fix
- ✅ Health check diagnostics
- ✅ Self-healing formulas
- ✅ Comprehensive testing suite

---

## 📊 Tab Structure (13 Tabs)

| Tab | Type | What It Does |
|-----|------|--------------|
| **DASHBOARD** | Main | KPIs, source analysis, action items, member alerts |
| **Lead Data** | Data Entry | Enter all leads (34 columns, auto-calculated) |
| **Members** | View | Auto-filtered active members with toggle |
| **Settings & Budget** | Config | Targets, dropdowns, marketing budgets, date ranges |
| **Import Members** | Data Entry | Import existing members for LTV tracking |
| **LTV Analysis** | Analytics | Lifetime value by source and package type |
| **Help** | Guide | Quick reference (auto-hidden) |
| **_UTM Tracking** | Hidden | UTM parameter tracking for attribution |
| **_LTV Calculations** | Hidden | LTV calculation engine |
| **_Metrics** | Hidden | Net gain/loss calculations |
| **_Chart Data** | Hidden | Chart data aggregation |
| **_Data** | Hidden | Helper calculations |
| **_Daily Spend** | Hidden | Marketing spend calculations |

---

## 📝 Lead Data (34 Columns)

**Manual Entry:**
```
A Lead ID          L Appt Set? ☑      V MRR ($)
B Created Date     M Appt Date        W Upfront Fee ($)
C First Name       N Show? ☑          X Cancelled? ☑
D Last Name        O Show Date        Y Cancel Date
E Phone            P Start Trial? ☑   Z Cancel Reason
F Email            Q Trial Start      AA Notes
G DOB              S Converted? ☑
I Campaign         T Member Start
J Staff Owner      U Membership Type
K Location
```

**Auto-Calculated (Blue/Green background):**
```
H Source (from _UTM Tracking)
R Trial End (= Q + trial length)
AB Current Status (derived from checkboxes)
AC Age (Days) (visual indicator)
AD Lead Score (hot/warm/cold)
AE Action Needed (next step)
AF Duplicate? (phone/email check)
AG Days to Convert
AH Last Touchpoint
```

---

## 🎯 DASHBOARD - Comprehensive Analytics

1. **Today's Snapshot** - Hot leads, active MRR
2. **Key Metrics** - Leads, Set%, Show%, Close%, New Members, MRR, CAC
3. **On-Pace Status** - vs targets (green = on track, red = behind)
4. **Source Analysis** - 13 metrics per source (Leads, Spend, CPL, CPA, CPS, CAC, LTV, LTV:CAC)
5. **LTV:CAC Health Check** - Overall ratio with status
6. **Action Items** - No appt set, no shows, trials expiring
7. **Member Alerts** - Trials ending, birthdays
8. **Net Gain/Loss** - By membership type (selected date range)
9. **New Revenue** - By membership type

**Everything you need on one page with flexible date range filtering.**

---

## ⚙️ Settings Tab

**Monthly Targets:**
- Leads: 200, Set Rate: 60%, Show: 70%, Close: 50%
- New Members: 42, CAC: $150, ARPU: $150

**Dropdowns:**
- Sources: Facebook, Instagram, Google, Referral, Walk-in
- Staff: Front Desk, Coach A, Coach B
- Locations: Location A, Location B
- Membership Types: PT, Small Group, General, Class Pack

**Date Range:**
- Start Date, End Date, As of (for on-pace calculations)

**Other:**
- Trial Length: 14 days

**Edit these to match your gym!**

---

## 🚀 Getting Started

**After installation:**

1. **Initialize:** Gym Ops → Initialize V2 (creates all 13 tabs)
2. **Add Sample Data:** Gym Ops → Add 20 Sample Leads (test the system)
3. **Configure:** Settings & Budget tab (set your targets, sources, staff)
4. **Test:** Gym Ops → Health Check (verify everything works)
5. **Go Live:** Delete sample leads, start entering real data

**Menu Actions:**
- 📥 Add 20 Sample Leads - Test data with UTM tracking
- 🏥 Health Check - Automated diagnostics
- ✅ Validate & Auto-Fix - Fixes common issues automatically
- 🧪 Quick Test - Verify system components

---

## 📱 Daily Workflow

**Morning (5 min):**
1. Open DASHBOARD
2. Check ON PACE status
3. Call action items (no appt set, no shows)
4. Note member alerts

**Throughout Day:**
1. Enter leads in Lead Data
2. Check boxes: Appt Set → Show → Converted → Cancelled

**Weekly:**
1. Review marketing budgets in Settings & Budget (adjust if needed)
2. Review Staff leaderboard

---

## 💡 Key Features

**Auto-Updates:**
- Members tab = Filtered view (Converted=TRUE, Cancelled≠TRUE)
- Trial End = Trial Start + 14 days
- Current Status = Derived from checkboxes
- All DASHBOARD metrics = Real-time
- CAC & spend metrics pull directly from monthly budgets (no manual trigger)
- `_Daily Spend` tab removed; data generated on the fly

**Formula-Based:**
- No "magic" auto-stamping
- Everything is transparent formulas
- Edit dates directly if needed

**Fast:**
- 10,000+ leads supported
- ARRAYFORMULA for instant calc
- Minimal volatile functions

---

## 🎯 Menu Actions

| Action | What It Does |
|--------|--------------|
| Initialize Template V2 | Create all 13 tabs with validation |
| View Dashboard/Lead Data/Members | Quick navigation |
| Add 20 Sample Leads | Test leads with UTM tracking |
| Validate & Auto-Fix | Check formulas and auto-repair issues |
| Quick Test | Verify system components |
| Health Check | Comprehensive diagnostics |
| Optimize Performance | Enable caching for large datasets |
| Test Member Toggle | Verify member filtering |

---

## 🆘 Troubleshooting

**"Gym Ops" menu missing:**
- Wait 20 sec after refresh
- Hard refresh: Ctrl+Shift+R

**Formulas showing #REF!:**
- Run Gym Ops → Initialize Template again

**DASHBOARD shows zeros:**
- Check Settings date range includes your leads
- Verify Lead Data has dates in column A

**Auto columns blank:**
- Trial End: Check Trial Start is filled
- Current Status: Check row 2 has ARRAYFORMULA

---

## 📊 Included Charts

- Active Members Trend (90 days) - auto-positioned on DASHBOARD

---

## 🎓 Training

**Front Desk (5 min):**
- Enter leads: Name, Phone, Email, Source, Staff, Location
- Check "Appt Set?" when scheduled

**Sales (10 min):**
- Check DASHBOARD action items daily
- Check boxes: Show → Converted (fill MRR)
- Review Staff leaderboard

**Manager (15 min):**
- Daily: DASHBOARD on-pace status
- Weekly: Staff leaderboard, Marketing spend
- Monthly: Adjust targets

---

## 🔧 Customization

**Add dropdown values:** Settings tab → DROPDOWNS section
**Change trial length:** Settings → B21
**Adjust targets:** Settings → Column B (rows 3-10)
**Change date range:** Settings → B17:B18

---

## 📦 Repository Structure

**Production:**
- `GYM-OPS-ULTRA-COMPLETE.gs` - Main code file (2,580 lines)
- `README.md` - This file
- `appsscript.json` - Apps Script configuration

**Documentation:**
- `docs/ARCHITECTURE.md` - System structure and dependencies
- `docs/CELL-REFERENCE-MAP.md` - Complete cell reference guide
- `docs/DEPLOY-CHECKLIST.md` - Pre-deployment validation
- `docs/CHANGES.md` - Change log and history
- `docs/TROUBLESHOOTING.md` - Common issues and solutions
- `docs/TESTING-GUIDE.md` - How to test changes

**Archive:**
- `_archive/` - Historical files and old versions

---

## 🎯 Success After 30 Days

- ✅ 100% lead capture (same day entry)
- ✅ Daily DASHBOARD checks (team habit)
- ✅ Clear funnel visibility (know your rates)
- ✅ Data-driven decisions (pause low-ROI sources)
- ✅ Proactive follow-up (action items cleared daily)

---

## 💪 Best Practices

**Data Entry:**
- Enter leads same day
- Check boxes immediately when events happen
- Fill MRR for all members
- Use Notes field for reminders

**Dashboard:**
- Check every morning (5 min)
- Clear action items daily
- Monitor on-pace status

**Weekly:**
- Add Marketing spend Mondays
- Review Staff leaderboard in team meeting

**Monthly:**
- Screenshot DASHBOARD before month-end
- Adjust Settings date range to new month
- Increase targets if consistently ON PACE

---

## 🚀 Next Steps

**Just installed?**
1. Run Quick Start Wizard
2. Add 5-10 real leads to test
3. Check DASHBOARD updates
4. Customize Settings (your staff, sources)
5. Train team

**Go live:**
1. Delete sample data
2. Set date range to current month
3. Announce to team
4. Daily stand-up around DASHBOARD

---

**Built for operators who value data over guesswork.**

**Simple. Fast. Effective.** 💪📊
