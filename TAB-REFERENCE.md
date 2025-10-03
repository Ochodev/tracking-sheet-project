# 📑 Complete Tab Reference

## Quick Navigation

| # | Tab Name | Type | Purpose | Edit? |
|---|----------|------|---------|-------|
| 1 | READ ME | Info | Instructions & links | ❌ |
| 2 | Lists | Config | Dropdowns & settings | ✅ |
| 3 | Targets | Config | Goals & date ranges | ✅ |
| 4 | **Lead Data** | **Entry** | **Primary data source** | **✅** |
| 5 | Members | View | Active members (auto) | ❌ |
| 6 | Cancellations | View | Cancelled members (auto) | ❌ |
| 7 | Marketing Spend | Entry | Ad spend tracking | ✅ |
| 8 | Mappings | Config | Source standardization | ✅ |
| 9 | Scoreboard | Dashboard | KPIs & on-pace | ❌ |
| 10 | Marketing Performance | Dashboard | CAC, CPL by source | ❌ |
| 11 | Member Health | Dashboard | Trials, renewals, birthdays | ❌ |
| 12 | Follow-ups | Dashboard | Action queue | ❌ |
| 13 | Staff Leaderboard | Dashboard | Performance by staff | ❌ |
| 14 | Daily Active | Hidden | Churn calculations | ❌ |
| 15 | Cohorts | Hidden | Retention analysis | ❌ |
| 16 | Snapshots | Hidden | Nightly backups | ❌ |

---

## 1. READ ME

**Purpose:** Instructions for daily use

**Content:**
- Daily use tips
- Menu actions (Gym Ops)
- Date range logic
- Data entry guidelines
- Protected tabs notice
- Charts & slicers info
- Snapshots explanation

**No formulas, just text.**

---

## 2. Lists

**Purpose:** Dropdown sources & settings

**Structure:**

| Column | Header | Seed Values | Used In |
|--------|--------|-------------|---------|
| A | Sources | Facebook, Instagram, Google, Referral, Walk-in, Other | Lead Data H, Marketing Spend B |
| B | Cancel Reasons | Price, Moved, Injury, Service, Location, Other | Lead Data Z |
| C | Membership Types | PT, Small Group, General, Class Pack | Lead Data T |
| D | Staff | Front Desk, Coach A, Coach B | Lead Data K |
| E | Locations | Location A, Location B | Lead Data AJ, Marketing Spend C |
| G | Settings | "Default Trial Length (days)" | Trial End calculation |
| H | Values | 14 | Used in Lead Data Q formula |

**Protection:** Warning-only (can edit with prompt)

**Key Cell:**
- `H2`: Trial length (used in `Lead Data!Q2` formula)

---

## 3. Targets

**Purpose:** Monthly goals & date range controls

**Structure:**

### Table (A1:C11)
| Metric | Target | Notes |
|--------|--------|-------|
| Leads | 200 | Total new leads per month |
| CPL ($) | 25 | Cost per lead |
| Set Rate (%) | 0.60 | Appt set / leads |
| Show Rate (%) | 0.70 | Shows / appts set |
| Close Rate (%) | 0.50 | Closes / shows |
| New Members | 42 | Monthly new member goal |
| CAC ($) | 150 | Customer acquisition cost |
| Monthly Churn (%) | 0.05 | Target churn rate |
| ARPU ($) | 150 | Average revenue per user |
| PT Renewals Due | 10 | Expected renewals/month |

### Date Controls (F1:G3)
| Label | Cell | Named Range | Default Value |
|-------|------|-------------|---------------|
| Start Date | G1 | `rngStart` | First of current month |
| End Date | G2 | `rngEnd` | Last of current month |
| As of (pace) | G3 | `rngAsOf` | `=TODAY()` |

**All dashboards filter by these named ranges.**

---

## 4. Lead Data ⭐

**Purpose:** PRIMARY DATA ENTRY - Single source of truth

### Column Reference (A-AK, 37 columns)

#### ENTRY COLUMNS (Manual)

