# 🚀 GoHighLevel Integration Plan - v2.1

## 📋 EXECUTIVE SUMMARY

**Goal:** Integrate GoHighLevel webhook → Google Sheets with UTM attribution, monthly marketing spend, dynamic date ranges, and 7 new charts.

**Changes from v2.0:**
- Add webhook endpoint for GHL data
- Expand to 10 tabs (from 8)
- Add Lead ID column (26 total columns in Lead Data)
- Hide UTM data in separate tab
- Monthly marketing spend input (auto-calculates daily)
- Date range dropdown (7d, 14d, 30d, 90d, 6mo, 12mo, QTD, YTD, Custom)
- 7 new charts on DASHBOARD
- Protect auto-calculated columns

**Impact:**
- Fully automated lead capture from GHL
- First-touch attribution via UTM tracking
- Cleaner Lead Data tab (26 vs 35+ columns)
- Visual analytics on DASHBOARD

---

## 🏗️ ARCHITECTURE OVERVIEW

### Tab Structure (10 tabs)

| # | Tab | Type | Changes from v2.0 |
|---|-----|------|-------------------|
| 1 | **DASHBOARD** | View | ✨ Add 7 charts, date range dropdown |
| 2 | **Lead Data** | Entry | ✨ Add Lead ID column (A), Source auto-fills |
| 3 | **Members** | View | No change |
| 4 | **Settings** | Config | ✨ Add UTM mapping, monthly spend, date range dropdown |
| 5 | **Marketing** | Entry | ✨ Monthly budget (not daily) |
| 6 | **Staff** | View | No change |
| 7 | **Help** | Info | Update docs |
| 8 | **_UTM Tracking** | Hidden | 🆕 NEW - All UTM parameters |
| 9 | **_Daily Spend** | Hidden | 🆕 NEW - Auto-calc from monthly |
| 10 | **_Data** | Hidden | No change (active members) |

---

## 📊 DATA MODEL

### Lead Data Tab (26 columns)

| Col | Field | Type | Source | Auto? | Notes |
|-----|-------|------|--------|-------|-------|
| **A** | **Lead ID** | Text | GHL | - | `nracrQEQnzCNZ5Bqs5gO` |
| B | Created Date | Date | GHL | - | `date_created` |
| C | First Name | Text | GHL | - | `first_name` |
| D | Last Name | Text | GHL | - | `last_name` |
| E | Phone | Text | GHL | - | `phone` |
| F | Email | Email | GHL | - | `email` |
| G | DOB | Date | GHL | - | `date_of_birth` |
| H | Source | Dropdown | Formula | ✅ | Standardized (from UTM) |
| I | Campaign | Text | GHL | - | `campaign.name` |
| J | Staff Owner | Dropdown | Manual | - | Assigned manually |
| K | Location | Dropdown | GHL | - | `location.name` |
| L | Appt Set? | Checkbox | Manual | - | |
| M | Appt Date | Date | GHL/Manual | - | `calendar.startTime` or manual |
| N | Show? | Checkbox | Manual | - | |
| O | Trial Start | Date | Manual | - | |
| P | Trial End | Date | Formula | ✅ | `O + Settings!B21` |
| Q | Converted? | Checkbox | Manual | - | |
| R | Member Start | Date | Manual | - | |
| S | Membership Type | Dropdown | Manual | - | |
| T | MRR ($) | Number | Manual | - | |
| U | Upfront Fee ($) | Number | Manual | - | |
| V | Cancelled? | Checkbox | Manual | - | |
| W | Cancel Date | Date | Manual | - | |
| X | Cancel Reason | Dropdown | Manual | - | |
| Y | Notes | Text | Manual | - | |
| Z | Current Status | Text | Formula | ✅ | Derived from checkboxes |

**Key Changes:**
- Lead ID is now column A (all other columns shift right by 1)
- Source (H) auto-fills from UTM mapping
- Campaign (I) comes from GHL
- Location (K) auto-fills from GHL
- Appt Date (M) can come from GHL calendar webhook

### _UTM Tracking Tab (Hidden, 15 columns)

