# 🚀 GoHighLevel Integration - FINAL PLAN v2.1

## 📋 UPDATED ARCHITECTURE (Based on Answers)

### **Key Simplification:**
✅ **No webhook endpoint needed!**
- GHL workflows append rows directly to Lead Data + UTM Tracking
- No doPost(), no JSON parsing, no web app deployment
- Much simpler, more reliable

### **Your Answers Summary:**
1. ✅ **GHL Workflows** (not direct webhook)
2. ✅ **UTM in root payload** (`utm_source`, `utm_campaign`, etc.)
3. ✅ **Create _Chart Data helper tab** (fast charts)
4. ✅ **Remove "Add Sample Data"** menu item
5. ✅ **Keep 4-step wizard**, update questions

---

## 🏗️ SIMPLIFIED ARCHITECTURE

### Tab Structure (10 tabs)

| # | Tab | Populated By | Auto-Calc |
|---|-----|--------------|-----------|
| 1 | DASHBOARD | Formulas | ✅ |
| 2 | Lead Data | **GHL Workflow** | Columns H, P, Z |
| 3 | Members | Formulas | ✅ |
| 4 | Settings | Manual | - |
| 5 | Marketing | Manual (monthly) | Columns E-F |
| 6 | Staff | Formulas | ✅ |
| 7 | Help | Static | - |
| 8 | _UTM Tracking | **GHL Workflow** | Column O |
| 9 | _Daily Spend | Script (monthly→daily) | ✅ |
| 10 | _Chart Data | Formulas | ✅ |
| 11 | _Data | Formulas | ✅ |

**Total: 11 tabs** (added _Chart Data)

---

## 🔄 GHL WORKFLOW INTEGRATION

### How GHL Populates Data

**GHL Workflow Steps:**
1. **Trigger:** Contact Created / Updated
2. **Action 1:** Append row to **Lead Data** tab
3. **Action 2:** Append row to **_UTM Tracking** tab

### Lead Data Row Mapping (GHL → Sheets)

**GHL Workflow "Add Row to Sheet" action:**

| Sheet Column | GHL Field | Example |
|--------------|-----------|---------|
| A (Lead ID) | `{{contact.id}}` | `nracrQEQnzCNZ5Bqs5gO` |
| B (Created Date) | `{{contact.date_created}}` | `2025-01-15` |
| C (First Name) | `{{contact.first_name}}` | `John` |
| D (Last Name) | `{{contact.last_name}}` | `Doe` |
| E (Phone) | `{{contact.phone}}` | `555-1234` |
| F (Email) | `{{contact.email}}` | `john@example.com` |
| G (DOB) | `{{contact.date_of_birth}}` | `1990-05-15` |
| H (Source) | *LEAVE EMPTY* | *Auto from UTM* |
| I (Campaign) | `{{campaign.name}}` | `Summer Sale` |
| J (Staff Owner) | *LEAVE EMPTY* | *Manual assign* |
| K (Location) | `{{location.name}}` | `Downtown` |
| L-Y | *LEAVE EMPTY* | *Manual entry* |
| Z (Current Status) | *LEAVE EMPTY* | *Auto formula* |

### _UTM Tracking Row Mapping

| Sheet Column | GHL Field |
|--------------|-----------|
| A (Lead ID) | `{{contact.id}}` |
| B (Date Created) | `{{contact.date_created}}` |
| C (UTM Source) | `{{contact.utm_source}}` |
| D (UTM Medium) | `{{contact.utm_medium}}` |
| E (UTM Campaign) | `{{contact.utm_campaign}}` |
| F (UTM Content) | `{{contact.utm_content}}` |
| G (Match Type) | `{{contact.utm_matchtype}}` |
| H (Campaign ID) | `{{contact.campaign_id}}` |
| I (Ad Group ID) | `{{contact.ad_group_id}}` |
| J (Ad ID) | `{{contact.ad_id}}` |
| K (GCLID) | `{{contact.gclid}}` |
| L (Contact Source) | `{{contact.contact_source}}` |
| M (Opportunity Source) | `{{contact.opportunity_source}}` or `{{contact.source}}` |
| N (Pipeline Stage) | `{{contact.pipleline_stage}}` |
| O (Standardized Source) | *LEAVE EMPTY* | *Auto formula* |

