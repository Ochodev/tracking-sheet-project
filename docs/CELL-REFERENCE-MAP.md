# CELL REFERENCE MAP

**Complete mapping of all critical cells and formulas**  
**Last Updated:** October 14, 2025

---

## 📋 Quick Reference

| Sheet | Critical Cells | Impact Level |
|-------|----------------|--------------|
| Settings & Budget | B30, B31, B33, A40:E100 | 🔴 CRITICAL |
| DASHBOARD | B2, A20:M30 | 🔴 CRITICAL |
| Lead Data | H2, R2, AB2, Columns S/X | 🔴 CRITICAL |
| _LTV Calculations | N:T | 🟡 MEDIUM |
| Members | A2 | 🟡 MEDIUM |

---

## 🎯 Settings & Budget Tab

### Configuration Cells

#### B30: Start Date (Calculated)
- **Type:** Formula
- **Purpose:** Calculates start date based on DASHBOARD B2 dropdown
- **Formula:** Complex IF statement handling 9 date range options
- **Referenced By:** ALL tabs for date filtering
- **Impact:** 🔴 CRITICAL - Changing breaks all metrics
- **Dependencies:** DASHBOARD!B2
- **Expected Output:** Date (e.g., 2025-09-14)
- **Breaking This:** All COUNTIFS, SUMIFS with date filters fail

#### B31: End Date (Calculated)
- **Type:** Formula
- **Purpose:** Calculates end date based on DASHBOARD B2 dropdown
- **Formula:** `IF(DASHBOARD!B2="Custom Range", B29, TODAY())`
- **Referenced By:** ALL tabs for date filtering
- **Impact:** 🔴 CRITICAL - Changing breaks all metrics
- **Dependencies:** DASHBOARD!B2, B29
- **Expected Output:** Date (e.g., 2025-10-14)
- **Breaking This:** All COUNTIFS, SUMIFS with date filters fail

#### B33: Trial Length
- **Type:** Value (14)
- **Purpose:** Number of days for trial period
- **Referenced By:** Lead Data R2 (Trial End calculation)
- **Impact:** 🟡 MEDIUM - Only affects trial end dates
- **Expected Output:** Number (typically 7, 14, or 30)
- **Breaking This:** Trial End dates calculate incorrectly

### Dropdown Lists

#### A14:A24: Source List
- **Type:** Values
- **Purpose:** Lead source options for dropdown
- **Referenced By:** 
  - Lead Data H2 (data validation)
  - DASHBOARD A20 (source list)
  - Marketing Budget B40:B100 (dropdown validation)
- **Impact:** 🟡 MEDIUM - Breaks source tracking
- **Default Values:** Paid Search, Paid Social, Direct Traffic, etc.
- **Breaking This:** Dropdowns show #REF!, SOURCE ANALYSIS empty

#### B14:B16: Staff List
- **Type:** Values
- **Purpose:** Staff member options for dropdown
- **Referenced By:** Lead Data J2 (data validation)
- **Impact:** 🟢 LOW - Only affects dropdown
- **Default Values:** Front Desk, Coach A, Coach B

#### D14:D17: Membership Types
- **Type:** Values
- **Purpose:** Membership package options
- **Referenced By:** 
  - Lead Data U2 (data validation)
  - _Metrics calculations
  - _LTV Calculations
- **Impact:** 🟡 MEDIUM - Breaks type-based analytics
- **Default Values:** PT, Small Group, General, Class Pack

#### E14:E19: Cancel Reasons
- **Type:** Values
- **Purpose:** Cancellation reason options
- **Referenced By:** Lead Data Z2 (data validation)
- **Impact:** 🟢 LOW - Only affects dropdown
- **Default Values:** Price, Moved, Injury, Service, Location, Other

### Marketing Budget Table

#### A40:A100: Month Column
- **Type:** Values (YYYY-MM format)
- **Purpose:** Month identifiers for budget data
- **Referenced By:** DASHBOARD G20 (Spend formula)
- **Impact:** 🔴 CRITICAL - Breaks spend calculations
- **Format:** Text string "YYYY-MM" (e.g., "2025-10")
- **Breaking This:** Spend shows $0, all cost metrics fail

#### B40:B100: Source Column
- **Type:** Values (from A14:A24)
- **Purpose:** Which source the budget applies to
- **Referenced By:** DASHBOARD G20 (Spend formula)
- **Impact:** 🔴 CRITICAL - Breaks spend calculations
- **Validation:** Dropdown from A14:A24
- **Breaking This:** Spend shows $0, all cost metrics fail