| Col | Field | Source | Auto? |
|-----|-------|--------|-------|
| A | Lead ID | GHL | - |
| B | Date Created | GHL | - |
| C | UTM Source (raw) | GHL | - |
| D | UTM Medium | GHL | - |
| E | UTM Campaign | GHL | - |
| F | UTM Content | GHL | - |
| G | UTM Match Type | GHL | - |
| H | Campaign ID | GHL | - |
| I | Ad Group ID | GHL | - |
| J | Ad ID | GHL | - |
| K | GCLID | GHL | - |
| L | Contact Source | GHL | - |
| M | Opportunity Source | GHL | - |
| N | Pipeline Stage | GHL | - |
| O | Standardized Source | Formula | ✅ |

**Formula (O2):**
```javascript
=ARRAYFORMULA(IF(A2:A="","",
  IFERROR(VLOOKUP(LOWER(C2:C), Settings!$G$2:$H$50, 2, FALSE), "Others")
))
```

Maps raw UTM source to standardized source via lookup table.

### Marketing Tab - Monthly Budget (6 columns)

| Col | Field | Type | Auto? |
|-----|-------|------|-------|
| A | Month | Text | - |
| B | Source | Dropdown | - |
| C | Location | Dropdown | - |
| D | Monthly Budget ($) | Number | - |
| E | Days in Month | Number | ✅ |
| F | Daily Rate ($) | Number | ✅ |

**Example:**
```
Month      Source        Location    Monthly Budget  Days  Daily Rate
2025-01    Paid Social   Downtown    $3,000          31    $96.77
2025-01    Paid Search   Downtown    $5,000          31    $161.29
```

**Formulas:**
- E2: `=DAY(EOMONTH(DATEVALUE(A2&"-01"),0))` (days in month)
- F2: `=D2/E2` (daily rate)

### _Daily Spend Tab (Hidden, 4 columns)

Auto-generated daily rows from monthly budget.

| Col | Field | Formula |
|-----|-------|---------|
| A | Date | Date series |
| B | Source | Lookup from monthly |
| C | Location | Lookup from monthly |
| D | Daily Spend ($) | Lookup daily rate |

**Generation Logic:**
For each month in Marketing tab, create 28-31 rows (one per day) with the daily rate.

### Settings Tab - New Sections

#### UTM Attribution Mapping (G1:H50)

| Raw UTM Source | Standardized Source |
|----------------|---------------------|
| adwords | Paid Search |
| google / cpc | Paid Search |
| google / organic | Organic Search |
| fb_ad | Paid Social |
| instagram | Paid Social |
| facebook | Social Media |
| (direct) | Direct Traffic |
| referral | Referrals |
| gohighlevel | CRM UI |
| member_referral | Member Referral |
| walkin | Walk-In |
| (none) | Others |

#### Date Range Dropdown (New Section)

| Setting | Value |
|---------|-------|
| Date Range Preset | [Dropdown] |
| Custom Start Date | (if Custom selected) |
| Custom End Date | (if Custom selected) |

**Dropdown Options:**
- Last 7 Days
- Last 14 Days
- **Last 30 Days** (default)
- Last 90 Days
- Last 6 Months
- Last 12 Months
- Quarter-to-Date
- Year-to-Date
- Custom Range

**Formula Logic:**
```javascript
// If "Last 30 Days" selected:
Start Date = TODAY() - 30
End Date = TODAY()

// If "Quarter-to-Date" selected:
Start Date = First day of current quarter
End Date = TODAY()

// If "Custom Range" selected:
Start Date = Manual input
End Date = Manual input
```

---

## 🔗 GOHIGHLEVEL WEBHOOK INTEGRATION

### Webhook Endpoint: `doPost(e)`

**URL:** `https://script.google.com/macros/s/{SCRIPT_ID}/exec`

**Method:** POST

**Payload:** GHL sends JSON with contact/opportunity/calendar data

