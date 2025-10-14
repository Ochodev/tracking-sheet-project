# Start Lead Data with 3 Rows Instead of 5000

## Current Problem
Lead Data tab applies validation/formatting to 5000 rows on initialization:
- Checkboxes: L2:L5000, N2:N5000, P2:P5000, S2:S5000, X2:X5000
- Dropdowns: H2:H5000, J2:J5000, U2:U5000, Z2:Z5000
- Conditional formatting: A2:AH5000 (4 rules)

**Impact:** Slow initialization, unnecessary resource usage for empty sheet

## Solution
Change all ranges from 2:5000 → 2:4 (3 data rows)

**Benefits:**
- Much faster initialization
- Lower resource usage
- Still functional (GHL can write to any row)
- Users can copy row 2 down if manually adding data

## Changes Needed

### In createLeadDataTabV2 (lines 764-829):

**Checkboxes (5 ranges):**
- Line 764: `L2:L5000` → `L2:L4`
- Line 765: `N2:N5000` → `N2:N4`
- Line 766: `P2:P5000` → `P2:P4`
- Line 767: `S2:S5000` → `S2:S4`
- Line 768: `X2:X5000` → `X2:X4`

**Dropdowns (4 ranges):**
- Line 781: `H2:H5000` → `H2:H4`
- Line 787: `J2:J5000` → `J2:J4`
- Line 793: `U2:U5000` → `U2:U4`
- Line 799: `Z2:Z5000` → `Z2:Z4`

**Conditional Formatting (4 rules):**
- Line 808: `A2:AH5000` → `A2:AH4`
- Line 814: `A2:AH5000` → `A2:AH4`
- Line 820: `A2:AH5000` → `A2:AH4`
- Line 826: `A2:AH5000` → `A2:AH4`

## Total Changes
13 ranges to update in createLeadDataTabV2

## Note
ARRAYFORMULAS in columns H, R, AB-AG already handle dynamic expansion, so they don't need changes.

