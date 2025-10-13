/**
 * MEMBER TYPE TOGGLE FEATURE
 * Adds dynamic filtering to Members tab by membership type
 * 
 * Features:
 * - Click buttons to filter by membership type
 * - "All Members" shows everything
 * - Preserves original filtered formula
 * - Instant updates (no page reload)
 * - Visual feedback (active button highlighted)
 * 
 * Created: October 9, 2025
 * Part of V2.2 Feature Enhancements
 */

/**
 * Enhanced Members tab with type toggle feature
 * Replaces createMembersTabV2 with filtering capability
 */
function createMembersTabV2WithToggle(ss) {
  const builder = new TabBuilder(ss, 'Members');
  
  builder.create();
  
  const sheet = builder.getSheet();
  
  // ============================================================
  // SECTION 1: Header & Filter Buttons
  // ============================================================
  
  builder
    .addRow(1, 'A', '👥 ACTIVE MEMBERS', { bold: true, fontSize: 14 })
    .addRow(1, 'C', 'Filter by Type:', { bold: true, fontSize: 11 });
  
  // Add filter buttons in row 1
  const types = ['All Members', 'PT', 'Small Group', 'General', 'Class Pack'];
  const colors = ['#4285f4', '#ea4335', '#fbbc04', '#34a853', '#9333ea'];
  
  types.forEach((type, idx) => {
    const col = 4 + idx; // D, E, F, G, H
    sheet.getRange(1, col)
      .setValue(type)
      .setBackground(colors[idx])
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setNote('Click to filter members by ' + type);
  });
  
  // Add instruction text
  builder.addRow(1, 'I', '← Click buttons to filter', { italic: true, color: '#666666', fontSize: 9 });
  
  // ============================================================
  // SECTION 2: Members Data (Filtered)
  // ============================================================
  
  // Store current filter in hidden cell
  sheet.getRange('Z1').setValue('All Members').setNote('Current filter (hidden)');
  
  // Dynamic formula that respects filter
  const membersFormula = `LET(
    filterType, Z1,
    allData, {'Lead Data'!A1:AH1; 
      LET(
        filtered, IFERROR(FILTER('Lead Data'!A2:AH,'Lead Data'!S2:S=TRUE,'Lead Data'!X2:X<>TRUE), {}),
        IF(ROWS(filtered)=0, FILTER('Lead Data'!A2:AH, ROW('Lead Data'!A2:A)=0), 
           IFERROR(QUERY(filtered,"WHERE Col1 IS NOT NULL",0), filtered))
      )
    },
    IF(filterType="All Members", allData,
       FILTER(allData, (ROW(allData)=1) + (COLUMN(allData)<>21) + (INDEX(allData, 0, 21)=filterType)))
  )`;
  
  builder.addFormula(2, 'A', membersFormula);
  
  // ============================================================
  // SECTION 3: Summary Stats
  // ============================================================
  
  builder
    .addRow(3, 'J', 'SUMMARY', { bold: true, background: '#f3f3f3' })
    .addRow(4, 'J', 'Total Members:', { bold: true })
    .addFormula(4, 'K', 'COUNTA(A3:A)-1', { format: '0', bold: true })
    .addRow(5, 'J', 'Active MRR:', { bold: true })
    .addFormula(5, 'K', 'SUM(V3:V)', { format: '$#,##0', bold: true })
    .addRow(6, 'J', 'Avg Tenure (days):', { bold: true })
    .addFormula(6, 'K', 'IFERROR(AVERAGE(AC3:AC),0)', { format: '0', bold: true });
  
  sheet.getRange('J3:K6').setBackground('#f9f9f9');
  
  // ============================================================
  // FORMATTING
  // ============================================================
  
  sheet.setColumnWidth(1, 120);  // Lead ID
  sheet.setColumnWidths(2, 33, 100);
  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(4);
  
  // Hide unnecessary columns for cleaner view
  sheet.hideColumns(7, 1);  // DOB
  sheet.hideColumns(9, 1);  // Campaign
  sheet.hideColumns(11, 1); // Location
  sheet.hideColumns(27, 1); // Notes
  
  Logger.log('✅ Members tab created with Type Toggle feature');
  
  return sheet;
}