**Function Flow:**
```javascript
function doPost(e) {
  try {
    // 1. Parse incoming JSON
    const payload = JSON.parse(e.postData.contents);
    
    // 2. Extract fields
    const leadData = extractLeadData(payload);
    const utmData = extractUTMData(payload);
    
    // 3. Write to Lead Data tab
    appendToLeadData(leadData);
    
    // 4. Write to UTM Tracking tab
    appendToUTMTracking(utmData);
    
    // 5. Return success
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      leadId: leadData.id
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Field Extraction Logic

**Lead Data Extraction:**
```javascript
function extractLeadData(payload) {
  return {
    leadId: payload.id || payload.contact_id,
    createdDate: new Date(payload.date_created),
    firstName: payload.first_name || '',
    lastName: payload.last_name || '',
    phone: payload.phone || '',
    email: payload.email || '',
    dob: payload.date_of_birth ? new Date(payload.date_of_birth) : '',
    // Source auto-filled from UTM (formula)
    campaign: payload.campaign?.name || '',
    // Staff Owner: manual assignment
    location: payload.location?.name || '',
    // Appt Set: from calendar webhook
    apptDate: payload.calendar?.startTime ? new Date(payload.calendar.startTime) : '',
    // Rest are manual checkboxes/inputs
  };
}
```

**UTM Data Extraction:**
```javascript
function extractUTMData(payload) {
  // GHL sends UTM as custom fields or URL parameters
  // Need to check how GHL stores UTM data in webhook
  
  return {
    leadId: payload.id,
    dateCreated: new Date(payload.date_created),
    utmSource: payload.utm_source || payload.gclid ? 'adwords' : '',
    utmMedium: payload.utm_medium || '',
    utmCampaign: payload.utm_campaign || '',
    utmContent: payload.utm_content || '',
    utmMatchType: payload.utm_matchtype || '',
    campaignId: payload.campaign_id || payload.campaign?.id || '',
    adGroupId: payload.ad_group_id || '',
    adId: payload.ad_id || '',
    gclid: payload.gclid || '',
    contactSource: payload.contact_source || '',
    opportunitySource: payload.opportunity_source || payload.source || '',
    pipelineStage: payload.pipleline_stage || '' // Note: GHL typo "pipleline"
  };
}
```

### Webhook Events to Handle

| GHL Event | Action in Sheets |
|-----------|------------------|
| **Contact Created** | Add new row to Lead Data + UTM Tracking |
| **Appointment Booked** | Update Appt Set?, Appt Date in existing row |
| **Opportunity Created** | Update opportunity fields in UTM Tracking |
| **Opportunity Status Changed** | Update pipeline stage |
| **Contact Updated** | Update corresponding row (match by Lead ID) |

---

## 📈 DASHBOARD ENHANCEMENTS

### New Layout (Scrollable)

```
╔══════════════════════════════════════════════════════════════════╗
║ 📊 GYM OPS DASHBOARD              Date Range: [Last 30 Days ▼] ║
╠══════════════════════════════════════════════════════════════════╣
║ SECTION 1: KPIs & On-Pace Status (rows 5-15)                    ║
║   Leads, Set%, Show%, Close%, Members, MRR, CAC                  ║
╠══════════════════════════════════════════════════════════════════╣
║ SECTION 2: Action Items (rows 17-35)                            ║
║   🔴 No Appt Set | 🟡 No Shows | 🟠 Trials Expiring            ║
╠══════════════════════════════════════════════════════════════════╣
║ SECTION 3: Member Alerts (rows 37-50)                           ║
║   🎯 Trials Ending | 🎂 Birthdays                               ║
╠══════════════════════════════════════════════════════════════════╣
║ SECTION 4: ANALYTICS CHARTS (rows 52+, scrollable)              ║
║                                                                  ║
║ Row 52-70:  Chart 1 (left) | Chart 2 (right)                    ║
║             ┌────────────┐  ┌────────────┐                      ║
║             │ Leads by   │  │ Funnel     │                      ║
║             │ Source     │  │ Conversion │                      ║
║             │ Over Time  │  │ Waterfall  │                      ║
║             └────────────┘  └────────────┘                      ║
║                                                                  ║
║ Row 72-90:  Chart 3 (left) | Chart 4 (right)                    ║
║             ┌────────────┐  ┌────────────┐                      ║
║             │ Revenue    │  │ CAC by     │                      ║
║             │ Trends     │  │ Source     │                      ║
║             │ (MRR+Up)   │  │ (Bar)      │                      ║
║             └────────────┘  └────────────┘                      ║
║                                                                  ║
║ Row 92-110: Chart 5 (left) | Chart 6 (right)                    ║
║             ┌────────────┐  ┌────────────┐                      ║
║             │ New Members│  │ Lead Volume│                      ║
║             │ vs Target  │  │ by Day of  │                      ║
║             │ (Combo)    │  │ Week       │                      ║
║             └────────────┘  └────────────┘                      ║
║                                                                  ║
║ Row 112-130: Chart 7 (full width)                               ║
║             ┌─────────────────────────────────────┐             ║
║             │ Source Performance Matrix           │             ║
║             │ Bubble Chart (CAC vs Close Rate)    │             ║
║             │ Size = Lead Volume                  │             ║
║             └─────────────────────────────────────┘             ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