#### C40:C100: Monthly Budget
- **Type:** Values (dollars)
- **Purpose:** Total monthly budget amount
- **Referenced By:** Not currently used (was for old formula)
- **Impact:** 🟢 LOW - Not currently referenced
- **Format:** Currency

#### D40:D100: Days in Month
- **Type:** Formula (ARRAYFORMULA)
- **Purpose:** Auto-calculate days in each month
- **Formula:** `ARRAYFORMULA(IF(A40:A67="","",DAY(EOMONTH(...))))`
- **Impact:** 🟢 LOW - Used for daily rate calculation
- **Breaking This:** Daily rate shows #ERROR

#### E40:E100: Daily Rate
- **Type:** Formula (ARRAYFORMULA)
- **Purpose:** Auto-calculate daily spend rate
- **Formula:** `ARRAYFORMULA(IF(C40:C67="","",C40:C67/D40:D67))`
- **Referenced By:** DASHBOARD G20 (Spend formula)
- **Impact:** 🔴 CRITICAL - Breaks spend calculations
- **Breaking This:** Spend shows $0, all cost metrics fail

---

## 📊 DASHBOARD Tab

### Control Cells

#### B2: Date Range Dropdown
- **Type:** Data validation dropdown
- **Purpose:** User selects reporting period
- **Options:** Last 7 Days, Last 14 Days, Last 30 Days, Last 90 Days, Last 6 Months, Last 12 Months, Quarter-to-Date, Year-to-Date, Custom Range
- **Referenced By:** Settings B30/B31 (drives date calculations)
- **Impact:** 🔴 CRITICAL - Controls ALL date filtering
- **Breaking This:** Date range breaks, all metrics show wrong data

### Key Metrics Section

#### B10: Leads Count
- **Formula:** `COUNTIFS('Lead Data'!B:B,">="&'Settings & Budget'!$B$30,'Lead Data'!B:B,"<="&'Settings & Budget'!$B$31)`
- **Purpose:** Count leads in date range
- **Impact:** 🟡 MEDIUM - Affects KPI display only

#### B16: CAC (Customer Acquisition Cost)
- **Formula:** Complex LET formula with spend calculation
- **Purpose:** Calculate overall CAC
- **Dependencies:** Settings A40:E100, Lead Data
- **Impact:** 🟡 MEDIUM - Affects KPI display only

### SOURCE ANALYSIS Section (Rows 18-30)

#### A20:A30: Source List
- **Formula:** `ARRAYFORMULA(IF(LEN('Settings & Budget'!A14:A24)=0,"", 'Settings & Budget'!A14:A24))`
- **Purpose:** Pull source names from Settings
- **Impact:** 🔴 CRITICAL - Drives all SOURCE ANALYSIS
- **Breaking This:** Entire SOURCE ANALYSIS section fails

#### B20:B30: Leads per Source
- **Formula:** `ARRAYFORMULA(IF(A20:A30="","",COUNTIFS(...)))`
- **Purpose:** Count leads by source
- **Impact:** 🟡 MEDIUM - Affects one column only

#### C20:C30: Appointments per Source
- **Formula:** `ARRAYFORMULA(IF(A20:A30="","",COUNTIFS('Lead Data'!H:H,A20:A30,'Lead Data'!L:L,TRUE,...)))`
- **Purpose:** Count appointments by source
- **Impact:** 🟡 MEDIUM - Affects one column only

#### D20:D30: Showed per Source
- **Formula:** `ARRAYFORMULA(IF(A20:A30="","",COUNTIFS('Lead Data'!H:H,A20:A30,'Lead Data'!N:N,TRUE,...)))`
- **Purpose:** Count shows by source
- **Impact:** 🟡 MEDIUM - Affects one column only

#### E20:E30: Show Rate
- **Formula:** `ARRAYFORMULA(IF(A20:A30="","",IFERROR(D20:D30/C20:C30,0)))`
- **Purpose:** Calculate show rate percentage
- **Dependencies:** C20:C30, D20:D30
- **Impact:** 🟢 LOW - Calculated from other columns

#### F20:F30: Close Rate
- **Formula:** `ARRAYFORMULA(IF(A20:A30="","",IFERROR(COUNTIFS(...)/B20:B30,0)))`
- **Purpose:** Calculate close rate percentage
- **Dependencies:** B20:B30
- **Impact:** 🟢 LOW - Calculated from other columns

