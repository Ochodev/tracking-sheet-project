# 📊 Data Flow & Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         MANUAL ENTRY                            │
│  (Green = Primary Entry Points)                                 │
└─────────────────────────────────────────────────────────────────┘
                              ▼
        ┌──────────────────────────────────────────┐
        │  📝 LEAD DATA (Primary Source of Truth)  │
        │  - All leads, members, cancellations     │
        │  - Auto-calculated columns (ARRAYFORMULA)│
        │  - onEdit triggers auto-stamp dates      │
        └──────────────────────────────────────────┘
                              ▼
        ┌─────────────────────┬──────────────────────┐
        ▼                     ▼                      ▼
┌──────────────┐    ┌──────────────┐     ┌──────────────┐
│   MEMBERS    │    │ CANCELLATIONS│     │  FOLLOW-UPS  │
│  (FILTER:    │    │  (FILTER:    │     │  (FILTER:    │
│ R=TRUE,      │    │   X=TRUE)    │     │ Various Date │
│ X≠TRUE)      │    │              │     │ Conditions)  │
└──────────────┘    └──────────────┘     └──────────────┘
                              
        ┌─────────────────────────────────────────┐
        │  💰 MARKETING SPEND (Manual Entry)      │
        │  - Date, Source, Location, Spend        │
        └─────────────────────────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │   SCOREBOARD     │
                    │  - Joins Lead    │
                    │    Data + Spend  │
                    │  - Calculates    │
                    │    CPL, CAC      │
                    └──────────────────┘

        ┌─────────────────────────────────────────┐
        │  🎯 TARGETS (Manual Configuration)      │
        │  - Monthly goals                        │
        │  - Date range controls (rngStart, End)  │
        └─────────────────────────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │  ON-PACE LOGIC   │
                    │  Goal To Date =  │
                    │  Target × Pace%  │
                    └──────────────────┘

        ┌─────────────────────────────────────────┐
        │  📋 LISTS (Seed Data + Dropdowns)       │
        │  - Sources, Staff, Locations, Types     │
        │  - Settings (Trial Length)              │
        └─────────────────────────────────────────┘
                              ▼
              (Used for Data Validation in Lead Data)

        ┌─────────────────────────────────────────┐
        │  🗺️  MAPPINGS (Raw → Standardized)      │
        │  - UTM source normalization             │
        └─────────────────────────────────────────┘
                              ▼
          (Used in Marketing Performance aggregations)

┌─────────────────────────────────────────────────────────────────┐
│                     AUTOMATED BACKGROUND                        │
│  (Hidden tabs, time-based triggers)                             │
└─────────────────────────────────────────────────────────────────┘

        ┌─────────────────────────────────────────┐
        │  📈 DAILY ACTIVE (Hidden)               │
        │  - Date series (365 days)               │
        │  - New Members, Cancels, Active Count   │
        │  - Cumulative running total             │
        └─────────────────────────────────────────┘
                              ▼
        ┌──────────────────────┬─────────────────┐
        ▼                      ▼                 ▼
┌──────────────┐    ┌──────────────┐  ┌──────────────┐
│ MEMBER HEALTH│    │   COHORTS    │  │  CHURN CHART │
│ - Trials     │    │ - Retention  │  │  - 90 days   │
│ - Renewals   │    │   by month   │  │  - Active    │
│ - Birthdays  │    │   cohort     │  │    trend     │
└──────────────┘    └──────────────┘  └──────────────┘

        ┌─────────────────────────────────────────┐
        │  💾 SNAPSHOTS (Hidden, Nightly Trigger) │
        │  - Yesterday's totals                   │
        │  - Prevents retroactive drift           │
        │  - Historical trend analysis            │
        └─────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      OUTPUT DASHBOARDS                          │
