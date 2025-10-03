# ✅ Deployment Checklist

## Pre-Deployment (1-2 hours)

### 1. Technical Setup
- [ ] Create new Google Sheet
- [ ] Open Apps Script editor (Extensions → Apps Script)
- [ ] Copy `Code.gs` from repo
- [ ] Paste into Apps Script editor
- [ ] Save Apps Script project
- [ ] Optional: Copy `appsscript.json` for timezone settings
- [ ] Close Apps Script editor

### 2. Initialize Template
- [ ] Refresh Google Sheet (F5)
- [ ] Wait for "Gym Ops" menu to appear (20 seconds)
- [ ] Click **Gym Ops → ⚙️ Initialize Template**
- [ ] Authorize script when prompted:
  - [ ] Click "Continue"
  - [ ] Select Google account
  - [ ] Click "Advanced" → "Go to Gym Ops Script (unsafe)"
  - [ ] Click "Allow"
- [ ] Confirm initialization dialog
- [ ] Wait 30 seconds for completion
- [ ] Verify 16 tabs created (see checklist below)

### 3. Verify Tab Creation
Check all tabs exist in order:
- [ ] 1. READ ME
- [ ] 2. Lists
- [ ] 3. Targets
- [ ] 4. Lead Data
- [ ] 5. Members
- [ ] 6. Cancellations
- [ ] 7. Marketing Spend
- [ ] 8. Mappings
- [ ] 9. Scoreboard
- [ ] 10. Marketing Performance
- [ ] 11. Member Health
- [ ] 12. Follow-ups
- [ ] 13. Staff Leaderboard
- [ ] 14. Daily Active (hidden)
- [ ] 15. Cohorts (hidden)
- [ ] 16. Snapshots (hidden)

### 4. Test Core Functionality
- [ ] Add test lead in **Lead Data**:
  - [ ] A2: Today's date
  - [ ] C2: John
  - [ ] D2: Doe
  - [ ] H2: Facebook (dropdown)
  - [ ] K2: Front Desk (dropdown)
  - [ ] AJ2: Location A (dropdown)
- [ ] Verify **B2** auto-fills: `L00001` ✓
- [ ] Verify **AC2** shows: `Lead` ✓
- [ ] Check **M2** (Appt Set?), verify **AF2** stamps today's date ✓
- [ ] Check **R2** (Converted?), verify **S2** defaults to today ✓
- [ ] Verify **Members** tab shows the lead ✓
- [ ] Check **X2** (Cancelled?), verify lead moves to **Cancellations** ✓
- [ ] Delete test lead

### 5. Add Sample Data (Optional)
- [ ] Click **Gym Ops → 📊 Add Sample Data**
- [ ] Confirm
- [ ] Verify 20 leads added
- [ ] Review **Scoreboard** (should show metrics)
- [ ] Review **Follow-ups** (should show action items)
- [ ] Delete sample data when done testing (or keep for demo)

---

## Customization (2-4 hours)

### 1. Update Lists
Go to **Lists** tab:
- [ ] **Column A (Sources)**: Replace/add your lead sources
  - [ ] Facebook Ads
  - [ ] Instagram
  - [ ] Google Ads
  - [ ] Referral Program
  - [ ] Walk-in
  - [ ] Yelp
  - [ ] Other
- [ ] **Column B (Cancel Reasons)**: Customize cancel reasons
  - [ ] Price Too High
  - [ ] Moved Away
  - [ ] Injury
  - [ ] Poor Service
  - [ ] Location Inconvenient
  - [ ] Other
- [ ] **Column C (Membership Types)**: Add your membership tiers
  - [ ] 1-on-1 PT
  - [ ] Small Group (2-4)
  - [ ] General Membership
  - [ ] Class Pack (10-pack)
  - [ ] Drop-in
- [ ] **Column D (Staff)**: Add your team members
  - [ ] Replace "Front Desk", "Coach A", etc. with real names
  - [ ] Add all sales staff and coaches