### Chart Specifications

#### Chart 1: Leads by Source Over Time (Stacked Area)

**Data Source:** Lead Data filtered by date range
**X-Axis:** Date (daily or weekly buckets)
**Y-Axis:** Count of leads
**Series:** Stacked by Standardized Source
**Chart Type:** `Charts.ChartType.AREA` (stacked)

**Data Prep:**
Need helper tab or QUERY to aggregate:
```sql
SELECT 
  DATE(Created_Date) as Date,
  Source,
  COUNT(*) as Leads
FROM Lead_Data
WHERE Created_Date BETWEEN rngStart AND rngEnd
GROUP BY Date, Source
ORDER BY Date
```

#### Chart 2: Funnel Conversion (Waterfall)

**Data Source:** DASHBOARD KPI cells
**Stages:**
1. Leads (B7)
2. Sets (B7 × B8)
3. Shows (B7 × B8 × B9)
4. Closes (B11)

**Chart Type:** `Charts.ChartType.COLUMN` with custom colors
- Green: Leads
- Yellow: Sets
- Orange: Shows
- Blue: Closes

**Falloff Annotations:**
- Leads → Sets: Show % lost
- Sets → Shows: Show % lost
- Shows → Closes: Show % lost

#### Chart 3: Revenue Trends (Line Chart)

**Data Source:** Daily aggregation of MRR + Upfront
**X-Axis:** Date
**Y-Axis:** Revenue ($)
**Series:**
- MRR Added (cumulative or daily)
- Upfront Revenue (daily or cumulative)

**Chart Type:** `Charts.ChartType.LINE` (dual-axis if needed)

#### Chart 4: CAC by Source (Bar Chart)

**Data Source:** Aggregated from _Daily Spend and Lead Data
**X-Axis:** Standardized Source
**Y-Axis:** CAC ($)
**Calculation:** Total Spend / Total Conversions per source

**Chart Type:** `Charts.ChartType.BAR` (horizontal bars)
**Color:** Gradient (green = low CAC, red = high CAC)

#### Chart 5: New Members vs Target (Combo Chart)

**Data Source:** Daily/Weekly new members vs prorated target
**X-Axis:** Date (or week)
**Y-Axis:** Count
**Series:**
1. Actual New Members (bars)
2. Target Pace Line (line)

**Chart Type:** `Charts.ChartType.COMBO`

#### Chart 6: Lead Volume by Day of Week (Column Chart)

**Data Source:** Lead Data grouped by weekday
**X-Axis:** Mon, Tue, Wed, Thu, Fri, Sat, Sun
**Y-Axis:** Count of leads
**Calculation:** `WEEKDAY(Created_Date)` aggregation

**Chart Type:** `Charts.ChartType.COLUMN`
**Conditional Formatting:** Highest volume = green, lowest = red

#### Chart 7: Source Performance Matrix (Bubble Chart)

**Data Source:** Aggregated by Source
**X-Axis:** CAC ($)
**Y-Axis:** Close Rate (%)
**Bubble Size:** Lead Volume
**Bubble Color:** By Source

**Chart Type:** `Charts.ChartType.BUBBLE`
**Interpretation:** Top-left quadrant = best (low CAC, high close rate)

---

## 🔧 IMPLEMENTATION CHECKLIST

### Phase 1: Core Infrastructure (Day 1)

- [ ] **1.1** Update Lead Data tab structure (add Lead ID column A)
- [ ] **1.2** Create _UTM Tracking tab (15 columns)
- [ ] **1.3** Create _Daily Spend tab (4 columns)
- [ ] **1.4** Update Settings tab:
  - [ ] Add UTM mapping section (G1:H50)
  - [ ] Add date range dropdown section
  - [ ] Convert monthly targets to use new date logic
- [ ] **1.5** Update Marketing tab to monthly budget format
- [ ] **1.6** Update all existing formulas to reference new column positions (A→B, B→C, etc.)

### Phase 2: Webhook Integration (Day 2)