**Note:** GHL workflow will append TWO rows (one to each tab) simultaneously.

---

## 📊 DATA MODEL (UPDATED)

### Lead Data (26 columns A-Z)

**Changes from v2.0:**
- **Added:** Lead ID (column A)
- **All other columns shift right by 1**
- Source (H) auto-fills from UTM lookup
- Trial End (P) auto-calculates
- Current Status (Z) auto-calculates

**Column Reference:**
```
A  Lead ID              ← NEW (from GHL)
B  Created Date         ← Was A
C  First Name           ← Was B
D  Last Name            ← Was C
E  Phone                ← Was D
F  Email                ← Was E
G  DOB                  ← Was F
H  Source               ← Was G (AUTO from UTM)
I  Campaign             ← Was H
J  Staff Owner          ← Was I
K  Location             ← Was J
L  Appt Set?            ← Was K
M  Appt Date            ← Was L
N  Show?                ← Was M
O  Trial Start          ← Was N
P  Trial End            ← Was O (AUTO)
Q  Converted?           ← Was P
R  Member Start         ← Was Q
S  Membership Type      ← Was R
T  MRR ($)              ← Was S
U  Upfront Fee ($)      ← Was T
V  Cancelled?           ← Was U
W  Cancel Date          ← Was V
X  Cancel Reason        ← Was W
Y  Notes                ← Was X
Z  Current Status       ← Was Y (AUTO)
```

### _UTM Tracking (15 columns A-O)

Hidden tab, populated by GHL workflow.

**Column O (Standardized Source) Formula:**
```javascript
=ARRAYFORMULA(IF(A2:A="","",
  IFERROR(VLOOKUP(LOWER(C2:C), Settings!$G$2:$H$50, 2, FALSE), "Others")
))
```

### _Chart Data (Helper for Charts)

Multiple sheets within one tab, or separate sections:

**Sheet 1: LeadsBySourceDaily**
```
A: Date | B: Paid Search | C: Paid Social | D: Organic | E: Referral | ...
```

**Sheet 2: FunnelData**
```
A: Stage | B: Count | C: %
Leads    | 200     | 100%
Sets     | 120     | 60%
Shows    | 84      | 70%
Closes   | 42      | 50%
```

**Sheet 3: RevenueDaily**
```
A: Date | B: MRR Added | C: Upfront
```

(etc. for each chart)

---

## 🎨 CHART SPECIFICATIONS (FINAL)

### Chart 1: Leads by Source Over Time

**Data Source:** `_Chart Data!LeadsBySourceDaily`

**Formula in _Chart Data:**
```javascript
// Generate date series for date range
=QUERY('Lead Data'!B:H, 
  "SELECT B, H, COUNT(A) 
   WHERE B >= date '"&TEXT(Settings!B26,"yyyy-mm-dd")&"' 
     AND B <= date '"&TEXT(Settings!B27,"yyyy-mm-dd")&"' 
   GROUP BY B, H 
   PIVOT H 
   ORDER BY B", 0)
```

**Chart Setup:**
```javascript
const chart = dashboard.newChart()
  .setChartType(Charts.ChartType.AREA)
  .addRange(chartDataSheet.getRange('LeadsBySourceDaily!A1:K100'))
  .setPosition(52, 1, 0, 0)
  .setOption('title', 'Leads by Source Over Time')
  .setOption('isStacked', true)
  .setOption('width', 600)
  .setOption('height', 300)
  .build();
```

### Chart 2: Funnel Conversion Waterfall

**Data Source:** DASHBOARD KPI cells

**Data Prep:**
```
Row in _Chart Data:
A: "Leads"   B: =DASHBOARD!B7
A: "Sets"    B: =DASHBOARD!B7*DASHBOARD!B8
A: "Shows"   B: =DASHBOARD!B7*DASHBOARD!B8*DASHBOARD!B9
A: "Closes"  B: =DASHBOARD!B11
```