/**
 * Handle click events on filter buttons
 * Called by onEdit trigger
 */
function handleMemberTypeToggle(e) {
  const sheet = e.source.getActiveSheet();
  
  // Only process Members tab, row 1, columns D-H
  if (sheet.getName() !== 'Members') return;
  if (e.range.getRow() !== 1) return;
  if (e.range.getColumn() < 4 || e.range.getColumn() > 8) return;
  
  const clickedValue = e.range.getValue();
  
  // Update hidden filter cell
  sheet.getRange('Z1').setValue(clickedValue);
  
  // Visual feedback: Highlight active button
  const buttons = sheet.getRange('D1:H1');
  buttons.setFontWeight('normal').setBorder(false, false, false, false, false, false);
  
  e.range.setFontWeight('bold').setBorder(true, true, true, true, true, true, 'black', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  
  // Show toast
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Filtering members by: ' + clickedValue,
    '👥 Filter Applied',
    3
  );
  
  Logger.log('Member filter applied: ' + clickedValue);
}

/**
 * Add to existing onEdit function in Code.gs
 * 
 * Add this inside onEdit(e):
 *   handleMemberTypeToggle(e);
 */

/**
 * Test the member type toggle feature
 */
function testMemberTypeToggle() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    '🧪 Test Member Type Toggle',
    'This will recreate the Members tab with filtering.\n\n' +
    '1. Click any membership type button (row 1)\n' +
    '2. Watch the list filter instantly\n' +
    '3. Try "All Members" to see everything\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  try {
    createMembersTabV2WithToggle(ss);
    
    ui.alert(
      '✅ Member Type Toggle Created!',
      'Try it:\n\n' +
      '1. Go to Members tab\n' +
      '2. Click any type button in row 1\n' +
      '3. List filters instantly!\n\n' +
      'Add sample data first if sheet is empty.',
      ui.ButtonSet.OK
    );
    
    ss.setActiveSheet(ss.getSheetByName('Members'));
    
  } catch (error) {
    ui.alert('❌ Error', error.toString(), ui.ButtonSet.OK);
    Logger.log('testMemberTypeToggle error: ' + error);
  }
}

/**
 * Alternative: Dropdown-based filter (simpler but less visual)
 */
function createMembersTabV2WithDropdown(ss) {
  const builder = new TabBuilder(ss, 'Members');
  
  builder.create();
  
  const sheet = builder.getSheet();
  
  builder
    .addRow(1, 'A', '👥 ACTIVE MEMBERS', { bold: true, fontSize: 14 })
    .addRow(1, 'C', 'Filter:', { bold: true })
    .addRow(1, 'D', 'All Members', {});
  
  // Dropdown validation
  const filterValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['All Members', 'PT', 'Small Group', 'General', 'Class Pack'], true)
    .build();
  sheet.getRange('D1').setDataValidation(filterValidation);
  
  // Dynamic formula
  const membersFormula = `LET(
    filterType, D1,
    allData, {'Lead Data'!A1:AH1; 
      LET(
        filtered, IFERROR(FILTER('Lead Data'!A2:AH,'Lead Data'!S2:S=TRUE,'Lead Data'!X2:X<>TRUE), {}),
        IF(ROWS(filtered)=0, FILTER('Lead Data'!A2:AH, ROW('Lead Data'!A2:A)=0), 
           IFERROR(QUERY(filtered,"WHERE Col1 IS NOT NULL",0), filtered))
      )
    },
    IF(filterType="All Members", allData,
       FILTER(allData, (ROW(allData)=1) + (COLUMN(allData)<>21) + (INDEX(allData, 0, 21)=filterType)))
  )`;
  
  builder
    .addFormula(2, 'A', membersFormula)
    .setFrozen({ rows: 2, columns: 4 })
    .build();
  
  Logger.log('✅ Members tab created with Dropdown filter');
  
  return sheet;
}

