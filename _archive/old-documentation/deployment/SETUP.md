# ⚡ Quick Setup - Gym Ops Tracker v2.0

## 5-Minute Installation

### Step 1: Create Google Sheet
```
1. Go to sheets.google.com
2. Click "Blank" to create new spreadsheet
3. Name it: "[Your Gym Name] - Ops Tracker"
```

### Step 2: Add Apps Script
```
1. In your sheet: Extensions → Apps Script
2. Delete the default code
3. Copy ALL of Code.gs from this repo
4. Paste into Apps Script editor
5. Save (Ctrl+S or Cmd+S)
6. Close Apps Script tab
```

### Step 3: Run Quick Start Wizard
```
1. Go back to your Google Sheet
2. Refresh page (F5 or Cmd+R)
3. Wait 15-20 seconds for "Gym Ops" menu to appear
4. Click: Gym Ops → 🧙 Quick Start Wizard
5. Authorize when prompted:
   - Click "Continue"
   - Select your Google account
   - Click "Advanced" → "Go to ... (unsafe)"
   - Click "Allow"
6. Follow the 4-step wizard (2 minutes)
7. Done! ✅
```

---

## Quick Start Wizard Steps

### Step 1: Gym Name
```
Enter your gym or studio name
Example: "Iron Fitness Studio"
```

### Step 2: Monthly Goal
```
How many new members do you want per month?
Example: 40
```

### Step 3: Lead Sources
```
Keep default sources (Facebook, Instagram, Google, Referral, Walk-in)?
- YES: Use defaults (you can edit later in Settings)
- NO: Customize in Settings tab after setup
```

### Step 4: Sample Data
```
Add 20 sample leads to test the system?
- YES: Recommended for first-time users
- NO: Start with a blank tracker
```

**After wizard:** You'll land on the DASHBOARD tab, ready to use!

---

## Verification Checklist

After setup, verify you have these **8 tabs** (in order):

- [ ] DASHBOARD
- [ ] Lead Data
- [ ] Members
- [ ] Settings
- [ ] Marketing
- [ ] Staff
- [ ] Help
- [ ] _Data (hidden)

### Test Functionality

1. **Add a test lead:**
   - Go to Lead Data tab
   - Row 2: Enter Name, Source, Staff, Location
   - Check "Appt Set?" box
   - Verify "Current Status" shows "Appt Set"

2. **Check DASHBOARD:**
   - Switch to DASHBOARD tab
   - Verify "Leads" count = 1
   - Verify test lead appears in action items

3. **Check Members:**
   - Go to Members tab
   - Should be empty (test lead not converted yet)

4. **Convert test lead:**
   - Back to Lead Data
   - Check "Show?" box
   - Check "Converted?" box
   - Fill MRR: $150
   - Verify "Current Status" = "Member"

5. **Verify Members tab:**
   - Go to Members tab
   - Should show your test lead

**If all checks pass, you're ready!** Delete test lead and start with real data.

---

## Customization (10 minutes)

### Update Settings Tab

#### 1. Monthly Targets (Cells B2:B10)
```
Leads: [Your target]
Set Rate: [Your typical %]
Show Rate: [Your typical %]
Close Rate: [Your typical %]
New Members: [Your monthly goal]
CAC: [Your target cost per acquisition]
ARPU: [Your average revenue per user]
```

#### 2. Dropdown Lists (Rows 14+)

**Column A - Sources:**
```
Replace with your actual lead sources:
- Facebook Ads
- Instagram
- Google Ads
- Yelp
- Member Referrals
- Walk-in
- Corporate Partnerships
- etc.
```

**Column B - Staff:**
```
Replace "Coach A", "Coach B" with real names:
- John Smith (Sales)
- Jane Doe (Front Desk)
- Mike Johnson (Head Coach)
- etc.
```

**Column C - Locations:**
```
Replace with your actual locations:
- Downtown
- West Side
- Satellite Studio
- Mobile (if you do home training)
```

**Column D - Membership Types:**
```
Customize to your offerings:
- 1-on-1 Personal Training
- Small Group (2-4)
- General Membership
- Class Pack (10-pack)
- Drop-in
- Corporate
```

**Column E - Cancel Reasons:**
```
Adjust based on your typical reasons:
- Price
- Moved Away
- Injury
- Scheduling Conflict
- Found Another Gym
- Didn't See Results
- Other
```

#### 3. Date Range (Cells B17:B19)
```
Start Date: First day of current month
End Date: Last day of current month
As of: =TODAY() (leave as formula)
```

#### 4. Trial Length (Cell B21)
```
Change from 14 to your default trial days
Common: 7, 14, 30
```

---

## Training Your Team (30 minutes total)

### Front Desk Training (10 min)

**What they do:**
1. Open "Lead Data" tab
2. When someone inquires, enter new row:
   - Created Date: Today
   - First Name, Last Name, Phone, Email
   - Source: Where they came from
   - Staff Owner: Who should follow up
   - Location: Which gym
3. If appt scheduled immediately, check "Appt Set?" and fill Appt Date

**Show them:**
- How to use dropdown menus (Source, Staff, Location)
- What happens on DASHBOARD (their lead appears in action items)

**Give them:**
- Quick reference card with required fields

### Sales Team Training (15 min)

**What they do:**
1. Check DASHBOARD every morning:
   - 🔴 No Appt Set (24h): Call these first
   - 🟡 No Shows: Follow up today
   - 🟠 Trials Expiring (3d): Close these ASAP