| Col | Field | Type | Validation | Required | Notes |
|-----|-------|------|------------|----------|-------|
| A | Created Date | Date | Date format | ✅ | When lead entered system |
| C | First Name | Text | - | ✅ | |
| D | Last Name | Text | - | ✅ | |
| E | Phone | Text | - | | Format: 555-1234 |
| F | Email | Email | - | | |
| G | DOB | Date | - | | For birthday tracking |
| H | Source | Dropdown | Lists!A2:A | ✅ | Facebook, Google, etc. |
| I | Campaign | Text | - | | UTM campaign |
| J | Ad Group | Text | - | | UTM ad group |
| K | Staff Owner | Dropdown | Lists!D2:D | ✅ | Assigned salesperson |
| L | Spend Attributed ($) | Number | Currency | | Optional per-lead cost |
| M | Appt Set? | Checkbox | TRUE/FALSE | | Triggers AF stamp |
| N | Appt Date | Date | - | | When appt scheduled |
| O | Show? | Checkbox | TRUE/FALSE | | Triggers AG stamp |
| P | Trial Start | Date | - | | Triggers Q calculation |
| R | Converted to Member? | Checkbox | TRUE/FALSE | | Triggers S & AH |
| S | Member Start | Date | - | | Required if R=TRUE |
| T | Membership Type | Dropdown | Lists!C2:C | | PT, General, etc. |
| U | MRR ($) | Number | Currency | | Monthly recurring |
| V | Join Fee ($) | Number | Currency | | One-time |
| W | PT Package ($) | Number | Currency | | One-time |
| X | Cancelled? | Checkbox | TRUE/FALSE | | Triggers Y & AI |
| Y | Cancel Date | Date | - | | Required if X=TRUE |
| Z | Cancel Reason | Dropdown | Lists!B2:B | | Required if X=TRUE |
| AA | Birthday | Date | - | | For birthday alerts |
| AB | Notes | Text | - | | Free text |
| AE | PT Renewal Date | Date | - | | Triggers renewal alert |
| AJ | Location | Dropdown | Lists!E2:E | ✅ | Physical location |

#### AUTO-CALCULATED COLUMNS (No Entry)

| Col | Field | Formula | Purpose |
|-----|-------|---------|---------|
| **B** | Lead ID | `=ARRAYFORMULA(IF(A2:A="","", "L"&TEXT(ROW(A2:A)-1,"00000")))` | Unique identifier |
| **Q** | Trial End | `=ARRAYFORMULA(IF(P2:P="",, P2:P + IFERROR(VALUE(Lists!$H$2),14)))` | P + trial length |
| **AC** | Current Status | Nested IF checking X→R→P→O→M | Lead lifecycle stage |
| **AD** | Event Date | `=ARRAYFORMULA(IF(A2:A="","", IF(R2:R,S2:S, A2:A)))` | For cohort analysis |
| **AF** | Appt Set Date | onEdit stamp | When M checked |
| **AG** | Show Date | onEdit stamp | When O checked |
| **AH** | Converted Date | onEdit stamp | When R checked |
| **AI** | Cancel Stamp | onEdit stamp | When X checked |
| **AK** | Error Flag | Validation logic | Data integrity check |

### Status Precedence (AC)
```
1. Cancelled (X=TRUE) → "Cancelled"
2. Member (R=TRUE) → "Member"
3. Trial (P≠"") → "Trial"
4. Show (O=TRUE) → "Show"
5. Appt Set (M=TRUE) → "Appt Set"
6. Default → "Lead"
```

### Error Flags (AK)
- `ERR: Cancelled not Member` → X=TRUE but R=FALSE
- `ERR: Member missing Start` → R=TRUE but S blank
- `ERR: Show missing Appt Date` → O=TRUE but N blank

### onEdit Triggers
```javascript
When M checked → Set AF=TODAY, default N=TODAY
When O checked → Set AG=TODAY
When R checked → Set AH=S, default S=TODAY
When X checked → Set AI=Y, default Y=TODAY
When P set → Set Q=P+Lists!H2
```

---

## 5. Members

**Purpose:** Filtered view of active members

**Formula (A1):**
```
={'Lead Data'!A1:AK1;
  QUERY(FILTER('Lead Data'!A2:AK,
    'Lead Data'!R2:R=TRUE,
    'Lead Data'!X2:X<>TRUE), "WHERE Col1 IS NOT NULL", 0)}
```

