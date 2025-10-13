# Efficiency Review Findings

## Code.gs
- **onEdit trigger**: cache row data once per edit to avoid repeated `getRange().getValue()` calls.
- **Tab builder duplication**: large blocks setting notes/formatting; introduce helper utilities or configuration-driven builders.
- **createDashboardTab & peers**: functions exceed 400 lines; refactor into logical subroutines to reduce initialization time and ease maintenance.
- **refreshDashboards**: multiple `SpreadsheetApp.flush()` calls—verify if both are necessary to reduce execution time.
- **Sample data generator**: cache static lists (membership types, cancel reasons) outside loops to avoid repeated lookups.

## Supporting Scripts
- **leadDataService.gs**: convert `checkForDuplicate` and `validateDateChronology` logic into reusable, parameterized helpers to cut repetition; consider caching lowercase column values on each edit.
- **healthCheck.gs**: expand checks (e.g., named ranges, trigger existence) but current impact minimal.
- **constants.gs**: switch to `const` (if supported) and centralize column range constants for reuse across scripts.

## Sheet Formulas & Automation
- **createDailySpendTab**: LET/SCAN formula efficient; add `IFERROR` wrapper for clearer failure handling when budgets are missing.
- **_LTV Calculations**: new `MAKEARRAY` logic effective; ensure `Lead Data` conversions always populate `Member Start`, `MRR`, `Cancel Date` to prevent blank lifespans.
- **_Chart Data**: COUNTIFS across entire columns may slow with very large datasets; consider opinionated caching if row volume grows beyond ~10k.

## Quick Wins
1. Introduce helper utilities for repeated formatting/styling operations across tab builders.
2. Memoize `onEdit` row data and extract shared toast/alert logic.
3. Break monolithic tab creation functions into modular sections to reduce execution time and support testing.
4. Centralize static arrays (sources, packages, reasons) in constants to prevent duplication.
5. Monitor formula-heavy tabs; if performance degrades, move aggregation into periodic Apps Script jobs.

## Dropdown Audit Note
- Run `Gym Ops → Run Health Check` after updating any lists in `Settings & Budget`.
- The Health Check now flags empty rows, duplicates, or section dividers inside the dropdown ranges for Sources, Staff, Location, Membership Types, Cancel Reasons, and Status Values.
- Resolve any reported issues by clearing blank lines or moving decorative dividers below the list blocks.