2. Update Lead Data when events happen:
   - Check "Show?" when lead arrives for trial
   - Check "Converted?" when they sign up
   - Fill MRR, Upfront Fee, Membership Type for new members
   - Check "Cancelled?" if someone cancels

3. Review Staff leaderboard (friendly competition)

**Show them:**
- How to filter Lead Data by their name (Staff Owner)
- Their personal stats on Staff leaderboard
- How DASHBOARD action items work

### Manager Training (5 min)

**What they do:**
1. **Daily:** Check DASHBOARD ON PACE status
   - Green = on track
   - Red = need more effort (more leads, better follow-up)

2. **Weekly:**
   - Review Staff leaderboard in team meeting
   - Add Marketing spend (Marketing tab)
   - Celebrate wins

3. **Monthly:**
   - Screenshot DASHBOARD before changing date range
   - Adjust Settings date range to new month
   - Review targets (increase if consistently ON PACE)

**Show them:**
- How to read on-pace logic (Goal To Date vs Actual)
- How to export DASHBOARD for board meetings (File → Download → PDF)
- How to adjust targets in Settings

---

## Common Issues & Fixes

### Issue: "Gym Ops" menu doesn't appear after refresh
**Fix:**
1. Wait full 20 seconds
2. Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Check Apps Script editor - make sure Code.gs saved with no red errors
4. Try opening sheet in incognito/private window

### Issue: Authorization stuck or scary warning
**Fix:**
1. Clear cookies for google.com
2. Use personal Google account (not restricted workspace account)
3. Click "Advanced" → "Go to [project name] (unsafe)" is normal
4. This is YOUR script, so it's safe

### Issue: Formulas show #REF! or #ERROR!
**Fix:**
1. Run: Gym Ops → Initialize Template (safe to run again)
2. Check Settings tab exists
3. Check dropdown lists in Settings have values

### Issue: DASHBOARD shows all zeros
**Fix:**
1. Add at least one lead in Lead Data
2. Check Settings date range includes today
3. Verify Lead Data column A (Created Date) has actual dates

### Issue: Trial End or Current Status columns blank
**Fix:**
1. Check formulas in row 2 start with =ARRAYFORMULA
2. Trial End needs Trial Start filled
3. Re-run Initialize Template if formulas missing

### Issue: Sample data shows but I can't delete it
**Fix:**
1. Just select the rows with sample data
2. Right-click → Delete rows
3. Formulas in row 2 will extend to new data automatically

---

## First Week Checklist

### Day 1: Go Live
- [ ] Customize Settings (your staff, sources, locations)
- [ ] Delete sample data (if any)
- [ ] Set date range to current month
- [ ] Train front desk (10 min)
- [ ] Train sales team (15 min)
- [ ] Announce daily DASHBOARD check is required

### Day 2-3: Build Habit
- [ ] Team checks DASHBOARD together each morning (5 min stand-up)
- [ ] Enter all new leads same day
- [ ] Update checkboxes immediately when events happen

### Day 4-5: First Review
- [ ] Check Staff leaderboard (acknowledge top performer)
- [ ] Review DASHBOARD on-pace status
- [ ] Add Marketing spend for the week
- [ ] Troubleshoot any data entry issues

### Week End: Team Meeting
- [ ] Review DASHBOARD together (project on screen)
- [ ] Discuss: What's ON PACE? What's BEHIND?
- [ ] Celebrate wins (most sets, highest close rate)
- [ ] Set next week's focus (more leads? better show rate?)

---

## Monthly Routine

### Last Day of Month:
1. Open DASHBOARD
2. Screenshot or File → Download → PDF
3. Note: Final metrics for the month

### First Day of New Month:
1. Go to Settings tab
2. Update date range:
   - B17: First day of new month
   - B18: Last day of new month
3. DASHBOARD now shows new month data
4. Team meeting: Review last month, set new month goals

### Throughout Month:
1. **Weekly:** Add Marketing spend (Mondays recommended)
2. **Daily:** DASHBOARD morning check (5 min)
3. **As needed:** Adjust targets if consistently ahead/behind pace

---

## Advanced Setup (Optional)

### Export DASHBOARD as PDF for Board Meetings
```
1. Open DASHBOARD tab
2. File → Print
3. Change destination to "Save as PDF"
4. Current sheet only: DASHBOARD
5. Fit to width: 1 page
6. Save
```

### Create Email Alerts for Action Items
```
(Requires Apps Script knowledge)
Add function to email daily action items to sales team
Set time-based trigger for 8 AM daily
```

### Integrate with Zapier
```
Use Zapier to:
- Auto-add leads from Google Forms
- Send new lead notifications to Slack
- Sync members to email marketing platform
```

---

## Success Metrics

After 30 days, you should see:

- ✅ **100% lead capture rate** (no leads forgotten)
- ✅ **Daily DASHBOARD checks** (team habit established)
- ✅ **Clear funnel visibility** (you know your Set/Show/Close rates)
- ✅ **Faster follow-up** (action items list empty daily)
- ✅ **Data-driven decisions** (pause low-ROI ad sources)
- ✅ **Team accountability** (staff leaderboard drives competition)

If any are missing, revisit training or daily workflow.

---

## Need Help?

1. **Check Help tab** in the sheet (quick reference)
2. **Re-read this SETUP.md** (covers 90% of issues)
3. **Check IMPROVEMENTS.md** (understand design decisions)
4. **Run Initialize Template** again (fixes broken formulas)
5. **Use Version History** (restore previous working version)

---

**You're all set! Start tracking and growing.** 💪📊