**Logic:**
- Include: Converted=TRUE AND Cancelled≠TRUE
- Preserves headers from Lead Data
- Live updates when Lead Data changes

**Protection:** Yes (read-only)

---

## 6. Cancellations

**Purpose:** All cancelled members

**Formula (A1):**
```
={'Lead Data'!A1:AK1;
  QUERY(FILTER('Lead Data'!A2:AK, 'Lead Data'!X2:X=TRUE), "WHERE Col1 IS NOT NULL", 0)}
```

**Logic:**
- Include: Cancelled=TRUE (regardless of R status)
- For churn analysis

**Protection:** Yes (read-only)

---

## 7. Marketing Spend

**Purpose:** Track ad spend by date/source/location

**Structure:**

| Column | Field | Validation | Format |
|--------|-------|------------|--------|
| A | Date | Date | yyyy-mm-dd |
| B | Source | Lists!A2:A | Dropdown |
| C | Location | Lists!E2:E | Dropdown |
| D | Spend ($) | Number | Currency |

**Used In:**
- Scoreboard: CPL, CAC calculations
- Marketing Performance: Spend by source

**Entry Frequency:** Daily or weekly batch

---

## 8. Mappings

**Purpose:** Standardize raw UTM sources

**Structure:**

| Column | Field | Example |
|--------|-------|---------|
| A | Raw Source/UTM | fb, google_ads, friend |
| B | Standardized Source | Facebook, Google, Referral |

**Usage:**
```
=VLOOKUP(rawSource, Mappings!A:B, 2, FALSE)
```

**Seed Data:**
- fb → Facebook
- ig → Instagram
- google_ads → Google
- adwords → Google
- friend → Referral

**Protection:** Warning-only

---

## 9. Scoreboard 📊

**Purpose:** Main KPI dashboard with on-pace tracking

### Layout

**A1:** Title "📊 SCOREBOARD"

**A3:B4:** Date range display
- `B3`: Date range (from Targets)
- `B4`: As of date

**A6:F15:** KPI Table

| Metric | Actual (B) | Target (C) | Goal To Date (D) | Variance (E) | Status (F) |
|--------|------------|------------|------------------|--------------|------------|
| Leads | COUNT | Target | Target×Pace | Actual-Goal | ON PACE/BEHIND |
| Set Rate | % | Target | Target×Pace | Actual-Goal | ON PACE/BEHIND |
| Show Rate | % | Target | Target×Pace | Actual-Goal | ON PACE/BEHIND |
| Close Rate | % | Target | Target×Pace | Actual-Goal | ON PACE/BEHIND |
| New Members | COUNT | Target | Target×Pace | Actual-Goal | ON PACE/BEHIND |
| Added MRR | SUM | Calc | Calc×Pace | Actual-Goal | ON PACE/BEHIND |
| Upfront Revenue | SUM | - | - | - | - |
| CPL | Calc | Target | - | - | ON PACE/BEHIND |
| CAC | Calc | Target | - | - | ON PACE/BEHIND |

### Key Formulas

**Pace Calculation:**
```
pace = (MIN(rngEnd, rngAsOf) - rngStart + 1) / (rngEnd - rngStart + 1)
```

**Actual Leads (B7):**
```
=COUNTIFS('Lead Data'!A:A, ">="&Targets!$G$1, 'Lead Data'!A:A, "<="&Targets!$G$2)
```

**Actual Set Rate (B8):**
```
=IFERROR(
  COUNTIFS('Lead Data'!AF:AF, ">="&rngStart, 'Lead Data'!AF:AF, "<="&rngEnd) /
  COUNTIFS('Lead Data'!A:A, ">="&rngStart, 'Lead Data'!A:A, "<="&rngEnd), 0)
```

**Status (F7):**
```
=IF(D7="","", IF(B7 >= D7, "ON PACE", "BEHIND"))
```