- [ ] **2.1** Create `doPost(e)` webhook endpoint
- [ ] **2.2** Create `extractLeadData(payload)` function
- [ ] **2.3** Create `extractUTMData(payload)` function
- [ ] **2.4** Create `appendToLeadData(data)` function
- [ ] **2.5** Create `appendToUTMTracking(data)` function
- [ ] **2.6** Create `updateExistingLead(leadId, data)` function (for updates)
- [ ] **2.7** Deploy as web app, get webhook URL
- [ ] **2.8** Test with GHL webhook simulator

### Phase 3: Attribution Logic (Day 2)

- [ ] **3.1** Populate UTM mapping table in Settings
- [ ] **3.2** Add formula in _UTM Tracking (O2) to map source
- [ ] **3.3** Add formula in Lead Data (H2) to pull from UTM Tracking
- [ ] **3.4** Test with various UTM combinations

### Phase 4: Date Range System (Day 3)

- [ ] **4.1** Create date range dropdown in Settings (B23)
- [ ] **4.2** Create named range for selected preset
- [ ] **4.3** Add custom date fields (B24, B25)
- [ ] **4.4** Create helper cells that calculate actual start/end dates based on selection
- [ ] **4.5** Update all COUNTIFS/SUMIFS to reference new date range cells
- [ ] **4.6** Add date range dropdown to DASHBOARD header (linked to Settings)
- [ ] **4.7** Test all presets (7d, 14d, 30d, 90d, 6mo, 12mo, QTD, YTD, Custom)

### Phase 5: Monthly Marketing Spend (Day 3)

- [ ] **5.1** Update Marketing tab header to monthly format
- [ ] **5.2** Add days-in-month formula (E2)
- [ ] **5.3** Add daily-rate formula (F2)
- [ ] **5.4** Create _Daily Spend tab with date series generation
- [ ] **5.5** Add VLOOKUP formulas to populate daily spend
- [ ] **5.6** Update CAC/CPL formulas to use _Daily Spend instead of Marketing
- [ ] **5.7** Test with multiple months, sources, locations

### Phase 6: Charts Creation (Day 4)

- [ ] **6.1** Create helper tab for chart data aggregation (if needed)
- [ ] **6.2** Chart 1: Leads by Source Over Time (stacked area)
- [ ] **6.3** Chart 2: Funnel Conversion (waterfall/column)
- [ ] **6.4** Chart 3: Revenue Trends (line)
- [ ] **6.5** Chart 4: CAC by Source (bar)
- [ ] **6.6** Chart 5: New Members vs Target (combo)
- [ ] **6.7** Chart 6: Lead Volume by Day of Week (column)
- [ ] **6.8** Chart 7: Source Performance Matrix (bubble)
- [ ] **6.9** Position all charts on DASHBOARD (rows 52+)
- [ ] **6.10** Test chart updates when date range changes

### Phase 7: Protections & Cleanup (Day 5)

- [ ] **7.1** Protect auto-calculated columns in Lead Data (P, Z)
- [ ] **7.2** Protect _UTM Tracking column O (Standardized Source)
- [ ] **7.3** Protect entire _Daily Spend tab
- [ ] **7.4** Protect Marketing columns E-F (auto-calculated)
- [ ] **7.5** Set protection to "Warning" mode (not hard block)
- [ ] **7.6** Hide _UTM Tracking, _Daily Spend, _Data tabs
- [ ] **7.7** Update Help tab documentation
- [ ] **7.8** Remove "Add Sample Data" from menu (GHL provides data)

### Phase 8: Testing & Validation (Day 6)

- [ ] **8.1** Test GHL webhook with real payload
- [ ] **8.2** Verify Lead Data row created correctly
- [ ] **8.3** Verify UTM Tracking row created
- [ ] **8.4** Verify Source auto-fills in Lead Data
- [ ] **8.5** Test all 7 charts render correctly
- [ ] **8.6** Test date range changes (verify charts update)
- [ ] **8.7** Test monthly spend → daily calculation
- [ ] **8.8** Test CAC/CPL calculations with monthly data
- [ ] **8.9** Load test with 100+ leads
- [ ] **8.10** Performance check: all formulas recalculate in <5 seconds

---

## 📐 FORMULA REFERENCE

### Lead Data Tab

**Column H (Source) - Row 2:**
```javascript
=ARRAYFORMULA(IF(A2:A="","",
  IFERROR(VLOOKUP(A2:A, '_UTM Tracking'!A:O, 15, FALSE), "Others")
))
```
Looks up Lead ID in UTM Tracking tab, returns Standardized Source.