**Chart Setup:**
```javascript
const chart = dashboard.newChart()
  .setChartType(Charts.ChartType.COLUMN)
  .addRange(chartDataSheet.getRange('FunnelData!A1:B5'))
  .setPosition(52, 8, 0, 0)
  .setOption('title', 'Funnel Conversion')
  .setOption('width', 400)
  .setOption('height', 300)
  .setOption('colors', ['#4285f4', '#fbbc04', '#ea4335', '#34a853'])
  .build();
```

### Chart 3: Revenue Trends

**Data Source:** `_Chart Data!RevenueDaily`

**Formula:**
```javascript
=QUERY('Lead Data'!B:T, 
  "SELECT B, SUM(T), SUM(U) 
   WHERE B >= date '"&TEXT(Settings!B26,"yyyy-mm-dd")&"' 
     AND B <= date '"&TEXT(Settings!B27,"yyyy-mm-dd")&"' 
     AND Q = TRUE 
   GROUP BY B 
   ORDER BY B", 0)
```

### Chart 4: CAC by Source

**Data Source:** Calculated in _Chart Data

**Formula:**
```javascript
// For each source:
// Total Spend (from _Daily Spend) / Total Conversions (from Lead Data)
```

### Chart 5: New Members vs Target

**Data Source:** Daily new members vs prorated target

### Chart 6: Lead Volume by Day of Week

**Data Source:** Aggregated by WEEKDAY()

**Formula:**
```javascript
=QUERY('Lead Data'!B:B, 
  "SELECT WEEKDAY(B), COUNT(B) 
   WHERE B >= date '"&TEXT(Settings!B26,"yyyy-mm-dd")&"' 
     AND B <= date '"&TEXT(Settings!B27,"yyyy-mm-dd")&"' 
   GROUP BY WEEKDAY(B) 
   ORDER BY WEEKDAY(B)", 0)
```

### Chart 7: Source Performance Matrix (Bubble)

**Data Source:** Aggregated by source
- X: CAC
- Y: Close Rate
- Size: Lead Volume

---

## ⚙️ IMPLEMENTATION STEPS

### Phase 1: Tab Structure Updates (2 hours)

- [ ] Add Lead ID column (A) to Lead Data
- [ ] Shift all formulas right by 1 column
- [ ] Create _UTM Tracking tab (15 columns)
- [ ] Create _Chart Data tab (helper sheets)
- [ ] Update Marketing tab to monthly format
- [ ] Create _Daily Spend tab
- [ ] Update Settings tab (UTM mapping, date dropdown)

### Phase 2: Formula Updates (3 hours)

- [ ] Update Lead Data formulas:
  - [ ] H2 (Source): `=VLOOKUP(A2:A, '_UTM Tracking'!A:O, 15, FALSE)`
  - [ ] P2 (Trial End): Adjust column references
  - [ ] Z2 (Current Status): Adjust column references
- [ ] Add UTM Tracking formula:
  - [ ] O2 (Standardized Source): `=VLOOKUP(LOWER(C2:C), Settings!G:H, 2, FALSE)`
- [ ] Update all DASHBOARD formulas to new column positions
- [ ] Update Members tab filter to new columns
- [ ] Add date range calculation formulas in Settings

### Phase 3: Monthly Spend System (2 hours)

- [ ] Update Marketing tab headers (monthly format)
- [ ] Add formulas: Days in Month (E2), Daily Rate (F2)
- [ ] Create script: `generateDailySpend()`
  - Reads Marketing monthly budget
  - Generates daily rows in _Daily Spend
  - Runs on Settings change or manual trigger
- [ ] Update CAC/CPL formulas to use _Daily Spend

### Phase 4: Date Range System (2 hours)

- [ ] Add date range dropdown in Settings (B23)
- [ ] Add custom date fields (B24, B25)
- [ ] Add calculation formulas (B26, B27)
- [ ] Update named ranges: rngStart → B26, rngEnd → B27
- [ ] Add date range dropdown to DASHBOARD header
- [ ] Test all presets (7d, 14d, 30d, 90d, 6mo, 12mo, QTD, YTD, Custom)

### Phase 5: Chart Data Helpers (3 hours)