### Conditional Formatting
- **ON PACE**: Green background (#b7e1cd), dark green text
- **BEHIND**: Red background (#f4c7c3), dark red text

### Charts
- Funnel Conversion Rates (Set/Show/Close) - Column chart

---

## 10. Marketing Performance

**Purpose:** CAC, CPL, MRR by Source & Location

**Structure:**

| Source | Location | Leads | New Members | Spend ($) | CPL ($) | CAC ($) | Added MRR ($) | Upfront Revenue ($) |
|--------|----------|-------|-------------|-----------|---------|---------|---------------|---------------------|
| ... | ... | COUNT | COUNT | SUM | Spend/Leads | Spend/Members | SUM MRR | SUM Join+PT |

**Date Range:** Respects Targets!G1:G2

**Charts:**
- CAC by Source (bar chart)
- Added MRR by Source (bar chart)

---

## 11. Member Health ❤️

**Purpose:** Proactive member retention

### Sections

**A3:** Trials Ending Next 7 Days
```
=IFERROR(FILTER('Lead Data'!A2:AK,
  'Lead Data'!Q2:Q>=TODAY(),
  'Lead Data'!Q2:Q<=TODAY()+7,
  'Lead Data'!P2:P<>""), {"No trials ending soon"})
```

**A15:** PT Renewals Next 14 Days
```
=IFERROR(FILTER('Lead Data'!A2:AK,
  'Lead Data'!AE2:AE>=TODAY(),
  'Lead Data'!AE2:AE<=TODAY()+14,
  'Lead Data'!R2:R=TRUE,
  'Lead Data'!X2:X<>TRUE), {"No PT renewals due"})
```

**A27:** Birthdays This Month
```
=IFERROR(FILTER('Lead Data'!C2:D&" - "&'Lead Data'!AA2:AA,
  MONTH('Lead Data'!AA2:AA)=MONTH(TODAY()),
  'Lead Data'!R2:R=TRUE,
  'Lead Data'!X2:X<>TRUE,
  'Lead Data'!AA2:AA<>""), {"No birthdays this month"})
```

**Chart:** Active Members Trend (90 days from Daily Active)

---

## 12. Follow-ups 📞

**Purpose:** Daily action queue

### Sections

**A3:** No Appt Set After 24h
```
=IFERROR(FILTER('Lead Data'!A2:AK,
  'Lead Data'!A2:A < TODAY()-1,
  'Lead Data'!M2:M=FALSE,
  'Lead Data'!R2:R=FALSE,
  'Lead Data'!X2:X=FALSE), {"None"})
```

**A15:** No Show Follow-up
```
=IFERROR(FILTER('Lead Data'!A2:AK,
  'Lead Data'!O2:O=FALSE,
  'Lead Data'!N2:N<>"",
  'Lead Data'!N2:N<TODAY(),
  'Lead Data'!R2:R=FALSE), {"None"})
```

**A27:** Trial Ending in 3 Days - Not Converted
```
=IFERROR(FILTER('Lead Data'!A2:AK,
  'Lead Data'!Q2:Q>=TODAY(),
  'Lead Data'!Q2:Q<=TODAY()+3,
  'Lead Data'!R2:R=FALSE,
  'Lead Data'!P2:P<>""), {"None"})
```

**Use Case:** Daily morning checklist for sales team

---

## 13. Staff Leaderboard 🏆

**Purpose:** Performance by Staff Owner

**Structure:**

| Staff | Leads | Sets | Shows | Closes | Close Rate | Added MRR ($) | Upfront Revenue ($) | Next Actions |
|-------|-------|------|-------|--------|------------|---------------|---------------------|--------------|
| Coach A | COUNT | COUNT | COUNT | COUNT | % | SUM | SUM | COUNT |
| Coach B | ... | ... | ... | ... | ... | ... | ... | ... |

**Date Range:** Respects Targets!G1:G2

**Metrics:**
- **Leads:** `COUNTIFS(K:K, Staff, A:A, range)`
- **Sets:** `COUNTIFS(K:K, Staff, AF:AF, range)`
- **Shows:** `COUNTIFS(K:K, Staff, AG:AG, range)`
- **Closes:** `COUNTIFS(K:K, Staff, R:R, TRUE, S:S, range)`
- **Close Rate:** Closes / Shows
- **Next Actions:** Count from Follow-ups tab

---

## 14. Daily Active (Hidden)

**Purpose:** Churn calculations & trend analysis

**Structure:**

| Date | New Members | Cancels | Active Members |
|------|-------------|---------|----------------|
| Today-365 | `=COUNTIFS('Lead Data'!S:S, A2)` | `=COUNTIF('Lead Data'!Y:Y, A2)` | Cumulative |
| Today-364 | ... | ... | D1 + B2 - C2 |
| ... | ... | ... | ... |
| Today+30 | ... | ... | ... |

**Total Rows:** 395 (365 past + 30 future)

**Formula D2 (Active Members):**
```
=IF(ROW()=2, B2-C2, D1+B2-C2)
```

**Used By:**
- Member Health: Active Members Trend chart
- Cohorts: Retention calculations
- Churn analysis

**Hidden:** Yes (background calculation)

---

## 15. Cohorts (Hidden)

**Purpose:** Retention by cohort month

**Structure:**

| Cohort Month | Members | 30-Day Retention | 60-Day Retention | 90-Day Retention |
|--------------|---------|------------------|------------------|------------------|
| 2025-01 | 42 | 90% | 85% | 80% |
| 2025-02 | 38 | 92% | 87% | 82% |

**Calculation:**
- Cohort = Month of Member Start (S column)
- Retention = Members still active N days later (from Daily Active)

**Hidden:** Yes (advanced analytics)

---

## 16. Snapshots (Hidden)

**Purpose:** Nightly backups, prevent retroactive drift

**Structure:**

| Snapshot Date | Active Members | Total Leads | New Members (MTD) | Cancels (MTD) | Added MRR (MTD) | Upfront Revenue (MTD) |
|---------------|----------------|-------------|-------------------|---------------|-----------------|------------------------|
| 2025-09-29 | 450 | 2,350 | 42 | 8 | $5,200 | $12,500 |
| 2025-09-28 | 448 | 2,340 | 41 | 8 | $5,100 | $12,400 |

**Trigger:** Time-based, 2 AM daily (after running `setupNightlyTrigger()`)

**Function:** `takeNightlySnapshot()`

**Process:**
1. Get yesterday's date
2. Query Daily Active for active member count
3. Calculate MTD metrics from Lead Data (month-to-date for yesterday)
4. Append row to Snapshots

**Use Case:**
- Historical reporting (what were our numbers on X date?)
- Prevents issues when old data is edited
- Trend analysis over time

**Hidden:** Yes (background data)

---

## Summary Table

| Tab Type | Count | Tabs |
|----------|-------|------|
| **Entry** | 3 | Lead Data, Marketing Spend, Targets |
| **Config** | 2 | Lists, Mappings |
| **View** | 2 | Members, Cancellations |
| **Dashboard** | 5 | Scoreboard, Marketing Performance, Member Health, Follow-ups, Staff Leaderboard |
| **Background** | 3 | Daily Active, Cohorts, Snapshots |
| **Info** | 1 | READ ME |
| **TOTAL** | **16** | |

---

## Formula Count by Tab

| Tab | ARRAYFORMULA | FILTER | QUERY | COUNTIFS/SUMIFS | Total Formulas |
|-----|--------------|--------|-------|-----------------|----------------|
| Lead Data | 5 | 0 | 0 | 0 | 5 (covering 50k+ cells) |
| Members | 0 | 1 | 1 | 0 | 1 (entire tab) |
| Cancellations | 0 | 1 | 1 | 0 | 1 (entire tab) |
| Scoreboard | 0 | 0 | 0 | 20+ | ~30 |
| Marketing Perf | 0 | 0 | 1 | 10+ | ~15 |
| Member Health | 0 | 3 | 0 | 0 | 3 |
| Follow-ups | 0 | 3 | 0 | 0 | 3 |
| Staff Leaderboard | 0 | 0 | 1 | 15+ | ~20 |
| Daily Active | 0 | 0 | 0 | 2×395 | 790 |
| Targets | 1 (TODAY) | 0 | 0 | 0 | 1 |

**Total:** ~870 formulas, but highly optimized (ARRAYFORMULA reduces cell count by 99%)

---

**This tab structure ensures:**
- ✅ Single entry point (Lead Data)
- ✅ Automatic propagation (no manual copying)
- ✅ Clear separation (entry vs dashboards)
- ✅ Performance (optimized formulas)
- ✅ Scalability (10k+ leads)
- ✅ Historical accuracy (snapshots)