#### G20:G30: Spend (CRITICAL)
- **Formula:** Complex MAP/LAMBDA with date overlap logic
- **Purpose:** Calculate marketing spend per source for date range
- **Dependencies:** 
  - Settings A40:A100 (months)
  - Settings B40:B100 (sources)
  - Settings E40:E100 (daily rates)
  - Settings B30/B31 (date range)
- **Impact:** 🔴 CRITICAL - Breaks CPL, CPA, CPS, CAC if wrong
- **Expected Output:** Dollar amounts (e.g., $3450, $1200)
- **Common Issues:**
  - Shows $0 → Check Marketing Budget has data
  - Shows #ERROR → Formula syntax issue
  - Shows wrong amount → Check date range overlap logic

**Formula Structure:**
```javascript
=ARRAYFORMULA(MAP(A20:A30,
  LAMBDA(src,
    IF(src="","",
      LET(
        startDate,'Settings & Budget'!$B$30,
        endDate,'Settings & Budget'!$B$31,
        rawMonths,'Settings & Budget'!$A$40:$A$100,
        sources,'Settings & Budget'!$B$40:$B$100,
        rates,'Settings & Budget'!$E$40:$E$100,
        // ... date overlap calculation ...
      )
    )
  )
))
```

#### H20:H30: CPL (Cost Per Lead)
- **Formula:** `ARRAYFORMULA(IF(A20:A30="","",IF(B20:B30=0,"-",G20:G30/B20:B30)))`
- **Purpose:** Calculate cost per lead
- **Dependencies:** G20:G30, B20:B30
- **Impact:** 🟡 MEDIUM - Dependent on Spend (G20)
- **Expected Output:** Dollar amounts or "-"

#### I20:I30: CPA (Cost Per Appointment)
- **Formula:** `ARRAYFORMULA(IF(A20:A30="","",IF(C20:C30=0,"-",G20:G30/C20:C30)))`
- **Purpose:** Calculate cost per appointment
- **Dependencies:** G20:G30, C20:C30
- **Impact:** 🟡 MEDIUM - Dependent on Spend (G20)

#### J20:J30: CPS (Cost Per Show)
- **Formula:** `ARRAYFORMULA(IF(A20:A30="","",IF(D20:D30=0,"-",G20:G30/D20:D30)))`
- **Purpose:** Calculate cost per show
- **Dependencies:** G20:G30, D20:D30
- **Impact:** 🟡 MEDIUM - Dependent on Spend (G20)

#### K20:K30: CAC (Cost Per Acquisition)
- **Formula:** `ARRAYFORMULA(IF(A20:A30="","",LET(spend,G20:G30,members,COUNTIFS(...),IF(spend=0,"Organic",IF(members=0,"-",spend/members)))))`
- **Purpose:** Calculate customer acquisition cost per source
- **Dependencies:** G20:G30, Lead Data
- **Impact:** 🟡 MEDIUM - Dependent on Spend (G20)
- **Expected Output:** Dollar amounts, "Organic", or "-"

#### L20:L30: LTV (Lifetime Value)
- **Formula:** `=ARRAYFORMULA(IF(A20:A30="","",IFERROR(VLOOKUP(A20:A30,'_LTV Calculations'!N:T,7,FALSE),0)))`
- **Purpose:** Pull LTV per source from _LTV Calculations
- **Dependencies:** _LTV Calculations N:T
- **Impact:** 🔴 CRITICAL - Breaks LTV:CAC if wrong
- **Expected Output:** Dollar amounts (e.g., $4500, $3200)
- **Common Issues:**
  - Shows $0 → Source not in _LTV Calculations
  - Shows #N/A → VLOOKUP range wrong
  - Shows wrong value → Check column index (should be 7)

#### M20:M30: LTV:CAC Ratio
- **Formula:** `ARRAYFORMULA(IF(A20:A30="","",IF((L20:L30=0)+(K20:K30=0)+(K20:K30="Organic")>0,"-",L20:L30/K20:K30)))`
- **Purpose:** Calculate LTV:CAC ratio
- **Dependencies:** L20:L30, K20:K30
- **Impact:** 🟢 LOW - Calculated from other columns
- **Expected Output:** Ratios like "3.5x", "2.1x", or "-"

---

## 📝 Lead Data Tab

### Auto-Calculated Formulas