- [ ] **Column E (Locations)**: Add your gym locations
  - [ ] Downtown
  - [ ] West Side
  - [ ] Satellite Studio
  - [ ] etc.
- [ ] **H2 (Trial Length)**: Set default trial days (default: 14)

### 2. Set Monthly Targets
Go to **Targets** tab (cells C2:C11):
- [ ] **Leads**: Monthly lead goal (e.g., 200)
- [ ] **CPL ($)**: Target cost per lead (e.g., $25)
- [ ] **Set Rate (%)**: Target appt set rate (e.g., 0.60 = 60%)
- [ ] **Show Rate (%)**: Target show rate (e.g., 0.70 = 70%)
- [ ] **Close Rate (%)**: Target close rate (e.g., 0.50 = 50%)
- [ ] **New Members**: Monthly new member goal (e.g., 42)
- [ ] **CAC ($)**: Target customer acquisition cost (e.g., $150)
- [ ] **Monthly Churn (%)**: Target churn rate (e.g., 0.05 = 5%)
- [ ] **ARPU ($)**: Average revenue per user (e.g., $150)
- [ ] **PT Renewals Due**: Expected PT renewals/month (e.g., 10)

### 3. Set Date Range
Go to **Targets** tab (cells G1:G3):
- [ ] **G1 (Start Date)**: Set to first day of current month (or period start)
- [ ] **G2 (End Date)**: Set to last day of current month (or period end)
- [ ] **G3 (As of)**: Leave as `=TODAY()` (or set specific date for projections)

### 4. Add Source Mappings (Optional)
Go to **Mappings** tab:
- [ ] Add raw UTM sources to Column A
- [ ] Map to standardized sources in Column B
- [ ] Examples:
  - [ ] `fb` → `Facebook`
  - [ ] `ig` → `Instagram`
  - [ ] `google_ads` → `Google`
  - [ ] `member_ref` → `Referral`

### 5. Customize Protections (Optional)
If you want hard locks (not warnings):
- [ ] Right-click **Lists** tab → Protect sheet → Set permissions: "Only you"
- [ ] Repeat for **Mappings**, **Scoreboard**, etc.
- [ ] Leave **Lead Data**, **Marketing Spend**, **Targets** editable

---

## Data Migration (Varies)

### If Starting Fresh
- [ ] Start entering leads immediately in **Lead Data** tab
- [ ] No migration needed

### If Migrating from Existing System
- [ ] Export existing leads to CSV (columns: Created Date, Name, Phone, Email, Source, Staff, Status, etc.)
- [ ] Map CSV columns to **Lead Data** columns (A-AK)
- [ ] **Important:** Do NOT overwrite auto-calculated columns (B, Q, AC, AD, AK)
- [ ] Import process:
  1. [ ] Open **Lead Data** tab
  2. [ ] Select A2 (first data cell)
  3. [ ] File → Import → Upload CSV
  4. [ ] Import location: "Replace data at selected cell"
  5. [ ] Verify formulas in B, Q, AC, AD, AK still work
  6. [ ] Manually check boxes (M, O, R, X) for existing leads based on status
- [ ] Verify **Members** and **Cancellations** tabs populate correctly
- [ ] Run **Gym Ops → Refresh Dashboards**

### Backfill Marketing Spend (Optional)
- [ ] Export historical ad spend from Facebook/Google Ads
- [ ] Format as: Date | Source | Location | Spend
- [ ] Import into **Marketing Spend** tab
- [ ] Verify **Scoreboard** CPL/CAC update

---

## Team Training (1-2 hours)

### Front Desk Staff Training
- [ ] Show **Lead Data** tab only
- [ ] Demonstrate entry workflow:
  1. [ ] Enter: Name, Phone, Email, Source, Staff Owner, Location
  2. [ ] Check **Appt Set?** when scheduled
  3. [ ] Fill **Appt Date**
- [ ] Show **Follow-ups** tab for daily to-dos
- [ ] Practice: Each person enters 2 test leads