**Column P (Trial End) - Row 2:**
```javascript
=ARRAYFORMULA(IF(O2:O="",, O2:O + Settings!$B$21))
```
No change from v2.0.

**Column Z (Current Status) - Row 2:**
```javascript
=ARRAYFORMULA(IF(A2:A="","",
  IF(V2:V=TRUE,"Cancelled",
  IF(Q2:Q=TRUE,"Member",
  IF(O2:O<>"","Trial",
  IF(N2:N=TRUE,"Show",
  IF(L2:L=TRUE,"Appt Set","Lead")))))))
```
Adjusted for new column positions.

### _UTM Tracking Tab

**Column O (Standardized Source) - Row 2:**
```javascript
=ARRAYFORMULA(IF(A2:A="","",
  IFERROR(VLOOKUP(LOWER(C2:C), Settings!$G$2:$H$50, 2, FALSE), "Others")
))
```
Maps raw UTM Source to standardized source.

### _Daily Spend Tab

**Populated by script, not formulas.**

Generates rows like:
```
Date        Source       Location  Daily Spend
2025-01-01  Paid Social  Downtown  $96.77
2025-01-02  Paid Social  Downtown  $96.77
...
2025-01-31  Paid Social  Downtown  $96.77
```

### Settings Tab - Date Range Logic

**Named Cells:**
- `B23`: Date Range Preset (dropdown)
- `B24`: Custom Start Date (manual)
- `B25`: Custom End Date (manual)
- `B26`: Calculated Start Date (formula)
- `B27`: Calculated End Date (formula)

**B26 (Calculated Start):**
```javascript
=IF(B23="Last 7 Days", TODAY()-7,
  IF(B23="Last 14 Days", TODAY()-14,
  IF(B23="Last 30 Days", TODAY()-30,
  IF(B23="Last 90 Days", TODAY()-90,
  IF(B23="Last 6 Months", EDATE(TODAY(),-6),
  IF(B23="Last 12 Months", EDATE(TODAY(),-12),
  IF(B23="Quarter-to-Date", DATE(YEAR(TODAY()), ROUNDDOWN((MONTH(TODAY())-1)/3,0)*3+1, 1),
  IF(B23="Year-to-Date", DATE(YEAR(TODAY()), 1, 1),
  IF(B23="Custom Range", B24, TODAY()-30)))))))))
```

**B27 (Calculated End):**
```javascript
=IF(B23="Custom Range", B25, TODAY())
```

**Update named ranges:**
- `rngStart` → Settings!B26
- `rngEnd` → Settings!B27

---

## 🎨 UI/UX ENHANCEMENTS

### DASHBOARD Header (Row 2)

**Before:**
```
A2: "Date Range:"
B2: =TEXT(rngStart) & " to " & TEXT(rngEnd)
```

**After:**
```
A2: "Date Range:"
B2: [Dropdown linked to Settings!B23]
C2: (If custom) "Start:" [Settings!B24]
D2: (If custom) "End:" [Settings!B25]
```

### Settings Tab Organization

```
A1: 🎯 MONTHLY TARGETS
A2-C10: Target table (existing)

A12: 📋 DROPDOWN LISTS
A13-E20: Source, Staff, Location, Types, Reasons (existing)

A22: 📅 DATE RANGE SELECTOR
A23: "Preset:" | B23: [Dropdown]
A24: "Custom Start:" | B24: [Date]
A25: "Custom End:" | B25: [Date]
A26: "Calculated Start:" | B26: [Formula] (hidden or gray)
A27: "Calculated End:" | B27: [Formula] (hidden or gray)

A29: ⚙️ OTHER SETTINGS
A30: "Trial Length (days)" | B30: 14

G1: 🗺️ UTM SOURCE MAPPING
G2: "Raw UTM Source" | H2: "Standardized Source"
G3: "adwords" | H3: "Paid Search"
G4: "google / cpc" | H4: "Paid Search"
... (continue mapping)
```

### Marketing Tab - Monthly Budget

```
A1: 💰 MARKETING BUDGET (Monthly)

A2: Month
B2: Source
C2: Location
D2: Monthly Budget ($)
E2: Days in Month
F2: Daily Rate ($)

A3: 2025-01
B3: Paid Social
C3: Downtown
D3: $3,000
E3: 31 (auto)
F3: $96.77 (auto)
```

---

## 🔐 SECURITY & PERMISSIONS