│  (All auto-updated, date-range aware)                           │
└─────────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────────────┐
        │  📊 SCOREBOARD                           │
        │  - KPIs vs Targets                       │
        │  - On-Pace Status (Green/Red)            │
        │  - Required Leads Calculator             │
        │  - Slicers: Location, Source, Staff      │
        └──────────────────────────────────────────┘

        ┌──────────────────────────────────────────┐
        │  📈 MARKETING PERFORMANCE                │
        │  - By Source & Location                  │
        │  - CPL, CAC, MRR, Upfront Revenue        │
        │  - Charts: CAC, MRR by source            │
        └──────────────────────────────────────────┘

        ┌──────────────────────────────────────────┐
        │  🏆 STAFF LEADERBOARD                    │
        │  - By Staff Owner                        │
        │  - Sets, Shows, Closes, Close Rate       │
        │  - Revenue attribution                   │
        │  - Next Actions count                    │
        └──────────────────────────────────────────┘
```

---

## Data Dependencies

### Lead Data Auto-Calculated Columns

| Column | Formula Type | Dependencies |
|--------|--------------|--------------|
| **B** (Lead ID) | ARRAYFORMULA | Row number |
| **Q** (Trial End) | ARRAYFORMULA | P (Trial Start) + Lists!H2 |
| **AC** (Current Status) | ARRAYFORMULA | M, O, P, R, X (checkboxes) |
| **AD** (Event Date) | ARRAYFORMULA | R (Converted), S (Member Start), A (Created) |
| **AK** (Error Flag) | ARRAYFORMULA | R, S, X, O, N (validation logic) |
| **AF-AI** (Stamps) | onEdit trigger | M, O, R, X (when toggled) |

### Filtered Tabs (Live Updates)

```javascript
Members = FILTER(Lead Data, R=TRUE, X≠TRUE)
Cancellations = FILTER(Lead Data, X=TRUE)
Follow-ups = Multiple FILTER conditions on dates & statuses
```

### Dashboard Calculations

**Scoreboard:**
```
Leads = COUNTIFS(Lead Data!A:A, date range)
Set Rate = COUNTIFS(AF:AF, range) / COUNTIFS(A:A, range)
Show Rate = COUNTIFS(AG:AG, range) / COUNTIFS(AF:AF, range)
Close Rate = COUNTIFS(R:R=TRUE, S:S in range) / COUNTIFS(AG:AG, range)
New Members = COUNTIFS(S:S, range, R:R=TRUE)
Added MRR = SUMIFS(U:U, S:S, range, R:R=TRUE)
CPL = SUMIFS(Marketing Spend!D:D, range) / Leads
CAC = SUMIFS(Marketing Spend!D:D, range) / New Members
```

**On-Pace Logic:**
```
daysTotal = rngEnd - rngStart + 1
daysElapsed = MIN(rngEnd, rngAsOf) - rngStart + 1
pace = daysElapsed / daysTotal
goalToDate = Target × pace
status = IF(Actual >= goalToDate, "ON PACE", "BEHIND")
```

### Daily Active Calculations

```
Row N:
  Date = TODAY - 365 + N
  New Members = COUNTIFS(Lead Data!S:S, Date)
  Cancels = COUNTIF(Lead Data!Y:Y, Date)
  Active = Previous Active + New Members - Cancels