### Sales Team Training
- [ ] Show **Lead Data** entry (same as front desk)
- [ ] Additional fields:
  - [ ] Check **Show?** when lead arrives
  - [ ] Check **Converted to Member?** after signup
  - [ ] Fill **MRR**, **Join Fee**, **Membership Type** for new members
  - [ ] Check **Cancelled?** if member cancels
- [ ] Show **Follow-ups** tab for action queue
- [ ] Show **Staff Leaderboard** for personal metrics
- [ ] Practice: Complete full funnel (Lead → Appt → Show → Convert)

### Manager Training
- [ ] **Scoreboard**: Daily KPI review, on-pace vs target
- [ ] **Targets**: Adjust monthly goals, set date ranges
- [ ] **Marketing Performance**: Review CAC/CPL by source
- [ ] **Member Health**: Monitor trials, renewals, birthdays
- [ ] **Staff Leaderboard**: Review team performance
- [ ] **Snapshots**: Export for monthly reports
- [ ] **Gym Ops Menu**: Refresh dashboards, add sample data

### Create Quick Reference Cards
- [ ] Front Desk: Entry fields only (laminated card by desk)
- [ ] Sales: Full funnel checklist (mobile-friendly)
- [ ] Manager: Dashboard checklist (weekly review)

---

## Go-Live (Day 1)

### Morning (Before Team Arrives)
- [ ] Set **Targets** date range to current month
- [ ] Verify all dropdowns work (Lists populated)
- [ ] Test one full lead entry (Lead → Member)
- [ ] Delete test data
- [ ] Open **Follow-ups** tab (should be empty or show legacy items)

### Launch Meeting
- [ ] Announce new tracking system
- [ ] Distribute quick reference cards
- [ ] Demonstrate live entry (project screen):
  - [ ] Enter a real lead that came in today
  - [ ] Show auto-updates on Members/Scoreboard
- [ ] Assign roles:
  - [ ] Front desk: Enter all new leads
  - [ ] Sales: Check Follow-ups daily, update statuses
  - [ ] Manager: Review Scoreboard daily
- [ ] Set expectations:
  - [ ] Enter leads same day (not end of week)
  - [ ] Update statuses immediately (check boxes)
  - [ ] Review dashboards in weekly team meeting

### First Week Checklist
- [ ] **Day 1**: Enter all new leads, verify Follow-ups populate
- [ ] **Day 2**: Review **Scoreboard**, check on-pace status
- [ ] **Day 3**: Check **Staff Leaderboard**, acknowledge top performer
- [ ] **Day 4**: Add **Marketing Spend** for week
- [ ] **Day 5**: Review **Member Health**, contact expiring trials
- [ ] **Week End**: Team huddle - review Scoreboard together

---

## Advanced Setup (Optional)

### 1. Nightly Snapshots
- [ ] In Google Sheet: Extensions → Apps Script
- [ ] In Apps Script editor, select `setupNightlyTrigger` function
- [ ] Click "Run" (▶️ button)
- [ ] Authorize permissions
- [ ] Verify in **Triggers** page (clock icon): "takeNightlySnapshot" runs at 2 AM daily
- [ ] Next morning, check **Snapshots** tab has new row

### 2. Manual Slicers (Scoreboard)
- [ ] Go to **Scoreboard** tab
- [ ] Click **Data → Slicer**
- [ ] Configure slicer:
  - [ ] Data range: Lead Data!H:H (Source)
  - [ ] Position: Right side of Scoreboard
- [ ] Repeat for:
  - [ ] Lead Data!AJ:AJ (Location)
  - [ ] Lead Data!K:K (Staff Owner)
- [ ] Test slicers filter Scoreboard metrics

### 3. Email Alerts (Advanced)
Create Apps Script function to email daily Follow-ups:
```javascript
function emailDailyFollowups() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const followUps = ss.getSheetByName('Follow-ups');
  const data = followUps.getDataRange().getValues();
  
  // Count action items
  // Send email to manager@yourgym.com
  // Schedule trigger for 8 AM daily
}
```
- [ ] Customize email template
- [ ] Set up trigger (8 AM daily)
- [ ] Test with your email