#### H2: Source Formula (CRITICAL)
- **Type:** ARRAYFORMULA
- **Formula:** `=ARRAYFORMULA(IF(A2:A="","",IFERROR(INDEX('_UTM Tracking'!O:O, MATCH(A2:A, '_UTM Tracking'!A:A, 0)),"⚠️ Not Tracked")))`
- **Purpose:** Auto-populate source from _UTM Tracking
- **Referenced By:** Members, DASHBOARD, _Metrics, _LTV Calculations
- **Impact:** 🔴 CRITICAL - Breaks all source-based analytics
- **Expected Output:** Source names or "⚠️ Not Tracked"
- **Breaking This:** SOURCE ANALYSIS shows blank, Members filter breaks

#### R2: Trial End Formula
- **Type:** ARRAYFORMULA
- **Formula:** `=ARRAYFORMULA(IF(A2:A="","",IF(ISNUMBER(Q2:Q),DATEVALUE(Q2:Q)+'Settings & Budget'!B33,"")))`
- **Purpose:** Auto-calculate trial end date
- **Dependencies:** Q2:Q (Trial Start), Settings B33 (Trial Length)
- **Impact:** 🟡 MEDIUM - Only affects trial tracking
- **Expected Output:** Dates (e.g., 2025-10-28)

#### AB2: Current Status Formula
- **Type:** ARRAYFORMULA
- **Formula:** Complex nested IF checking X, S, T, N, L columns
- **Purpose:** Auto-calculate lead status
- **Referenced By:** DASHBOARD, Members
- **Impact:** 🟡 MEDIUM - Affects status display
- **Expected Output:** "Cancelled", "Member", "Trial", "Show", "Appt Set", or "Lead"

### Critical Data Columns

#### Column S: Converted? (Checkbox)
- **Type:** Checkbox (TRUE/FALSE)
- **Purpose:** Flag converted members
- **Referenced By:** Members QUERY, DASHBOARD metrics, _Metrics
- **Impact:** 🔴 CRITICAL - Breaks member tracking
- **Breaking This:** Members tab empty, metrics wrong

#### Column X: Cancelled? (Checkbox)
- **Type:** Checkbox (TRUE/FALSE)
- **Purpose:** Flag cancelled members
- **Referenced By:** Members QUERY, DASHBOARD metrics
- **Impact:** 🔴 CRITICAL - Breaks member filtering
- **Breaking This:** Cancelled members show in Members tab

---

## 🔢 _LTV Calculations Tab

#### N:T: LTV by Source Table
- **Columns:** Source, Total Members, Active, Cancelled, Avg Lifespan, Avg MRR, Avg LTV, Retention Rate
- **Purpose:** Calculate LTV metrics per source
- **Referenced By:** DASHBOARD L20 (VLOOKUP)
- **Impact:** 🔴 CRITICAL - Breaks LTV display in DASHBOARD
- **Column 7 (T):** Avg LTV column (used in VLOOKUP)
- **Breaking This:** DASHBOARD LTV shows #N/A or $0

---

## 👥 Members Tab

#### A2: Members QUERY
- **Formula:** `=QUERY('Lead Data'!A:AH, "SELECT * WHERE S=TRUE AND X<>TRUE ORDER BY T DESC", 1)`
- **Purpose:** Filter active members from Lead Data
- **Dependencies:** Lead Data columns S (Converted) and X (Cancelled)
- **Impact:** 🟡 MEDIUM - Affects Members display only
- **Expected Output:** Filtered rows of active members
- **Breaking This:** Members tab shows #REF! or wrong data

---

## ⚠️ Impact Legend

- 🔴 **CRITICAL:** Breaks multiple features, immediate action required
- 🟡 **MEDIUM:** Breaks specific feature, should fix soon
- 🟢 **LOW:** Minor impact, cosmetic or single-feature only

---

## 🔧 Troubleshooting Quick Reference

| Symptom | Likely Cause | Check This Cell |
|---------|--------------|-----------------|
| SOURCE ANALYSIS all $0 | Marketing Budget empty | Settings E40:E100 |
| #REF! in DASHBOARD | Tab deleted or renamed | Check all tabs exist |
| Members tab empty | QUERY formula broken | Members A2 |
| Source column blank | H2 formula missing | Lead Data H2 |
| Date metrics wrong | Date range broken | Settings B30/B31 |
| LTV shows $0 | Source not in LTV table | _LTV Calculations N:T |

---

**See also:** ARCHITECTURE.md, TROUBLESHOOTING.md

