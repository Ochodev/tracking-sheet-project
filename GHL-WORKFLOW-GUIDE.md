# 🔗 GoHighLevel Workflow Setup Guide

## Quick Reference

**Version:** v2.1-alpha  
**Integration Method:** GHL Workflows (not webhook)  
**Tabs to Populate:** Lead Data + _UTM Tracking  
**Auto-Calculated:** Source, Trial End, Current Status

---

## 📋 Overview

This guide shows you how to configure GoHighLevel workflows to automatically populate your Google Sheets tracker when contacts are created.

**What Gets Automated:**
- ✅ New leads added to Lead Data tab (with Lead ID from GHL)
- ✅ UTM tracking data captured in hidden _UTM Tracking tab
- ✅ Source auto-mapped from UTM parameters
- ✅ Location auto-filled from GHL location data

**What Stays Manual:**
- Staff assignment
- Checkbox updates (Appt Set, Show, Converted, Cancelled)
- Revenue data (MRR, Upfront Fee)
- Membership type

---

## 🎯 Prerequisites

Before starting:
- [ ] Gym Ops Tracker v2.1-alpha initialized in Google Sheets
- [ ] Google Sheets API enabled for your GHL account
- [ ] GoHighLevel account with workflow access
- [ ] Test contact ready in GHL

---

## 🔧 Workflow 1: Lead Data Population

### Step 1: Create New Workflow

1. In GHL, go to **Automation** → **Workflows**
2. Click **Create Workflow**
3. Name: `Gym Ops - New Lead to Sheets`
4. Description: `Automatically add new contacts to Lead Data tab`

### Step 2: Set Trigger

**Trigger:** Contact Created

**Filters (optional):**
- Only if `contact_type` = Lead
- Only if `location` = [Your Location]

### Step 3: Add Action - Lead Data Tab

**Action Type:** Google Sheets → Add Row

**Spreadsheet:** Select your Gym Ops tracker sheet

**Worksheet:** `Lead Data`

**Column Mapping:**

| Column (A-Z) | GHL Field | Notes |
|--------------|-----------|-------|
| A (Lead ID) | `{{contact.id}}` | ✅ Required |
| B (Created Date) | `{{contact.date_created}}` | Format: YYYY-MM-DD |
| C (First Name) | `{{contact.first_name}}` | |
| D (Last Name) | `{{contact.last_name}}` | |
| E (Phone) | `{{contact.phone}}` | |
| F (Email) | `{{contact.email}}` | |
| G (DOB) | `{{contact.date_of_birth}}` | |
| H (Source) | *LEAVE EMPTY* | Auto-fills from UTM |
| I (Campaign) | `{{campaign.name}}` | |
| J (Staff Owner) | *LEAVE EMPTY* | Manual assignment |
| K (Location) | `{{location.name}}` | ✅ Auto from GHL |
| L-Y | *LEAVE EMPTY* | Manual entry |
| Z (Current Status) | *LEAVE EMPTY* | Auto-calculated |

**GHL Workflow Action Config:**
```
Add Row to Google Sheet
Sheet: [Your Sheet Name]
Tab: Lead Data
Values:
  A: {{contact.id}}
  B: {{contact.date_created}}
  C: {{contact.first_name}}
  D: {{contact.last_name}}
  E: {{contact.phone}}
  F: {{contact.email}}
  G: {{contact.date_of_birth}}
  H: (skip)
  I: {{campaign.name}}
  J: (skip)
  K: {{location.name}}
  L-Z: (skip all remaining)
```

### Step 4: Test Lead Data Action

1. Click **Test** in workflow
2. Select a test contact
3. Run action
4. Check Google Sheet → Lead Data tab
5. Verify row added with correct data
6. Note: Source (H) will show "Others" until UTM data is added

---

## 🗺️ Workflow 2: UTM Tracking Population

### Step 1: Add Second Action (Same Workflow)

**Action Type:** Google Sheets → Add Row

**Spreadsheet:** Same sheet

**Worksheet:** `_UTM Tracking`

**Column Mapping:**

