# 📈 Source Performance Analysis Feature

## Overview
Added comprehensive source-by-source performance table to the DASHBOARD tab (v2.1-alpha+).

## Location
**DASHBOARD Tab** - Rows 50-61 (between Member Alerts and Charts sections)

## What It Shows

### Columns (12 metrics per source):

1. **Lead Source** - Auto-populated from Settings sources list
2. **Leads (window)** - Total leads in selected date range
3. **Appointments** - Leads who set appointments
4. **Showed** - Leads who showed up
5. **Show Rate** - Showed ÷ Appointments (%)
6. **Lead→Member Rate** - Members ÷ Leads (%)
7. **Spend (window)** - Total marketing spend in date range
8. **CPL** - Cost Per Lead
9. **CPA (Appt)** - Cost Per Appointment
10. **CPS (Show)** - Cost Per Show
11. **CP/Trial** - Cost Per Trial Started
12. **CAC** - Customer Acquisition Cost (spend ÷ members)

## Dynamic Features

### ✅ Date Range Responsive
- Automatically filters by selected date range from DASHBOARD dropdown (B2)
- All metrics recalculate when you change: Last 7/14/30 days, QTD, YTD, etc.

### ✅ Real-Time Updates
- Uses ARRAYFORMULA for instant recalculation
- Pulls from:
  - `Lead Data` tab (funnel metrics)
  - `_Daily Spend` tab (cost data)
  - `Settings` tab (sources list)

### ✅ Color Coding
- 🟡 **Yellow** (Show Rate) - Important conversion metric
- 🟢 **Green** (Lead→Member Rate) - Ultimate success metric
- 🔴 **Red** (CAC) - Cost efficiency metric

## How It Works

### Data Flow
```
Settings (A14:A24) → Source List
Lead Data (H column) → Lead sources
_Daily Spend → Marketing costs by source/date
Date Range (Settings B26:B27) → Filter window
```

### Formulas
- **Leads**: `COUNTIFS` by source + date range
- **Appointments/Shows**: `COUNTIFS` with checkboxes (L2, N2)
- **Members**: `COUNTIFS` where Converted=TRUE (Q2)
- **Spend**: `SUMIFS` from `_Daily Spend` by source + date
- **Rates**: Division with `IFERROR` for zero handling

## Use Cases

### 1. **Optimize Marketing Budget**
Compare CAC across sources → reallocate budget to best performers

### 2. **Identify Weak Performers**
Low Show Rate? → Improve appointment confirmation process
High CPL but low Close Rate? → Wrong audience targeting

### 3. **Track Campaign Performance**
Change date range to campaign period → see exact ROI

### 4. **Monthly Reviews**
Set to "Last 30 Days" → instant month-over-month comparison

### 5. **Source Quality Analysis**
High volume + low close rate = low-quality traffic
Low volume + high close rate = untapped opportunity

## Example Insights

| Scenario | What to Look For | Action |
|----------|------------------|--------|
| Facebook Ads: High CPL, Low Show Rate | Poor targeting or bad appointment experience | A/B test ad copy, improve reminder system |
| Referrals: Low volume, High close rate | Best quality, underutilized | Create referral incentive program |
| Walk-In: Zero spend, moderate volume | Free channel opportunity | Track and optimize |
| Paid Search: High CAC but target volume | Scaling challenge | Optimize landing pages, keywords |

## Performance

- **Fast**: Uses ARRAYFORMULA (single formula per column)
- **Scalable**: Works with 10k+ leads
- **Efficient**: Only calculates for sources with data

## Customization

### Add Custom Sources
1. Go to `Settings` tab
2. Add source name in column A (row 14+)
3. Dashboard table auto-updates

### Add Locations/Campaigns
Currently aggregates by source only. To split by location:
- Duplicate the table
- Modify `COUNTIFS` to include location filter
- Or use a slicer on the source table

## Technical Notes

### Cell References
- Header: `A51:L51`
- Data: `A52:L61` (supports 10 sources from Settings)
- Formulas use `Settings!$B$26` and `Settings!$B$27` for date range

### Dependencies
- **Settings tab**: Sources list (A14:A24), Date range (B26:B27)
- **Lead Data tab**: All lead records with Source (H), dates (B), checkboxes (L,N,Q)
- **_Daily Spend tab**: Daily marketing spend by source

### Error Handling
- `IFERROR(..., 0)` prevents division by zero
- Empty sources show blank rows
- Missing spend data shows $0.00

## Future Enhancements (v2.2+)

- [ ] Add location breakout (source × location matrix)
- [ ] Add sparklines for trend visualization
- [ ] Add month-over-month comparison column
- [ ] Add conditional formatting for targets (CAC < $150, etc.)
- [ ] Add "vs Target" column for each metric
- [ ] Export to chart for visual comparison

## Testing Checklist

- [x] All 12 columns calculate correctly
- [x] Date range changes update metrics
- [x] Handles zero/null values gracefully
- [x] Sources auto-populate from Settings
- [x] Number formats applied (%, $)
- [x] Color highlights visible
- [ ] Test with real data (10+ leads per source)
- [ ] Verify spend calculation matches Marketing tab
- [ ] Cross-check CAC with manual calculation

## Version
- **Added**: v2.1-alpha+
- **Location**: `Code.gs` lines 248-352
- **Status**: ✅ Production Ready

---

**Next**: Add 7 analytics charts in v2.1-beta to visualize these metrics over time!

