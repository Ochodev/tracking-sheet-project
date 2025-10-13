/**
 * REFACTORED: Help Tab
 * Old version: ~370 lines
 * New version: ~60 lines (84% reduction!) by extracting content to data structure
 * 
 * Replaces: createHelpTab() in Code.gs (lines 1998-2366)
 * 
 * Note: Content extracted to HELP_CONTENT constant for easier editing
 */

// Help content as structured data (easier to maintain)
var HELP_CONTENT = [
  ['🏋️ GYM OPS TRACKER v2.1 - HELP'],
  [''],
  ['📊 DASHBOARD - Your morning overview'],
  ['  • Check KPIs & on-pace status'],
  ['  • Use date range dropdown to change time period'],
  ['  • Review action items daily'],
  ['  • Monitor LTV:CAC ratios by source'],
  [''],
  ['📝 LEAD DATA - GHL populates automatically'],
  ['  • GoHighLevel workflow adds new rows with Lead ID'],
  ['  • Source auto-fills from UTM tracking'],
  ['  • Manual: Check boxes (Appt Set, Show, Converted, Cancelled)'],
  ['  • Manual: Fill MRR, Upfront Fee, Membership Type'],
  ['  • Column Groups: Collapse/expand sections for easier viewing'],
  [''],
  ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
  [''],
  ['🔗 GOHIGHLEVEL (GHL) INTEGRATION - Complete Setup Guide'],
  ['For complete GHL setup instructions, see GHL-WORKFLOW-GUIDE.md documentation.'],
  [''],
  ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
  [''],
  ['⚠️ NEVER DELETE ROWS - Use "Cancelled?" Checkbox Instead'],
  [''],
  ['❌ DO NOT DELETE ROWS in Lead Data!'],
  [''],
  ['Why?'],
  ['  • Permanently loses member data'],
  ['  • Breaks MRR tracking'],
  ['  • Corrupts LTV calculations'],
  ['  • Prevents churn analysis'],
  [''],
  ['✅ CORRECT WAY to remove a member:'],
  ['  1. Check "Cancelled?" checkbox (column X)'],
  ['  2. Enter "Cancel Date" (column Y)'],
  ['  3. Select "Cancel Reason" (column Z)'],
  [''],
  ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
  [''],
  ['🎯 DAILY WORKFLOW'],
  ['  1. GHL creates leads automatically'],
  ['  2. Check DASHBOARD action items'],
  ['  3. Update checkboxes as events happen'],
  ['  4. Review on-pace status'],
  ['  5. Monitor LTV:CAC health check'],
  [''],
  ['⚡ SPEED TIPS - Keyboard Shortcuts'],
  [''],
  ['  • TAB = Auto-complete dropdowns (40% faster!)'],
  ['  • SPACE = Toggle checkbox (dates auto-fill!)'],
  ['  • F2 = Edit cell without double-clicking'],
  ['  • Copy row 2 down to add leads (formulas copy too!)'],
  [''],
  ['💡 TIPS'],
  ['  • Help tab auto-hides (access via Gym Ops → View Help)'],
  ['  • Lead Data has column groups (click minus to collapse)'],
  ['  • Add sample data for testing (Gym Ops menu)']
];

function createHelpTabV2(ss, force) {
  const builder = new TabBuilder(ss, 'Help');
  
  // Check if should skip rewrite
  const existing = ss.getSheetByName('Help');
  if (!force && existing && existing.getLastRow() > 0) {
    Logger.log('ℹ️ Help tab already populated; skipping rewrite');
    return existing;
  }
  
  builder
    .create()
    .addTable(1, 'A', HELP_CONTENT, {})
    .setColumnWidths({ '1': 800 })
    .hide()
    .build();
  
  const sheet = builder.getSheet();
  
  // Style key rows
  sheet.getRange('A1').setFontSize(14).setFontWeight('bold');
  [3, 9, 18, 22, 28, 46].forEach(row => {
    sheet.getRange(row, 1).setFontWeight('bold');
  });
  
  Logger.log('✅ Help tab created (refactored v2) and auto-hidden');
  
  return builder.getSheet();
}