- [ ] Create sections in _Chart Data:
  - [ ] LeadsBySourceDaily (QUERY by date + source)
  - [ ] FunnelData (from DASHBOARD KPIs)
  - [ ] RevenueDaily (QUERY by date, SUM MRR + Upfront)
  - [ ] CACBySource (calculate from spend + conversions)
  - [ ] MembersVsTarget (daily members + prorated target)
  - [ ] LeadsByWeekday (QUERY with WEEKDAY())
  - [ ] SourceMatrix (aggregate CAC, close rate, volume)

### Phase 6: Create All 7 Charts (4 hours)

- [ ] Chart 1: Leads by Source Over Time (stacked area)
- [ ] Chart 2: Funnel Conversion (column/waterfall)
- [ ] Chart 3: Revenue Trends (line, dual axis)
- [ ] Chart 4: CAC by Source (horizontal bar)
- [ ] Chart 5: New Members vs Target (combo)
- [ ] Chart 6: Lead Volume by Day of Week (column)
- [ ] Chart 7: Source Performance Matrix (bubble)
- [ ] Position all on DASHBOARD (rows 52+)
- [ ] Add titles, legends, formatting

### Phase 7: Protections & Polish (1 hour)

- [ ] Protect Lead Data: H (Source), P (Trial End), Z (Status)
- [ ] Protect _UTM Tracking: O (Standardized Source)
- [ ] Protect _Daily Spend: Entire tab
- [ ] Protect _Chart Data: Entire tab
- [ ] Protect Marketing: E-F (auto-calculated)
- [ ] Set all to "Warning" mode (not hard block)
- [ ] Hide: _UTM Tracking, _Daily Spend, _Chart Data, _Data

### Phase 8: Wizard & Menu Updates (1 hour)

- [ ] Update Quick Start Wizard:
  - [ ] Remove "Add Sample Data" question
  - [ ] Update sources question (note about GHL)
  - [ ] Add note: "Configure GHL workflow after setup"
- [ ] Remove "Add Sample Data" from menu
- [ ] Add "Generate Daily Spend" menu item (manual trigger)
- [ ] Update Help tab with GHL workflow instructions

### Phase 9: Documentation (2 hours)

- [ ] Update README.md:
  - [ ] Add GHL Workflows section
  - [ ] Update column count (26)
  - [ ] Update tab count (11)
  - [ ] Document 7 new charts
  - [ ] Document monthly spend workflow
- [ ] Update SETUP.md:
  - [ ] Add GHL workflow configuration steps
  - [ ] Update team training (automated lead capture)
- [ ] Create GHL-WORKFLOW-GUIDE.md:
  - [ ] Step-by-step GHL workflow setup
  - [ ] Field mapping table
  - [ ] Testing procedures
  - [ ] Troubleshooting

### Phase 10: Testing (2 hours)

- [ ] Test manual lead entry (verify formulas work)
- [ ] Simulate GHL workflow (manually add row with Lead ID)
- [ ] Verify Source auto-fills from UTM
- [ ] Test all 7 date range presets
- [ ] Test monthly spend → daily generation
- [ ] Verify all 7 charts render
- [ ] Test chart updates when date range changes
- [ ] Load test with 100+ rows
- [ ] Check performance (<5 sec recalc)

**Total Estimated Time: 22 hours (~3 days)**

---

## 📝 GHL WORKFLOW CONFIGURATION

### Workflow 1: New Contact Created

**Trigger:** Contact Created

**Action 1: Add Row to Lead Data**
```
Spreadsheet: [Your Sheet Name]
Worksheet: "Lead Data"
Row data (map columns):
  Column A: {{contact.id}}
  Column B: {{contact.date_created}}
  Column C: {{contact.first_name}}
  Column D: {{contact.last_name}}
  Column E: {{contact.phone}}
  Column F: {{contact.email}}
  Column G: {{contact.date_of_birth}}
  Column H: (leave empty - auto-filled)
  Column I: {{campaign.name}}
  Column J: (leave empty - manual)
  Column K: {{location.name}}
  Columns L-Y: (leave empty - manual)
  Column Z: (leave empty - auto-filled)
```