```

---

## Trigger Architecture

### onOpen (Automatic)
- **When**: Sheet opens
- **Action**: Creates "Gym Ops" custom menu
- **Functions**: Initialize, Refresh, Add Sample Data, Rebuild Slicers

### onEdit (Automatic, Installable)
- **When**: Any cell edited in Lead Data
- **Scope**: Lead Data tab only, rows 2+
- **Actions**:
  - M (Appt Set?) checked → Set AF = TODAY, default N = TODAY
  - O (Show?) checked → Set AG = TODAY
  - R (Converted?) checked → Set AH = S, default S = TODAY
  - X (Cancelled?) checked → Set AI = Y, default Y = TODAY
  - P (Trial Start) set → Set Q = P + trial length

### Time-Based (Manual Setup via `setupNightlyTrigger()`)
- **When**: 2 AM daily
- **Action**: `takeNightlySnapshot()`
- **Process**:
  1. Get yesterday's date
  2. Count active members from Daily Active
  3. Calculate MTD metrics (leads, new members, cancels, MRR, revenue)
  4. Append to Snapshots tab

---

## Formula Optimization

### Why ARRAYFORMULA?
- **Single formula** applies to entire column (10,000+ rows)
- **Instant recalculation** when source data changes
- **No drag-down** required (auto-extends)

### Why FILTER over QUERY?
- **Faster** for simple conditions
- **Live updates** when source changes
- **Preserves headers** (important for Members/Cancellations tabs)

### Why Named Ranges (rngStart, rngEnd, rngAsOf)?
- **Single source of truth** for date range
- **Easy updates** (change in Targets tab → all dashboards update)
- **Readable formulas** (`>=rngStart` vs `>=Targets!$G$1`)

### Performance Considerations
- ✅ **Dynamic ranges**: `A1:INDEX(AK:AK, MATCH(2, 1/(A:A<>""), 1))`
- ✅ **Conditional aggregation**: `COUNTIFS`, `SUMIFS` (not SUMPRODUCT)
- ✅ **Avoid volatile functions**: Minimal use of `TODAY()`, `NOW()`, `INDIRECT()`
- ✅ **Limit conditional formatting**: Only Status column, Error Flag

---

## Security & Protections

### Protected Sheets (Warning-Only)
- **Lists**: Prevents accidental deletion of dropdown sources
- **Mappings**: Preserves source standardization
- **All calculated tabs**: Members, Cancellations, Scoreboard, etc.
- **Hidden tabs**: Daily Active, Cohorts, Snapshots

### Editable Tabs
- **Lead Data**: Primary entry (only calculated columns protected by formulas)
- **Marketing Spend**: Manual spend entry
- **Targets**: Goal setting, date range controls

### Data Validation (Dropdowns)
- **Source** → Lists!A2:A
- **Staff** → Lists!D2:D
- **Location** → Lists!E2:E
- **Membership Type** → Lists!C2:C
- **Cancel Reason** → Lists!B2:B
- **Checkboxes** → TRUE/FALSE (prevents text entry)

---

## Scalability Limits

| Metric | Recommended | Maximum | Notes |
|--------|-------------|---------|-------|
| **Leads** | 10,000 | 50,000 | Archive yearly if exceeded |
| **Daily Active rows** | 395 (13 months) | 1,000 | Extends automatically |
| **Marketing Spend rows** | 500/year | 5,000 | One row per day per source |
| **Staff** | 20 | 100 | Leaderboard scales well |
| **Locations** | 10 | 50 | Use slicers for filtering |
| **Sources** | 10 | 30 | Standardize via Mappings |

### When to Archive
- **Annually**: Move prior year leads to "Archive YYYY" sheet
- **Keep current year** in Lead Data for fast dashboards
- **Snapshots tab** preserves historical trends

---

## Extension Points

### Add Custom Metrics
1. Insert column in Lead Data (after AB, before AC)
2. Update header row
3. Add to Scoreboard or Leaderboard with SUMIFS/COUNTIFS

### Integrate with External Systems
- **Zapier**: Trigger on new Lead Data row → CRM
- **Google Forms**: Pre-fill Lead Data via form submissions
- **API**: Apps Script `UrlFetchApp` to pull ad spend from Facebook/Google Ads

### Advanced Analytics
- **Export to BigQuery**: File → Download → CSV → Import to BQ
- **Looker Studio**: Connect Google Sheets as data source
- **Python/R**: Use `gspread` library to read data

---

## Maintenance Schedule

| Task | Frequency | Tab |
|------|-----------|-----|
| Enter leads | Daily | Lead Data |
| Review Follow-ups | Daily | Follow-ups |
| Check Scoreboard | Daily | Scoreboard |
| Update Marketing Spend | Weekly | Marketing Spend |
| Review Member Health | Weekly | Member Health |
| Adjust Targets | Monthly | Targets |
| Export Snapshots | Monthly | Snapshots |
| Archive old data | Yearly | Lead Data |

---

**This architecture ensures:**
- ✅ Single source of truth (Lead Data)
- ✅ Automatic propagation (formulas, not scripts)
- ✅ Date-range flexibility (named ranges)
- ✅ Fast performance (optimized formulas)
- ✅ Historical accuracy (snapshots)
- ✅ Scalability (10k+ leads)