| Column (A-O) | GHL Field | Notes |
|--------------|-----------|-------|
| A (Lead ID) | `{{contact.id}}` | ✅ Links to Lead Data |
| B (Date Created) | `{{contact.date_created}}` | |
| C (UTM Source) | `{{contact.utm_source}}` | From URL params |
| D (UTM Medium) | `{{contact.utm_medium}}` | |
| E (UTM Campaign) | `{{contact.utm_campaign}}` | |
| F (UTM Content) | `{{contact.utm_content}}` | |
| G (Match Type) | `{{contact.utm_matchtype}}` | Google Ads |
| H (Campaign ID) | `{{contact.campaign_id}}` or `{{campaign.id}}` | |
| I (Ad Group ID) | `{{contact.ad_group_id}}` | |
| J (Ad ID) | `{{contact.ad_id}}` | |
| K (GCLID) | `{{contact.gclid}}` | Google click ID |
| L (Contact Source) | `{{contact.contact_source}}` | |
| M (Opportunity Source) | `{{contact.opportunity_source}}` or `{{contact.source}}` | |
| N (Pipeline Stage) | `{{contact.pipleline_stage}}` | Note: GHL typo |
| O (Standardized Source) | *LEAVE EMPTY* | Auto-mapped from C |

**GHL Workflow Action Config:**
```
Add Row to Google Sheet
Sheet: [Your Sheet Name]
Tab: _UTM Tracking
Values:
  A: {{contact.id}}
  B: {{contact.date_created}}
  C: {{contact.utm_source}}
  D: {{contact.utm_medium}}
  E: {{contact.utm_campaign}}
  F: {{contact.utm_content}}
  G: {{contact.utm_matchtype}}
  H: {{contact.campaign_id}}
  I: {{contact.ad_group_id}}
  J: {{contact.ad_id}}
  K: {{contact.gclid}}
  L: {{contact.contact_source}}
  M: {{contact.opportunity_source}}
  N: {{contact.pipleline_stage}}
  O: (skip - auto-calculated)
```

### Step 2: Test UTM Action

1. Test workflow again
2. Check _UTM Tracking tab (unhide it temporarily)
3. Verify row added
4. Check column O (Standardized Source) auto-populates
5. Go back to Lead Data tab
6. Verify Source (H) now shows standardized source (e.g., "Paid Social" instead of "fb_ad")

---

## 🔗 UTM Parameter Capture

### How GHL Captures UTM

When someone clicks a link with UTM parameters:
```
https://yourgym.com/free-trial?utm_source=fb_ad&utm_medium=video&utm_campaign=summer_sale
```

GHL stores these in custom fields or contact properties.

### Ensure UTM Tracking is Enabled

1. GHL → **Settings** → **Forms**
2. Enable "Capture UTM Parameters"
3. Map to custom fields if needed:
   - `utm_source` → Custom Field
   - `utm_medium` → Custom Field
   - `utm_campaign` → Custom Field

### Test UTM Capture

1. Create a test form with UTM-enabled link
2. Fill out form from that link
3. Check contact in GHL
4. Verify UTM fields populated
5. Trigger workflow
6. Check Sheets → _UTM Tracking tab

---

## 📊 Source Attribution Mapping

### How Auto-Mapping Works

1. GHL sends raw `utm_source` (e.g., `fb_ad`)
2. Workflow adds to _UTM Tracking column C
3. Formula in column O looks up Settings tab
4. Maps `fb_ad` → `Paid Social`
5. Formula in Lead Data column H pulls standardized source

### Customize Mapping

**Settings Tab → Columns G-H:**

| Raw UTM Source | Standardized Source |
|----------------|---------------------|
| fb_ad | Paid Social |
| adwords | Paid Search |
| google / cpc | Paid Search |
| instagram | Paid Social |

**Add Your Own:**
1. Go to Settings tab
2. Scroll to UTM Attribution Mapping section (G1)
3. Add row: Raw source | Standardized source
4. Example: `linkedin_ad` | `Paid Social`

---

## 🧪 Testing Checklist

### Test 1: Manual Entry (Baseline)

- [ ] Manually add row to Lead Data with Lead ID `TEST001`
- [ ] Manually add row to _UTM Tracking with same Lead ID
- [ ] Set utm_source to `fb_ad`
- [ ] Verify Lead Data Source (H) shows "Paid Social"

### Test 2: GHL Workflow (Automated)

- [ ] Create test contact in GHL
- [ ] Set custom fields: `utm_source = fb_ad`, `utm_campaign = test`
- [ ] Trigger workflow
- [ ] Verify Lead Data row added
- [ ] Verify _UTM Tracking row added
- [ ] Verify Source auto-mapped correctly

### Test 3: Real Lead Flow

- [ ] Create form with UTM link
- [ ] Fill out form from UTM link
- [ ] Contact created in GHL
- [ ] Workflow triggers automatically
- [ ] Both sheets populated
- [ ] Source mapped correctly

### Test 4: Multiple Sources