### Webhook Security

**Options:**
1. **API Key in Query String:**
   ```
   https://script.google.com/.../exec?key=SECRET_KEY
   ```
   Validate in `doPost()`:
   ```javascript
   if (e.parameter.key !== 'SECRET_KEY') {
     return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
   }
   ```

2. **Verify GHL Signature** (if GHL provides):
   Check `X-GHL-Signature` header matches expected hash.

3. **IP Whitelist** (advanced):
   Check request origin IP against GHL's IP ranges.

### Sheet Permissions

**Protected Ranges:**
- Lead Data: Columns P (Trial End), Z (Current Status)
- _UTM Tracking: Column O (Standardized Source)
- _Daily Spend: Entire sheet
- Marketing: Columns E-F (Days, Daily Rate)

**Protection Type:** Warning-only (allow edit with confirmation)

**Hidden Sheets:**
- _UTM Tracking
- _Daily Spend
- _Data

---

## 📊 CHART DATA HELPERS

### Option A: Use QUERY in Chart Range

Directly query Lead Data in chart definition:
```javascript
const dataRange = ss.getSheetByName('Lead Data').getRange('A1:Z1000');
const chart = sheet.newChart()
  .addRange(dataRange)
  .setOption('series', {
    0: { type: 'area', targetAxisIndex: 0 }
  })
  .build();
```

**Pros:** No helper tabs
**Cons:** Complex chart setup, slower rendering

### Option B: Create _Chart Data Helper Tab

Hidden tab with pre-aggregated data for each chart.

**Example - Leads by Source Over Time:**

_Chart Data tab, Sheet "LeadsBySource":
```
A: Date | B: Paid Search | C: Paid Social | D: Organic | ...
2025-01-01 | 5 | 3 | 2 | ...
2025-01-02 | 7 | 4 | 1 | ...
```

Generated by QUERY formulas that reference date range:
```sql
=QUERY('Lead Data'!A:H, 
  "SELECT B, COUNT(A) 
   WHERE B >= date '"&TEXT(rngStart,"yyyy-mm-dd")&"' 
   AND B <= date '"&TEXT(rngEnd,"yyyy-mm-dd")&"' 
   GROUP BY B, H 
   PIVOT H")
```

**Pros:** Clean chart setup, faster rendering
**Cons:** More complexity, more tabs

**Recommendation:** Option B - cleaner and more maintainable

---

## 🧪 TESTING SCENARIOS

### Test 1: GHL Webhook - New Lead Created

**Input (GHL Webhook Payload):**
```json
{
  "id": "nracrQEQnzCNZ5Bqs5gO",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "date_created": "2025-01-15T10:30:00Z",
  "location": {
    "name": "Downtown",
    "id": "loc123"
  },
  "campaign": {
    "id": "camp456",
    "name": "Summer Sale 2025"
  },
  "utm_source": "fb_ad",
  "utm_medium": "social-video",
  "utm_campaign": "summer_sale",
  "utm_content": "video_1",
  "campaign_id": "123456789"
}
```

**Expected Output:**

**Lead Data row:**
```
A: nracrQEQnzCNZ5Bqs5gO
B: 2025-01-15
C: John
D: Doe
E: 555-1234
F: john@example.com
G: (empty)
H: Paid Social (auto from UTM)
I: Summer Sale 2025
J: (empty - manual)
K: Downtown
L-Z: (empty - manual checkboxes/dates)
```

**_UTM Tracking row:**
```
A: nracrQEQnzCNZ5Bqs5gO
B: 2025-01-15
C: fb_ad
D: social-video
E: summer_sale
F: video_1
G: (empty)
H: 123456789
I-N: (empty)
O: Paid Social (auto from mapping)
```

### Test 2: Date Range Change

**Action:** Change Settings!B23 from "Last 30 Days" to "Last 7 Days"

**Expected:**
1. Settings!B26 updates to TODAY()-7
2. Settings!B27 updates to TODAY()
3. All DASHBOARD KPIs recalculate
4. All 7 charts redraw with new data

**Verify:**
- Lead count changes
- Charts show only last 7 days of data
- On-pace % changes (pace = 7 days elapsed / 30 total days in month)

### Test 3: Monthly Marketing Spend

**Input (Marketing tab):**
```
Month: 2025-01
Source: Paid Social
Location: Downtown
Monthly Budget: $3,000
```