### 4. Integrate with External Tools
- [ ] **Zapier**: Trigger on new Google Sheets row → Create CRM contact
- [ ] **Google Forms**: Pre-fill Lead Data via form submissions
- [ ] **Facebook Ads API**: Auto-import spend to Marketing Spend tab
- [ ] **Looker Studio**: Connect for advanced dashboards

---

## Monthly Maintenance

### First of Month
- [ ] Review previous month's Scoreboard (before changing dates)
- [ ] Export **Snapshots** tab to CSV (backup)
- [ ] Update **Targets** date range to new month (G1:G2)
- [ ] Adjust **Targets** goals if needed (C2:C11)
- [ ] Review **Cohorts** for retention trends
- [ ] Team meeting: Review last month, set goals for new month

### Mid-Month
- [ ] Check on-pace status in **Scoreboard**
- [ ] If BEHIND, adjust tactics (more ad spend, more follow-up)
- [ ] Review **Marketing Performance** - pause low-ROI sources
- [ ] Acknowledge top performer in **Staff Leaderboard**

### Quarterly
- [ ] Archive old data (optional):
  - [ ] Copy **Lead Data** to new "Archive Q1 2025" tab
  - [ ] Delete rows older than 90 days from Lead Data
  - [ ] Preserve **Snapshots** (do not delete)
- [ ] Review **Cohorts** for long-term retention trends
- [ ] Adjust **Lists** (add new sources, staff, locations)

---

## Troubleshooting First Week

### Issue: Formulas show #REF!
- [ ] Run **Gym Ops → Initialize Template** again (safe, idempotent)
- [ ] Check **Lists** tab has data in A2:E

### Issue: Auto-stamping not working
- [ ] Verify you're checking boxes (not typing TRUE)
- [ ] Check Apps Script triggers: Extensions → Apps Script → Triggers (clock icon)
- [ ] Manually run `onEdit` test in Apps Script

### Issue: Scoreboard shows zeros
- [ ] Verify **Targets** date range includes entered leads
- [ ] Check **Lead Data** has dates in column A (Created Date)
- [ ] Verify named ranges exist: Targets → Named Ranges

### Issue: Members tab empty
- [ ] Check leads have **R (Converted to Member?)** checked
- [ ] Verify **X (Cancelled?)** is NOT checked
- [ ] Check formula in Members A1 (should start with `=`)

### Issue: Team says "too complicated"
- [ ] Simplify: Only show **Lead Data** and **Follow-ups** tabs
- [ ] Hide other tabs (right-click → Hide sheet)
- [ ] Create separate "Manager Dashboard" view with only Scoreboard visible

---

## Success Metrics (30 Days Post-Launch)

After one month, verify:
- [ ] **100% lead entry rate**: All leads entered same day
- [ ] **Daily Follow-ups usage**: Sales team checks every morning
- [ ] **Weekly Scoreboard reviews**: Manager checks on-pace status
- [ ] **Accurate data**: Error Flag column (AK) mostly empty
- [ ] **Team adoption**: Staff can enter leads without asking questions
- [ ] **Actionable insights**: Identified at least one marketing channel to cut or boost

---

## Final Pre-Launch Checklist

Before announcing to team:
- [ ] All Lists customized (Sources, Staff, Locations, Types)
- [ ] Targets set for current month
- [ ] Date range set to current month
- [ ] Test lead entered and flows through funnel
- [ ] Sample data deleted (if used for testing)
- [ ] Team trained (or training scheduled)
- [ ] Quick reference cards printed/distributed
- [ ] **Gym Ops** menu accessible (verify on team's computers)
- [ ] Permissions set (Editor for team, Owner for manager)
- [ ] Backup plan (know how to restore from version history)

---

**You're ready to launch! 🚀**

**First 24 hours:** Enter all new leads, check Follow-ups  
**First week:** Daily Scoreboard review  
**First month:** Full team adoption, adjust targets based on data

**Questions?** Review **README.md**, **SETUP.md**, or **TAB-REFERENCE.md**