- [ ] Test Facebook ad (`utm_source=fb_ad`)
- [ ] Test Google ad (`utm_source=adwords`)
- [ ] Test Instagram (`utm_source=instagram`)
- [ ] Test direct (`utm_source=(direct)`)
- [ ] Verify all map to correct standardized sources

---

## ⚠️ Troubleshooting

### Issue: Row Added but Source is "Others"

**Cause:** UTM data not captured or mapping not found

**Fix:**
1. Check _UTM Tracking tab
2. See what value is in column C (UTM Source)
3. Go to Settings tab → UTM Mapping
4. Add mapping for that raw source

### Issue: No Row Added to Lead Data

**Cause:** Workflow not triggering or permission issue

**Fix:**
1. Check GHL workflow logs
2. Verify trigger conditions met
3. Re-authorize Google Sheets connection
4. Check sheet name spelling (case-sensitive)

### Issue: Duplicate Rows

**Cause:** Workflow running multiple times

**Fix:**
1. Add "Only run once per contact" condition
2. Or use "Contact Updated" trigger with filter

### Issue: UTM Data Not Populating

**Cause:** GHL not capturing UTM parameters

**Fix:**
1. GHL → Settings → Forms
2. Enable "Capture UTM Parameters"
3. Test with browser dev tools (check URL params)
4. Add custom fields for UTM if needed

### Issue: Source Shows Wrong Value

**Cause:** Mapping table incorrect

**Fix:**
1. Go to Settings → UTM Mapping (G:H)
2. Find the raw source value (from _UTM Tracking)
3. Update or add correct mapping
4. Source will update automatically

---

## 📈 Advanced: Appointment Tracking

### Optional Workflow 3: Appointment Booked

If you want to auto-update when appointments are booked:

**Trigger:** Appointment Created

**Action:** Update Row in Google Sheet
- Find row where Column A = `{{contact.id}}`
- Update Column L (Appt Set?) = `TRUE`
- Update Column M (Appt Date) = `{{calendar.startTime}}`

**Note:** GHL workflows may not support "Update Row" - might need Zapier.

---

## 🔐 Security & Permissions

### Google Sheets Permissions

When connecting GHL to Sheets:
1. GHL requests "Edit" permission
2. This allows adding/updating rows
3. Protected columns (H, P, Z) have warnings but allow edits

### Recommended Settings

1. **Sheet Permissions:**
   - Owner: Your Google account
   - GHL Service Account: Editor
   - Team Members: Viewer or Editor (as needed)

2. **Workflow Access:**
   - Only authorized GHL users can edit workflows
   - Test changes in staging workspace first

---

## 📝 Next Steps After Setup

1. **Monitor First Week:**
   - Check daily that leads are being added
   - Verify source mapping accuracy
   - Adjust UTM mappings as needed

2. **Team Training:**
   - Show team where manual updates happen (checkboxes)
   - Explain Lead ID = unique from GHL
   - Train on updating MRR/Membership Type

3. **Monthly Maintenance:**
   - Add new UTM mappings as campaigns launch
   - Review source attribution accuracy
   - Update staff/location dropdowns in Settings

4. **v2.1-beta Preparation:**
   - Once charts are added, test chart rendering
   - Verify date range changes update charts
   - Load test with 1000+ leads

---

## 📊 Expected Data Flow

```
Facebook Ad Click
    ↓
Landing Page (with UTM)
    ↓
Form Fill
    ↓
GHL Contact Created
    ↓
Workflow Triggered
    ↓
Row Added to Lead Data (with Lead ID)
Row Added to _UTM Tracking (with UTM data)
    ↓
Sheets Formulas Auto-Run
    ↓
Source Mapped: fb_ad → Paid Social
    ↓
Lead Data Source (H) Shows: "Paid Social"
Current Status (Z) Shows: "Lead"
    ↓
Sales Team Updates Manually
    ↓
Checkboxes: Appt Set → Show → Converted
    ↓
Current Status Updates Automatically
    ↓
DASHBOARD Shows Metrics
```

---

## ✅ Success Criteria

After setup, you should see:
- [ ] New GHL contacts automatically create Lead Data rows
- [ ] Lead ID matches GHL contact ID
- [ ] UTM data captured in _UTM Tracking
- [ ] Source auto-maps correctly (>90% accuracy)
- [ ] Manual updates still work (checkboxes, MRR)
- [ ] DASHBOARD KPIs reflect new leads
- [ ] No duplicate rows
- [ ] No missing data (names, phone, email)

---

**Setup complete! Your tracker is now integrated with GoHighLevel.** 🎉

**Next:** Add monthly marketing budgets, configure date ranges, and wait for v2.1-beta charts!