**Expected:**
- E3 (Days): 31
- F3 (Daily Rate): $96.77

**_Daily Spend tab:**
31 rows created (2025-01-01 to 2025-01-31), each with $96.77

**DASHBOARD CAC calculation:**
- Total spend Jan 1-31: $3,000
- New members from Paid Social in Jan: 15
- CAC: $3,000 / 15 = $200

### Test 4: All 7 Charts Render

**Setup:**
- 100 leads across 5 sources
- Date range: Last 30 days

**Verify each chart:**
1. Leads by Source Over Time: Shows 5 stacked areas
2. Funnel Conversion: 4 bars (Leads, Sets, Shows, Closes)
3. Revenue Trends: 2 lines (MRR, Upfront)
4. CAC by Source: 5 horizontal bars
5. New Members vs Target: Bars + target line
6. Lead Volume by Day: 7 bars (Mon-Sun)
7. Source Performance Matrix: 5 bubbles (one per source)

---

## 📈 PERFORMANCE OPTIMIZATION

### Potential Bottlenecks

1. **ARRAYFORMULA in Lead Data:**
   - With 10,000 leads, ARRAYFORMULA can be slow
   - **Solution:** Limit to visible rows using INDEX

2. **VLOOKUP from UTM Tracking:**
   - 10,000 VLOOKUPs can be slow
   - **Solution:** Use INDEX/MATCH or JOIN formula

3. **Chart Data Aggregation:**
   - QUERY formulas recalculate on every change
   - **Solution:** Use Apps Script to cache aggregated data

### Optimized Formulas

**Lead Data H2 (Source) - Optimized:**
```javascript
=ARRAYFORMULA(IF(A2:A100="","",
  INDEX('_UTM Tracking'!O:O, MATCH(A2:A100, '_UTM Tracking'!A:A, 0))
))
```
INDEX/MATCH is faster than VLOOKUP for large datasets.

**Limit ARRAYFORMULA to 100 rows at a time:**
Instead of A2:A (entire column), use A2:A100, then extend as needed.

---

## 🎯 SUCCESS METRICS

After implementation, verify:

- [ ] ✅ GHL webhook delivers data within 5 seconds
- [ ] ✅ Lead Data + UTM Tracking rows created correctly
- [ ] ✅ Source auto-fills from UTM mapping (>95% accuracy)
- [ ] ✅ All 7 charts render in <10 seconds
- [ ] ✅ Date range changes update charts in <5 seconds
- [ ] ✅ Monthly spend → daily calculation accurate
- [ ] ✅ CAC/CPL calculations match manual calculations
- [ ] ✅ Dashboard loads in <3 seconds with 1,000 leads
- [ ] ✅ No formula errors (#REF!, #N/A, #VALUE!)
- [ ] ✅ Protected columns prevent accidental edits

---

## 📝 DOCUMENTATION UPDATES

### README.md Updates

- Add section: "GoHighLevel Integration"
- Update column count: 25 → 26
- Update tab count: 8 → 10
- Document new charts
- Document monthly spend workflow

### SETUP.md Updates

- Add webhook URL deployment steps
- Add GHL webhook configuration guide
- Update team training (no manual lead entry)

### New: WEBHOOK-GUIDE.md

Create detailed guide:
1. Deploy Apps Script as web app
2. Get webhook URL
3. Configure in GHL (Settings → Webhooks)
4. Test webhook delivery
5. Troubleshooting common issues

---

## 🚀 ROLLOUT PLAN

### Week 1: Development
- Days 1-3: Core infrastructure, webhook, attribution
- Days 4-5: Date ranges, marketing spend
- Day 6: Testing

### Week 2: Chart Development
- Days 1-4: Build all 7 charts
- Day 5: Chart positioning and styling

### Week 3: Integration Testing
- Configure GHL webhooks
- Test with real data
- Performance optimization

### Week 4: Training & Launch
- Train team on new features
- Monitor webhook deliveries
- Fix any edge cases

---

## ✅ NEXT STEPS

**Approve this plan, then I will:**

1. Create updated Code.gs (v2.1)
2. Create webhook endpoint code
3. Create helper functions for attribution
4. Create all chart generation code
5. Update all documentation
6. Create testing checklist
7. Create GHL webhook configuration guide

**Estimated total code: ~1,200 lines (up from 640)**

**Ready to proceed?** 🚀