**Action 2: Add Row to _UTM Tracking**
```
Spreadsheet: [Your Sheet Name]
Worksheet: "_UTM Tracking"
Row data (map columns):
  Column A: {{contact.id}}
  Column B: {{contact.date_created}}
  Column C: {{contact.utm_source}}
  Column D: {{contact.utm_medium}}
  Column E: {{contact.utm_campaign}}
  Column F: {{contact.utm_content}}
  Column G: {{contact.utm_matchtype}}
  Column H: {{contact.campaign_id}}
  Column I: {{contact.ad_group_id}}
  Column J: {{contact.ad_id}}
  Column K: {{contact.gclid}}
  Column L: {{contact.contact_source}}
  Column M: {{contact.opportunity_source}} or {{contact.source}}
  Column N: {{contact.pipleline_stage}}
  Column O: (leave empty - auto-filled)
```

### Workflow 2: Appointment Booked (Optional)

**Trigger:** Appointment Created

**Action: Update Row in Lead Data**
```
Find row where Column A = {{contact.id}}
Update:
  Column L: TRUE (Appt Set?)
  Column M: {{calendar.startTime}}
```

**Note:** GHL workflows may not support "Update Row" - might need Zapier or manual update.

---

## 🎯 SUCCESS CRITERIA

After implementation, verify:

- [ ] ✅ Lead Data has 26 columns (A = Lead ID)
- [ ] ✅ _UTM Tracking has 15 columns
- [ ] ✅ _Chart Data has helper sections for all 7 charts
- [ ] ✅ Source (H) auto-fills from UTM mapping
- [ ] ✅ Trial End (P) auto-calculates
- [ ] ✅ Current Status (Z) updates based on checkboxes
- [ ] ✅ Date range dropdown works (all 9 options)
- [ ] ✅ Monthly spend generates daily rows
- [ ] ✅ CAC/CPL calculations use daily spend
- [ ] ✅ All 7 charts render on DASHBOARD
- [ ] ✅ Charts update when date range changes
- [ ] ✅ Protections prevent accidental formula edits
- [ ] ✅ Hidden tabs: _UTM, _Daily Spend, _Chart Data, _Data
- [ ] ✅ Quick Start Wizard updated (no sample data)
- [ ] ✅ Menu updated (no sample data option)
- [ ] ✅ Performance: <5 sec recalc with 1,000 leads
- [ ] ✅ No formula errors (#REF!, #N/A, #VALUE!)

---

## 📋 DELIVERABLES

**Code:**
1. **Code.gs v2.1** (~1,100 lines)
   - 11 tab creation functions
   - generateDailySpend() function
   - Updated wizard (no sample data)
   - All 7 chart generation functions
   - Protection setup
   - Menu updates

**Documentation:**
2. **README.md** (updated)
   - v2.1 features
   - GHL Workflows integration
   - 7 new charts
   - 26 columns, 11 tabs

3. **SETUP.md** (updated)
   - GHL workflow configuration
   - No webhook deployment
   - Team training updates

4. **GHL-WORKFLOW-GUIDE.md** (NEW)
   - Step-by-step workflow setup
   - Field mapping tables
   - Testing procedures
   - Troubleshooting

5. **TESTING-CHECKLIST.md** (NEW)
   - GHL workflow test scenarios
   - Chart verification
   - Performance benchmarks
   - Date range testing

6. **CHANGELOG.md** (updated)
   - v2.0 → v2.1 changes
   - Migration guide

---

## 🚀 READY TO BUILD

**All questions answered. Plan finalized. Architecture confirmed.**

**Proceeding with implementation in this order:**

1. Create Code.gs v2.1 (all tab functions, formulas, charts)
2. Create GHL-WORKFLOW-GUIDE.md (configuration steps)
3. Update README.md (v2.1 features)
4. Update SETUP.md (GHL integration)
5. Create TESTING-CHECKLIST.md (verification steps)
6. Update CHANGELOG.md (v2.0 → v2.1 summary)

**Estimated completion: 3-4 hours**

**Starting implementation now...** 🚀

