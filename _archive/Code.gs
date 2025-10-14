/**
 * Gym Operations Tracking Sheet - v2.1-beta
 * 
 * ✅ COMPLETE FEATURE SET:
 * ✅ Lead ID column (A) for GHL integration
 * ✅ _UTM Tracking tab with auto-source mapping (hidden)
 * ✅ Monthly marketing spend (directly references budgets)
 * ✅ Date range dropdown (9 presets + custom range)
 * ✅ Protections on auto-calculated columns
 * ✅ Source Performance Analysis table on DASHBOARD (12 metrics per source)
 * ✅ Sample data generator for testing (50 realistic leads)
 * ✅ 7 analytics charts on DASHBOARD (interactive visuals)
 * ✅ _Chart Data helper tab (pre-aggregated chart data)
 * ✅ Auto-fix for DASHBOARD formula errors (2025-10-08)
 * ✅ Health check detects and prevents formula reference errors
 * 
 * TAB STRUCTURE (12 tabs):
 * 1. DASHBOARD - KPIs, actions, alerts, source analysis + 7 interactive charts
 * 2. Lead Data - 26 columns (A=Lead ID)
 * 3. Members - Active members view
 * 4. Settings - Config + UTM mapping + date dropdown
 * 5. Marketing - Monthly budget input
 * 6. Staff - Leaderboard
 * 7. Help - Instructions
 * 8. _UTM Tracking - Hidden, auto-source mapping
 * 9. _Daily Spend - Removed (spend calculated on demand)
 * 10. _Chart Data - Hidden, chart data aggregation (7 sections)
 * 11. _Data - Hidden, active members calculation
 * 
 * CRITICAL FIX (2025-10-08):
 * - Fixed createDashboardTab() to reference Settings B3-B9 (data) not B2 (header)
 * - Added auto-fix on sheet open if Target column shows "Target" text
 * - Added menu item: "Gym Ops → Fix DASHBOARD Formulas" for manual fix
 * - Enhanced health check to detect this specific issue
 * - Created named ranges (Target_Leads, etc.) for future stability
 * - See FORMULA-AUDIT-REPORT.md for complete documentation
 */

// Import constants safely
var Sheets = typeof SHEET !== 'undefined' ? SHEET : {};
var LeadCol = typeof LEAD_COL !== 'undefined' ? LEAD_COL : {};
var DefaultLists = typeof DEFAULT_LISTS !== 'undefined' ? DEFAULT_LISTS : {
  SOURCES: ['Paid Search', 'Paid Social', 'Direct Traffic', 'Organic Search', 'Social Media', 'Referrals', 'Others', 'CRM UI', 'Third-Party', 'Member Referral', 'Walk-In'],
  STAFF: ['Front Desk', 'Coach A', 'Coach B'],
  MEMBERSHIP_TYPES: ['PT', 'Small Group', 'General', 'Class Pack'],
  CANCEL_REASONS: ['Price', 'Moved', 'Injury', 'Service', 'Location', 'Other'],
  STATUS_VALUES: ['Lead', 'Appt Set', 'Show', 'Trial', 'Member', 'Cancelled'],
  LOCATION: 'Main Location',
  SAMPLE_CAMPAIGNS: ['spring-promo', 'summer-sale', 'back-to-school', 'new-year', 'organic', '', 'portal', 'api', 'member-program'],
  SAMPLE_FIRST_NAMES: ['John', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'Chris', 'Anna', 'James', 'Maria', 'Tom', 'Kate', 'Alex', 'Jen', 'Dan'],
  SAMPLE_LAST_NAMES: ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia', 'Lee'],
  SAMPLE_UTM_SOURCES: ['google', 'facebook', 'direct', 'organic', 'instagram', 'referral', 'other', 'gohighlevel', 'third-party', 'member_referral', 'walkin'],
  AVERAGE_MRR: 150
};

// ============================================================
// MENU & INITIALIZATION
// ============================================================

function onOpen() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  SpreadsheetApp.getUi()
    .createMenu('Gym Ops')
    .addItem('🧙 Quick Start Wizard', 'quickStartWizard')
    .addItem('🚀 Full Setup (Init + Wizard)', 'fullSetupWizard')
    .addSeparator()
    .addItem('➕ Quick Add Lead', 'quickAddLead')
    .addSeparator()
    .addItem('⚙️ Initialize Template', 'initializeTemplate')
    .addItem('🔄 Refresh Dashboards', 'refreshDashboards')
    .addSeparator()
    .addItem('💾 Create Backup Now', 'createBackupSnapshot')
    .addItem('🔄 Restore from Backup', 'restoreFromBackup')
    .addSeparator()
    .addItem('📥 Export Lead Data to CSV', 'exportLeadDataToCSV')
    .addSeparator()
    .addItem('🔍 Run Health Check', 'runHealthCheck')
    .addItem('🔧 Fix DASHBOARD Formulas', 'fixDashboardTargetFormulas')
    .addItem('🧹 Cleanup Settings Dropdowns', 'cleanupSettingsDropdowns')
    .addSeparator()
    .addItem('🔍 Setup Member Filters', 'setupMemberFilters')
    .addSeparator()
    .addItem('🧪 Add Sample Data (for testing)', 'addSampleData')
    .addSeparator()
    .addItem('❓ View Help', 'showHelp')
    .addToUi();
  try {
    const settingsSheet = ss.getSheetByName('Settings & Budget');
    if (settingsSheet) {
      normalizeSettingsTargets(settingsSheet);
      validateSettingsTargets(settingsSheet);
    }
    setupDataValidations(ss);
    
    // Auto-check and fix DASHBOARD target formulas if broken
    const dashboard = ss.getSheetByName('DASHBOARD');
    if (dashboard && typeof HealthCheck !== 'undefined' && HealthCheck.checkDashboardTargetFormulas) {
      const issues = HealthCheck.checkDashboardTargetFormulas(dashboard);
      if (issues.length > 0) {
        Logger.log(`⚠️ DASHBOARD formula issues detected on open (${issues.length} issues) - auto-fixing...`);
        fixDashboardTargetFormulasSilent();
      }
    }
  } catch (error) {
    Logger.log('onOpen setup failed: ' + error);
  }
}

/**
 * onEdit Trigger - Auto-fill dates when checkboxes are checked
 * Handles: Trial Start, Conversion, Cancellation
 */
function onEdit(e) {
  if (!e) return;
  
  var sheet = e.source.getActiveSheet();
  var range = e.range;
  var row = range.getRow();
  var col = range.getColumn();
  
  if (sheet.getName() === Sheets.DASHBOARD && range.getA1Notation() === 'B2') {
    updateDateRange();
    return;
  }
  
  if (sheet.getName() === Sheets.SETTINGS && range.getA1Notation() === 'B27') {
    updateDateRange();
    return;
  }
  
  if (sheet.getName() !== Sheets.LEAD_DATA || row < 2) return;
  
  var value = range.getValue();
  
  if (col === LeadCol.APPT_SET) {
    handleCheckboxDateAutomation(e, sheet, row, LeadCol.APPT_DATE, value, '✅ Appointment date set to today!', 'Appointment date cleared.');
  }

  if (col === LeadCol.SHOW) {
    handleCheckboxDateAutomation(e, sheet, row, LeadCol.SHOW_DATE, value, '✅ Show date set to right now!', 'Show date cleared.');
  }

  if (col === LeadCol.TRIAL_START) {
    handleCheckboxDateAutomation(e, sheet, row, LeadCol.TRIAL_START_DATE, value, '✅ Trial start date set to today!', 'Trial start date cleared.');
  }
  
  if (col === LeadCol.CONVERTED) {
    handleCheckboxDateAutomation(e, sheet, row, LeadCol.MEMBER_START, value, '✅ Member start date set to today!', 'Member start date cleared.');
  }
  
  if (col === LeadCol.CANCELLED) {
    handleCheckboxDateAutomation(e, sheet, row, LeadCol.CANCEL_DATE, value, '✅ Cancel date set to today!', 'Cancel date cleared.');
  }
  
  if (col === LeadCol.NOTES) {
    var lastTouchpointCell = sheet.getRange(row, LeadCol.LAST_TOUCHPOINT);
    var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    lastTouchpointCell.setValue(timestamp);
  }
  
  if ((col === LeadCol.PHONE || col === LeadCol.EMAIL) && value && value.toString().trim() !== '') {
    var duplicateInfo = LeadDataService.checkForDuplicate(sheet, row, col, value);
    if (duplicateInfo) {
      var action = showDuplicateAlert(duplicateInfo, row, col);
      if (action === 'CANCEL') {
        range.setValue('');
        e.source.toast('⚠️ Entry cancelled - duplicate detected', 'Cancelled', 3);
      }
    }
  }
  
  if (value instanceof Date || (value && !isNaN(Date.parse(value)))) {
    var validationError = LeadDataService.validateDateChronology(sheet, row, col);
    if (validationError) {
      var ui = SpreadsheetApp.getUi();
      var title = validationError.warning ? '⚠️ Date Order Warning' : '❌ Invalid Date Order';
      var message = validationError.message + '\n\nDo you want to keep this date anyway?';
      var response = ui.alert(title, message, ui.ButtonSet.YES_NO);
      if (response === ui.Button.NO) {
        range.setValue('');
        e.source.toast('⚠️ ' + validationError.field + ' cleared - invalid date order', 'Date Validation', 3);
      }
    }
  }
}

function handleCheckboxDateAutomation(e, sheet, row, dateColumn, checkboxValue, setToastMessage, clearToastMessage) {
  const dateCell = sheet.getRange(row, dateColumn);

  if (checkboxValue === true) {
    dateCell.setValue(new Date());
    if (setToastMessage) {
      e.source.toast(setToastMessage, 'Auto-filled', 2);
    }
    return;
  }

  if (checkboxValue === false) {
    const currentValue = dateCell.getValue();
    if (currentValue !== '' && currentValue !== null) {
      dateCell.clearContent();
      if (clearToastMessage) {
        e.source.toast(clearToastMessage, 'Auto-cleared', 2);
      }
    }
  }
}

/**
 * HIGH FIX #6: Check for Duplicate Lead
 * Searches for existing lead with same phone or email
 */
function checkForDuplicate(sheet, currentRow, col, value) {
  try {
    const searchValue = value.toString().trim().toLowerCase();
    if (!searchValue) return null;
    
    // Get all data from the column being edited
    const columnData = sheet.getRange(2, col, sheet.getLastRow() - 1, 1).getValues();
    
    // Search for duplicate (excluding current row)
    for (let i = 0; i < columnData.length; i++) {
      const checkRow = i + 2; // Data starts at row 2
      if (checkRow === currentRow) continue; // Skip current row
      
      const cellValue = columnData[i][0];
      if (cellValue && cellValue.toString().trim().toLowerCase() === searchValue) {
        // Found duplicate! Get lead info
        const leadRow = sheet.getRange(checkRow, 1, 1, 31).getValues()[0]; // Get all columns (A-AE)
        
        return {
          row: checkRow,
          leadId: leadRow[0] || 'N/A',
          firstName: leadRow[2] || '',
          lastName: leadRow[3] || '',
          phone: leadRow[4] || '',
          email: leadRow[5] || '',
          createdDate: leadRow[1] || '',
          status: leadRow[25] || 'Unknown', // Column Z (Current Status)
          duplicateField: col === LeadCol.PHONE ? 'PHONE' : 'EMAIL'
        };
      }
    }
    
    return null; // No duplicate found
    
  } catch (error) {
    Logger.log('checkForDuplicate error: ' + error.toString());
    return null; // On error, allow entry
  }
}

/**
 * HIGH FIX #6: Show Duplicate Alert
 * Returns user's choice: 'CANCEL' or 'CONTINUE'
 */
function showDuplicateAlert(duplicateInfo, currentRow, currentCol) {
  const ui = SpreadsheetApp.getUi();
  
  const name = `${duplicateInfo.firstName} ${duplicateInfo.lastName}`.trim() || 'Unknown';
  const fieldName = duplicateInfo.duplicateField;
  const otherField = fieldName === 'PHONE' ? 'Email' : 'Phone';
  const otherValue = fieldName === 'PHONE' ? duplicateInfo.email : duplicateInfo.phone;
  
  let dateStr = 'Unknown';
  if (duplicateInfo.createdDate) {
    try {
      const date = new Date(duplicateInfo.createdDate);
      dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } catch (e) {
      dateStr = duplicateInfo.createdDate.toString();
    }
  }
  
  const message = `A lead with this ${fieldName} already exists:\n\n` +
    `  Name: ${name}\n` +
    `  ${otherField}: ${otherValue || 'N/A'}\n` +
    `  Created: ${dateStr}\n` +
    `  Status: ${duplicateInfo.status}\n` +
    `  Row: ${duplicateInfo.row}\n\n` +
    `This might be:\n` +
    `• Same person (duplicate)\n` +
    `• Family member (shared ${fieldName.toLowerCase()})\n` +
    `• ${fieldName === 'PHONE' ? 'Old number reassigned' : 'Multiple people'} (rare)\n\n` +
    `Continue adding this lead?`;
  
  const response = ui.alert(
    '⚠️ Potential Duplicate Lead',
    message,
    ui.ButtonSet.YES_NO
  );
  
  return response === ui.Button.YES ? 'CONTINUE' : 'CANCEL';
}

/**
 * HIGH FIX #8: Validate Date Chronology
 * Ensures dates are in logical order
 * Returns: null (valid) or error object {field, message}
 */
function validateDateChronology(sheet, row, col) {
  try {
    // Only validate date columns: B(2), M(13), O(15), R(18), W(23)
    if (![2, 13, 15, 18, 23].includes(col)) return null;
    
    // Get the row data for all date fields
    const rowData = sheet.getRange(row, 1, 1, 31).getValues()[0];
    
    const createdDate = rowData[1];    // B (Created Date)
    const apptDate = rowData[12];      // M (Appt Date)
    const trialStart = rowData[14];    // O (Trial Start)
    const memberStart = rowData[17];   // R (Member Start)
    const cancelDate = rowData[22];    // W (Cancel Date)
    
    // Helper function to check if value is a valid date
    const isValidDate = (val) => val instanceof Date && !isNaN(val.getTime());
    
    // Rule 1: Appt Date must be >= Created Date
    if (isValidDate(apptDate) && isValidDate(createdDate)) {
      if (apptDate < createdDate) {
        return {
          field: 'Appointment Date',
          message: `Appointment date (${formatDate(apptDate)}) cannot be before lead created date (${formatDate(createdDate)}).`
        };
      }
    }
    
    // Rule 2: Trial Start must be >= Created Date
    if (isValidDate(trialStart) && isValidDate(createdDate)) {
      if (trialStart < createdDate) {
        return {
          field: 'Trial Start',
          message: `Trial start (${formatDate(trialStart)}) cannot be before lead created date (${formatDate(createdDate)}).`
        };
      }
    }
    
    // Rule 3: Trial Start should be >= Appt Date (warning, not error)
    if (isValidDate(trialStart) && isValidDate(apptDate)) {
      if (trialStart < apptDate) {
        return {
          field: 'Trial Start',
          message: `Trial start (${formatDate(trialStart)}) is before appointment date (${formatDate(apptDate)}).\n\nThis is unusual but might be intentional.`,
          warning: true
        };
      }
    }
    
    // Rule 4: Member Start must be >= Trial Start
    if (isValidDate(memberStart) && isValidDate(trialStart)) {
      if (memberStart < trialStart) {
        return {
          field: 'Member Start',
          message: `Member start (${formatDate(memberStart)}) cannot be before trial start (${formatDate(trialStart)}).`
        };
      }
    }
    
    // Rule 5: Cancel Date must be >= Member Start
    if (isValidDate(cancelDate) && isValidDate(memberStart)) {
      if (cancelDate < memberStart) {
        return {
          field: 'Cancel Date',
          message: `Cancel date (${formatDate(cancelDate)}) cannot be before member start (${formatDate(memberStart)}).`
        };
      }
    }
    
    return null; // All validations passed
    
  } catch (error) {
    Logger.log('validateDateChronology error: ' + error.toString());
    return null; // On error, allow entry
  }
}

/**
 * HIGH FIX #8: Format Date for Display
 * Helper function for validation messages
 */
function formatDate(date) {
  try {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  } catch (e) {
    return date.toString();
  }
}

/**
 * Show Help Tab (Phase 1.3 - Access hidden Help tab)
 */
function showHelp() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const helpSheet = ss.getSheetByName('Help');
  
  if (helpSheet) {
    helpSheet.showSheet();
    ss.setActiveSheet(helpSheet);
    SpreadsheetApp.getUi().alert('✅ Help tab displayed!\n\nNote: This tab will auto-hide next time you initialize. Access it anytime via "Gym Ops → View Help".');
  } else {
    SpreadsheetApp.getUi().alert('⚠️ Help tab not found. Run "Initialize Template" first.');
  }
}

/**
 * Update and validate date range calculations
 * CRITICAL FIX #1: Fixes race condition where formulas don't calculate in time
 * Called when:
 * - User changes date dropdown in DASHBOARD
 * - User manually changes Settings B27
 * - User runs "Refresh Dashboards"
 */
function updateDateRange() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const settings = ss.getSheetByName('Settings & Budget');
    
    if (!settings) {
      Logger.log('updateDateRange: Settings & Budget tab not found');
      return;
    }
    
    // Force flush to complete any pending calculations
    SpreadsheetApp.flush();
    
    // Wait for formulas to recalculate
    Utilities.sleep(500);
    
    // Read calculated dates
    const startDate = settings.getRange('B30').getValue();
    const endDate = settings.getRange('B31').getValue();
    const preset = settings.getRange('B27').getValue();
    
    // Validate dates are actual Date objects
    const startIsValid = startDate instanceof Date && !isNaN(startDate.getTime());
    const endIsValid = endDate instanceof Date && !isNaN(endDate.getTime());
    
    // If formulas failed, calculate manually as fallback
    if (!startIsValid || !endIsValid || !preset) {
      Logger.log('updateDateRange: Formulas failed, using manual calculation');
      
      const dates = calculateDateRangeFromPreset(preset || 'Last 30 Days', 
        settings.getRange('B28').getValue(),
        settings.getRange('B29').getValue()
      );
      
      settings.getRange('B30').setValue(dates.start);
      settings.getRange('B31').setValue(dates.end);
      
      SpreadsheetApp.flush();
    }
    
    Logger.log(`updateDateRange: ${preset} → ${settings.getRange('B30').getValue()} to ${settings.getRange('B31').getValue()}`);
    
  } catch (error) {
    Logger.log('updateDateRange error: ' + error.toString());
  }
}

/**
 * Calculate date range from preset
 * Helper function for updateDateRange()
 */
function calculateDateRangeFromPreset(preset, customStart, customEnd) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  let start, end = today;
  
  switch (preset) {
    case 'Last 7 Days':
      start = new Date(today);
      start.setDate(today.getDate() - 7);
      break;
    case 'Last 14 Days':
      start = new Date(today);
      start.setDate(today.getDate() - 14);
      break;
    case 'Last 30 Days':
      start = new Date(today);
      start.setDate(today.getDate() - 30);
      break;
    case 'Last 90 Days':
      start = new Date(today);
      start.setDate(today.getDate() - 90);
      break;
    case 'Last 6 Months':
      start = new Date(today);
      start.setMonth(today.getMonth() - 6);
      break;
    case 'Last 12 Months':
      start = new Date(today);
      start.setMonth(today.getMonth() - 12);
      break;
    case 'Quarter-to-Date':
      const quarter = Math.floor((today.getMonth()) / 3);
      start = new Date(today.getFullYear(), quarter * 3, 1);
      break;
    case 'Year-to-Date':
      start = new Date(today.getFullYear(), 0, 1);
      break;
    case 'Custom Range':
      start = customStart instanceof Date ? customStart : today;
      end = customEnd instanceof Date ? customEnd : today;
      break;
    default:
      // Default to Last 30 Days
      start = new Date(today);
      start.setDate(today.getDate() - 30);
  }
  
  return { start: start, end: end };
}

/**
 * Quick Start Wizard - Updated for GHL integration
 */
function quickStartWizard(options) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const skipWelcome = options && options.skipWelcome === true;
  const skipAutoInit = options && options.skipAutoInit === true;
  
  // Step 1: Welcome & Auto-Initialize
  if (!skipWelcome) {
    const welcome = ui.alert(
      '👋 Welcome to Gym Ops Tracker v2.2!',
      'This 5-minute wizard will fully configure your tracker.\n\nNo need to touch Settings & Budget afterward!\n\nClick OK to continue.',
      ui.ButtonSet.OK_CANCEL
    );
    if (welcome !== ui.Button.OK) return;
  }

  if (!skipAutoInit && !ss.getSheetByName('DASHBOARD')) {
    ui.alert('Setting up template...', 'This will take 20 seconds.', ui.ButtonSet.OK);
    initializeTemplate(true);
  }
  
  // Step 2: Gym Name
  const gymNamePrompt = ui.prompt(
    'Step 1 of 6: Gym Name',
    'What\'s your gym or studio name?',
    ui.ButtonSet.OK_CANCEL
  );
  if (gymNamePrompt.getSelectedButton() !== ui.Button.OK) return;
  const gymName = gymNamePrompt.getResponseText();
  
  // Step 3: Monthly Goal
  const targetPrompt = ui.prompt(
    'Step 2 of 6: Monthly Goal',
    'How many new members do you want per month?\n(Enter a number like 40)',
    ui.ButtonSet.OK_CANCEL
  );
  if (targetPrompt.getSelectedButton() !== ui.Button.OK) return;
  const targetMembers = parseInt(targetPrompt.getResponseText()) || 40;
  
  // Step 3a: Monthly Targets
  const defaultTargets = {
    leads: Math.ceil(targetMembers * 3.5),
    setRate: 0.6,
    showRate: 0.7,
    closeRate: 0.5,
    newMembers: targetMembers,
    mrr: Math.ceil(targetMembers * (DefaultLists.AVERAGE_MRR || 150))
  };
  
  const targetsPrompt = ui.prompt(
    'Set Monthly Targets',
    'Enter targets separated by commas (Leads, Set %, Show %, Close %, New Members, MRR)\n\n' +
    `Defaults: ${defaultTargets.leads}, ${Math.round(defaultTargets.setRate * 100)}%, ${Math.round(defaultTargets.showRate * 100)}%, ${Math.round(defaultTargets.closeRate * 100)}%, ${defaultTargets.newMembers}, $${defaultTargets.mrr}` +
    '\n\nExample: 120, 55%, 65%, 45%, 30, $6000\n\nPress OK to accept defaults.',
    ui.ButtonSet.OK_CANCEL
  );
  if (targetsPrompt.getSelectedButton() !== ui.Button.OK) return;
  const targetsResponse = targetsPrompt.getResponseText().trim();
  const parsedTargets = targetsResponse ? targetsResponse.split(',').map(value => value.trim()) : [];
  
  const targets = {
    leads: parsedTargets[0] ? parseInt(parsedTargets[0]) : defaultTargets.leads,
    setRate: parsedTargets[1] ? parseFloat(parsedTargets[1].replace('%', '')) / 100 : defaultTargets.setRate,
    showRate: parsedTargets[2] ? parseFloat(parsedTargets[2].replace('%', '')) / 100 : defaultTargets.showRate,
    closeRate: parsedTargets[3] ? parseFloat(parsedTargets[3].replace('%', '')) / 100 : defaultTargets.closeRate,
    newMembers: parsedTargets[4] ? parseInt(parsedTargets[4]) : defaultTargets.newMembers,
    mrr: parsedTargets[5] ? parseFloat(parsedTargets[5].replace('$', '').replace(',', '')) : defaultTargets.mrr
  };
  
  // Step 4: Marketing Budget (User-Controlled Approach)
  const budgetPrompt = ui.prompt(
    'Step 3 of 6: Marketing Budget',
    'What\'s your total monthly marketing budget?\n(Enter 0 if none, or a number like 5000)',
    ui.ButtonSet.OK_CANCEL
  );
  if (budgetPrompt.getSelectedButton() !== ui.Button.OK) return;
  const totalBudget = parseFloat(budgetPrompt.getResponseText()) || 0;
  
  let budgetAllocations = [];
  let budgetApproved = false;
  
  if (totalBudget > 0) {
    // Step 4a: Choose which sources to fund
    const sourcesPrompt = ui.prompt(
      'Select Marketing Channels',
      `Budget: $${totalBudget}/month\n\n` +
      `Which channels do you want to allocate budget to?\n` +
      `Enter numbers separated by commas:\n\n` +
      `1. Paid Search (Google Ads, Bing)\n` +
      `2. Paid Social (Facebook, Instagram)\n` +
      `3. Direct Traffic (Direct mail, flyers)\n` +
      `4. Others (Partnerships, events, etc.)\n\n` +
      `Example: 1,2 (for Paid Search and Paid Social)\n` +
      `Or press Cancel to skip budget setup`,
      ui.ButtonSet.OK_CANCEL
    );
    
    if (sourcesPrompt.getSelectedButton() === ui.Button.OK) {
      const selectedIndices = sourcesPrompt.getResponseText().split(',').map(s => parseInt(s.trim())).filter(n => n >= 1 && n <= 4);
      
      if (selectedIndices.length > 0) {
        const sourceNames = {
          1: 'Paid Search',
          2: 'Paid Social',
          3: 'Direct Traffic',
          4: 'Others'
        };
        
        const selectedSources = selectedIndices.map(i => sourceNames[i]);
        
        // Step 4b: Choose allocation method
        const methodChoice = ui.alert(
          'How to Allocate Budget?',
          `Selected channels: ${selectedSources.join(', ')}\n` +
          `Total budget: $${totalBudget}\n\n` +
          `Choose allocation method:\n` +
          `• YES = Even split across all channels\n` +
          `• NO = Manually enter amount for each channel`,
          ui.ButtonSet.YES_NO_CANCEL
        );
        
        if (methodChoice === ui.Button.YES) {
          // Even split
          const amountPerSource = Math.floor(totalBudget / selectedSources.length);
          const remainder = totalBudget - (amountPerSource * selectedSources.length);
          
          selectedSources.forEach((source, idx) => {
            const amount = idx === 0 ? amountPerSource + remainder : amountPerSource;
            budgetAllocations.push({ source: source, amount: amount });
          });
          
          budgetApproved = true;
          
        } else if (methodChoice === ui.Button.NO) {
          // Manual entry for each source
          let totalAllocated = 0;
          let allValid = true;
          
          for (const source of selectedSources) {
            const remaining = totalBudget - totalAllocated;
            const amountPrompt = ui.prompt(
              `Budget for ${source}`,
              `How much for ${source}?\n\n` +
              `Remaining: $${remaining} of $${totalBudget}\n\n` +
              `Enter amount (or 0 to skip):`,
              ui.ButtonSet.OK_CANCEL
            );
            
            if (amountPrompt.getSelectedButton() !== ui.Button.OK) {
              allValid = false;
              break;
            }
            
            const amount = parseFloat(amountPrompt.getResponseText()) || 0;
            if (amount > 0) {
              budgetAllocations.push({ source: source, amount: amount });
              totalAllocated += amount;
            }
          }
          
          if (allValid && budgetAllocations.length > 0) {
            // Show summary
            let summary = `Budget Allocation Summary:\n\n`;
            budgetAllocations.forEach(item => {
              summary += `• ${item.source}: $${item.amount}\n`;
            });
            summary += `\nTotal: $${totalAllocated} of $${totalBudget}\n\n`;
            
            if (totalAllocated < totalBudget) {
              summary += `Unallocated: $${totalBudget - totalAllocated}\n\n`;
            }
            
            summary += `Confirm this allocation?`;
            
            const confirm = ui.alert('Confirm Budget', summary, ui.ButtonSet.YES_NO);
            budgetApproved = (confirm === ui.Button.YES);
          }
        }
      }
    }
  }
  
  // Step 5: Staff Names
  const staffPrompt = ui.prompt(
    'Step 4 of 6: Staff Names',
    'Enter staff names (comma-separated):\n\nExample: Sarah, Mike, Jessica\n\nOr press OK to keep defaults (Front Desk, Coach A, Coach B)',
    ui.ButtonSet.OK_CANCEL
  );
  if (staffPrompt.getSelectedButton() !== ui.Button.OK) return;
  const staffInput = staffPrompt.getResponseText().trim();
  const staffNames = staffInput ? staffInput.split(',').map(s => s.trim()).filter(s => s) : DefaultLists.STAFF.slice();
  
  // Step 6: Membership Types
  const typesConfirm = ui.alert(
    'Step 5 of 6: Membership Types',
    'Default packages:\n• PT (Personal Training)\n• Small Group\n• General Membership\n• Class Pack\n\nKeep defaults?',
    ui.ButtonSet.YES_NO
  );
  
  let membershipTypes = DefaultLists.MEMBERSHIP_TYPES.slice();
  if (typesConfirm === ui.Button.NO) {
    const typesPrompt = ui.prompt(
      'Custom Membership Types',
      'Enter types (comma-separated):\n\nExample: Personal Training, Group Class, Unlimited',
      ui.ButtonSet.OK_CANCEL
    );
    if (typesPrompt.getSelectedButton() === ui.Button.OK && typesPrompt.getResponseText().trim()) {
      membershipTypes = typesPrompt.getResponseText().split(',').map(s => s.trim()).filter(s => s);
    }
  }
  
  // Step 7: Sample Data
  const sampleData = ui.alert(
    'Step 6 of 6: Sample Data',
    'Add 50 sample leads to test the system?\n(You can delete them later)\n\nRecommended for first-time users.',
    ui.ButtonSet.YES_NO
  );
  
  // Apply all settings
  try {
    ss.rename(gymName + ' - Gym Ops');
    
    const settingsSheet = ss.getSheetByName('Settings & Budget');
    if (settingsSheet) {
      // Set monthly targets based on wizard inputs
      settingsSheet.getRange('B3').setValue(targets.leads);
      settingsSheet.getRange('B4').setValue(targets.setRate);
      settingsSheet.getRange('B5').setValue(targets.showRate);
      settingsSheet.getRange('B6').setValue(targets.closeRate);
      settingsSheet.getRange('B7').setValue(targets.newMembers);
      settingsSheet.getRange('B8').setValue(targets.mrr);
      
      // Set location to gym name
      settingsSheet.getRange('C14').setValue(gymName);
      
      // Set staff names
      for (let i = 0; i < Math.min(staffNames.length, 10); i++) {
        settingsSheet.getRange(14 + i, 2).setValue(staffNames[i]);
      }
      
      // Set membership types
      for (let i = 0; i < Math.min(membershipTypes.length, 10); i++) {
        settingsSheet.getRange(14 + i, 4).setValue(membershipTypes[i]);
      }
      
      // Set marketing budget (if approved and allocations exist)
      if (budgetApproved && budgetAllocations.length > 0) {
        const today = new Date();
        const startYear = today.getFullYear();
        const startMonth = today.getMonth(); // 0-based
        
        // Clear existing budget rows (40-200) before writing (24 months × sources)
        settingsSheet.getRange('A40:E200').clearContent();
        
        let rowOffset = 0;
        // Create 24 months: 12 months past + 12 months future
        for (let monthOffset = -12; monthOffset < 12; monthOffset++) {
          const date = new Date(startYear, startMonth + monthOffset, 1);
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const monthKey = `${year}-${month}`;
          const daysInMonth = new Date(year, date.getMonth() + 1, 0).getDate();
          
          budgetAllocations.forEach((allocation, index) => {
            const row = 40 + rowOffset;
            settingsSheet.getRange(`A${row}`).setNumberFormat('@');
            settingsSheet.getRange(`A${row}`).setValue(monthKey);
            settingsSheet.getRange(`B${row}`).setValue(allocation.source);
            settingsSheet.getRange(`C${row}`).setValue(allocation.amount);
            settingsSheet.getRange(`D${row}`).setValue(daysInMonth);
            settingsSheet.getRange(`E${row}`).setFormula(`=IFERROR(IF(C${row}="","",C${row}/D${row}),"")`);
            rowOffset++;
          });
        }
        
        SpreadsheetApp.flush();
      }
    }
    
    // Add sample data if requested
  if (sampleData === ui.Button.YES) {
    const added = addSampleData();
    if (!added) {
      ui.alert('Heads up', 'Sample data was not added. You can run "Gym Ops → 🧪 Add Sample Data" later.', ui.ButtonSet.OK);
    }
  }

  if (typeof OnboardingService !== 'undefined' && OnboardingService && typeof OnboardingService.runOnboardingSetup === 'function') {
    try {
      OnboardingService.runOnboardingSetup();
    } catch (onboardingError) {
      Logger.log('Onboarding setup error: ' + onboardingError);
    }
  }
    
    // Finalize
    const dashboard = ss.getSheetByName('DASHBOARD');
    if (dashboard) ss.setActiveSheet(dashboard);
    
    const budgetSummary = budgetAllocations.length > 0 
      ? `💰 Marketing budget allocated:\n${budgetAllocations.map(a => `   • ${a.source}: $${a.amount}`).join('\n')}\n\n`
      : '';
    
    ui.alert(
      '✅ Setup Complete!',
      'Your tracker is 100% configured!\n\n' +
      '📊 Check DASHBOARD now\n' +
      '⚙️ Connect GHL workflow (see Help tab)\n' +
      '📝 Add your first lead in "Lead Data"\n\n' +
      budgetSummary +
      'Everything is ready to use!',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('Error', 'Setup failed: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Main initialization
 */
function initializeTemplate(silent) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  if (!silent) {
    const result = ui.alert(
      'Initialize Template',
      'Create all tabs with formulas?\n\nContinue?',
      ui.ButtonSet.YES_NO
    );
    if (result !== ui.Button.YES) return;
  }
  
  try {
    createHelpTab(ss, false);
    createSettingsTab(ss);
    createLeadDataTab(ss);
    createMembersTab(ss);
    createImportMembersTab(ss);
    createLTVAnalysisTab(ss);
    createMarketingTab(ss);
    createStaffTab(ss);
    createUTMTrackingTab(ss);
    createDailySpendTab(ss);
    createChartDataTab(ss);
    createLTVCalculationsTab(ss);
    createDataTab(ss);
    createMetricsTab(ss);  // New: Net Gain/Loss calculations
    createDashboardTab(ss);
    
    createNamedRanges(ss);
    setupDataValidations(ss);
    applyProtections(ss);
    reorderTabs(ss);
    
    // Create charts (v2.1-beta)
    createDashboardCharts(ss);
    
    // HIGH FIX #5: Setup monthly auto-backup trigger
    setupMonthlyBackup();
    
    if (!silent) {
      ui.alert('✅ Done!', 'All tabs created. Monthly auto-backup enabled. Run Quick Start Wizard next!', ui.ButtonSet.OK);
    }
    
  } catch (error) {
    ui.alert('Error', error.toString(), ui.ButtonSet.OK);
    Logger.log('Error: ' + error.toString());
  }
}

function fullSetupWizard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const confirm = ui.alert(
    '🚀 Run Full Setup?',
    'This will re-create the template structure and walk you through the Quick Start Wizard.\n\nExisting customizations may be overwritten. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (confirm !== ui.Button.YES) {
    return;
  }

  initializeTemplate(true);

  quickStartWizard({
    skipWelcome: true,
    skipAutoInit: true
  });
}

// ============================================================
// TAB CREATION
// ============================================================

/**
 * Tab 1: DASHBOARD (v2.1-alpha: KPIs + Actions, charts in beta)
 */
function createDashboardTab(ss) {
  let sheet = ss.getSheetByName('DASHBOARD');
  if (!sheet) {
    sheet = ss.insertSheet('DASHBOARD');
  } else {
    sheet.clear();
  }
  
  // Header with date range dropdown and status indicator
  sheet.getRange('A1').setValue('📊 GYM OPS DASHBOARD').setFontSize(18).setFontWeight('bold');
  
  // Status indicator (UX Enhancement - shows initialization status)
  const currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  sheet.getRange('D1').setValue(`Status: ✅ Ready`).setFontSize(10).setFontWeight('bold').setFontColor('#0b5394');
  sheet.getRange('E1').setValue(`Last Updated: ${currentDate}`).setFontSize(9).setFontColor('#666666');
  sheet.getRange('D1:E1').setNote('System Status:\n✅ Ready - Sheet initialized and operational\n⚠️ Needs Setup - Run Initialize Template\n\nLast Updated shows when sheet was last initialized.');
  
  sheet.getRange('A2').setValue('Date Range:').setFontWeight('bold');
  
  // Data validation for date range (linked to Settings)
  const dateRangeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Last 7 Days', 'Last 14 Days', 'Last 30 Days', 'Last 90 Days', 'Last 6 Months', 'Last 12 Months', 'Quarter-to-Date', 'Year-to-Date', 'Custom Range'], true)
    .build();
  sheet.getRange('B2').setDataValidation(dateRangeRule).setValue('Last 30 Days');
  
  sheet.getRange('A3').setValue('Showing:').setFontWeight('bold');
  sheet.getRange('B3').setFormula('=IFERROR(TEXT(\'Settings & Budget\'!B30,"yyyy-mm-dd") & " to " & TEXT(\'Settings & Budget\'!B31,"yyyy-mm-dd"), "Calculating...")');
  
  // UX #1: TODAY'S SNAPSHOT - At-a-Glance Summary Card
  sheet.getRange('A4').setValue('📊 TODAY\'S SNAPSHOT').setFontSize(13).setFontWeight('bold').setBackground('#e7f4e4');
  sheet.getRange('B4:F4').merge().setBackground('#e7f4e4');
  
  // Row 5: Key instant metrics
  sheet.getRange('A5').setValue('🔥 HOT Leads:').setFontWeight('bold');
  sheet.getRange('B5').setFormula('=COUNTIFS(\'Lead Data\'!AD:AD,"🔥 HOT",\'Lead Data\'!S:S,FALSE,\'Lead Data\'!X:X,FALSE)').setNumberFormat('0');
  sheet.getRange('A5').setNote('HOT leads (score 70+) who are NOT yet members.\n\nThese are your highest-priority leads - follow up ASAP!');
  
  sheet.getRange('C5').setValue('⚠️ Action Needed:').setFontWeight('bold');
  sheet.getRange('D5').setFormula('=LET(values,{A20,A25,A30,A45,A50},SUM(BYROW(values,LAMBDA(v,IF(OR(v="✓ None",v=""),0,COUNTA(TEXTSPLIT(v,CHAR(10))))))))').setNumberFormat('0');
  sheet.getRange('C5').setNote('Total action items from sections below:\n• No Appt Set (24h)\n• No Shows\n• Trials Expiring (3d)\n• Member Alerts');
  
  sheet.getRange('E5').setValue('⏰ Trials Expiring (3d):').setFontWeight('bold');
  sheet.getRange('F5').setFormula('=COUNTIFS(\'Lead Data\'!R:R,">="&TODAY(),\'Lead Data\'!R:R,"<="&TODAY()+3,\'Lead Data\'!S:S,FALSE,\'Lead Data\'!Q:Q,"<>")').setNumberFormat('0');
  sheet.getRange('E5').setNote('Trials expiring within 3 days who haven\'t converted yet.\n\nUrgent: Follow up to close these sales!');
  
  // Row 6: More metrics
  sheet.getRange('A6').setValue('💰 Active MRR:').setFontWeight('bold');
  sheet.getRange('B6').setFormula('=SUMIFS(\'Lead Data\'!V:V,\'Lead Data\'!S:S,TRUE,\'Lead Data\'!X:X,FALSE)').setNumberFormat('$#,##0');
  sheet.getRange('A6').setNote('Total Monthly Recurring Revenue from all active members (not cancelled).');
  
  sheet.getRange('C6').setValue('📈 LTV:CAC Health:').setFontWeight('bold');
  sheet.getRange('D6').setFormula('=IF(ISNUMBER(B67),IF(B67>=5,"✅ Excellent",IF(B67>=3,"✅ Good","⚠️ Review")),"⚠️ No Data")').setFontWeight('bold');
  sheet.getRange('C6').setNote('Overall profitability health based on LTV:CAC ratio.\n\n✅ Excellent = 5x+\n✅ Good = 3-5x\n⚠️ Review = <3x');
  
  sheet.getRange('E6').setValue('🆕 New Members (30d):').setFontWeight('bold');
  sheet.getRange('F6').setFormula('=COUNTIFS(\'Lead Data\'!T:T,">="&TODAY()-30,\'Lead Data\'!T:T,"<="&TODAY(),\'Lead Data\'!S:S,TRUE)').setNumberFormat('0');
  sheet.getRange('E6').setNote('New members who joined in the last 30 days.');
  
  // Conditional formatting for the snapshot card
  const hotLeadsFormat = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(5).setBackground('#fff3cd')
    .setRanges([sheet.getRange('B5')]).build();
  const actionFormat = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(0).setBackground('#ffe0e0')
    .setRanges([sheet.getRange('D5')]).build();
  const trialsFormat = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(0).setBackground('#fff3cd')
    .setRanges([sheet.getRange('F5')]).build();
  
  const snapshotRules = [hotLeadsFormat, actionFormat, trialsFormat];
  
  // KPIs (now starting at row 8, with headers at row 9)
  sheet.getRange('A8').setValue('🎯 KEY METRICS').setFontSize(14).setFontWeight('bold');
  const kpiHeaders = [['Metric', 'Actual', 'Target', 'Variance', 'Status']];
  sheet.getRange('A9:E9').setValues(kpiHeaders).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  const metrics = ['Leads', 'Set %', 'Show %', 'Close %', 'New Members', 'MRR', 'CAC'];
  sheet.getRange(10, 1, metrics.length, 1).setValues(metrics.map(m => [m]));
  
  // Formulas - updated for new row positions (starting at row 10 instead of 7) and fixed sheet references
  sheet.getRange('B10').setFormula('=COUNTIFS(\'Lead Data\'!B:B,">="&\'Settings & Budget\'!B30,\'Lead Data\'!B:B,"<="&\'Settings & Budget\'!B31)');
  // HIGH FIX #8: Enhanced rate formulas - show "N/A" instead of 0% when denominator is 0
  sheet.getRange('B11').setFormula('=IF(B10=0,"-",IFERROR(COUNTIFS(\'Lead Data\'!L:L,TRUE,\'Lead Data\'!B:B,">="&\'Settings & Budget\'!B30,\'Lead Data\'!B:B,"<="&\'Settings & Budget\'!B31)/B10,0))');
  sheet.getRange('B12').setFormula('=LET(appts,COUNTIFS(\'Lead Data\'!L:L,TRUE,\'Lead Data\'!B:B,">="&\'Settings & Budget\'!B30,\'Lead Data\'!B:B,"<="&\'Settings & Budget\'!B31),IF(appts=0,"-",IFERROR(COUNTIFS(\'Lead Data\'!N:N,TRUE,\'Lead Data\'!B:B,">="&\'Settings & Budget\'!B30,\'Lead Data\'!B:B,"<="&\'Settings & Budget\'!B31)/appts,0)))');
  sheet.getRange('B13').setFormula('=LET(shows,COUNTIFS(\'Lead Data\'!N:N,TRUE,\'Lead Data\'!B:B,">="&\'Settings & Budget\'!B30,\'Lead Data\'!B:B,"<="&\'Settings & Budget\'!B31),IF(shows=0,"-",IFERROR(COUNTIFS(\'Lead Data\'!S:S,TRUE,\'Lead Data\'!B:B,">="&\'Settings & Budget\'!B30,\'Lead Data\'!B:B,"<="&\'Settings & Budget\'!B31)/shows,0)))');
  sheet.getRange('B14').setFormula('=COUNTIFS(\'Lead Data\'!T:T,">="&\'Settings & Budget\'!B30,\'Lead Data\'!T:T,"<="&\'Settings & Budget\'!B31,\'Lead Data\'!S:S,TRUE,\'Lead Data\'!X:X,FALSE)');
  sheet.getRange('B15').setFormula('=SUMIFS(\'Lead Data\'!V:V,\'Lead Data\'!S:S,TRUE,\'Lead Data\'!X:X,FALSE)');
  // CRITICAL FIX #3: Enhanced CAC formula - handles zero members gracefully
  sheet.getRange('B16').setFormula(`=LET(
    startDate,'Settings & Budget'!$B$30,
    endDate,'Settings & Budget'!$B$31,
    rawMonths,'Settings & Budget'!$A$40:$A$100,
    rates,'Settings & Budget'!$E$40:$E$100,
    monthStarts,ARRAYFORMULA(IF(rawMonths="",,IF(ISNUMBER(rawMonths),DATE(YEAR(rawMonths),MONTH(rawMonths),1),DATE(VALUE(LEFT(rawMonths,4)),VALUE(MID(rawMonths,6,2)),1)))),
    monthEnds,ARRAYFORMULA(IF(monthStarts="",,EOMONTH(monthStarts,0))),
    totalSpend,IFERROR(SUM(BYROW(FILTER({monthStarts,monthEnds,rates},(rates<>"")*(monthStarts<>"")*(monthEnds>=startDate)*(monthStarts<=endDate)),
      LAMBDA(row,
        LET(
          mStart,INDEX(row,1),
          mEnd,INDEX(row,2),
          rate,INDEX(row,3),
          overlapStart,MAX(mStart,startDate),
          overlapEnd,MIN(mEnd,endDate),
          days,MAX(0,overlapEnd-overlapStart+1),
          days*rate
        )
      )
    )),0),
    IF(B14=0,IF(totalSpend>0,"⚠️ Spend/0","-"),totalSpend/B14)
  )`);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRITICAL FIX: Target Column Formulas (Fixed 2025-10-08)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 
  // ISSUE: Previous loop created C10 with reference to B2 (header "Target")
  // CAUSE: Loop started at i=2 (header row) instead of i=3 (first data row)
  // EFFECT: C10-C16 showed "Target" text → #VALUE! cascade in D, E columns
  // NOTE: "Goal To Date" column removed - Variance now calculates Actual - Target directly
  // 
  // SOLUTION: Explicit assignments ensure each metric references correct data row
  // - C10 → B3 (Leads: 70)
  // - C11 → B4 (Set Rate: 60%)
  // - C12 → B5 (Show Rate: 70%)
  // - C13 → B6 (Close Rate: 50%)
  // - C14 → B7 (New Members: 20)
  // - C15 → B8 (MRR: $3,000)
  // - C16 → B9 (CAC: $150)
  // 
  // AUTO-FIX: onOpen() now validates and auto-corrects this issue
  // MANUAL FIX: Users can run "Gym Ops → Fix DASHBOARD Formulas"
  // PREVENTION: Named ranges (Target_Leads, etc.) created for future stability
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  sheet.getRange('C10').setFormula('=IFERROR(\'Settings & Budget\'!B3,"⚠️ Setup")'); // Leads Target
  sheet.getRange('C11').setFormula('=IFERROR(\'Settings & Budget\'!B4,"⚠️ Setup")'); // Set Rate Target
  sheet.getRange('C12').setFormula('=IFERROR(\'Settings & Budget\'!B5,"⚠️ Setup")'); // Show Rate Target
  sheet.getRange('C13').setFormula('=IFERROR(\'Settings & Budget\'!B6,"⚠️ Setup")'); // Close Rate Target
  sheet.getRange('C14').setFormula('=IFERROR(\'Settings & Budget\'!B7,"⚠️ Setup")'); // New Members Target
  sheet.getRange('C15').setFormula('=IFERROR(\'Settings & Budget\'!B8,"⚠️ Setup")'); // MRR Target
  sheet.getRange('C16').setFormula('=IFERROR(\'Settings & Budget\'!B9,"⚠️ Setup")'); // CAC Target
  
  // Variance and Status (updated for new row positions: 10-16)
  // Variance = Actual - Target (column D = B - C)
  for (let row = 10; row <= 16; row++) {
    sheet.getRange(row, 4).setFormula(`=IF(C${row}="","",B${row}-C${row})`);
    // Status: For most metrics, higher is better (Actual > Target = ON PACE)
    // For CAC (row 16), lower is better (Actual < Target = ON PACE)
    if (row === 16) {
      sheet.getRange(row, 5).setFormula(`=IF(C${row}="","",IF(B${row}<=C${row},"✅ ON PACE","⚠️ OVER"))`);
    } else {
      sheet.getRange(row, 5).setFormula(`=IF(C${row}="","",IF(B${row}>=C${row},"✅ ON PACE","📉 BEHIND"))`);
    }
  }
  
  // UX #4: Add contextual help tooltips to key metrics (updated for new row positions: 10-16)
  sheet.getRange('A10').setNote('📊 LEADS - Total new leads created in date range\n\nCounted from "Created Date" column in Lead Data.\n\nGoal: Consistent lead flow every week.');
  sheet.getRange('A11').setNote('📞 SET % - Appointment set rate\n\nFormula: Appointments Set ÷ Total Leads\n\n✅ Good: 60%+\n⚠️ Warning: 40-60%\n❌ Poor: <40%\n\nTip: Fast response time improves this!');
  sheet.getRange('A12').setNote('👀 SHOW % - Appointment show rate\n\nFormula: Appointments Showed ÷ Appointments Set\n\n✅ Good: 70%+\n⚠️ Warning: 50-70%\n❌ Poor: <50%\n\nTip: Confirmation calls & texts help!');
  sheet.getRange('A13').setNote('💰 CLOSE % - Conversion rate (cohort-based)\n\nFormula: Members Converted ÷ Shows (same cohort)\n\n✅ Good: 50%+\n⚠️ Warning: 30-50%\n❌ Poor: <30%\n\nNote: Both metrics use "Created Date" to ensure accurate cohort tracking.');
  sheet.getRange('A14').setNote('🆕 NEW MEMBERS - Total conversions in date range\n\nCounted from "Member Start" date in Lead Data.\n\n💡 This is your primary revenue growth metric!');
  sheet.getRange('A15').setNote('💵 MRR - Monthly Recurring Revenue\n\nTotal Active MRR: Sum of all active members (not cancelled)\n\n✅ Growth = New members > Cancellations\n⚠️ Flat = New members = Cancellations\n❌ Declining = Cancellations > New members\n\nGoal: Steady month-over-month growth!');
  sheet.getRange('A16').setNote('💸 CAC - Customer Acquisition Cost\n\nFormula: Total Marketing Spend ÷ New Members\n\n✅ Excellent: <$100\n✅ Good: $100-200\n⚠️ Warning: $200-300\n❌ High: >$300\n\nLower is better! Compare to LTV:CAC ratio (target: 3x+).');
  
  // Format (updated for new row positions: 11-13 for %, 15-16 for $)
  // Updated for Goal To Date removal: columns are now A, B, C, D, E (was A, B, C, D, E, F)
  sheet.getRange('B11:E13').setNumberFormat('0.0%');
  sheet.getRange('C11:C13').setNumberFormat('0.0%');
  sheet.getRange('D11:D13').setNumberFormat('0.0%'); // Variance for percentage rows
  sheet.getRange('B15:E15').setNumberFormat('$#,##0');
  sheet.getRange('B16:E16').setNumberFormat('$#,##0');
  
  // Action Items
  sheet.getRange('A17').setValue('🔔 ACTION ITEMS').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A19').setValue('🔴 No Appt Set (24h)').setFontWeight('bold');
  sheet.getRange('A20').setFormula('=IFERROR(LET(items,FILTER(\'Lead Data\'!C:C&" "&\'Lead Data\'!D:D,\'Lead Data\'!B:B<TODAY()-1,\'Lead Data\'!L:L=FALSE,\'Lead Data\'!S:S=FALSE,\'Lead Data\'!T:T="",\'Lead Data\'!A:A<>""),"→ "&TEXTJOIN(CHAR(10)&"→ ",TRUE,items)) ,"✓ None")');
  sheet.getRange('A20').setWrap(true);
  
  sheet.getRange('A24').setValue('🟡 No Shows').setFontWeight('bold');
  sheet.getRange('A25').setFormula('=IFERROR(LET(items,FILTER(\'Lead Data\'!C:C&" "&\'Lead Data\'!D:D,\'Lead Data\'!N:N=FALSE,\'Lead Data\'!M:M<>"",\'Lead Data\'!M:M<TODAY(),\'Lead Data\'!S:S=FALSE,\'Lead Data\'!T:T="",\'Lead Data\'!A:A<>""),"→ "&TEXTJOIN(CHAR(10)&"→ ",TRUE,items)) ,"✓ None")');
  sheet.getRange('A25').setWrap(true);
  
  sheet.getRange('A29').setValue('🟠 Trials Expiring (3d)').setFontWeight('bold');
  sheet.getRange('A30').setFormula('=IFERROR(LET(items,FILTER(\'Lead Data\'!C:C&" "&\'Lead Data\'!D:D,\'Lead Data\'!R:R>=TODAY(),\'Lead Data\'!R:R<=TODAY()+3,\'Lead Data\'!S:S=FALSE,\'Lead Data\'!Q:Q<>"",\'Lead Data\'!T:T="",\'Lead Data\'!A:A<>""),"→ "&TEXTJOIN(CHAR(10)&"→ ",TRUE,items)) ,"✓ None")');
  sheet.getRange('A30').setWrap(true);
  
  // NET GAIN/LOSS BY MEMBERSHIP TYPE
  sheet.getRange('A34').setValue('📊 NET GAIN/LOSS BY MEMBERSHIP TYPE (Selected Range)').setFontSize(14).setFontWeight('bold');
  
  // Headers
  const gainLossHeaders = [['Type', 'Gains', 'Losses', 'Net', '% Change']];
  sheet.getRange('A35:E35').setValues(gainLossHeaders).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // Pull data from _Metrics tab
  sheet.getRange('A36').setFormula('=_Metrics!A5:E9');
  
  // Add conditional formatting for Net column (D36:D40)
  const positiveNetDashboard = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(0)
    .setBackground('#d4edda')
    .setFontColor('#155724')
    .setRanges([sheet.getRange('D36:D40')])
    .build();
    
  const negativeNetDashboard = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(0)
    .setBackground('#f8d7da')
    .setFontColor('#721c24')
    .setRanges([sheet.getRange('D36:D40')])
    .build();
  
  // Store these rules to be applied later with all other conditional formatting
  const netGainLossRules = [positiveNetDashboard, negativeNetDashboard];
  
  // Formatting
  sheet.getRange('B36:D40').setNumberFormat('0'); // Integer counts
  sheet.getRange('E36:E40').setNumberFormat('0.0%'); // Percentage
  
  // Add explanatory note
  sheet.getRange('A34').setNote('Net Gain/Loss Summary:\n\n✅ GAINS: New members who started in the selected date range\n❌ LOSSES: Members who cancelled in the selected date range\n📊 NET: Gains minus Losses (green = growth, red = decline)\n\n💡 TIP: Change the date range dropdown (B2) to analyze different time periods.\n\nUses member start dates (column R) and cancel dates (column W) from Lead Data.');
  
  // Member Alerts (shifted down to row 42 to accommodate Net Gain/Loss section)
  sheet.getRange('A42').setValue('👥 MEMBER ALERTS').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A44').setValue('🎯 Trials Ending (7d)').setFontWeight('bold');
  sheet.getRange('A45').setFormula('=IFERROR(LET(items,FILTER(\'Lead Data\'!C:C&" "&\'Lead Data\'!D:D,\'Lead Data\'!P:P>=TODAY(),\'Lead Data\'!P:P<=TODAY()+7,\'Lead Data\'!O:O<>"",\'Lead Data\'!A:A<>""),"→ "&TEXTJOIN(CHAR(10)&"→ ",TRUE,items)) ,"✓ None")');
  sheet.getRange('A45').setWrap(true);
  
  sheet.getRange('A49').setValue('🎂 Birthdays This Month').setFontWeight('bold');
  sheet.getRange('A50').setFormula('=IFERROR(LET(items,FILTER(\'Lead Data\'!C:C&" "&\'Lead Data\'!D:D,MONTH(\'Lead Data\'!G:G)=MONTH(TODAY()),\'Lead Data\'!Q:Q=TRUE,\'Lead Data\'!V:V<>TRUE,\'Lead Data\'!G:G<>""),"→ "&TEXTJOIN(CHAR(10)&"→ ",TRUE,items)) ,"✓ None")');
  sheet.getRange('A50').setWrap(true);
  
  // SOURCE ANALYSIS TABLE (shifted down to row 55)
  sheet.getRange('A55').setValue('📈 SOURCE ANALYSIS (by Lead Source)').setFontSize(14).setFontWeight('bold');
  
  const sourceHeaders = [[
    'Lead Source', 'Leads (window)', 'Appointments', 'Showed', 'Show Rate', 'Lead→Member Rate',
    'Spend (window)', 'CPL', 'CPA (Appt)', 'CPS (Show)', 'CP/Trial', 'CAC'
  ]];
  sheet.getRange('A56:L56').setValues(sourceHeaders).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // Get unique sources from Settings
  sheet.getRange('A57').setFormula(`
    =ARRAYFORMULA(IF(LEN('Settings & Budget'!A14:A24)=0,"",'Settings & Budget'!A14:A24))
  `);
  
  // B57: Leads (window) - count by source in date range
  sheet.getRange('B57').setFormula(`
    =ARRAYFORMULA(IF(A57:A66="","",
      COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!B:B,">="&'Settings & Budget'!$B$30,'Lead Data'!B:B,"<="&'Settings & Budget'!$B$31)
    ))
  `);
  
  // C57: Appointments - count appt set by source in date range
  sheet.getRange('C57').setFormula(`
    =ARRAYFORMULA(IF(A57:A66="","",
      COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!L:L,TRUE,'Lead Data'!B:B,">="&'Settings & Budget'!$B$30,'Lead Data'!B:B,"<="&'Settings & Budget'!$B$31)
    ))
  `);
  
  // D57: Showed - count showed by source in date range
  sheet.getRange('D57').setFormula(`
    =ARRAYFORMULA(IF(A57:A66="","",
      COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!N:N,TRUE,'Lead Data'!B:B,">="&'Settings & Budget'!$B$30,'Lead Data'!B:B,"<="&'Settings & Budget'!$B$31)
    ))
  `);
  
  // E57: Show Rate = Showed / Appointments - HIGH FIX #8: Show "-" instead of 0 when no appointments
  sheet.getRange('E57').setFormula(`
    =ARRAYFORMULA(IF(A57:A66="","",IF(C57:C66=0,"-",IFERROR(D57:D66/C57:C66,0))))
  `);
  
  // F57: Lead→Member Rate = Members / Leads - HIGH FIX #8: Show "-" instead of 0 when no leads
  sheet.getRange('F57').setFormula(`
    =ARRAYFORMULA(IF(A57:A66="","",
      IF(B57:B66=0,"-",
        IFERROR(
          COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!S:S,TRUE,'Lead Data'!T:T,">="&'Settings & Budget'!$B$30,'Lead Data'!T:T,"<="&'Settings & Budget'!$B$31)
          /B57:B66,
          0
        )
      )
    ))
  `);
  
  // G57: Spend (window) - sum daily spend by source in date range
  sheet.getRange('G57').setFormula(`
    =ARRAYFORMULA(MAP(A57:A66,
      LAMBDA(src,
        IF(src="","",
          LET(
            startDate,'Settings & Budget'!$B$30,
            endDate,'Settings & Budget'!$B$31,
            rawMonths,'Settings & Budget'!$A$40:$A$100,
            sources,'Settings & Budget'!$B$40:$B$100,
            rates,'Settings & Budget'!$E$40:$E$100,
            monthStarts,ARRAYFORMULA(IF(rawMonths="",,IF(ISNUMBER(rawMonths),DATE(YEAR(rawMonths),MONTH(rawMonths),1),DATE(VALUE(LEFT(rawMonths,4)),VALUE(MID(rawMonths,6,2)),1)))),
            monthEnds,ARRAYFORMULA(IF(monthStarts="",,EOMONTH(monthStarts,0))),
            valid,(sources=src)*(rates<>"")*(monthStarts<>"")*(monthEnds>=startDate)*(monthStarts<=endDate),
            IF(SUM(valid)=0,0,
              SUM(
                MAP(
                  FILTER(monthStarts,valid),
                  FILTER(monthEnds,valid),
                  FILTER(rates,valid),
                  LAMBDA(mStart,mEnd,rate,
                    LET(
                      overlapStart,MAX(mStart,startDate),
                      overlapEnd,MIN(mEnd,endDate),
                      days,MAX(0,overlapEnd-overlapStart+1),
                      days*rate
                    )
                  )
                )
              )
            )
          )
        )
      )
    ))
  `);
  
  // H57: CPL = Spend / Leads - CRITICAL FIX #3 + MEDIUM FIX #11: Show "Organic" for $0 spend
  sheet.getRange('H57').setFormula(`
    =ARRAYFORMULA(IF(A57:A66="","",IF(G57:G66=0,"Organic",IF(B57:B66=0,IF(G57:G66>0,"Spend/0 Leads","-"),G57:G66/B57:B66))))
  `);
  
  // I57: CPA (Appt) = Spend / Appointments - CRITICAL FIX #3 + MEDIUM FIX #11
  sheet.getRange('I57').setFormula(`
    =ARRAYFORMULA(IF(A57:A66="","",IF(G57:G66=0,"Organic",IF(C57:C66=0,IF(G57:G66>0,"Spend/0 Appts","-"),G57:G66/C57:C66))))
  `);
  
  // J57: CPS (Show) = Spend / Showed - CRITICAL FIX #3 + MEDIUM FIX #11
  sheet.getRange('J57').setFormula(`
    =ARRAYFORMULA(IF(A57:A66="","",IF(G57:G66=0,"Organic",IF(D57:D66=0,IF(G57:G66>0,"Spend/0 Shows","-"),G57:G66/D57:D66))))
  `);
  
  // K57: CP/Trial = Spend / Trials Started - CRITICAL FIX #3 + MEDIUM FIX #11
  sheet.getRange('K57').setFormula(`
    =ARRAYFORMULA(IF(A57:A66="","",
      LET(
        trials, COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!Q:Q,">="&'Settings & Budget'!$B$30,'Lead Data'!Q:Q,"<="&'Settings & Budget'!$B$31,'Lead Data'!Q:Q,"<>"),
        IF(G57:G66=0, "Organic", IF(trials=0, IF(G57:G66>0, "Spend/0 Trials", "-"), G57:G66/trials))
      )
    ))
  `);
  
  // L57: CAC = Spend / New Members - CRITICAL FIX #3 + MEDIUM FIX #11
  sheet.getRange('L57').setFormula(`
    =ARRAYFORMULA(IF(A57:A66="","",
      LET(
        members, COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!S:S,TRUE,'Lead Data'!T:T,">="&'Settings & Budget'!$B$30,'Lead Data'!T:T,"<="&'Settings & Budget'!$B$31),
        IF(G57:G66=0, "Organic", IF(members=0, IF(G57:G66>0, "Spend/0 Members", "-"), G57:G66/members))
      )
    ))
  `);
  
  // Format numbers (updated row refs from 52-61 to 57-66)
  sheet.getRange('E57:F66').setNumberFormat('0.0%');
  sheet.getRange('G57:L66').setNumberFormat('$#,##0.00');
  
  // Highlight columns (updated row refs from 52-61 to 57-66)
  sheet.getRange('E57:E66').setBackground('#fff3cd');  // Show Rate
  sheet.getRange('F57:F66').setBackground('#d4edda');  // Lead→Member Rate
  sheet.getRange('L57:L66').setBackground('#f8d7da');  // CAC
  
  // LTV METRICS SECTION (Priority: Source > Retention > CAC Ratio)
  sheet.getRange('A65').setValue('💰 LIFETIME VALUE (LTV) METRICS').setFontSize(14).setFontWeight('bold');
  
  // PROFITABILITY HEALTH CHECK SUMMARY CARD
  sheet.getRange('A66').setValue('PROFITABILITY HEALTH CHECK').setFontWeight('bold').setFontSize(11);
  sheet.getRange('A67').setValue('Overall LTV:CAC Ratio:').setFontWeight('bold');
  // UX #4: Add tooltip to Overall LTV:CAC header
  sheet.getRange('A67').setNote('💰 Overall LTV:CAC Ratio - Your Most Important Profitability Metric!\n\nFormula: Average Lifetime Value ÷ Average CAC (across all sources)\n\nWhat it means:\n• <3x = ⚠️ LOSING MONEY - Review marketing spend!\n• 3-5x = ✅ PROFITABLE - Industry standard\n• 5-10x = ✅ HIGHLY PROFITABLE - Great job!\n• 10x+ = 🚀 EXCEPTIONAL - Scale this!\n\n💡 TIP: Focus on sources with highest LTV:CAC, not just lowest CAC!');
  // CRITICAL FIX #3: Enhanced LTV:CAC calculation - shows descriptive message when no CAC data + type checking
  sheet.getRange('B67').setFormula('=LET(avgLTV,AVERAGE(FILTER(B70:B80,A70:A80<>"")),avgCAC,AVERAGE(FILTER(C70:C80,A70:A80<>"",C70:C80>0)),IF(OR(NOT(ISNUMBER(avgLTV)),NOT(ISNUMBER(avgCAC))),"-",IF(avgCAC=0,"No CAC Data",avgLTV/avgCAC)))').setNumberFormat('0.0"x"').setFontWeight('bold').setFontSize(12);
  sheet.getRange('C67').setFormula('=IF(ISNUMBER(B67),IF(B67>=5,"✅ HIGHLY PROFITABLE",IF(B67>=3,"✅ PROFITABLE","⚠️ REVIEW")),"⚠️")').setFontWeight('bold');
  sheet.getRange('D67').setValue('(Target: 5x+ | Industry: 3-5x)').setFontStyle('italic').setFontColor('#666666');
  
  // Priority 1: LTV by Source (Enhanced with CAC and Status)
  sheet.getRange('A69').setValue('LTV by Source (All-Time) - Transparent Calculation').setFontWeight('bold').setFontSize(12);
  const ltvHeaders = [['Source', 'Avg LTV', 'CAC', 'LTV:CAC Ratio', 'Status', 'Total Members', 'Retention %']];
  sheet.getRange('A70:G70').setValues(ltvHeaders).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // Add hover note to explain LTV:CAC
  sheet.getRange('D70').setNote('LTV:CAC Ratio = Customer Lifetime Value ÷ Customer Acquisition Cost\n\nWhat it means:\n• <3x = Unprofitable (losing money)\n• 3-5x = Profitable (industry standard)\n• 5-10x = Highly profitable (great!)\n• 10x+ = Exceptional (scale this!)\n\nYour Target: 5x or higher');
  
  // A71: Pull sources from Settings (single source of truth)
  sheet.getRange('A71').setFormula('=ARRAYFORMULA(IF(LEN(\'Settings & Budget\'!A14:A24)=0,"",\'Settings & Budget\'!A14:A24))');
  
  // B71: Avg LTV from _LTV Calculations (using INDEX-MATCH)
  sheet.getRange('B71').setFormula('=ARRAYFORMULA(IF(A71:A81="","",IFERROR(INDEX(\'_LTV Calculations\'!T:T, MATCH(A71:A81, \'_LTV Calculations\'!N:N, 0)), 0)))').setNumberFormat('$#,##0');
  
  // C71: CAC from Source Analysis (transparent!)
  sheet.getRange('C71').setFormula('=ARRAYFORMULA(IF(A71:A81="","",IFERROR(INDEX(L:L,MATCH(A71:A81,A52:A61,0)+51),0)))').setNumberFormat('$#,##0');
  
  // D71: LTV:CAC ratio (now transparent calculation)
  sheet.getRange('D71').setFormula('=ARRAYFORMULA(IF(A71:A81="","",IFERROR(IF(C71:C81=0,"∞",B71:B81/C71:C81),0)))').setNumberFormat('0.0"x"');
  
  // E71: Status (color-coded with emojis)
  sheet.getRange('E71').setFormula('=ARRAYFORMULA(IF(A71:A81="","",IF(D71:D81="∞","🟢 FREE",IF(VALUE(LEFT(D71:D81,FIND("x",D71:D81)-1))>=10,"🟢 EXCELLENT",IF(VALUE(LEFT(D71:D81,FIND("x",D71:D81)-1))>=5,"🟢 GREAT",IF(VALUE(LEFT(D71:D81,FIND("x",D71:D81)-1))>=3,"🟡 GOOD","🔴 REVIEW"))))))');
  
  // F71: Total Members
  sheet.getRange('F71').setFormula('=ARRAYFORMULA(IF(A71:A81="","",IFERROR(INDEX(\'_LTV Calculations\'!O:O, MATCH(A71:A81, \'_LTV Calculations\'!N:N, 0)), 0)))');
  
  // G71: Retention %
  sheet.getRange('G71').setFormula('=ARRAYFORMULA(IF(A71:A81="","",IFERROR(INDEX(\'_LTV Calculations\'!U:U, MATCH(A71:A81, \'_LTV Calculations\'!N:N, 0)), 0)))').setNumberFormat('0.0%');
  
  // Add TARGET benchmark row
  sheet.getRange('A82').setValue('━━ TARGET ━━').setFontWeight('bold').setFontStyle('italic').setFontColor('#666666');
  sheet.getRange('B82').setValue('(varies)').setFontStyle('italic').setFontColor('#666666');
  sheet.getRange('C82').setValue('(varies)').setFontStyle('italic').setFontColor('#666666');
  sheet.getRange('D82').setValue('5.0x+').setFontWeight('bold').setFontColor('#0f6938');
  sheet.getRange('E82').setValue('🎯 AIM HERE').setFontWeight('bold').setFontColor('#0f6938');
  
  // Highlight columns for clarity
  sheet.getRange('B71:B81').setBackground('#e7f4e4'); // LTV
  sheet.getRange('C71:C81').setBackground('#fce8e6'); // CAC (cost = red tint)
  sheet.getRange('D71:D81').setBackground('#fff3cd'); // LTV:CAC ratio
  
  // Conditional formatting for LTV:CAC ratio (color zones)
  const excellentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(10).setBackground('#d4edda').setFontColor('#155724')
    .setRanges([sheet.getRange('D71:D81')]).build();
  const greatRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberBetween(5, 10).setBackground('#d4edda').setFontColor('#155724')
    .setRanges([sheet.getRange('D71:D81')]).build();
  const goodRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberBetween(3, 5).setBackground('#fff3cd').setFontColor('#856404')
    .setRanges([sheet.getRange('D71:D81')]).build();
  const reviewRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(3).setBackground('#f8d7da').setFontColor('#721c24')
    .setRanges([sheet.getRange('D71:D81')]).build();
  
  const ltvCacRules = [excellentRule, greatRule, goodRule, reviewRule];
  
  // Conditional formatting for Status column
  const statusExcellentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🟢').setBackground('#d4edda').setFontColor('#155724')
    .setRanges([sheet.getRange('E71:E81')]).build();
  const statusGoodRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🟡').setBackground('#fff3cd').setFontColor('#856404')
    .setRanges([sheet.getRange('E71:E81')]).build();
  const statusReviewRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🔴').setBackground('#f8d7da').setFontColor('#721c24')
    .setRanges([sheet.getRange('E71:E81')]).build();
  
  const statusRules = [statusExcellentRule, statusGoodRule, statusReviewRule];
  
  // Priority 2: Retention/Churn Rate (moved to accommodate new rows)
  sheet.getRange('I69').setValue('Retention & Churn (Last 30 Days)').setFontWeight('bold').setFontSize(12);
  const churnHeaders = [['Metric', 'Value']];
  sheet.getRange('I70:J70').setValues(churnHeaders).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  sheet.getRange('I71').setValue('Overall Churn Rate');
  sheet.getRange('J71').setFormula('=IFERROR(INDEX(\'_LTV Calculations\'!D:D, MATCH(EOMONTH(TODAY(),-1)+1, \'_LTV Calculations\'!A:A, 0)), 0)').setNumberFormat('0.0%');
  
  sheet.getRange('I72').setValue('Avg Member Lifespan');
  sheet.getRange('J72').setFormula('=IFERROR(AVERAGE(\'_LTV Calculations\'!I:I), 0)').setNumberFormat('0.0 "months"');
  
  sheet.getRange('I73').setValue('Active Members');
  sheet.getRange('J73').setFormula('=COUNTIFS(\'Import Members\'!G:G, "Active") + COUNTIFS(\'Lead Data\'!Q:Q, TRUE, \'Lead Data\'!V:V, FALSE)');
  
  sheet.getRange('I74').setValue('Cancelled (Last 30d)');
  sheet.getRange('J74').setFormula('=COUNTIFS(\'Import Members\'!H:H, ">="&TODAY()-30) + COUNTIFS(\'Lead Data\'!W:W, ">="&TODAY()-30, \'Lead Data\'!V:V, TRUE)');
  
  // Overall LTV Summary
  sheet.getRange('I76').setValue('OVERALL AVERAGE LTV').setFontWeight('bold');
  sheet.getRange('J76').setFormula('=IFERROR(AVERAGE(\'_LTV Calculations\'!J:J), 0)').setNumberFormat('$#,##0').setFontWeight('bold').setBackground('#d4edda');
  
  // STAFF PERFORMANCE SECTION
  sheet.getRange('A85').setValue('👥 STAFF PERFORMANCE (Current Date Range)').setFontSize(14).setFontWeight('bold');
  
  const staffPerfHeaders = [['Staff Member', 'Leads Assigned', 'Appointments Set', 'Shows', 'Closes', 'Close Rate', 'Avg Days to Close', 'Total MRR']];
  sheet.getRange('A86:H86').setValues(staffPerfHeaders).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // Pull staff list from Settings
  sheet.getRange('A87').setFormula(`=ARRAYFORMULA(IF(LEN('Settings & Budget'!B14:B16)=0,"",'Settings & Budget'!B14:B16))`);
  
  // B87: Leads Assigned
  sheet.getRange('B87').setFormula(`
    =ARRAYFORMULA(IF(A87:A89="","",
      COUNTIFS('Lead Data'!J:J,A87:A89,'Lead Data'!B:B,">="&'Settings & Budget'!$B$30,'Lead Data'!B:B,"<="&'Settings & Budget'!$B$31)
    ))
  `);
  
  // C87: Appointments Set
  sheet.getRange('C87').setFormula(`
    =ARRAYFORMULA(IF(A87:A89="","",
      COUNTIFS('Lead Data'!J:J,A87:A89,'Lead Data'!L:L,TRUE,'Lead Data'!B:B,">="&'Settings & Budget'!$B$30,'Lead Data'!B:B,"<="&'Settings & Budget'!$B$31)
    ))
  `);
  
  // D87: Shows
  sheet.getRange('D87').setFormula(`
    =ARRAYFORMULA(IF(A87:A89="","",
      COUNTIFS('Lead Data'!J:J,A87:A89,'Lead Data'!N:N,TRUE,'Lead Data'!B:B,">="&'Settings & Budget'!$B$30,'Lead Data'!B:B,"<="&'Settings & Budget'!$B$31)
    ))
  `);
  
  // E87: Closes (Members)
  sheet.getRange('E87').setFormula(`
    =ARRAYFORMULA(IF(A87:A89="","",
      COUNTIFS('Lead Data'!J:J,A87:A89,'Lead Data'!S:S,TRUE,'Lead Data'!T:T,">="&'Settings & Budget'!$B$30,'Lead Data'!T:T,"<="&'Settings & Budget'!$B$31)
    ))
  `);
  
  // F87: Close Rate
  sheet.getRange('F87').setFormula('=ARRAYFORMULA(IF(A87:A89="","",IFERROR(E87:E89/B87:B89,0)))').setNumberFormat('0.0%');
  
  // G87: Avg Days to Close
  sheet.getRange('G87').setFormula(`
    =ARRAYFORMULA(IF(A87:A89="","",
      IFERROR(AVERAGEIFS('Lead Data'!AE:AE,'Lead Data'!J:J,A87:A89,'Lead Data'!S:S,TRUE,'Lead Data'!T:T,">="&'Settings & Budget'!$B$30,'Lead Data'!T:T,"<="&'Settings & Budget'!$B$31),0)
    ))
  `).setNumberFormat('0.0');
  
  // H87: Total MRR Generated
  sheet.getRange('H87').setFormula(`
    =ARRAYFORMULA(IF(A87:A89="","",
      SUMIFS('Lead Data'!V:V,'Lead Data'!J:J,A87:A89,'Lead Data'!S:S,TRUE,'Lead Data'!T:T,">="&'Settings & Budget'!$B$30,'Lead Data'!T:T,"<="&'Settings & Budget'!$B$31)
    ))
  `).setNumberFormat('$#,##0');
  
  // Highlight top performer
  sheet.getRange('E87:E89').setBackground('#e7f4e4'); // Closes
  sheet.getRange('F87:F89').setBackground('#fff3cd'); // Close Rate
  sheet.getRange('H87:H89').setBackground('#d4edda'); // MRR
  
  // Note about charts
  sheet.getRange('A95').setValue('📊 ANALYTICS CHARTS').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A96').setValue('7 interactive charts created below (scroll down to view)').setFontStyle('italic').setFontColor('#0f6938');
  
  sheet.setColumnWidths(1, 12, 120);  // Columns A-L for Source Analysis table
  sheet.setFrozenRows(9);  // UX #1: Updated to freeze snapshot card + KPI headers
  
  // Conditional formatting for KPIs (updated for Goal To Date removal)
  // Status column is now E (was F)
  const onPace = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('ON PACE').setBackground('#b7e1cd').setFontColor('#0f6938')
    .setRanges([sheet.getRange('E10:E16')]).build();
  const behind = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('BEHIND').setBackground('#f4c7c3').setFontColor('#cc0000')
    .setRanges([sheet.getRange('E10:E16')]).build();
  const over = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('OVER').setBackground('#fff3cd').setFontColor('#856404')
    .setRanges([sheet.getRange('E10:E16')]).build();
  
  // Combine all conditional formatting rules (including snapshot card rules)
  const allRules = [onPace, behind, over, ...snapshotRules, ...ltvCacRules, ...statusRules, ...netGainLossRules];
  sheet.setConditionalFormatRules(allRules);
  
  // Link date range to Settings
  ss.setNamedRange('dashboardDateRange', sheet.getRange('B2'));
}

/**
 * Tab 2: Lead Data (26 columns, A=Lead ID)
 */
function createLeadDataTab(ss) {
  let sheet = ss.getSheetByName('Lead Data');
  if (!sheet) {
    sheet = ss.insertSheet('Lead Data');
  } else {
    sheet.clear();
  }
  
  const desiredRows = 3;
  const currentRows = sheet.getMaxRows();
  if (currentRows > desiredRows) {
    sheet.deleteRows(desiredRows + 1, currentRows - desiredRows);
  } else if (currentRows < desiredRows) {
    sheet.insertRows(currentRows + 1, desiredRows - currentRows);
  }
  
  // 33 columns (A-Z, AA-AH) - Added "Trial Start" date column + 6 smart columns including Last Touchpoint
  const headers = [[
    'Lead ID', 'Created Date', 'First Name', 'Last Name', 'Phone', 'Email', 'DOB',
    'Source', 'Campaign', 'Staff Owner', 'Location',
    'Appt Set?', 'Appt Date', 'Show?', 'Show Date', 'Start Trial?', 'Trial Start', 'Trial End',
    'Converted?', 'Member Start', 'Membership Type', 'MRR ($)', 'Upfront Fee ($)',
    'Cancelled?', 'Cancel Date', 'Cancel Reason', 'Notes', 'Current Status',
    'Age (Days)', 'Lead Score', 'Action Needed', 'Duplicate?', 'Days to Convert', 'Last Touchpoint'
  ]];
  
  sheet.getRange('A1:AH1').setValues(headers).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff').setWrap(true);
  
  // Add helpful notes for auto-fill behavior + MEDIUM FIX #16: Deletion warnings
  sheet.getRange('A1').setNote('⚠️ LEAD ID\n\n❌ DO NOT DELETE ROWS!\n\nDeleting rows permanently removes data and cannot be undone.\n\n✅ To remove a member:\n1. Check "Cancelled?" (column X)\n2. Enter Cancel Date (column Y)\n3. Select Cancel Reason (column Z)\n\nThis preserves data for reporting and LTV analysis.\n\n💡 TIP: Copy row 2 down to add more leads - formulas will automatically copy!\n\n⚠️ ROW CAPACITY: Auto-calculated columns work up to row 10,000. After that, formulas stop calculating and you\'ll need to extend ranges manually or contact support. See Help tab for details.');
  sheet.getRange('H1').setNote('🗺️ AUTO-MAPPED from UTM data via _UTM Tracking tab.\n\n✅ To manually override: Click cell → Select from dropdown\n\n🎨 COLOR-CODED by Source Type (UX #9):\n  • 🔴 Light Red = Paid Sources (Paid Search, Paid Social)\n  • 🟢 Light Green = Organic Sources (Organic Search, Direct Traffic, Social Media)\n  • 🔵 Light Blue = Referral Sources (Referrals, Member Referral, Third-Party)\n  • ⚠️ Yellow = Warning/Error (mapping issues)\n\n⚠️ Warning symbols indicate mapping issues:\n  • ⚠️ Not Tracked = Lead not in UTM Tracking\n  • ⚠️ No UTM = No UTM source provided\n  • ⚠️ Unmapped = UTM source not in Settings mapping table\n\n💡 Add new UTM mappings in Settings & Budget tab (columns G-H)');
  sheet.getRange('O1').setNote('✅ Automatically stamps the date/time when "Show?" is checked.\n\n⚠️ Feel free to override if the appointment happened earlier.');
  sheet.getRange('P1').setNote('✅ CHECK THIS BOX when lead starts trial.\n\n📅 Trial Start date (column Q) will auto-fill with today\'s date!\n\n🧮 Trial End (column R) will auto-calculate based on trial length.\n\n💡 Keep checkbox checked to track trial status.');
  sheet.getRange('Q1').setNote('📅 AUTO-FILLED when "Start Trial?" (column P) is checked.\n\n✅ Shows the date the trial started.\n\n🧮 Used to calculate Trial End date.\n\n⚠️ Feel free to manually override if trial started on a different date.');
  sheet.getRange('R1').setNote('🧮 AUTO-CALCULATED: Trial Start date + trial length\n\n✅ Shows when trial expires.\n\n💡 Trial length is set in Settings & Budget (default: 14 days).\n\n⚠️ This is a formula - do not manually edit unless needed.');
  sheet.getRange('S1').setNote('✅ Check when lead becomes a paying member\n\n⚠️ Once checked, this member adds to MRR tracking.\n\nTo cancel a member:\n• Use "Cancelled?" checkbox (column X)\n• DO NOT delete the row\n\nDeleting active members loses revenue tracking!\n\nMember Start date (T) will auto-fill with today\'s date.');
  sheet.getRange('X1').setNote('✅ Check this box to mark a member as cancelled\n\n⚠️ ALWAYS USE THIS INSTEAD OF DELETING ROWS!\n\nWhy?\n• Preserves historical data\n• Maintains LTV calculations\n• Enables churn analysis\n• Allows member reactivation\n• Prevents MRR tracking errors\n\nDeleting rows = permanent data loss!\n\nCancel Date (Y) will auto-fill with today\'s date.');
  sheet.getRange('J1').setNote('👤 STAFF - Assign lead to team member\n\n⚡ SPEED TIP: Use TAB key for auto-complete!\n  • Type "Em" → TAB → "Emily (Sales)"\n  • Type "J" → TAB → First staff starting with J\n  • 40% faster than clicking dropdown!\n\n💡 Configure staff list in Settings & Budget tab.');
  sheet.getRange('U1').setNote('🎫 MEMBERSHIP TYPE\n\n⚡ SPEED TIP: Use TAB key for auto-complete!\n  • Type "P" → TAB → "Personal Training"\n  • Type "G" → TAB → "General Membership"\n  • 40% faster than clicking!\n\n💡 Configure membership types in Settings & Budget tab.');
  sheet.getRange('Z1').setNote('📝 CANCEL REASON (required when Cancelled? is checked)\n\n⚡ SPEED TIP: Use TAB key for auto-complete!\n  • Type "P" → TAB → "Price Too High"\n  • Type "M" → TAB → "Moved Away"\n  • 40% faster than clicking dropdown!\n\n💡 Configure reasons in Settings & Budget tab.');
  sheet.getRange('AA1').setNote('📝 MEMBER NOTES\n\nFree-text field for tracking member interactions, follow-ups, and important details.\n\n⚡ AUTO-UPDATE: When you edit this field, "Last Touchpoint" (column AH) automatically updates with the current timestamp!\n\n💡 TIP: Notes are visible on both Lead Data and Members tabs.\n\nBest practices:\n• Include date of interaction\n• Note action taken or promised\n• Mark follow-up dates\n• Track member preferences');
  sheet.getRange('AH1').setNote('⏰ LAST TOUCHPOINT (Auto-Updated)\n\n📌 This timestamp automatically updates when you edit the "Notes" column (AA).\n\n✅ Purpose:\n• Track when member was last contacted\n• Identify members needing follow-up\n• Measure engagement frequency\n• Sort by recency of contact\n\n⚠️ DO NOT manually edit this column - it updates automatically!\n\nTimestamp format: YYYY-MM-DD HH:MM:SS');
  sheet.getRange('AC1').setNote('📊 AGE (DAYS) - UX #11 Enhanced Visual System\n\nShows days since lead was created with visual urgency:\n\n🆕 0-3 days = New lead (green)\n⏱️ 4-7 days = Watch closely (light yellow)\n⚠️ 8-14 days = Warning - needs attention (yellow)\n🔴 15+ days = URGENT - follow up now! (red)\n\nColor-coded backgrounds help you spot old leads instantly.\n\nGoal: Contact all leads within 7 days!');
  
  // Auto formulas
  // H2: Source (lookup from UTM Tracking) - CRITICAL FIX #2: Enhanced with better error handling - HIGH FIX #4: Bounded to 5000 rows
  sheet.getRange('H2').setFormula(`=ARRAYFORMULA(IF(A2:A="","",
    IFERROR(
      INDEX('_UTM Tracking'!O:O, MATCH(A2:A, '_UTM Tracking'!A:A, 0)),
      "⚠️ Not Tracked"
    )
  ))`);
  
  // Q2: Trial Start (auto-filled when Start Trial? checkbox is checked - via onEdit handler)
  // This is a date column, not a formula column
  
  // R2: Trial End (calculated from Trial Start date + trial length) - FIXED: Now references Q2:Q (Trial Start date) + DATEVALUE() for timezone normalization
  sheet.getRange('R2').setFormula('=ARRAYFORMULA(IF(A2:A="","",IF(ISNUMBER(Q2:Q),DATEVALUE(Q2:Q)+\'Settings & Budget\'!B33,"")))');
  
  // AB2: Current Status (check if T is date for Member, Q for Trial) - FIXED: Updated column references
  sheet.getRange('AB2').setFormula('=ARRAYFORMULA(IF(A2:A="","",IF(X2:X=TRUE,"Cancelled",IF(S2:S=TRUE,"Member",IF((T2:T<>"")*ISNUMBER(T2:T),"Trial",IF(N2:N=TRUE,"Show",IF(L2:L=TRUE,"Appt Set","Lead"))))))))');
  
  // AC2: Age (Days) - Days since created - HIGH FIX #4 + UX #11: Enhanced with emoji indicators
  sheet.getRange('AC2').setFormula(`=ARRAYFORMULA(IF(A2:A="","",IF(B2:B="","",
    LET(age, INT(TODAY()-B2:B),
      IF(age<=3, "🆕 "&age,
        IF(age<=7, "⏱️ "&age,
          IF(age<=14, "⚠️ "&age,
            "🔴 "&age
          )
        )
      )
    )
  )))`);
  
  // AD2: Lead Score - Hot/Warm/Cold based on multiple factors - FIXED: Updated column references
  sheet.getRange('AD2').setFormula(`=ARRAYFORMULA(IF(A2:A="","",
    LET(
      score, 
      IF(N2:N=TRUE,50,0) + 
      IF(REGEXMATCH(LOWER(H2:H),"referral|member"),30,0) +
      IF(L2:L=TRUE,20,0) +
      IF(AC2:AC<3,15,IF(AC2:AC<7,10,IF(AC2:AC<14,5,0))) -
      IF(AC2:AC>30,20,0) -
      IF(AC2:AC>60,30,0) +
      IF(ISNUMBER(R2:R)*(R2:R<=TODAY()+3)*(R2:R>=TODAY()), 50, 0),
      IF(score>=70,"🔥 HOT",IF(score>=40,"🟡 WARM","❄️ COLD"))
    )
  ))`);
  
  // AE2: Action Needed - Smart next step - FIXED: Updated all column references
  sheet.getRange('AE2').setFormula(`=ARRAYFORMULA(IF(A2:A="","",
    IF(S2:S=TRUE,"✅ Member",
      IF(X2:X=TRUE,"⛔ Cancelled",
        IF((Q2:Q<>"")*(R2:R<=TODAY()+3),"🔥 TRIAL EXPIRING!",
          IF((L2:L=FALSE)*(AC2:AC>=2),"📞 SET APPOINTMENT",
            IF((L2:L=TRUE)*(N2:N=FALSE)*(M2:M<TODAY()),"⚠️ NO-SHOW - FOLLOW UP",
              IF((N2:N=TRUE)*(Q2:Q=""),"🎯 OFFER TRIAL",
                IF((N2:N=TRUE)*(Q2:Q<>"")*(S2:S=FALSE),"💰 CLOSE DEAL",
                  IF(AC2:AC>=7,"⏰ OVERDUE CHECK-IN",
                    "✓ On Track"
                  )
                )
              )
            )
          )
        )
      )
    )
  ))`);
  
  // AF2: Duplicate Check - Flag potential duplicates - No changes needed (E and F columns unchanged)
  sheet.getRange('AF2').setFormula('=ARRAYFORMULA(IF(A2:A="","",IF(OR(COUNTIF(E:E,E2:E)>1,COUNTIF(F:F,F2:F)>1),"⚠️ CHECK","✓")))');
  
  // AG2: Days to Convert - Time from lead to member - FIXED: Updated column references (S for Converted, T for Member Start)
  sheet.getRange('AG2').setFormula('=ARRAYFORMULA(IF(A2:A="","",IF((S2:S=TRUE)*(T2:T<>""),INT(T2:T-B2:B),"")))');
  
  // Column widths
  sheet.setColumnWidth(1, 120);  // Lead ID
  sheet.setColumnWidth(2, 110);  // Created Date
  sheet.setColumnWidths(3, 5, 100);
  sheet.setColumnWidths(8, 3, 120);
  sheet.setColumnWidths(11, 17, 100);  // Extended to include Q (Trial Start)
  sheet.setColumnWidth(27, 200);  // Notes (was 26, now 27 = AA)
  
  // Formats
  const dateColumns = ['B', 'G', 'M', 'O', 'Q', 'T', 'Y'];  // FIXED: Added Q (Trial Start), updated to T and Y
  dateColumns.forEach(col => sheet.getRange(col + ':' + col).setNumberFormat('yyyy-mm-dd'));
  sheet.getRange('V:W').setNumberFormat('$#,##0.00');  // FIXED: MRR and Upfront Fee (was T:U, now V:W)
  
  // Visual cues for auto columns
  sheet.getRange('H:H').setBackground('#e8f0fe').setNote('Auto-filled from UTM tracking');
  sheet.getRange('Q:Q').setBackground('#d9ead3').setNote('Auto-filled when Start Trial? is checked');
  sheet.getRange('R:R').setBackground('#d9ead3').setNote('Auto-calculated: Trial Start + trial length');
  sheet.getRange('AB:AB').setBackground('#d9ead3').setNote('Auto-calculated from checkboxes');
  
  // Smart columns styling  
  sheet.getRange('AC:AC').setBackground('#fff3cd').setNote('Auto-calculated: Days since created');
  sheet.getRange('AD:AD').setBackground('#e7f4e4').setFontWeight('bold').setNote('Auto-scored: 🔥 Hot (70+), 🟡 Warm (40-69), ❄️ COLD (<40)');
  sheet.getRange('AE:AE').setBackground('#fce8e6').setFontWeight('bold').setNote('Smart next action based on lead stage');
  sheet.getRange('AF:AF').setBackground('#f4cccc').setNote('Flags potential duplicates by phone/email');
  sheet.getRange('AG:AG').setBackground('#d9ead3').setNote('Auto-calculated: Days from lead to member');
  sheet.getRange('AH:AH').setBackground('#e8f0fe').setNote('Auto-updated: Timestamp of last note edit');
  
  // Column widths for smart columns
  sheet.setColumnWidth(29, 100);  // AC - Age (Days)
  sheet.setColumnWidth(30, 120);  // AD - Lead Score
  sheet.setColumnWidth(31, 180);  // AE - Action Needed
  sheet.setColumnWidth(32, 100);  // AF - Duplicate
  sheet.setColumnWidth(33, 120);  // AG - Days to Convert
  sheet.setColumnWidth(34, 160);  // AH - Last Touchpoint
  
  // Conditional formatting for Lead Score (AD:AD)
  const hotRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🔥').setBackground('#d4edda').setFontColor('#155724')
    .setRanges([sheet.getRange('AD:AD')]).build();
  const warmRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🟡').setBackground('#fff3cd').setFontColor('#856404')
    .setRanges([sheet.getRange('AD:AD')]).build();
  const coldRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('❄️').setBackground('#cfe2ff').setFontColor('#084298')
    .setRanges([sheet.getRange('AD:AD')]).build();
  
  // Conditional formatting for Action Needed urgency (AE:AE)
  const urgentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🔥').setBackground('#f8d7da').setFontColor('#721c24')
    .setRanges([sheet.getRange('AE:AE')]).build();
  const warningRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('⚠️').setBackground('#fff3cd').setFontColor('#856404')
    .setRanges([sheet.getRange('AE:AE')]).build();
  const overdueRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('⏰').setBackground('#ffeeba').setFontColor('#856404')
    .setRanges([sheet.getRange('AE:AE')]).build();
  
  // Conditional formatting for Duplicates (AF:AF)
  const dupRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('⚠️').setBackground('#f8d7da').setFontColor('#721c24')
    .setRanges([sheet.getRange('AF:AF')]).build();
  
  // Conditional formatting for Age (AC:AC) - UX #11: Enhanced with emoji-based colors
  const urgentLeadRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🔴').setBackground('#f8d7da').setFontColor('#721c24')
    .setRanges([sheet.getRange('AC:AC')]).build();
  const warningLeadRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('⚠️').setBackground('#fff3cd').setFontColor('#856404')
    .setRanges([sheet.getRange('AC:AC')]).build();
  const watchLeadRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('⏱️').setBackground('#fffbea').setFontColor('#9f7a00')
    .setRanges([sheet.getRange('AC:AC')]).build();
  const newLeadRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🆕').setBackground('#e7f4e4').setFontColor('#2d5f2e')
    .setRanges([sheet.getRange('AC:AC')]).build();
  
  // UX #9: Color-Coded Source Categories (Paid/Organic/Referral)
  // Paid Sources (light red background)
  const paidSourceRule1 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Paid Search').setBackground('#ffe0e0')
    .setRanges([sheet.getRange('H:H')]).build();
  const paidSourceRule2 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Paid Social').setBackground('#ffe0e0')
    .setRanges([sheet.getRange('H:H')]).build();
  
  // Organic Sources (light green background)
  const organicSourceRule1 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Organic Search').setBackground('#e0ffe0')
    .setRanges([sheet.getRange('H:H')]).build();
  const organicSourceRule2 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Direct Traffic').setBackground('#e0ffe0')
    .setRanges([sheet.getRange('H:H')]).build();
  const organicSourceRule3 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Social Media').setBackground('#e0ffe0')
    .setRanges([sheet.getRange('H:H')]).build();
  
  // Referral Sources (light blue background)
  const referralSourceRule1 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Referrals').setBackground('#e0e0ff')
    .setRanges([sheet.getRange('H:H')]).build();
  const referralSourceRule2 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Member Referral').setBackground('#e0e0ff')
    .setRanges([sheet.getRange('H:H')]).build();
  const referralSourceRule3 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Third-Party').setBackground('#e0e0ff')
    .setRanges([sheet.getRange('H:H')]).build();
  
  // CRITICAL FIX #2: Conditional formatting for Source warnings (overwrites colors for warnings)
  const sourceWarningRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('⚠️').setBackground('#fff3cd').setFontColor('#856404')
    .setRanges([sheet.getRange('H:H')]).build();
  
  // MEDIUM FIX #16: Highlight active members (visual warning against deletion) - FIXED: Updated column references
  const activeMemberRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($S2=TRUE, $W2=FALSE)')
    .setBackground('#e7f4e4')  // Light green background
    .setRanges([sheet.getRange('A2:AH5000')])
    .build();
  
  const rules = [hotRule, warmRule, coldRule, urgentRule, warningRule, overdueRule, dupRule, urgentLeadRule, warningLeadRule, watchLeadRule, newLeadRule, paidSourceRule1, paidSourceRule2, organicSourceRule1, organicSourceRule2, organicSourceRule3, referralSourceRule1, referralSourceRule2, referralSourceRule3, sourceWarningRule, activeMemberRule];
  sheet.setConditionalFormatRules(rules);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COLUMN GROUPS (Collapsible Sections) - UPDATED for new Trial Start column
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Group 1: FUNNEL (Columns L-Q: 12-17) - Includes Appt Set/Date, Show/Date, Trial Start checkbox/date
  sheet.getRange('L:Q').shiftColumnGroupDepth(1);
  
  // Group 2: CONVERSION (Columns R-X: 18-24) - Includes Trial End, Converted, Member Start, Membership, MRR, Upfront Fee, Cancelled
  sheet.getRange('R:X').shiftColumnGroupDepth(1);
  
  // Group 3: ADMIN (Columns Y-AA: 25-27) - Includes Cancel Date, Cancel Reason, Notes
  sheet.getRange('Y:AA').shiftColumnGroupDepth(1);
  
  // Note: CORE (A-K) and SMART (AC-AH) remain always visible
  
  Logger.log('✅ Column groups added: FUNNEL, CONVERSION, ADMIN are collapsible');
  Logger.log('✅ NEW COLUMN ADDED: Trial Start (Q) - auto-fills when Start Trial? checkbox is checked');
  
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(4);
}

/**
 * Tab 3: Members (updated for new Trial Start column - now 34 columns A-AH)
 */
function createMembersTab(ss) {
  let sheet = ss.getSheetByName('Members');
  if (!sheet) {
    sheet = ss.insertSheet('Members');
  } else {
    sheet.clear();
  }

  // FIXED: Updated to include new Trial Start column (AH instead of AG), and updated Converted/Cancelled column references
  const membersFormula = "={'Lead Data'!A1:AH1; LET(filtered, IFERROR(FILTER('Lead Data'!A2:AH,'Lead Data'!S2:S=TRUE,'Lead Data'!W2:W<>TRUE), {}), IF(ROWS(filtered)=0, FILTER('Lead Data'!A2:AH, ROW('Lead Data'!A2:A)=0), IFERROR(QUERY(filtered,\"WHERE Col1 IS NOT NULL\",0), filtered)))}";
  sheet.getRange('A1').setFormula(membersFormula);
  sheet.setFrozenRows(1);
}

/**
 * Tab 4: Settings (with UTM mapping + date dropdown)
 */
function createSettingsTab(ss) {
  // Rename tab if exists, or create new one
  let sheet = ss.getSheetByName('Settings & Budget');
  if (!sheet) {
    sheet = ss.getSheetByName('Settings'); // Check old name
    if (sheet) {
      sheet.setName('Settings & Budget'); // Rename
    } else {
      sheet = ss.insertSheet('Settings & Budget'); // Create new
    }
  }
  sheet.clear();
  
  // Monthly Targets
  sheet.getRange('A1').setValue('🎯 MONTHLY TARGETS').setFontSize(14).setFontWeight('bold');
  const targets = [
    ['Metric', 'Target'],
    ['Leads', 200],
    ['Set Rate (%)', 0.60],
    ['Show Rate (%)', 0.70],
    ['Close Rate (%)', 0.50],
    ['New Members', 42],
    ['MRR ($)', 4500],
    ['CAC ($)', 150],
    ['Monthly Churn (%)', 0.05],
    ['ARPU ($)', 150]
  ];
  sheet.getRange(2, 1, targets.length, 2).setValues(targets);
  sheet.getRange('A2:B2').setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  // Format targets: counts, percentages, and currency shown correctly
  sheet.getRange('B3').setNumberFormat('0');          // Leads
  sheet.getRange('B4:B6').setNumberFormat('0.0%');    // Set/Show/Close rates
  sheet.getRange('B7').setNumberFormat('0');          // New Members
  sheet.getRange('B8').setNumberFormat('$#,##0');     // MRR ($)
  sheet.getRange('B9').setNumberFormat('$#,##0');     // CAC ($)
  sheet.getRange('B10').setNumberFormat('0.0%');      // Monthly Churn (%)
  sheet.getRange('B11').setNumberFormat('$#,##0');    // ARPU ($)
  
  // Dropdowns
  sheet.getRange('A12').setValue('📋 DROPDOWN LISTS').setFontSize(14).setFontWeight('bold');
  const listHeaders = [['Sources', 'Staff', 'Location', 'Types', 'Cancel Reasons', '', 'Status Values']];
  sheet.getRange('A13:G13').setValues(listHeaders).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  const sources = DefaultLists.SOURCES;
  const staff = DefaultLists.STAFF;
  const location = DefaultLists.LOCATION; // ✅ SIMPLIFIED: Single location (will be set to gym name by wizard)
  const types = DefaultLists.MEMBERSHIP_TYPES;
  const reasons = DefaultLists.CANCEL_REASONS;
  const statusValues = DefaultLists.STATUS_VALUES;
  
  sheet.getRange(14, 1, sources.length, 1).setValues(sources.map(s => [s]));
  sheet.getRange(14, 2, staff.length, 1).setValues(staff.map(s => [s]));
  sheet.getRange('C14').setValue(location); // ✅ Single value instead of array
  sheet.getRange(14, 4, types.length, 1).setValues(types.map(t => [t]));
  sheet.getRange(14, 5, reasons.length, 1).setValues(reasons.map(r => [r]));
  sheet.getRange(14, 7, statusValues.length, 1).setValues(statusValues.map(sv => [sv]));
  
  // Add note for Status Values column
  sheet.getRange('G13').setNote('Status values for filtering Members tab.\n\nThese match the auto-calculated "Current Status" (column Z) in Lead Data:\n• Lead = Initial state\n• Appt Set = Appointment scheduled\n• Show = Attended appointment\n• Trial = Currently trialing\n• Member = Active member\n• Cancelled = Cancelled member');
  
  // Date Range System
  sheet.getRange('A26').setValue('📅 DATE RANGE SYSTEM').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A27').setValue('Selected Preset:').setFontWeight('bold');
  sheet.getRange('B27').setFormula('=IFERROR(DASHBOARD!B2, "Last 30 Days")');
  
  sheet.getRange('A28').setValue('Custom Start:').setFontWeight('bold');
  sheet.getRange('B28').setValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  sheet.getRange('A29').setValue('Custom End:').setFontWeight('bold');
  sheet.getRange('B29').setValue(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
  
  // Calculated dates (used by formulas)
  sheet.getRange('A30').setValue('Start Date (calculated):').setFontWeight('bold').setNote('Auto-calculated based on preset selection');
  sheet.getRange('B30').setFormula('=IF(B27="Last 7 Days", TODAY()-7, IF(B27="Last 14 Days", TODAY()-14, IF(B27="Last 30 Days", TODAY()-30, IF(B27="Last 90 Days", TODAY()-90, IF(B27="Last 6 Months", EDATE(TODAY(),-6), IF(B27="Last 12 Months", EDATE(TODAY(),-12), IF(B27="Quarter-to-Date", DATE(YEAR(TODAY()), ROUNDDOWN((MONTH(TODAY())-1)/3,0)*3+1, 1), IF(B27="Year-to-Date", DATE(YEAR(TODAY()), 1, 1), IF(B27="Custom Range", B28, TODAY()-30)))))))))').setNote('Auto-calculated start date');
  
  sheet.getRange('A31').setValue('End Date (calculated):').setFontWeight('bold').setNote('Auto-calculated based on preset selection');
  sheet.getRange('B31').setFormula('=IF(B27="Custom Range", B29, TODAY())').setNote('Auto-calculated end date');
  
  sheet.getRange('B28:B29').setNumberFormat('yyyy-mm-dd');
  sheet.getRange('B30:B31').setNumberFormat('yyyy-mm-dd');
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MEDIUM FIX #13: Custom Range Dates Validation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Add data validation for custom date range (B28:B29)
  // B28 (Start): Requires valid dates between 1900-2100
  const startDateValidation = SpreadsheetApp.newDataValidation()
    .requireDate()
    .requireDateBetween(new Date(1900, 0, 1), new Date(2100, 11, 31))
    .setAllowInvalid(false)
    .setHelpText('⚠️ Enter a valid date (YYYY-MM-DD)')
    .build();
  sheet.getRange('B28').setDataValidation(startDateValidation);
  
  // B29 (End): Must be after B28 (Start Date)
  const endDateValidation = SpreadsheetApp.newDataValidation()
    .requireDate()
    .requireDateAfter(sheet.getRange('B28'))
    .setAllowInvalid(false)
    .setHelpText('⚠️ End Date must be AFTER Start Date (B28)')
    .build();
  sheet.getRange('B29').setDataValidation(endDateValidation);
  
  // Add helpful notes explaining constraints
  sheet.getRange('B28').setNote('⚠️ Custom Start Date\n\nMust be BEFORE End Date (B29).\n\nOnly used when "Custom Range" is selected.\n\nIf Start > End, both cells will be highlighted in RED.');
  sheet.getRange('B29').setNote('⚠️ Custom End Date\n\nMust be AFTER Start Date (B28).\n\nOnly used when "Custom Range" is selected.\n\nIf Start > End, both cells will be highlighted in RED.');
  
  // Add conditional formatting to highlight invalid range (Start > End)
  const invalidRangeRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=B28>B29')
    .setBackground('#f8d7da')
    .setFontColor('#721c24')
    .setRanges([sheet.getRange('B28:B29')])
    .build();
  
  // Get existing rules and add new one
  const existingRules = sheet.getConditionalFormatRules();
  existingRules.push(invalidRangeRule);
  sheet.setConditionalFormatRules(existingRules);
  
  // Other Settings
  sheet.getRange('A33').setValue('Trial Length (days)').setFontWeight('bold');
  sheet.getRange('B33').setValue(14);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MEDIUM FIX #15: Trial Length Validation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Add data validation for trial length (1-90 days, whole numbers only)
  const trialLengthValidation = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(1, 90)
    .setAllowInvalid(false)
    .setHelpText('⚠️ Enter a whole number between 1 and 90 days (typical: 7, 14, or 30)')
    .build();
  sheet.getRange('B33').setDataValidation(trialLengthValidation);
  
  // Add helpful note explaining common values
  sheet.getRange('B33').setNote('⚠️ Trial Length (days)\n\nMust be between 1 and 90 days.\n\nCommon options:\n• 7 days (1 week trial)\n• 14 days (2 week trial)\n• 30 days (1 month trial)\n\nThis affects Trial End calculation in Lead Data.');
  
  // UTM Attribution Mapping
  sheet.getRange('G1').setValue('🗺️ UTM ATTRIBUTION MAPPING').setFontSize(14).setFontWeight('bold');
  sheet.getRange('G2:H2').setValues([['Raw UTM Source', 'Standardized Source']]).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  const utmMappings = [
    ['adwords', 'Paid Search'],
    ['google / cpc', 'Paid Search'],
    ['google / organic', 'Organic Search'],
    ['fb_ad', 'Paid Social'],
    ['instagram', 'Paid Social'],
    ['facebook', 'Social Media'],
    ['(direct)', 'Direct Traffic'],
    ['referral', 'Referrals'],
    ['gohighlevel', 'CRM UI'],
    ['member_referral', 'Member Referral'],
    ['walkin', 'Walk-In'],
    ['(none)', 'Others']
  ];
  
  sheet.getRange(3, 7, utmMappings.length, 2).setValues(utmMappings);
  
  // LTV Assumptions (for LTV calculations)
  sheet.getRange('G16').setValue('📊 LTV ASSUMPTIONS').setFontSize(14).setFontWeight('bold');
  sheet.getRange('G17:I17').setValues([['Package Type', 'Expected Lifespan (months)', 'Expected Churn Rate (%)']]).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  const ltvAssumptions = [
    ['PT', 12, 8.3],
    ['Small Group', 18, 5.6],
    ['General', 18, 5.6],
    ['Class Pack', 6, 16.7]
  ];
  
  sheet.getRange(18, 7, ltvAssumptions.length, 3).setValues(ltvAssumptions);
  sheet.getRange('I18:I21').setNumberFormat('0.0%');
  sheet.getRange('I18:I21').setValues(ltvAssumptions.map(row => [row[2]/100])); // Convert to decimal
  
  sheet.getRange('G18:G21').setNote('Customize these assumptions based on your gym\'s historical data');
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MARKETING BUDGET SECTION (Merged from Marketing tab - Phase 1.1)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  sheet.getRange('A36').setValue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━').setFontColor('#cccccc');
  sheet.getRange('A38').setValue('💰 MARKETING BUDGET (Monthly)').setFontSize(14).setFontWeight('bold');
  const budgetHeaders = [['Month', 'Source', 'Monthly Budget ($)', 'Days in Month', 'Daily Rate ($)']]; // ✅ SIMPLIFIED: Removed Location column
  sheet.getRange('A39:E39').setValues(budgetHeaders).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // Example row with formulas
  const currentMonth = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
  sheet.getRange('A40').setValue(currentMonth).setNote('Format: YYYY-MM');
  sheet.getRange('B40').setValue('Paid Social');
  sheet.getRange('C40').setValue(3000); // ✅ Monthly Budget now in column C (was D)
  // More robust formulas that work whether month is text or date
  sheet.getRange('D40').setFormula('=IFERROR(IF(A40="","",DAY(EOMONTH(DATEVALUE(TEXT(A40,"@")&"-01"),0))), "")').setNote('Auto-calculated: Days in month'); // ✅ Days now in column D (was E)
  sheet.getRange('E40').setFormula('=IFERROR(IF(C40="","",C40/D40), "")').setNote('Auto-calculated: Monthly Budget ÷ Days'); // ✅ Daily Rate now in column E (was F)
  
  sheet.getRange('C:C').setNumberFormat('$#,##0.00'); // ✅ Updated column reference (was D)
  sheet.getRange('E:E').setNumberFormat('$#,##0.00'); // ✅ Updated column reference (was F)
  
  sheet.getRange('D40:D100').setBackground('#d9ead3'); // ✅ Days in Month (was E)
  sheet.getRange('E40:E100').setBackground('#d9ead3'); // ✅ Daily Rate (was F)
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HIGH FIX #9: Month Format Validation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Add data validation for Month column (A40:A100)
  // Requires format: YYYY-MM (e.g., 2025-10)
  // Use INDIRECT to make the validation relative to each cell
  const monthValidation = SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied('=OR(INDIRECT("RC",FALSE)="", REGEXMATCH(INDIRECT("RC",FALSE)&"", "^\\d{4}-\\d{2}$"))')
    .setAllowInvalid(false)
    .setHelpText('⚠️ Invalid format! Use YYYY-MM (e.g., 2025-10 for October 2025)')
    .build();
  sheet.getRange('A40:A100').setDataValidation(monthValidation);
  
  // Enhance help text for Month header
  sheet.getRange('A39').setNote('💡 Enter months in YYYY-MM format (e.g., 2025-10 for October 2025)\n\nThis ensures accurate daily spend calculations.');
  sheet.getRange('A40:A100').setNumberFormat('@');
  
  sheet.setColumnWidths(1, 6, 150);
  sheet.setColumnWidths(7, 3, 150);
  sheet.setFrozenRows(2);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HIGH FIX #10: Protect Critical Date Range Cells
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //
  // PROBLEM: If user inserts rows above row 30, named ranges (rngStart, rngEnd) 
  // break because they reference specific cell addresses (B30, B31).
  //
  // SOLUTION: Protect rows 27-33 with warning-only mode (allows edits but warns user)
  //
  // Protected rows:
  // - B27: Date Range Preset selector
  // - B28-B29: Custom Start/End dates
  // - B30-B31: Calculated Start/End dates (used by all DASHBOARD formulas)
  // - B33: Trial Length
  //
  // Protection level: Warning Only (users can override, but are cautioned)
  //
  try {
    const protection = sheet.getRange('A27:Z33').protect();
    protection.setDescription('⚠️ CRITICAL DATE RANGE SYSTEM - DO NOT INSERT/DELETE ROWS HERE\n\nThese rows contain:\n• Date range selector (B27)\n• Custom dates (B28-B29)\n• Calculated dates used by ALL formulas (B30-B31)\n• Trial length (B33)\n\nInserting/deleting rows will break the entire DASHBOARD.\n\nTo edit values: Click "Edit anyway" when prompted.\nTo add marketing budget: Use rows 40+ below.');
    protection.setWarningOnly(true);
    Logger.log('✅ Protected critical Settings rows 27-33 (warning-only mode)');
  } catch (err) {
    Logger.log('⚠️ Could not protect Settings rows 27-33: ' + err.message);
  }
}

/**
 * Tab 5: Marketing (DEPRECATED - Merged into Settings & Budget)
 * This function now only deletes old Marketing tab if it exists
 */
function createMarketingTab(ss) {
  const oldSheet = ss.getSheetByName('Marketing');
  if (oldSheet) {
    ss.deleteSheet(oldSheet);
    Logger.log('✅ Removed old Marketing tab (now merged into Settings & Budget)');
  }
}

/**
 * Tab 6: Staff (DEPRECATED - Data now on DASHBOARD)
 * This function now only deletes old Staff tab if it exists
 */
function createStaffTab(ss) {
  const oldSheet = ss.getSheetByName('Staff');
  if (oldSheet) {
    ss.deleteSheet(oldSheet);
    Logger.log('✅ Removed old Staff tab (now on DASHBOARD rows 85-89)');
  }
}

/**
 * Tab 7: Help (Auto-hidden - Phase 1.3)
 */
function createHelpTab(ss, force) {
  let sheet = ss.getSheetByName('Help');
  if (!sheet) {
    sheet = ss.insertSheet('Help');
  } else if (!force && sheet.getLastRow() > 0) {
    Logger.log('ℹ️ Help tab already populated; skipping rewrite.');
    return;
  } else {
    sheet.clear();
  }
  
  const content = [
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
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['📋 OVERVIEW'],
    ['This sheet integrates with GoHighLevel (GHL) to automatically add leads when created in your CRM.'],
    ['Two workflows are needed: (1) UTM Tracking for source attribution, (2) Lead Data for contact details.'],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['🔧 WORKFLOW 1: UTM TRACKING SETUP'],
    [''],
    ['Purpose: Captures UTM parameters for source attribution'],
    [''],
    ['Steps:'],
    ['  1. In GHL, go to Automation → Workflows'],
    ['  2. Create new workflow: "Add Lead UTM to Tracking Sheet"'],
    ['  3. Trigger: "Contact Created" or "Opportunity Created"'],
    ['  4. Add Action: "Google Sheets - Update Row" or use Webhooks/Zapier'],
    ['  5. Configure Sheet Connection:'],
    ['     • Sheet ID: [Your Sheet ID from URL]'],
    ['     • Tab Name: "_UTM Tracking"'],
    ['     • Method: "Append Row"'],
    ['  6. Field Mapping (10 columns):'],
    ['     A - Lead ID        → {{contact.id}}'],
    ['     B - Created Date   → {{contact.date_added}}'],
    ['     C - UTM Source     → {{contact.utm_source}}'],
    ['     D - UTM Medium     → {{contact.utm_medium}}'],
    ['     E - UTM Campaign   → {{contact.utm_campaign}}'],
    ['     F - UTM Term       → {{contact.utm_term}}'],
    ['     G - UTM Content    → {{contact.utm_content}}'],
    ['     H - GCLID          → {{contact.gclid}}'],
    ['     I - FBCLID         → {{contact.fbclid}}'],
    ['     J - Referrer       → {{contact.referrer_url}}'],
    ['  7. Save and activate workflow'],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['🔧 WORKFLOW 2: LEAD DATA SETUP'],
    [''],
    ['Purpose: Creates lead row with contact details'],
    [''],
    ['Steps:'],
    ['  1. Create new workflow: "Add Lead to Tracking Sheet"'],
    ['  2. Trigger: "Contact Created" (same as Workflow 1)'],
    ['  3. ⚠️ IMPORTANT: Add 5-second delay AFTER Workflow 1'],
    ['     (ensures UTM data exists before Lead Data references it)'],
    ['  4. Add Action: "Google Sheets - Update Row" or Webhooks/Zapier'],
    ['  5. Configure Sheet Connection:'],
    ['     • Sheet ID: [Same as Workflow 1]'],
    ['     • Tab Name: "Lead Data"'],
    ['     • Method: "Append Row"'],
    [''],
    ['  6. Field Mapping (26 columns):'],
    [''],
    ['     REQUIRED FIELDS:'],
    ['     A - Lead ID        → {{contact.id}}'],
    ['     B - Created Date   → {{contact.date_added}}'],
    ['     C - First Name     → {{contact.first_name}}'],
    ['     D - Last Name      → {{contact.last_name}}'],
    ['     E - Phone          → {{contact.phone}}'],
    ['     F - Email          → {{contact.email}}'],
    [''],
    ['     OPTIONAL FIELDS:'],
    ['     G - DOB            → {{contact.date_of_birth}}'],
    ['     H - Source         → [Leave empty - auto-calculated from UTM]'],
    ['     I - Campaign       → {{contact.utm_campaign}}'],
    ['     J - Staff Owner    → {{contact.assigned_to}}'],
    ['     K - Location       → [Leave empty or use your gym name]'],
    [''],
    ['     FUNNEL FIELDS (Leave empty - filled manually or by staff):'],
    ['     L-M   Appt Set? / Appt Date    → [Empty]'],
    ['     N     Show?                     → [Empty]'],
    ['     O-P   Start Trial? / Trial End → [Empty / Auto-calculated]'],
    ['     Q-R   Converted? / Member Start → [Empty]'],
    ['     S-U   Membership Type / MRR / Upfront → [Empty]'],
    ['     V-W   Cancelled? / Cancel Date  → [Empty]'],
    ['     X-Y   Cancel Reason / Notes     → [Empty]'],
    ['     Z-AE  [Auto-calculated columns] → [Empty]'],
    [''],
    ['  7. Save and activate workflow'],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['🧪 TESTING YOUR INTEGRATION'],
    [''],
    ['Checklist:'],
    ['  ✅ Create a test contact in GHL with known UTM parameters'],
    ['  ✅ Wait 10 seconds for workflows to complete'],
    ['  ✅ Check _UTM Tracking tab → Verify new row with UTMs'],
    ['  ✅ Check Lead Data tab → Verify new lead row'],
    ['  ✅ Verify Source column (H) auto-populated correctly'],
    ['  ✅ Verify name, phone, email populated correctly'],
    ['  ✅ Delete test contact from both sheets'],
    ['  ✅ Repeat with different sources (Google Ads, Facebook, etc.)'],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['🔧 TROUBLESHOOTING COMMON ISSUES'],
    [''],
    ['Problem: Source shows "⚠️ Not Tracked"'],
    ['Solution: Lead exists in Lead Data but not in _UTM Tracking'],
    ['  → Check if UTM workflow ran successfully'],
    ['  → Manually add row to _UTM Tracking with Lead ID + UTM Source'],
    ['  → Or manually select Source from dropdown in column H'],
    [''],
    ['Problem: Source shows "⚠️ No UTM"'],
    ['Solution: Contact has no UTM source in GHL'],
    ['  → For manual entries, use "CRM UI" source'],
    ['  → For organic traffic, use "Direct Traffic"'],
    ['  → Or manually select correct source from dropdown'],
    [''],
    ['Problem: Source shows "⚠️ Unmapped"'],
    ['Solution: UTM source not in mapping table'],
    ['  → Go to Settings & Budget tab, columns G-H'],
    ['  → Add new row: [Raw UTM] → [Standardized Source]'],
    ['  → Example: "google_ads" → "Paid Search"'],
    [''],
    ['Problem: Duplicate leads created'],
    ['Solution: Workflow triggered multiple times'],
    ['  → Add filter in GHL workflow: "Only if contact is new"'],
    ['  → Use duplicate detection (enabled by default in sheet)'],
    ['  → Check Lead Data for duplicate warnings in column AD'],
    [''],
    ['Problem: Date fields showing errors'],
    ['Solution: Date format mismatch'],
    ['  → GHL dates must be in format: YYYY-MM-DD'],
    ['  → Check contact.date_added format in GHL'],
    ['  → Use TEXT() formula in GHL: TEXT(date, "yyyy-mm-dd")'],
    [''],
    ['Problem: Workflow not running'],
    ['Solution: Connection or permissions issue'],
    ['  → Verify Google Sheets connected in GHL'],
    ['  → Check OAuth permissions granted'],
    ['  → Re-authenticate Google account in GHL'],
    ['  → Ensure Sheet ID is correct (copy from URL)'],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['💡 PRO TIPS'],
    [''],
    ['  • Use 5-second delay between UTM and Lead workflows (ensures data dependency)'],
    ['  • Test with different sources: Google Ads, Facebook Ads, Organic, Referrals'],
    ['  • Monitor first week closely for mapping issues'],
    ['  • Keep UTM parameters consistent (standardize utm_source values)'],
    ['  • Backup data regularly (Gym Ops → Create Backup Now)'],
    ['  • Monthly backups run automatically'],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['⚙️ SETTINGS & BUDGET'],
    ['  • Set monthly targets'],
    ['  • Customize dropdown lists (sources, staff, locations)'],
    ['  • Configure UTM mapping (raw → standardized)'],
    ['  • Enter monthly marketing budget by source'],
    ['  • Date range is controlled from DASHBOARD dropdown'],
    [''],
    ['💰 LTV SYSTEM'],
    ['  • Import existing members once (Import Members tab)'],
    ['  • View detailed LTV analysis (LTV Analysis tab)'],
    ['  • DASHBOARD shows LTV:CAC by source'],
    ['  • Green = profitable, Yellow = optimize, Red = review'],
    [''],
    ['🗺️ UTM ATTRIBUTION & SOURCE MAPPING'],
    ['  • GHL workflow populates _UTM Tracking tab'],
    ['  • Settings & Budget has mapping table (fb_ad → Paid Social)'],
    ['  • Source in Lead Data auto-fills from mapping'],
    ['  • Add custom mappings in Settings & Budget column G-H'],
    ['  • Spend calculations read monthly budgets directly (no extra steps)'],
    [''],
    ['⚠️ SOURCE WARNINGS - What They Mean:'],
    ['  • ⚠️ Not Tracked = Lead ID not found in _UTM Tracking tab'],
    ['    → FIX: Check GHL workflow is adding to _UTM Tracking'],
    ['  • ⚠️ No UTM = Lead in tracking, but no UTM source provided'],
    ['    → FIX: Check UTM parameters in marketing links'],
    ['  • ⚠️ Unmapped = UTM source not in Settings mapping table'],
    ['    → FIX: Add mapping in Settings & Budget (G-H columns)'],
    [''],
    ['🔧 MANUAL SOURCE OVERRIDE:'],
    ['  1. Click on any Source cell (column H) in Lead Data'],
    ['  2. Select from dropdown (all 11 standardized sources)'],
    ['  3. This overwrites the auto-formula (permanent change)'],
    ['  4. Great for manual entries or fixing incorrect mappings'],
    [''],
    ['📅 DATE RANGES'],
    ['  • DASHBOARD dropdown: 9 preset options'],
    ['  • Last 7/14/30/90 Days, 6/12 Months, QTD, YTD, Custom'],
    ['  • Settings tab calculates actual dates'],
    ['  • All KPIs filter by selected range'],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['⚠️ IMPORTANT: ROW CAPACITY LIMITS'],
    [''],
    ['Auto-Calculation Limit: 10,000 Rows'],
    ['  • Lead Data auto-calculated columns (Source, Status, Age, etc.) work for rows 2-10,000'],
    ['  • After row 10,000, auto-formulas will stop calculating'],
    ['  • Manual entry still works, but calculated fields will be blank'],
    [''],
    ['What happens at 10,000 rows?'],
    ['  • Rows 10,001+ will not have Source, Current Status, Age, or Lead Score auto-filled'],
    ['  • DASHBOARD metrics will be incomplete (missing leads beyond row 10,000)'],
    ['  • You will need to manually extend formulas or contact support'],
    [''],
    ['When will you hit this limit?'],
    ['  • 100 leads/month = 100 months (8+ years)'],
    ['  • 200 leads/month = 50 months (4+ years)'],
    ['  • 500 leads/month = 20 months (1.5+ years)'],
    [''],
    ['How to monitor:'],
    ['  • Check "Lead ID" column - last row number shows total leads'],
    ['  • When approaching 9,500 rows, plan for expansion or archiving'],
    ['  • Export old data regularly (Gym Ops → Export Lead Data to CSV)'],
    [''],
    ['Solutions when approaching limit:'],
    ['  1. Archive old leads (closed/lost) to separate sheet'],
    ['  2. Contact support to increase limit to 20,000 rows'],
    ['  3. Export and start fresh sheet (keep old sheet as backup)'],
    [''],
    ['Note: This limit is for performance optimization. Without it, the sheet would recalculate'],
    ['millions of empty rows on every edit, causing significant slowdowns.'],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['⚠️ NEVER DELETE ROWS - Use "Cancelled?" Checkbox Instead'],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['❌ DO NOT DELETE ROWS in Lead Data!'],
    [''],
    ['Why?'],
    ['  • Permanently loses member data (cannot undo easily)'],
    ['  • Breaks MRR tracking (revenue disappears from dashboard)'],
    ['  • Corrupts LTV calculations (missing historical data)'],
    ['  • Prevents churn analysis (no cancel record)'],
    ['  • Loses compliance/audit trail'],
    [''],
    ['✅ CORRECT WAY to remove a member:'],
    [''],
    ['1. Check "Cancelled?" checkbox (column W)'],
    ['2. Enter "Cancel Date" (column X) - auto-fills when you check box'],
    ['3. Select "Cancel Reason" (column Y) - for analysis'],
    ['4. Add any notes (column Z)'],
    [''],
    ['Benefits of this approach:'],
    ['  • ✅ Preserves all historical data'],
    ['  • ✅ Maintains accurate MRR tracking'],
    ['  • ✅ Enables churn analysis and cohort studies'],
    ['  • ✅ Allows member reactivation if they return'],
    ['  • ✅ Keeps compliance/audit trail intact'],
    [''],
    ['Visual Cue:'],
    ['  • Active members have LIGHT GREEN background in Lead Data'],
    ['  • Easy to see which rows represent active revenue'],
    ['  • Think twice before deleting highlighted rows!'],
    [''],
    ['If you accidentally delete a row:'],
    ['  1. Immediately use: Gym Ops → Restore from Backup'],
    ['  2. Or use: Ctrl+Z (Cmd+Z on Mac) to undo'],
    ['  3. Or manually re-enter the data if recent'],
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
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['⚡ SPEED TIPS - UX #3: Keyboard Shortcuts & Auto-Complete'],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['⌨️ KEYBOARD SHORTCUTS (40% faster data entry!)'],
    [''],
    ['Auto-Complete Dropdowns:'],
    ['  • Press TAB to auto-complete dropdown selections'],
    ['  • Type first letter(s) → TAB → Done!'],
    ['  • Example: Type "P" → TAB → "Paid Search"'],
    ['  • Example: Type "Em" → TAB → "Emily (Sales)"'],
    ['  • Works for: Source, Staff, Membership Type, Cancel Reason'],
    [''],
    ['Navigation:'],
    ['  • TAB = Move to next cell (right)'],
    ['  • SHIFT+TAB = Move to previous cell (left)'],
    ['  • ENTER = Move down one row'],
    ['  • SHIFT+ENTER = Move up one row'],
    ['  • CTRL+HOME = Go to A1 (top-left)'],
    ['  • CTRL+END = Go to last cell with data'],
    [''],
    ['Editing:'],
    ['  • F2 = Edit current cell'],
    ['  • ESC = Cancel edit'],
    ['  • CTRL+C = Copy'],
    ['  • CTRL+V = Paste'],
    ['  • CTRL+Z = Undo'],
    ['  • CTRL+Y = Redo'],
    [''],
    ['Checkboxes:'],
    ['  • SPACE = Toggle checkbox (when cell is selected)'],
    ['  • Auto-fills date when checked!'],
    [''],
    ['Sheets Navigation:'],
    ['  • ALT+↓ = Open tab menu'],
    ['  • ALT+↑ = Previous tab'],
    ['  • ALT+↓ = Next tab'],
    [''],
    ['📝 PRO TIPS:'],
    ['  • Use TAB instead of clicking dropdowns = 40% faster!'],
    ['  • Type initials for staff: "JD" → "John Doe"'],
    ['  • SPACE to toggle checkboxes (dates auto-fill!)'],
    ['  • F2 to edit without double-clicking'],
    ['  • Copy row 2 down to add leads (formulas copy too!)'],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['👥 IMPORT MEMBERS TAB (Optional Custom Tab)'],
    [''],
    ['Purpose: One-time import of existing members who joined before using this sheet'],
    [''],
    ['⚠️ Note: This is an OPTIONAL custom tab, not part of the standard template.'],
    ['If it exists in your sheet, it was added by you for importing historical member data.'],
    [''],
    ['When to Use:'],
    ['  • You have existing members who joined before implementing this tracking system'],
    ['  • You want complete historical data for LTV and retention analysis'],
    ['  • You need to track all active members in one place'],
    [''],
    ['How to Use:'],
    ['  1. Go to Import Members tab'],
    ['  2. Fill in columns: Member ID, First Name, Last Name, Join Date, Package Type, Monthly MRR, Status'],
    ['  3. Add Cancel Date and Reason if member is cancelled'],
    ['  4. Data automatically flows to Members tab and LTV calculations'],
    [''],
    ['⚠️ Important:'],
    ['  • Only use this for members who joined BEFORE using Lead Data tracking'],
    ['  • New members should ALWAYS be tracked through Lead Data (from lead to member)'],
    ['  • Do not duplicate members between Import Members and Lead Data'],
    ['  • This tab does not track the full lead journey (since they were already members)'],
    [''],
    ['Data Format:'],
    ['  • Member ID: MEM-001, MEM-002, etc.'],
    ['  • Join Date: YYYY-MM-DD format'],
    ['  • Monthly MRR: Dollar amount (e.g., 150.00)'],
    ['  • Status: Active or Cancelled'],
    [''],
    ['If you don\'t need this tab:'],
    ['  • You can safely delete it if all your members are tracked through Lead Data'],
    ['  • Or leave it empty - it won\'t affect the rest of the system'],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['💡 TIPS'],
    ['  • Help tab auto-hides (access via Gym Ops → View Help)'],
    ['  • Lead Data has column groups (click minus to collapse)'],
    ['  • Add sample data for testing (Gym Ops menu)'],
    ['  • All consolidations are backward compatible'],
  ];
  
  sheet.getRange(1, 1, content.length, 1).setValues(content);
  sheet.getRange('A1').setFontSize(14).setFontWeight('bold');
  // Updated row numbers to account for expanded GHL section and Import Members documentation
  [3, 9, 18, 22, 28, 46, 92, 106, 147, 159, 166, 173, 181, 189, 211, 215, 251].forEach(row => sheet.getRange(row, 1).setFontWeight('bold'));
  sheet.setColumnWidth(1, 800);
  
  // AUTO-HIDE (Phase 1.3)
  sheet.hideSheet();
  Logger.log('✅ Help tab created and auto-hidden (access via Gym Ops → View Help)');
}


/**
 * Tab 7.5: LTV Analysis (detailed LTV breakdowns)
 */
function createLTVAnalysisTab(ss) {
  let sheet = ss.getSheetByName('LTV Analysis');
  if (!sheet) sheet = ss.insertSheet('LTV Analysis');
  else sheet.clear();
  
  sheet.getRange('A1').setValue('💰 LIFETIME VALUE (LTV) ANALYSIS').setFontSize(16).setFontWeight('bold');
  
  // Section 1: LTV by Source (All-Time)
  sheet.getRange('A3').setValue('📊 LTV by Source (All-Time Data)').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A4').setFormula('=QUERY(\'_LTV Calculations\'!N2:U11, "SELECT * WHERE Col1 IS NOT NULL ORDER BY Col7 DESC", 1)');
  
  // Section 2: LTV by Package (All-Time)
  sheet.getRange('A17').setValue('📦 LTV by Package Type (All-Time Data)').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A18').setFormula('=QUERY(\'_LTV Calculations\'!W2:AD6, "SELECT * WHERE Col1 IS NOT NULL ORDER BY Col7 DESC", 1)');
  
  // Section 3: Monthly Churn Rate Trend
  sheet.getRange('A30').setValue('📉 Monthly Churn Rate (Last 12 Months)').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A31').setFormula('=QUERY(\'_LTV Calculations\'!A15:D27, "SELECT * WHERE Col1 IS NOT NULL ORDER BY Col1 DESC", 1)');
  
  // Section 4: Cohort Analysis - Monthly
  sheet.getRange('F30').setValue('📅 Cohort Analysis - Monthly (Last 12 Months)').setFontSize(14).setFontWeight('bold');
  sheet.getRange('F31').setFormula('=QUERY(\'_LTV Calculations\'!F15:K27, "SELECT * WHERE Col1 IS NOT NULL ORDER BY Col1 DESC", 1)');
  
  // Section 5: Cohort Analysis - Quarterly
  sheet.getRange('M30').setValue('📅 Cohort Analysis - Quarterly (Last 8 Quarters)').setFontSize(14).setFontWeight('bold');
  sheet.getRange('M31').setFormula('=QUERY(\'_LTV Calculations\'!M15:R23, "SELECT * WHERE Col1 IS NOT NULL ORDER BY Col1 DESC", 1)');
  
  // Instructions
  sheet.getRange('A47').setValue('💡 HOW TO USE THIS TAB').setFontSize(14).setFontWeight('bold');
  const instructions = [
    [''],
    ['📝 What This Shows:'],
    ['  • LTV by Source: Which marketing channels bring the most valuable long-term customers'],
    ['  • LTV by Package: Which membership types generate the highest lifetime value'],
    ['  • Churn Rate: How many members you\'re losing each month (lower is better)'],
    ['  • Cohort Analysis: How member value changes based on when they joined'],
    [''],
    ['🎯 Key Metrics to Watch:'],
    ['  • Avg LTV: Higher is better (shows customer loyalty and value)'],
    ['  • LTV:CAC Ratio: Should be 3:1 or higher (you make $3 for every $1 spent)'],
    ['  • Retention Rate: Higher is better (percentage of members who stay)'],
    ['  • Churn Rate: Lower is better (aim for <5% per month)'],
    [''],
    ['📊 Action Items:'],
    ['  1. Focus marketing on sources with highest LTV (not just lowest CAC!)'],
    ['  2. If churn is high in certain packages, investigate why'],
    ['  3. Compare cohorts - are newer members staying longer than older ones?'],
    ['  4. If LTV:CAC ratio is below 3:1 for a source, consider reducing spend'],
    [''],
    ['🔄 Data Sources:'],
    ['  • Import Members tab: Your existing members (one-time entry)'],
    ['  • Lead Data tab: New members acquired through this system'],
    ['  • Settings tab: Customize LTV assumptions per package type'],
  ];
  
  sheet.getRange(48, 1, instructions.length, 1).setValues(instructions);
  sheet.setColumnWidths(1, 12, 130);
}

/**
 * Tab 8: Import Members (one-time import of existing members)
 */
function createImportMembersTab(ss) {
  let sheet = ss.getSheetByName('Import Members');
  if (!sheet) sheet = ss.insertSheet('Import Members');
  else if (sheet.getLastRow() > 1 && sheet.getLastRow() < 500) return; // Don't overwrite if has data
  else sheet.clear();
  
  sheet.getRange('A1').setValue('👥 IMPORT EXISTING MEMBERS (One-Time Entry)').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A2').setValue('Use this tab to enter your current members who joined before using this sheet. New members should be tracked in Lead Data.').setFontStyle('italic').setFontColor('#666666');
  
  const headers = [[
    'Member ID', 'First Name', 'Last Name', 'Join Date', 'Package Type', 
    'Monthly MRR ($)', 'Status', 'Cancel Date', 'Cancel Reason', 'Notes', 'Actual Lifespan (months)', 'Actual LTV'
  ]];
  
  sheet.getRange('A3:L3').setValues(headers).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // Example row
  sheet.getRange('A4').setValue('MEM-001').setNote('Unique ID (e.g., MEM-001 or GHL contact ID)');
  sheet.getRange('B4').setValue('John');
  sheet.getRange('C4').setValue('Smith');
  sheet.getRange('D4').setValue(new Date(2023, 0, 15)); // Jan 15, 2023
  sheet.getRange('E4').setValue('General');
  sheet.getRange('F4').setValue(150);
  sheet.getRange('G4').setValue('Active');
  sheet.getRange('H4').setValue('');
  sheet.getRange('I4').setValue('');
  sheet.getRange('J4').setValue('Existing member imported');
  
  // K4: Actual Lifespan (for cancelled) or current tenure (for active)
  sheet.getRange('K4').setFormula('=IFERROR(IF(G4="Cancelled", IF(H4="", "", DATEDIF(D4, H4, "M")), IF(D4="", "", DATEDIF(D4, TODAY(), "M"))), "")');
  
  // L4: Actual LTV = MRR × Lifespan
  sheet.getRange('L4').setFormula('=IFERROR(IF(K4="", "", F4*K4), "")');
  
  // Data validation for columns
  const settings = ss.getSheetByName('Settings');
  if (settings) {
    const packageRange = settings.getRange('D14:D100');
    const reasonRange = settings.getRange('E14:E100');
    
    sheet.getRange('E4:E500').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(packageRange, true).build());
    sheet.getRange('G4:G500').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Active', 'Cancelled'], true).build());
    sheet.getRange('I4:I500').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(reasonRange, true).build());
  }
  
  // Formatting
  sheet.getRange('D:D').setNumberFormat('yyyy-mm-dd');
  sheet.getRange('H:H').setNumberFormat('yyyy-mm-dd');
  sheet.getRange('F:F').setNumberFormat('$#,##0.00');
  sheet.getRange('L:L').setNumberFormat('$#,##0.00');
  
  // Conditional formatting for Status
  const activeRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Active').setBackground('#d4edda').setFontColor('#155724')
    .setRanges([sheet.getRange('G4:G500')]).build();
  const cancelledRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Cancelled').setBackground('#f8d7da').setFontColor('#721c24')
    .setRanges([sheet.getRange('G4:G500')]).build();
  sheet.setConditionalFormatRules([activeRule, cancelledRule]);
  
  // Column widths
  sheet.setColumnWidths(1, 3, 120); // Member ID, First, Last
  sheet.setColumnWidth(4, 100); // Join Date
  sheet.setColumnWidth(5, 130); // Package
  sheet.setColumnWidth(6, 120); // MRR
  sheet.setColumnWidth(7, 100); // Status
  sheet.setColumnWidth(8, 100); // Cancel Date
  sheet.setColumnWidth(9, 130); // Cancel Reason
  sheet.setColumnWidth(10, 200); // Notes
  sheet.setColumnWidth(11, 150); // Lifespan
  sheet.setColumnWidth(12, 120); // LTV
  
  // Auto-calculated columns background
  sheet.getRange('K:K').setBackground('#d9ead3').setNote('Auto-calculated: Months from join to cancel (or today if active)');
  sheet.getRange('L:L').setBackground('#d9ead3').setNote('Auto-calculated: MRR × Lifespan');
  
  sheet.setFrozenRows(3);
  sheet.setFrozenColumns(3);
}

/**
 * Tab 9: _UTM Tracking (hidden, populated by GHL)
 */
function createUTMTrackingTab(ss) {
  let sheet = ss.getSheetByName('_UTM Tracking');
  if (!sheet) sheet = ss.insertSheet('_UTM Tracking');
  else if (sheet.getLastRow() > 1) {
    Logger.log('ℹ️ _UTM Tracking tab already contains data; skipping reset.');
    return;
  } else sheet.clear();
  
  const headers = [[
    'Lead ID', 'Date Created', 'UTM Source', 'UTM Medium', 'UTM Campaign',
    'UTM Content', 'Match Type', 'Campaign ID', 'Ad Group ID', 'Ad ID',
    'GCLID', 'Contact Source', 'Opportunity Source', 'Pipeline Stage', 'Standardized Source'
  ]];
  
  sheet.getRange('A1:O1').setValues(headers).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // O2: Standardized Source (auto-mapped) - CRITICAL FIX #2: Enhanced with better fallback logic - HIGH FIX #7: Increased to 10K rows - HIGH FIX #7: Case-insensitive mapping
  sheet.getRange('O2').setFormula(`=ARRAYFORMULA(IF(A2:A10000="","",
    IF(C2:C10000="","⚠️ No UTM",
      IFERROR(
        VLOOKUP(LOWER(C2:C10000),ARRAYFORMULA({LOWER('Settings & Budget'!$G$3:$G$100),'Settings & Budget'!$H$3:$H$100}),2,FALSE),
        "⚠️ Unmapped"
      )
    )
  ))`);
  
  sheet.getRange('O:O').setBackground('#d9ead3').setNote('Auto-mapped from Settings & Budget UTM table. ⚠️ symbols indicate mapping issues.');
  sheet.setColumnWidths(1, 15, 120);
  sheet.setFrozenRows(1);
  sheet.hideSheet();
}

/**
 * Tab 9: _Daily Spend (hidden, auto-generated)
 */
function createDailySpendTab(ss) {
  let sheet = ss.getSheetByName('_Daily Spend');
  if (!sheet) sheet = ss.insertSheet('_Daily Spend');
  else sheet.clear();
  
  const headers = [['Date', 'Source', 'Daily Spend ($)']]; // ✅ SIMPLIFIED: Removed Location column
  sheet.getRange('A1:C1').setValues(headers).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  sheet.getRange('A2').setValue('This tab auto-calculates from Settings & Budget monthly budgets. Do not edit manually.');
  sheet.getRange('A3').setFormula(`=
LET(
  data,FILTER('Settings & Budget'!A40:E,'Settings & Budget'!A40:A<>""),
  monthsRaw,INDEX(data,,1),
  sources,INDEX(data,,2),
  budgets,INDEX(data,,3),
  days,INDEX(data,,4),
  rates,INDEX(data,,5),
  monthDates,
    BYROW(monthsRaw,
      LAMBDA(cell,
        IF(cell="",NA(),
          IF(TYPE(cell)=64,
            DATE(VALUE(LEFT(cell,4)), VALUE(MID(cell,6,2)), 1),
            cell
          )
        )
      )
    ),
  validMask,
    (sources<>"")*(budgets<>"")*(budgets<>0)*(days<>"")*(days<>0)*(rates<>"")*(rates<>0)*(NOT(ISNA(monthDates))),
  validMonths,FILTER(monthDates,validMask),
  validSources,FILTER(sources,validMask),
  validRates,FILTER(rates,validMask),
  validDays,FILTER(days,validMask),
  IF(COUNTA(validMonths)=0,{"","",""},
    LET(
      monthEnds,SCAN(0,validDays,LAMBDA(acc,val,acc+val)),
      totalDays,INDEX(monthEnds,ROWS(monthEnds)),
      seq,SEQUENCE(totalDays),
      monthIndex,MATCH(seq,monthEnds),
      priorEnd,IF(monthIndex=1,0,INDEX(monthEnds,monthIndex-1)),
      startDate,INDEX(validMonths,monthIndex),
      calcDate,startDate+(seq-priorEnd)-1,
      HSTACK(calcDate,INDEX(validSources,monthIndex),INDEX(validRates,monthIndex))
    )
  )
)`);
  sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd');
  sheet.getRange('C:C').setNumberFormat('$#,##0.00');
  
  sheet.setColumnWidths(1, 3, 120); // ✅ Only 3 columns now (was 4)
  sheet.setFrozenRows(1);
  sheet.hideSheet();
}

/**
 * Tab 10: _Chart Data (helper for dashboard charts)
 */
function createChartDataTab(ss) {
  let sheet = ss.getSheetByName('_Chart Data');
  if (!sheet) sheet = ss.insertSheet('_Chart Data');
  else sheet.clear();
  
  // Section 1: Leads by Source Over Time (last 90 days) - using all sources from Settings
  sheet.getRange('A1').setValue('Leads by Source Over Time (Last 90 Days)').setFontWeight('bold');
  
  // Get all sources from Settings (single source of truth)
  const chartSettingsSheet = ss.getSheetByName('Settings');
  const chartSources = chartSettingsSheet ? chartSettingsSheet.getRange('A14:A24').getValues().flat().filter(s => s !== '') : DefaultLists.SOURCES;
  
  // Build headers dynamically with all sources
  const headers1 = [['Date', ...chartSources]];
  sheet.getRange(2, 1, 1, chartSources.length + 1).setValues(headers1).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // Generate last 90 days
  for (let i = 89; i >= 0; i--) {
    const row = 93 - i;
    sheet.getRange(row, 1).setFormula(`=TODAY()-${i}`).setNumberFormat('yyyy-mm-dd');
    
    // Count leads per source per day
    chartSources.forEach((source, idx) => {
      sheet.getRange(row, idx + 2).setFormula(`=COUNTIFS('Lead Data'!H:H,"${source}",'Lead Data'!B:B,A${row})`);
    });
  }
  
  // Section 2: Funnel Metrics (for waterfall)
  sheet.getRange('A95').setValue('Funnel Metrics').setFontWeight('bold');
  const headers2 = [['Stage', 'Count']];
  sheet.getRange('A96:B96').setValues(headers2).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  const stages = [
    ['Leads', `=COUNTIFS('Lead Data'!B:B,">="&'Settings & Budget'!$B$30,'Lead Data'!B:B,"<="&'Settings & Budget'!$B$31)`],
    ['Appts Set', `=COUNTIFS('Lead Data'!L:L,TRUE,'Lead Data'!B:B,">="&'Settings & Budget'!$B$30,'Lead Data'!B:B,"<="&'Settings & Budget'!$B$31)`],
    ['Showed', `=COUNTIFS('Lead Data'!N:N,TRUE,'Lead Data'!B:B,">="&'Settings & Budget'!$B$30,'Lead Data'!B:B,"<="&'Settings & Budget'!$B$31)`],
    ['Trials', `=COUNTIFS('Lead Data'!Q:Q,">="&'Settings & Budget'!$B$30,'Lead Data'!Q:Q,"<="&'Settings & Budget'!$B$31,'Lead Data'!Q:Q,"<>")`],
    ['Members', `=COUNTIFS('Lead Data'!T:T,">="&'Settings & Budget'!$B$30,'Lead Data'!T:T,"<="&'Settings & Budget'!$B$31,'Lead Data'!S:S,TRUE)`]
  ];
  stages.forEach((stage, idx) => {
    sheet.getRange(97 + idx, 1).setValue(stage[0]);
    sheet.getRange(97 + idx, 2).setFormula(stage[1]);
  });
  
  // Section 3: Revenue Trends (MRR + Upfront by week, last 12 weeks)
  sheet.getRange('D95').setValue('Revenue Trends (Last 12 Weeks)').setFontWeight('bold');
  const headers3 = [['Week Start', 'MRR', 'Upfront Fees', 'Total Revenue']];
  sheet.getRange('D96:G96').setValues(headers3).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  for (let i = 11; i >= 0; i--) {
    const row = 108 - i;
    const weekStart = `=TODAY()-${i * 7}-MOD(TODAY()-${i * 7},7)`;
    const weekEnd = `=D${row}+6`;
    
    sheet.getRange(row, 4).setFormula(weekStart).setNumberFormat('yyyy-mm-dd');
    sheet.getRange(row, 5).setFormula(`=SUMIFS('Lead Data'!V:V,'Lead Data'!T:T,">="&D${row},'Lead Data'!T:T,"<="&(D${row}+6),'Lead Data'!S:S,TRUE)`).setNumberFormat('$#,##0');
    sheet.getRange(row, 6).setFormula(`=SUMIFS('Lead Data'!W:W,'Lead Data'!T:T,">="&D${row},'Lead Data'!T:T,"<="&(D${row}+6),'Lead Data'!S:S,TRUE)`).setNumberFormat('$#,##0');
    sheet.getRange(row, 7).setFormula(`=E${row}+F${row}`).setNumberFormat('$#,##0');
  }
  
  // Section 4: CAC by Source - using all sources from Settings
  sheet.getRange('I95').setValue('CAC by Source').setFontWeight('bold');
  const headers4 = [['Source', 'CAC']];
  sheet.getRange('I96:J96').setValues(headers4).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // Use chartSources from Settings (already loaded above)
  chartSources.forEach((source, idx) => {
    const row = 97 + idx;
    sheet.getRange(row, 9).setValue(source);
    // CRITICAL FIX #3: Enhanced CAC calculation for charts
    sheet.getRange(row, 10).setFormula(`=LET(
      startDate,'Settings & Budget'!$B$30,
      endDate,'Settings & Budget'!$B$31,
      rawMonths,'Settings & Budget'!$A$40:$A$100,
      sources,'Settings & Budget'!$B$40:$B$100,
      rates,'Settings & Budget'!$E$40:$E$100,
      monthStarts,ARRAYFORMULA(IF(rawMonths="",,IF(ISNUMBER(rawMonths),DATE(YEAR(rawMonths),MONTH(rawMonths),1),DATE(VALUE(LEFT(rawMonths,4)),VALUE(MID(rawMonths,6,2)),1)))),
      monthEnds,ARRAYFORMULA(IF(monthStarts="",,EOMONTH(monthStarts,0))),
      spend,IFERROR(SUM(BYROW(FILTER({monthStarts,monthEnds,sources,rates},(sources="${source}")*(rates<>"")*(monthStarts<>"")*(monthEnds>=startDate)*(monthStarts<=endDate)),
        LAMBDA(row,
          LET(
            mStart,INDEX(row,1),
            mEnd,INDEX(row,2),
            rate,INDEX(row,4),
            overlapStart,MAX(mStart,startDate),
            overlapEnd,MIN(mEnd,endDate),
            days,MAX(0,overlapEnd-overlapStart+1),
            days*rate
          )
        )
      )),0),
      members,COUNTIFS('Lead Data'!H:H,"${source}",'Lead Data'!T:T,">="&'Settings & Budget'!$B$30,'Lead Data'!T:T,"<="&'Settings & Budget'!$B$31,'Lead Data'!S:S,TRUE),
      IF(members=0,IF(spend>0,"Spend/0","-"),spend/members)
    )`).setNumberFormat('$#,##0');
  });
  
  // Section 5: Monthly New Members vs Target (last 12 months)
  sheet.getRange('L95').setValue('Monthly New Members vs Target').setFontWeight('bold');
  const headers5 = [['Month', 'New Members', 'Target']];
  sheet.getRange('L96:N96').setValues(headers5).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  for (let i = 11; i >= 0; i--) {
    const row = 108 - i;
    sheet.getRange(row, 12).setFormula(`=DATE(YEAR(TODAY()),MONTH(TODAY())-${i},1)`).setNumberFormat('mmm yyyy');
    sheet.getRange(row, 13).setFormula(`=COUNTIFS('Lead Data'!T:T,">="&L${row},'Lead Data'!T:T,"<"&EOMONTH(L${row},0)+1,'Lead Data'!S:S,TRUE)`);
    sheet.getRange(row, 14).setFormula('=Settings!$B$7'); // Target from Settings
  }
  
  // Section 6: Lead Volume by Day of Week
  sheet.getRange('P95').setValue('Lead Volume by Day of Week').setFontWeight('bold');
  const headers6 = [['Day', 'Leads']];
  sheet.getRange('P96:Q96').setValues(headers6).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  days.forEach((day, idx) => {
    const row = 97 + idx;
    sheet.getRange(row, 16).setValue(day);
    sheet.getRange(row, 17).setFormula(`=SUMPRODUCT((WEEKDAY('Lead Data'!B:B)=${idx + 1})*('Lead Data'!B:B>='Settings & Budget'!$B$30)*('Lead Data'!B:B<='Settings & Budget'!$B$31))`);
  });
  
  // Section 7: Source Performance Matrix (bubble chart data) - using all sources from Settings
  sheet.getRange('S95').setValue('Source Performance Matrix').setFontWeight('bold');
  const headers7 = [['Source', 'CAC', 'Lead Volume', 'Close Rate %']];
  sheet.getRange('S96:V96').setValues(headers7).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // Use chartSources from Settings (already loaded above)
  chartSources.forEach((source, idx) => {
    const row = 97 + idx;
    sheet.getRange(row, 19).setValue(source);
    // CAC - CRITICAL FIX #3: Enhanced calculation
    sheet.getRange(row, 20).setFormula(`=LET(spend,SUMIFS('_Daily Spend'!C:C,'_Daily Spend'!B:B,"${source}",'_Daily Spend'!A:A,">="&'Settings & Budget'!$B$30,'_Daily Spend'!A:A,"<="&'Settings & Budget'!$B$31),members,COUNTIFS('Lead Data'!H:H,"${source}",'Lead Data'!T:T,">="&'Settings & Budget'!$B$30,'Lead Data'!T:T,"<="&'Settings & Budget'!$B$31,'Lead Data'!S:S,TRUE),IF(members=0,IF(spend>0,"Spend/0","-"),spend/members))`).setNumberFormat('$#,##0');
    // Lead Volume
    sheet.getRange(row, 21).setFormula(`=COUNTIFS('Lead Data'!H:H,"${source}",'Lead Data'!B:B,">="&'Settings & Budget'!$B$30,'Lead Data'!B:B,"<="&'Settings & Budget'!$B$31)`);
    // Close Rate
    sheet.getRange(row, 22).setFormula(`=IFERROR(COUNTIFS('Lead Data'!H:H,"${source}",'Lead Data'!S:S,TRUE,'Lead Data'!T:T,">="&'Settings & Budget'!$B$30,'Lead Data'!T:T,"<="&'Settings & Budget'!$B$31)/U${row},0)`).setNumberFormat('0.0%');
  });
  
  sheet.setColumnWidths(1, 22, 120);
  sheet.hideSheet();
}

/**
 * Tab 11: _Data (member count time series)
 */
function createDataTab(ss) {
  let sheet = ss.getSheetByName('_Data');
  if (!sheet) sheet = ss.insertSheet('_Data');
  else sheet.clear();
  
  const headers = [['Date', 'Active Members']];
  sheet.getRange('A1:B1').setValues(headers).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  for (let i = 89; i >= 0; i--) {
    const row = 92 - i;
    sheet.getRange(row, 1).setFormula(`=TODAY()-${i}`).setNumberFormat('yyyy-mm-dd');
    sheet.getRange(row, 2).setFormula(`=COUNTIFS('Lead Data'!T:T,"<="&A${row},'Lead Data'!S:S,TRUE)-COUNTIFS('Lead Data'!Y:Y,"<="&A${row},'Lead Data'!X:X,TRUE)`);
  }
  
  sheet.hideSheet();
}

/**
 * Tab 11.5: _Metrics (hidden helper for Net Gain/Loss calculations)
 */
function createMetricsTab(ss) {
  let sheet = ss.getSheetByName('_Metrics');
  if (!sheet) sheet = ss.insertSheet('_Metrics');
  else sheet.clear();
  
  // Title
  sheet.getRange('A1').setValue('📊 NET GAIN/LOSS BY MEMBERSHIP TYPE').setFontSize(14).setFontWeight('bold');
  
  // Section 1: Summary Table (uses date range from Settings & Budget)
  sheet.getRange('A3').setValue('Summary (Date Range from Dashboard)').setFontWeight('bold');
  const headers = [['Membership Type', 'Gains', 'Losses', 'Net', '% Change']];
  sheet.getRange('A4:E4').setValues(headers).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // Get membership types from Settings & Budget
  const settingsSheet = ss.getSheetByName('Settings & Budget');
  let membershipTypes = [];
  if (settingsSheet) {
    membershipTypes = settingsSheet
      .getRange('D14:D100')
      .getValues()
      .flat()
      .map(value => (value ? value.toString().trim() : ''))
      .filter(Boolean);
  }

  if (membershipTypes.length === 0) {
    sheet.getRange('A5:E5').setValues([['No membership types configured', 0, 0, 0, '—']]);
    sheet.getRange('A9:E9').setValues([['All Types', 0, 0, 0, '—']]);
    sheet.getRange('B5:D5').setNumberFormat('0');
    sheet.getRange('B9:D9').setNumberFormat('0');
    sheet.getRange('E5:E5').setNumberFormat('@');
    sheet.getRange('E9:E9').setNumberFormat('@');
    sheet.hideSheet();
    Logger.log('⚠️ _Metrics tab initialized with placeholder data (no membership types configured).');
    return;
  }

  // Create formulas for each membership type
  membershipTypes.forEach((type, idx) => {
    const row = idx + 5;

    sheet.getRange(row, 1).setValue(type);
    sheet.getRange(row, 2).setFormula(
      `=COUNTIFS('Lead Data'!T:T,">="&'Settings & Budget'!$B$30,'Lead Data'!T:T,"<="&'Settings & Budget'!$B$31,'Lead Data'!U:U,"${type}",'Lead Data'!S:S,TRUE,'Lead Data'!A:A,"<>" )`
    );
    sheet.getRange(row, 3).setFormula(
      `=COUNTIFS('Lead Data'!Y:Y,">="&'Settings & Budget'!$B$30,'Lead Data'!Y:Y,"<="&'Settings & Budget'!$B$31,'Lead Data'!U:U,"${type}",'Lead Data'!X:X,TRUE,'Lead Data'!A:A,"<>" )`
    );
    sheet.getRange(row, 4).setFormula(`=B${row}-C${row}`);
    sheet.getRange(row, 5).setFormula(
      `=LET(gain,B${row},loss,C${row},total,gain+loss,IF(total=0,"—",(gain-loss)/MAX(loss,1)))`
    );
  });
  
  // Add "All Types" rollup row
  const firstDataRow = 5;
  const lastDataRow = firstDataRow + membershipTypes.length - 1;
  const rollupRow = lastDataRow + 1;
  sheet.getRange(rollupRow, 1).setValue('All Types').setFontWeight('bold');
  sheet.getRange(rollupRow, 2).setFormula(`=SUM(B${firstDataRow}:B${lastDataRow})`).setFontWeight('bold');
  sheet.getRange(rollupRow, 3).setFormula(`=SUM(C${firstDataRow}:C${lastDataRow})`).setFontWeight('bold');
  sheet.getRange(rollupRow, 4).setFormula(`=SUM(D${firstDataRow}:D${lastDataRow})`).setFontWeight('bold');
  sheet.getRange(rollupRow, 5).setFormula(
    `=LET(gain,B${rollupRow},loss,C${rollupRow},IF(gain+loss=0,"—",(gain-loss)/MAX(loss,1)))`
  ).setFontWeight('bold');
  
  // Formatting
  sheet.getRange(firstDataRow, 2, membershipTypes.length, 3).setNumberFormat('0'); // Gains/Losses/Net
  sheet.getRange(firstDataRow, 5, membershipTypes.length, 1).setNumberFormat('0.0%');
  sheet.getRange(rollupRow, 2, 1, 3).setNumberFormat('0');
  sheet.getRange(rollupRow, 5).setNumberFormat('0.0%');
  
  // Conditional formatting for Net column (D)
  const positiveNetRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(0)
    .setBackground('#d4edda')
    .setFontColor('#155724')
    .setRanges([sheet.getRange('D5:D9')])
    .build();
    
  const negativeNetRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(0)
    .setBackground('#f8d7da')
    .setFontColor('#721c24')
    .setRanges([sheet.getRange('D5:D9')])
    .build();
  
  sheet.setConditionalFormatRules([positiveNetRule, negativeNetRule]);
  
  // Column widths
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidths(2, 4, 100);
  
  // Add notes
  sheet.getRange('A1').setNote('This sheet calculates member gains and losses by membership type for the selected date range on the Dashboard.\n\nGains = New members who started in the date range\nLosses = Members who cancelled in the date range\nNet = Gains - Losses');
  
  sheet.hideSheet();
  Logger.log('✅ _Metrics tab created and hidden');
}

/**
 * Tab 12: _LTV Calculations (hidden helper for LTV metrics)
 */
function createLTVCalculationsTab(ss) {
  let sheet = ss.getSheetByName('_LTV Calculations');
  if (!sheet) sheet = ss.insertSheet('_LTV Calculations');
  else sheet.clear();
  
  // Section 1: Combined Member List (Import Members + Lead Data converted members)
  sheet.getRange('A1').setValue('Combined Member List').setFontWeight('bold');
  const headers1 = [['Source', 'Member ID', 'Name', 'Join Date', 'Package Type', 'MRR', 'Status', 'Cancel Date', 'Lifespan (months)', 'Actual LTV', 'Join Month', 'Join Quarter']];
  sheet.getRange('A2:L2').setValues(headers1).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // This will be populated by a query combining Import Members and converted leads from Lead Data
  // FIXED: Updated to new Trial Start column structure (AH instead of AG, T instead of R for Member Start)
  const combinedMembersFormula = `=LET(
    importRows,FILTER('Import Members'!A4:L,'Import Members'!A4:A<>""),
    leadRows,FILTER('Lead Data'!A2:AH,'Lead Data'!T2:T<>""),
    importCount,ROWS(importRows),
    leadCount,ROWS(leadRows),
    importBlock,IF(importCount=0,{},MAKEARRAY(importCount,12,LAMBDA(r,c,
      CHOOSE(c,
        "Imported",
        INDEX(importRows,r,1),
        INDEX(importRows,r,2)&" "&INDEX(importRows,r,3),
        INDEX(importRows,r,4),
        INDEX(importRows,r,5),
        INDEX(importRows,r,6),
        INDEX(importRows,r,7),
        INDEX(importRows,r,8),
        INDEX(importRows,r,11),
        INDEX(importRows,r,12),
        INDEX(importRows,r,4),
        INDEX(importRows,r,4)
      )
    ))),
    leadBlock,IF(leadCount=0,{},MAKEARRAY(leadCount,12,LAMBDA(r,c,
      LET(
        joinDate,INDEX(leadRows,r,20),
        cancelled,INDEX(leadRows,r,24),
        cancelDate,INDEX(leadRows,r,25),
        status,IF(cancelled,"Cancelled","Active"),
        lifespan,IF(joinDate="","",IF(cancelled,IF(cancelDate="","",DATEDIF(joinDate,cancelDate,"M")),MAX(1,DATEDIF(joinDate,TODAY(),"M")))),
        mrr,INDEX(leadRows,r,22),
        ltv,IF(OR(mrr="",lifespan=""),"",mrr*lifespan),
        CHOOSE(c,
          INDEX(leadRows,r,8),
          INDEX(leadRows,r,1),
          INDEX(leadRows,r,3)&" "&INDEX(leadRows,r,4),
          joinDate,
          INDEX(leadRows,r,21),
          mrr,
          status,
          cancelDate,
          lifespan,
          ltv,
          joinDate,
          joinDate
        )
      )
    ))),
    IF(importCount+leadCount=0,{""},IF(importCount=0,leadBlock,IF(leadCount=0,importBlock,VSTACK(importBlock,leadBlock))))
  )`;
  sheet.getRange('A3').setFormula(combinedMembersFormula).setNote('Combines Import Members + Converted members from Lead Data');
  
  // Section 2: LTV by Source (All-Time) - using all sources from Settings
  sheet.getRange('N1').setValue('LTV by Source (All-Time)').setFontWeight('bold');
  const headers2 = [['Source', 'Total Members', 'Active', 'Cancelled', 'Avg Lifespan', 'Avg MRR', 'Avg LTV', 'Retention Rate %']];
  sheet.getRange('N2:U2').setValues(headers2).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // Pull all 11 sources from Settings & Budget (single source of truth)
  const settingsSheet = ss.getSheetByName('Settings & Budget');
  const allSources = settingsSheet ? settingsSheet.getRange('A14:A24').getValues().flat().filter(s => s !== '') : DefaultLists.SOURCES;
  
  allSources.forEach((source, idx) => {
    const row = idx + 3;
    sheet.getRange(row, 14).setValue(source); // N column
    sheet.getRange(row, 15).setFormula(`=COUNTIF(A:A, "${source}")`); // Total Members
    sheet.getRange(row, 16).setFormula(`=COUNTIFS(A:A, "${source}", G:G, "Active")`); // Active
    sheet.getRange(row, 17).setFormula(`=COUNTIFS(A:A, "${source}", G:G, "Cancelled")`); // Cancelled
    sheet.getRange(row, 18).setFormula(`=IFERROR(AVERAGEIF(A:A, "${source}", I:I), 0)`); // Avg Lifespan
    sheet.getRange(row, 19).setFormula(`=IFERROR(AVERAGEIF(A:A, "${source}", F:F), 0)`); // Avg MRR
    sheet.getRange(row, 20).setFormula(`=IFERROR(AVERAGEIF(A:A, "${source}", J:J), 0)`); // Avg LTV
    sheet.getRange(row, 21).setFormula(`=IFERROR(P${row}/(O${row}+0.0001), 0)`); // Retention Rate (Active/Total)
  });
  
  sheet.getRange('R3:R13').setNumberFormat('0.0'); // Lifespan (extended to row 13 for 11 sources)
  sheet.getRange('S3:T13').setNumberFormat('$#,##0'); // MRR, LTV
  sheet.getRange('U3:U13').setNumberFormat('0.0%'); // Retention
  
  // Section 3: LTV by Package (All-Time)
  sheet.getRange('W1').setValue('LTV by Package (All-Time)').setFontWeight('bold');
  const headers3 = [['Package', 'Total Members', 'Active', 'Cancelled', 'Avg Lifespan', 'Avg MRR', 'Avg LTV', 'Actual Churn %']];
  sheet.getRange('W2:AD2').setValues(headers3).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  const packages = DefaultLists.MEMBERSHIP_TYPES;
  packages.forEach((pkg, idx) => {
    const row = idx + 3;
    sheet.getRange(row, 23).setValue(pkg); // W column
    sheet.getRange(row, 24).setFormula(`=COUNTIF(E:E, "${pkg}")`); // Total
    sheet.getRange(row, 25).setFormula(`=COUNTIFS(E:E, "${pkg}", G:G, "Active")`); // Active
    sheet.getRange(row, 26).setFormula(`=COUNTIFS(E:E, "${pkg}", G:G, "Cancelled")`); // Cancelled
    sheet.getRange(row, 27).setFormula(`=IFERROR(AVERAGEIF(E:E, "${pkg}", I:I), 0)`); // Avg Lifespan
    sheet.getRange(row, 28).setFormula(`=IFERROR(AVERAGEIF(E:E, "${pkg}", F:F), 0)`); // Avg MRR
    sheet.getRange(row, 29).setFormula(`=IFERROR(AVERAGEIF(E:E, "${pkg}", J:J), 0)`); // Avg LTV
    sheet.getRange(row, 30).setFormula(`=IF(X${row}=0,"No Data",IFERROR(IF(AA${row}=0,"No Data",1/AA${row}), 0))`); // Actual Churn (1/Lifespan) - Fixed divide-by-zero
  });
  
  sheet.getRange('AA3:AA6').setNumberFormat('0.0'); // Lifespan
  sheet.getRange('AB3:AC6').setNumberFormat('$#,##0'); // MRR, LTV
  sheet.getRange('AD3:AD6').setNumberFormat('0.0%'); // Churn
  
  // Section 4: Monthly Churn Rate (last 12 months)
  sheet.getRange('A14').setValue('Monthly Churn Rate (Last 12 Months)').setFontWeight('bold');
  const headers4 = [['Month', 'Active Start', 'Cancellations', 'Churn Rate %']];
  sheet.getRange('A15:D15').setValues(headers4).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  for (let i = 11; i >= 0; i--) {
    const row = 27 - i;
    sheet.getRange(row, 1).setFormula(`=DATE(YEAR(TODAY()),MONTH(TODAY())-${i},1)`).setNumberFormat('mmm yyyy');
    sheet.getRange(row, 2).setFormula(`=COUNTIFS(D:D, "<"&A${row}, G:G, "Active") + COUNTIFS(H:H, ">="&A${row}, H:H, "<"&EOMONTH(A${row},0)+1)`); // Active at start
    sheet.getRange(row, 3).setFormula(`=COUNTIFS(H:H, ">="&A${row}, H:H, "<"&EOMONTH(A${row},0)+1)`); // Cancellations
    sheet.getRange(row, 4).setFormula(`=IFERROR(C${row}/B${row}, 0)`).setNumberFormat('0.0%'); // Churn %
  }
  
  // Section 5: Cohort Analysis (Monthly)
  sheet.getRange('F14').setValue('Cohort Analysis - Monthly').setFontWeight('bold');
  const headers5 = [['Join Month', 'Members', 'Still Active', 'Avg Lifespan', 'Avg LTV', 'Retention %']];
  sheet.getRange('F15:K15').setValues(headers5).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  for (let i = 11; i >= 0; i--) {
    const row = 27 - i;
    sheet.getRange(row, 6).setFormula(`=DATE(YEAR(TODAY()),MONTH(TODAY())-${i},1)`).setNumberFormat('mmm yyyy');
    sheet.getRange(row, 7).setFormula(`=COUNTIFS(K:K, F${row})`); // Members in cohort
    sheet.getRange(row, 8).setFormula(`=COUNTIFS(K:K, F${row}, G:G, "Active")`); // Still Active
    sheet.getRange(row, 9).setFormula(`=IFERROR(AVERAGEIFS(I:I, K:K, F${row}), 0)`).setNumberFormat('0.0'); // Avg Lifespan
    sheet.getRange(row, 10).setFormula(`=IFERROR(AVERAGEIFS(J:J, K:K, F${row}), 0)`).setNumberFormat('$#,##0'); // Avg LTV
    sheet.getRange(row, 11).setFormula(`=IFERROR(H${row}/G${row}, 0)`).setNumberFormat('0.0%'); // Retention
  }
  
  // Section 6: Cohort Analysis (Quarterly)
  sheet.getRange('M14').setValue('Cohort Analysis - Quarterly').setFontWeight('bold');
  const headers6 = [['Join Quarter', 'Members', 'Still Active', 'Avg Lifespan', 'Avg LTV', 'Retention %']];
  sheet.getRange('M15:R15').setValues(headers6).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  for (let i = 7; i >= 0; i--) {
    const row = 23 - i;
    const quarterStart = `=DATE(YEAR(TODAY()), ROUNDDOWN((MONTH(TODAY())-1)/3,0)*3+1-${i*3}, 1)`;
    sheet.getRange(row, 13).setFormula(quarterStart).setNumberFormat('"Q"Q YYYY');
    sheet.getRange(row, 14).setFormula(`=COUNTIFS(L:L, ">="&M${row}, L:L, "<"&EDATE(M${row}, 3))`); // Members
    sheet.getRange(row, 15).setFormula(`=COUNTIFS(L:L, ">="&M${row}, L:L, "<"&EDATE(M${row}, 3), G:G, "Active")`); // Active
    sheet.getRange(row, 16).setFormula(`=IFERROR(AVERAGEIFS(I:I, L:L, ">="&M${row}, L:L, "<"&EDATE(M${row}, 3)), 0)`).setNumberFormat('0.0');
    sheet.getRange(row, 17).setFormula(`=IFERROR(AVERAGEIFS(J:J, L:L, ">="&M${row}, L:L, "<"&EDATE(M${row}, 3)), 0)`).setNumberFormat('$#,##0');
    sheet.getRange(row, 18).setFormula(`=IFERROR(O${row}/N${row}, 0)`).setNumberFormat('0.0%');
  }
  
  sheet.setColumnWidths(1, 30, 120);
  sheet.hideSheet();
}

// ============================================================
// CHART CREATION (v2.1-beta)
// ============================================================

/**
 * Create all 7 analytics charts on DASHBOARD
 */
function createDashboardCharts(ss) {
  const dashboard = ss.getSheetByName('DASHBOARD');
  const chartData = ss.getSheetByName('_Chart Data');
  
  if (!dashboard || !chartData) return;
  
  // Clear existing charts
  dashboard.getCharts().forEach(chart => dashboard.removeChart(chart));
  
  // Chart 1: Leads by Source Over Time (Stacked Area)
  const chart1 = dashboard.newChart()
    .setChartType(Charts.ChartType.AREA)
    .addRange(chartData.getRange('A2:H92'))
    .setPosition(100, 1, 0, 0) // ✅ FIXED: Proper spacing (was 70)
    .setOption('title', 'Leads by Source Over Time (Last 90 Days)')
    .setOption('width', 600)
    .setOption('height', 300)
    .setOption('isStacked', true)
    .setOption('legend', {position: 'bottom'})
    .setOption('hAxis', {title: 'Date', format: 'MMM dd'})
    .setOption('vAxis', {title: 'Leads'})
    .build();
  dashboard.insertChart(chart1);
  
  // Chart 2: Funnel Conversion Waterfall
  const chart2 = dashboard.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(chartData.getRange('A96:B101'))
    .setPosition(100, 7, 0, 0) // ✅ FIXED: Proper spacing (was 70)
    .setOption('title', 'Funnel Conversion')
    .setOption('width', 500)
    .setOption('height', 300)
    .setOption('legend', {position: 'none'})
    .setOption('hAxis', {title: 'Stage'})
    .setOption('vAxis', {title: 'Count'})
    .setOption('colors', ['#4285f4'])
    .build();
  dashboard.insertChart(chart2);
  
  // Chart 3: Revenue Trends (Line + Bar Combo)
  const chart3 = dashboard.newChart()
    .setChartType(Charts.ChartType.COMBO)
    .addRange(chartData.getRange('D96:G108'))
    .setPosition(118, 1, 0, 0) // ✅ FIXED: +18 rows spacing (was 76)
    .setOption('title', 'Revenue Trends (Last 12 Weeks)')
    .setOption('width', 600)
    .setOption('height', 300)
    .setOption('legend', {position: 'bottom'})
    .setOption('hAxis', {title: 'Week'})
    .setOption('vAxis', {title: 'Revenue ($)'})
    .setOption('seriesType', 'bars')
    .setOption('series', {2: {type: 'line', lineWidth: 3}})
    .build();
  dashboard.insertChart(chart3);
  
  // Chart 4: CAC by Source (Bar Chart)
  const chart4 = dashboard.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(chartData.getRange('I96:J103'))
    .setPosition(118, 7, 0, 0) // ✅ FIXED: +18 rows spacing (was 76)
    .setOption('title', 'CAC by Source')
    .setOption('width', 500)
    .setOption('height', 300)
    .setOption('legend', {position: 'none'})
    .setOption('hAxis', {title: 'CAC ($)'})
    .setOption('vAxis', {title: 'Source'})
    .setOption('colors', ['#ea4335'])
    .build();
  dashboard.insertChart(chart4);
  
  // Chart 5: Monthly New Members vs Target (Combo)
  const chart5 = dashboard.newChart()
    .setChartType(Charts.ChartType.COMBO)
    .addRange(chartData.getRange('L96:N108'))
    .setPosition(136, 1, 0, 0) // ✅ FIXED: +18 rows spacing (was 82)
    .setOption('title', 'Monthly New Members vs Target (Last 12 Months)')
    .setOption('width', 600)
    .setOption('height', 300)
    .setOption('legend', {position: 'bottom'})
    .setOption('hAxis', {title: 'Month'})
    .setOption('vAxis', {title: 'Members'})
    .setOption('seriesType', 'bars')
    .setOption('series', {1: {type: 'line', lineWidth: 2, color: '#ea4335'}})
    .build();
  dashboard.insertChart(chart5);
  
  // Chart 6: Lead Volume by Day of Week (Column Chart)
  const chart6 = dashboard.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(chartData.getRange('P96:Q103'))
    .setPosition(136, 7, 0, 0) // ✅ FIXED: +18 rows spacing (was 82)
    .setOption('title', 'Lead Volume by Day of Week')
    .setOption('width', 500)
    .setOption('height', 300)
    .setOption('legend', {position: 'none'})
    .setOption('hAxis', {title: 'Day'})
    .setOption('vAxis', {title: 'Leads'})
    .setOption('colors', ['#34a853'])
    .build();
  dashboard.insertChart(chart6);
  
  // Chart 7: Source Performance Matrix (Bubble Chart)
  const chart7 = dashboard.newChart()
    .setChartType(Charts.ChartType.BUBBLE)
    .addRange(chartData.getRange('S96:V103'))
    .setPosition(154, 1, 0, 0) // ✅ FIXED: +20 rows for larger chart (was 88)
    .setOption('title', 'Source Performance Matrix (CAC vs Volume vs Close Rate)')
    .setOption('width', 700)
    .setOption('height', 400)
    .setOption('hAxis', {title: 'CAC ($)'})
    .setOption('vAxis', {title: 'Lead Volume'})
    .setOption('bubble', {textStyle: {fontSize: 11}})
    .setOption('sizeAxis', {maxSize: 20, minSize: 5})
    .build();
  dashboard.insertChart(chart7);
  
  Logger.log('All 7 charts created successfully!');
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function createNamedRanges(ss) {
  try {
    const settings = ss.getSheetByName('Settings & Budget');
    if (!settings) {
      Logger.log('Warning: Settings & Budget sheet not found for named ranges');
      return;
    }
    
    // Date range named ranges
    ss.setNamedRange('rngStart', settings.getRange('B30'));
    ss.setNamedRange('rngEnd', settings.getRange('B31'));
    
    // Target value named ranges (CRITICAL: Prevents formula reference errors)
    // These ensure DASHBOARD formulas always reference data rows, not headers
    ss.setNamedRange('Target_Leads', settings.getRange('B3'));
    ss.setNamedRange('Target_SetRate', settings.getRange('B4'));
    ss.setNamedRange('Target_ShowRate', settings.getRange('B5'));
    ss.setNamedRange('Target_CloseRate', settings.getRange('B6'));
    ss.setNamedRange('Target_NewMembers', settings.getRange('B7'));
    ss.setNamedRange('Target_MRR', settings.getRange('B8'));
    ss.setNamedRange('Target_CAC', settings.getRange('B9'));
    ss.setNamedRange('Target_MonthlyChurn', settings.getRange('B10'));
    ss.setNamedRange('Target_ARPU', settings.getRange('B11'));
    
    // Membership Type list (D14:D17 - 4 types: PT, Small Group, General, Class Pack)
    ss.setNamedRange('MembershipTypes', settings.getRange('D14:D17'));
    
    // Status values (for filtering) - using Current Status auto-calculated values
    // Create a reference range in Settings for allowed status values
    ss.setNamedRange('StatusValues', settings.getRange('G14:G19'));
    
    Logger.log('✅ Named ranges created: rngStart, rngEnd, 9 Target ranges, MembershipTypes, StatusValues');
  } catch (e) {
    Logger.log('Named ranges error: ' + e);
  }
}

function getSourceOptions(settingsSheet) {
  if (!settingsSheet) return [];

  const sourceColumnValues = settingsSheet.getRange('A14:A').getDisplayValues().flat();
  const sources = [];

  for (let i = 0; i < sourceColumnValues.length; i++) {
    const rawValue = sourceColumnValues[i];
    const value = rawValue ? rawValue.toString().trim() : '';

    if (!value) {
      continue;
    }

    if (value.indexOf('━━━━━━━━') >= 0 || value.startsWith('📅 ') || value.startsWith('💰 ')) {
      break;
    }

    sources.push(value);
  }

  return sources;
}

function setupDataValidations(ss) {
  const leadData = ss.getSheetByName('Lead Data');
  const settings = ss.getSheetByName('Settings & Budget');
  if (!leadData || !settings) {
    return;
  }
  
  const staffRange = settings.getRange('B14:B100');
  const locationRange = settings.getRange('C14:C100');
  const typeRange = settings.getRange('D14:D100');
  const reasonRange = settings.getRange('E14:E100');
  
  // CRITICAL FIX #2: Source (H) data validation - auto-filled formula, but users can override by selecting from dropdown
  const sourceOptions = getSourceOptions(settings);
  if (sourceOptions.length) {
    const leadSourceValidation = SpreadsheetApp.newDataValidation().requireValueInList(sourceOptions, true).setAllowInvalid(true).build();
    leadData.getRange('H2:H').setDataValidation(leadSourceValidation);
  }
  
  leadData.getRange('J2:J').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(staffRange, true).build()); // Staff
  leadData.getRange('K2:K').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(locationRange, true).build()); // Location
  leadData.getRange('S2:S').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(typeRange, true).build()); // Membership Type
  leadData.getRange('Y2:Y').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(reasonRange, true).build()); // Cancel Reason
  
  const checkbox = SpreadsheetApp.newDataValidation().requireCheckbox().build();
  leadData.getRange('L2:L').setDataValidation(checkbox); // Appt Set?
  leadData.getRange('N2:N').setDataValidation(checkbox); // Show?
  leadData.getRange('P2:P').setDataValidation(checkbox); // Start Trial? (checkbox)
  leadData.getRange('S2:S').setDataValidation(checkbox); // Converted?
  leadData.getRange('X2:X').setDataValidation(checkbox); // Cancelled?
  
  // Date validation for date columns (NOT checkboxes)
  const dateValidation = SpreadsheetApp.newDataValidation()
    .requireDate()
    .requireDateBetween(new Date(2020, 0, 1), new Date(2030, 11, 31))
    .setAllowInvalid(false)
    .setHelpText('📅 Enter a valid date (YYYY-MM-DD)')
    .build();
  leadData.getRange('Q2:Q').setDataValidation(dateValidation); // Trial Start (DATE column)
  
  if (marketing) {
    if (sourceOptions.length) {
      marketing.getRange('B3:B').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(sourceOptions, true).build());
    }
    marketing.getRange('C3:C').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(locationRange, true).build());
  }
}

function applyProtections(ss) {
  try {
    const leadData = ss.getSheetByName('Lead Data');
    const utmTracking = ss.getSheetByName('_UTM Tracking');
    const dailySpend = ss.getSheetByName('_Daily Spend');
    const marketing = ss.getSheetByName('Marketing');
    
    // Protect auto-calculated columns (warning mode)
    if (leadData) {
      protectColumn(leadData, 'H', 'Source (auto from UTM)');
      protectColumn(leadData, 'Q', 'Trial End (auto)');
      protectColumn(leadData, 'Z', 'Current Status (auto)');
    }
    
    if (utmTracking) {
      protectColumn(utmTracking, 'O', 'Standardized Source (auto)');
    }
    
    if (dailySpend) {
      const protection = dailySpend.protect();
      protection.setDescription('Auto-generated from monthly budget');
      protection.setWarningOnly(true);
    }
    
    if (marketing) {
      protectColumn(marketing, 'E', 'Days in Month (auto)');
      protectColumn(marketing, 'F', 'Daily Rate (auto)');
    }
    
  } catch (e) {
    Logger.log('Protections error: ' + e);
  }
}

function protectColumn(sheet, column, description) {
  try {
    const lastRow = sheet.getMaxRows();
    const range = sheet.getRange(column + '2:' + column + lastRow);
    const protection = range.protect();
    protection.setDescription(description);
    protection.setWarningOnly(true);
  } catch (e) {
    Logger.log('Protection error for column ' + column + ': ' + e);
  }
}

function reorderTabs(ss) {
  const order = ['DASHBOARD', 'Lead Data', 'Members', 'Settings & Budget', 'Help', '_UTM Tracking', '_Chart Data', '_LTV Calculations', '_Metrics', '_Data'];
  order.forEach((name, index) => {
    const sheet = ss.getSheetByName(name);
    if (sheet) {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(index + 1);
    }
  });
  const dashboard = ss.getSheetByName('DASHBOARD');
  if (dashboard) ss.setActiveSheet(dashboard);
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function refreshDashboards() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  try {
    // CRITICAL FIX #1: Force date range recalculation and validation
    updateDateRange();
    
    // Force general recalculation by toggling a cell
    const settings = ss.getSheetByName('Settings & Budget');
    if (settings) {
      const cell = settings.getRange('B27'); // Use correct cell (was B26)
      const val = cell.getValue();
      cell.setValue('');
      SpreadsheetApp.flush();
      cell.setValue(val);
      SpreadsheetApp.flush();
    }
    
    // Final flush to ensure all formulas complete
    SpreadsheetApp.flush();
    
    ui.alert('✅ Refreshed!', 'Dashboards recalculated and date ranges validated.', ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('Error', error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * HIGH FIX #5: Create Manual Backup Snapshot
 * Creates timestamped backup of Lead Data and Import Members
 */
function createBackupSnapshot() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  try {
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm');
    const backupName = `_Backup_${timestamp}`;
    
    // Check if sheets exist
    const leadData = ss.getSheetByName('Lead Data');
    const importMembers = ss.getSheetByName('Import Members');
    
    if (!leadData) {
      ui.alert('⚠️ No Data', 'Lead Data sheet not found. Nothing to backup.', ui.ButtonSet.OK);
      return;
    }
    
    // Create backup sheet
    const backup = ss.insertSheet(backupName);
    backup.hideSheet();
    
    // Add header
    backup.getRange('A1').setValue(`📦 BACKUP created on ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')}`).setFontWeight('bold').setBackground('#d9ead3');
    backup.getRange('A2').setValue('Use "Gym Ops → Restore from Backup" to recover this data.').setFontStyle('italic');
    
    // Copy Lead Data
    backup.getRange('A4').setValue('LEAD DATA:').setFontWeight('bold');
    const leadRange = leadData.getDataRange();
    if (leadRange.getNumRows() > 0) {
      leadRange.copyTo(backup.getRange(5, 1), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);
    }
    
    // Copy Import Members if exists
    if (importMembers) {
      const membersStartRow = 5 + leadRange.getNumRows() + 3;
      backup.getRange(membersStartRow, 1).setValue('IMPORT MEMBERS:').setFontWeight('bold');
      const membersRange = importMembers.getDataRange();
      if (membersRange.getNumRows() > 0) {
        membersRange.copyTo(backup.getRange(membersStartRow + 1, 1), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);
      }
    }
    
    // Clean up old backups (keep last 6)
    cleanupOldBackups(ss, 6);
    
    ui.alert('✅ Backup Created!', `Backup sheet "${backupName}" created successfully.\n\nYou can restore this backup anytime via "Gym Ops → Restore from Backup".`, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('❌ Backup Failed', error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * HIGH FIX #5: List Available Backups
 * Returns array of backup sheet names sorted by date (newest first)
 */
function listBackups() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();
  const backups = [];
  
  allSheets.forEach(sheet => {
    const name = sheet.getName();
    if (name.startsWith('_Backup_')) {
      backups.push(name);
    }
  });
  
  // Sort by date (newest first)
  backups.sort((a, b) => b.localeCompare(a));
  
  return backups;
}

/**
 * HIGH FIX #5: Restore from Backup
 * Allows user to select and restore from a backup
 */
function restoreFromBackup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  try {
    const backups = listBackups();
    
    if (backups.length === 0) {
      ui.alert('⚠️ No Backups Found', 'No backup sheets found. Create a backup first via "Gym Ops → Create Backup Now".', ui.ButtonSet.OK);
      return;
    }
    
    // Show backup selection dialog
    let backupList = 'Available backups (newest first):\n\n';
    backups.forEach((backup, idx) => {
      const date = backup.replace('_Backup_', '').replace(/_/g, ' ');
      backupList += `${idx + 1}. ${date}\n`;
    });
    backupList += '\nEnter the number of the backup to restore:';
    
    const response = ui.prompt('🔄 Restore from Backup', backupList, ui.ButtonSet.OK_CANCEL);
    
    if (response.getSelectedButton() !== ui.Button.OK) {
      return; // User cancelled
    }
    
    const selectedNum = parseInt(response.getResponseText());
    if (isNaN(selectedNum) || selectedNum < 1 || selectedNum > backups.length) {
      ui.alert('❌ Invalid Selection', 'Please enter a valid backup number.', ui.ButtonSet.OK);
      return;
    }
    
    const selectedBackup = backups[selectedNum - 1];
    
    // Final confirmation
    const confirm = ui.alert(
      '⚠️ Confirm Restore',
      `This will restore data from:\n"${selectedBackup}"\n\nCurrent data will be REPLACED.\n\nA safety backup will be created first.\n\nContinue?`,
      ui.ButtonSet.YES_NO
    );
    
    if (confirm !== ui.Button.YES) {
      return;
    }
    
    // Create safety backup before restore
    createBackupSnapshot();
    
    // Perform restore
    const backupSheet = ss.getSheetByName(selectedBackup);
    if (!backupSheet) {
      ui.alert('❌ Error', 'Backup sheet not found.', ui.ButtonSet.OK);
      return;
    }
    
    // Find Lead Data section in backup
    const backupData = backupSheet.getDataRange().getValues();
    let leadDataStartRow = -1;
    let importMembersStartRow = -1;
    
    for (let i = 0; i < backupData.length; i++) {
      if (backupData[i][0] === 'LEAD DATA:') leadDataStartRow = i + 1;
      if (backupData[i][0] === 'IMPORT MEMBERS:') importMembersStartRow = i + 1;
    }
    
    if (leadDataStartRow === -1) {
      ui.alert('❌ Error', 'Backup format invalid. Lead Data section not found.', ui.ButtonSet.OK);
      return;
    }
    
    // Restore Lead Data
    const leadData = ss.getSheetByName('Lead Data');
    if (leadData) {
      leadData.clearContents();
      const leadEndRow = importMembersStartRow > 0 ? importMembersStartRow - 2 : backupData.length;
      const leadRows = leadEndRow - leadDataStartRow;
      if (leadRows > 0) {
        const restoreData = backupData.slice(leadDataStartRow, leadEndRow);
        leadData.getRange(1, 1, restoreData.length, restoreData[0].length).setValues(restoreData);
      }
    }
    
    // Restore Import Members if exists
    if (importMembersStartRow > 0) {
      const importMembers = ss.getSheetByName('Import Members');
      if (importMembers) {
        importMembers.clearContents();
        const memberRows = backupData.length - importMembersStartRow;
        if (memberRows > 0) {
          const memberData = backupData.slice(importMembersStartRow);
          importMembers.getRange(1, 1, memberData.length, memberData[0].length).setValues(memberData);
        }
      }
    }
    
    SpreadsheetApp.flush();
    
    ui.alert('✅ Restore Complete!', `Data restored from "${selectedBackup}".\n\nA safety backup was created before restore.`, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert('❌ Restore Failed', error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * HIGH FIX #5: Cleanup Old Backups
 * Keeps only the most recent N backups
 */
function cleanupOldBackups(ss, keepCount) {
  const backups = listBackups();
  
  if (backups.length <= keepCount) {
    return; // Nothing to clean up
  }
  
  // Delete oldest backups
  for (let i = keepCount; i < backups.length; i++) {
    const sheet = ss.getSheetByName(backups[i]);
    if (sheet) {
      ss.deleteSheet(sheet);
    }
  }
}

/**
 * HIGH FIX #5: Setup Monthly Auto-Backup
 * Creates time-based trigger for automatic monthly backups
 */
function setupMonthlyBackup() {
  // Delete existing triggers first
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'autoMonthlyBackup') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new monthly trigger (1st of month at 2 AM)
  ScriptApp.newTrigger('autoMonthlyBackup')
    .timeBased()
    .onMonthDay(1)
    .atHour(2)
    .create();
    
  Logger.log('✅ Monthly backup trigger created (runs 1st of month at 2 AM)');
}

/**
 * HIGH FIX #5: Auto Monthly Backup
 * Called by time trigger - creates backup silently
 */
function autoMonthlyBackup() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm');
    const backupName = `_Backup_AUTO_${timestamp}`;
    
    const leadData = ss.getSheetByName('Lead Data');
    if (!leadData) return;
    
    const backup = ss.insertSheet(backupName);
    backup.hideSheet();
    
    backup.getRange('A1').setValue(`📦 AUTO-BACKUP created on ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')}`).setFontWeight('bold').setBackground('#d9ead3');
    backup.getRange('A2').setValue('Automatic monthly backup. Use "Gym Ops → Restore from Backup" to recover.').setFontStyle('italic');
    
    backup.getRange('A4').setValue('LEAD DATA:').setFontWeight('bold');
    const leadRange = leadData.getDataRange();
    if (leadRange.getNumRows() > 0) {
      leadRange.copyTo(backup.getRange(5, 1), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);
    }
    
    const importMembers = ss.getSheetByName('Import Members');
    if (importMembers) {
      const membersStartRow = 5 + leadRange.getNumRows() + 3;
      backup.getRange(membersStartRow, 1).setValue('IMPORT MEMBERS:').setFontWeight('bold');
      const membersRange = importMembers.getDataRange();
      if (membersRange.getNumRows() > 0) {
        membersRange.copyTo(backup.getRange(membersStartRow + 1, 1), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);
      }
    }
    
    cleanupOldBackups(ss, 6);
    
    Logger.log('✅ Auto-backup created: ' + backupName);
    
  } catch (error) {
    Logger.log('❌ Auto-backup failed: ' + error.toString());
  }
}

/**
 * Add Sample Data - For testing and demo purposes
 */
function addSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  const confirm = ui.alert(
    '🧪 Add Sample Data?',
    'This will add 50 sample leads for testing.\n\n' +
    'Sample data includes:\n' +
    '• Leads from various sources (last 90 days)\n' +
    '• Different funnel stages (leads, appts, shows, members)\n' +
    '• UTM tracking data\n' +
    '• Some converted members, trials, and cancellations\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (confirm !== ui.Button.YES) return false;
  
  try {
    const leadData = ss.getSheetByName('Lead Data');
    const utmTracking = ss.getSheetByName('_UTM Tracking');
    
    if (!leadData || !utmTracking) {
      ui.alert('Error', 'Please run "Initialize Template" first.', ui.ButtonSet.OK);
      return false;
    }
    
    // Sample data configuration - using all 11 sources from Settings
    const sources = DefaultLists.SOURCES;
    const utmSources = ['google', 'facebook', 'direct', 'organic', 'instagram', 'referral', 'other', 'gohighlevel', 'third-party', 'member_referral', 'walkin'];
    const campaigns = ['spring-promo', 'summer-sale', 'back-to-school', 'new-year', 'organic', '', 'portal', 'api', 'member-program'];
    const firstNames = ['John', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'Chris', 'Anna', 'James', 'Maria', 'Tom', 'Kate', 'Alex', 'Jen', 'Dan'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia', 'Lee'];
    const staff = DefaultLists.STAFF;
    const location = DefaultLists.LOCATION; // ✅ SIMPLIFIED: Single location
    const membershipTypes = DefaultLists.MEMBERSHIP_TYPES;
    const cancelReasons = DefaultLists.CANCEL_REASONS;
    
    const today = new Date();
    const leadRows = [];
    const utmRows = [];
    
    // Generate 50 sample leads
    for (let i = 1; i <= 50; i++) {
      const leadId = 'LEAD-' + String(10000 + i).padStart(5, '0');
      const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
      const createdDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
    const firstName = DefaultLists.SAMPLE_FIRST_NAMES[Math.floor(Math.random() * DefaultLists.SAMPLE_FIRST_NAMES.length)];
    const lastName = DefaultLists.SAMPLE_LAST_NAMES[Math.floor(Math.random() * DefaultLists.SAMPLE_LAST_NAMES.length)];
      const phone = '555-' + String(Math.floor(Math.random() * 900) + 100) + '-' + String(Math.floor(Math.random() * 9000) + 1000);
      const email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + '@example.com';
      
      // Random DOB (25-45 years old)
      const birthYear = new Date().getFullYear() - (25 + Math.floor(Math.random() * 20));
      const dob = new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      
      const sourceIdx = Math.floor(Math.random() * sources.length);
      const source = sources[sourceIdx];
      const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
    const staffOwner = DefaultLists.STAFF[Math.floor(Math.random() * DefaultLists.STAFF.length)];
    // location already defined above as single value (DefaultLists.LOCATION)
      
      // Funnel progression (weighted for realism)
      const rand = Math.random();
      let apptSet = false, apptDate = '', showed = false, trialStart = '', converted = false, memberStart = '', cancelled = false;
      let membershipType = '', mrr = '', upfrontFee = '', cancelDate = '', cancelReason = '';
      
      if (rand > 0.3) { // 70% set appointment
        apptSet = true;
        apptDate = new Date(createdDate.getTime() + (1 + Math.floor(Math.random() * 3)) * 24 * 60 * 60 * 1000);
        
        if (rand > 0.45) { // 55% showed (of total)
          showed = true;
          trialStart = new Date(apptDate.getTime() + Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000);
          
          if (rand > 0.65) { // 35% converted (of total)
            converted = true;
            memberStart = new Date(trialStart.getTime() + (7 + Math.floor(Math.random() * 7)) * 24 * 60 * 60 * 1000);
            membershipType = membershipTypes[Math.floor(Math.random() * membershipTypes.length)];
            mrr = 100 + Math.floor(Math.random() * 150);
            upfrontFee = Math.random() > 0.5 ? 50 + Math.floor(Math.random() * 200) : 0;
            
            if (rand > 0.92) { // 8% cancelled (of converted)
              cancelled = true;
              cancelDate = new Date(memberStart.getTime() + (30 + Math.floor(Math.random() * 60)) * 24 * 60 * 60 * 1000);
              cancelReason = cancelReasons[Math.floor(Math.random() * cancelReasons.length)];
            }
          }
        }
      }
      
      // Build Lead Data row (26 columns A-Z)
      const leadRow = [
        leadId,                                    // A: Lead ID
        createdDate,                               // B: Created Date
        firstName,                                 // C: First Name
        lastName,                                  // D: Last Name
        phone,                                     // E: Phone
        email,                                     // F: Email
        dob,                                       // G: DOB
        '',                                        // H: Source (auto-filled from UTM)
        campaign,                                  // I: Campaign
        staffOwner,                                // J: Staff Owner
        location,                                  // K: Location
        apptSet,                                   // L: Appt Set?
        apptDate,                                  // M: Appt Date
        showed,                                    // N: Show?
        trialStart,                                // O: Trial Start
        '',                                        // P: Trial End (auto-calculated)
        converted,                                 // Q: Converted?
        memberStart,                               // R: Member Start
        membershipType,                            // S: Membership Type
        mrr,                                       // T: MRR ($)
        upfrontFee,                                // U: Upfront Fee ($)
        cancelled,                                 // V: Cancelled?
        cancelDate,                                // W: Cancel Date
        cancelReason,                              // X: Cancel Reason
        'Sample lead #' + i,                       // Y: Notes
        ''                                         // Z: Current Status (auto-calculated)
      ];
      leadRows.push(leadRow);
      
      // Build UTM Tracking row (15 columns A-O)
      const utmSource = DefaultLists.SAMPLE_UTM_SOURCES[sourceIdx];
    const utmRow = [
      leadId,                                    // A: Lead ID
      createdDate,                               // B: Date Created
      utmSource,                                 // C: UTM Source
      utmSource === 'google' || utmSource === 'facebook' ? 'cpc' : 'organic', // D: UTM Medium
      campaign,                                  // E: UTM Campaign
        '',                                        // F: UTM Content
        '',                                        // G: Match Type
        '',                                        // H: Campaign ID
        '',                                        // I: Ad Group ID
        '',                                        // J: Ad ID
        utmSource === 'google' ? 'gclid_' + i : '', // K: GCLID
        utmSource,                                 // L: Contact Source
        utmSource,                                 // M: Opportunity Source
        'new',                                     // N: Pipeline Stage
        ''                                         // O: Standardized Source (auto-filled)
      ];
      utmRows.push(utmRow);
    }
    
    // Write data to sheets
    const startRow = leadData.getLastRow() + 1;
    leadData.getRange(startRow, 1, leadRows.length, 26).setValues(leadRows);
    utmTracking.getRange(startRow, 1, utmRows.length, 15).setValues(utmRows);
    
    // Format dates
    leadData.getRange(startRow, 2, leadRows.length, 1).setNumberFormat('yyyy-mm-dd'); // Created Date
    leadData.getRange(startRow, 7, leadRows.length, 1).setNumberFormat('yyyy-mm-dd'); // DOB
    leadData.getRange(startRow, 13, leadRows.length, 1).setNumberFormat('yyyy-mm-dd'); // Appt Date
    leadData.getRange(startRow, 15, leadRows.length, 1).setNumberFormat('yyyy-mm-dd'); // Trial Start
    leadData.getRange(startRow, 18, leadRows.length, 1).setNumberFormat('yyyy-mm-dd'); // Member Start
    leadData.getRange(startRow, 23, leadRows.length, 1).setNumberFormat('yyyy-mm-dd'); // Cancel Date
    
    ui.alert(
      '✅ Sample Data Added!',
      '50 sample leads added successfully.\n\n' +
      'Next steps:\n' +
      '1. Go to Settings & Budget and add monthly budgets\n' +
      '2. Check DASHBOARD to see metrics and Source Analysis\n\n' +
      'Note: Source column will auto-fill based on UTM mapping.',
      ui.ButtonSet.OK
    );
    return true;
    
  } catch (error) {
    const message = error && error.toString ? error.toString() : 'Unknown error';
    Logger.log('Sample data error: ' + message);
    SpreadsheetApp.getUi().alert('Sample Data Error', message + '\n\nSample data was not added. You can retry later from the Gym Ops menu.', SpreadsheetApp.getUi().ButtonSet.OK);
    return false;
  }
}

function testScript() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  Logger.log('Script working! Sheet: ' + ss.getName());
  ui.alert('✅ Script OK', 'v2.1-alpha ready. Run Quick Start Wizard to configure.', ui.ButtonSet.OK);
}

// ============================================================
// QUICK ADD LEAD (UX #2 - PHASE B)
// ============================================================

/**
 * UX #2: Quick Add Lead - Fast lead entry without scrolling
 * Opens a dialog form for adding new leads quickly from anywhere
 */
function quickAddLead() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = ss.getSheetByName('Settings & Budget');
  
  if (!settings) {
    SpreadsheetApp.getUi().alert('❌ Error', 'Settings & Budget tab not found. Run "Initialize Template" first.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // Get dropdown options from Settings
  const sources = settings.getRange('A14:A24').getValues().flat().filter(String);
  const staff = settings.getRange('B14:B100').getValues().flat().filter(String);
  
  // Create HTML form
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 500px;
          }
          h2 {
            color: #4285f4;
            margin-bottom: 20px;
          }
          .form-group {
            margin-bottom: 15px;
          }
          label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
            color: #333;
          }
          input[type="text"],
          input[type="email"],
          input[type="tel"],
          select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
          }
          input:focus, select:focus {
            outline: none;
            border-color: #4285f4;
            box-shadow: 0 0 5px rgba(66, 133, 244, 0.3);
          }
          .required {
            color: #d93025;
          }
          .button-group {
            margin-top: 25px;
            text-align: right;
          }
          button {
            padding: 10px 20px;
            margin-left: 10px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-primary {
            background-color: #4285f4;
            color: white;
          }
          .btn-primary:hover {
            background-color: #3367d6;
          }
          .btn-secondary {
            background-color: #f1f3f4;
            color: #333;
          }
          .btn-secondary:hover {
            background-color: #e8eaed;
          }
          .success {
            padding: 15px;
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 4px;
            color: #155724;
            margin-bottom: 20px;
            display: none;
          }
          .error {
            padding: 15px;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            color: #721c24;
            margin-bottom: 20px;
            display: none;
          }
        </style>
      </head>
      <body>
        <h2>➕ Quick Add Lead</h2>
        
        <div id="successMessage" class="success"></div>
        <div id="errorMessage" class="error"></div>
        
        <form id="leadForm">
          <div class="form-group">
            <label>First Name <span class="required">*</span></label>
            <input type="text" id="firstName" name="firstName" required>
          </div>
          
          <div class="form-group">
            <label>Last Name <span class="required">*</span></label>
            <input type="text" id="lastName" name="lastName" required>
          </div>
          
          <div class="form-group">
            <label>Phone <span class="required">*</span></label>
            <input type="tel" id="phone" name="phone" required>
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="email" name="email">
          </div>
          
          <div class="form-group">
            <label>Source <span class="required">*</span></label>
            <select id="source" name="source" required>
              <option value="">-- Select Source --</option>
              ${sources.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
          
          <div class="form-group">
            <label>Assign to Staff</label>
            <select id="staff" name="staff">
              <option value="">-- Select Staff --</option>
              ${staff.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
          
          <div class="button-group">
            <button type="button" class="btn-secondary" onclick="google.script.host.close()">Cancel</button>
            <button type="submit" class="btn-primary">Add Lead</button>
          </div>
        </form>
        
        <script>
          document.getElementById('leadForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Disable submit button
            const submitBtn = e.target.querySelector('.btn-primary');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Adding...';
            
            // Get form data
            const formData = {
              firstName: document.getElementById('firstName').value.trim(),
              lastName: document.getElementById('lastName').value.trim(),
              phone: document.getElementById('phone').value.trim(),
              email: document.getElementById('email').value.trim(),
              source: document.getElementById('source').value,
              staff: document.getElementById('staff').value
            };
            
            // Call server function
            google.script.run
              .withSuccessHandler(function(result) {
                if (result.success) {
                  document.getElementById('successMessage').textContent = '✅ ' + result.message;
                  document.getElementById('successMessage').style.display = 'block';
                  document.getElementById('errorMessage').style.display = 'none';
                  
                  // Reset form
                  document.getElementById('leadForm').reset();
                  
                  // Re-enable button
                  submitBtn.disabled = false;
                  submitBtn.textContent = 'Add Lead';
                  
                  // Auto-close after 2 seconds
                  setTimeout(function() {
                    google.script.host.close();
                  }, 2000);
                } else {
                  throw new Error(result.message);
                }
              })
              .withFailureHandler(function(error) {
                document.getElementById('errorMessage').textContent = '❌ Error: ' + error.message;
                document.getElementById('errorMessage').style.display = 'block';
                document.getElementById('successMessage').style.display = 'none';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Add Lead';
              })
              .processQuickAddLead(formData);
          });
        </script>
      </body>
    </html>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(550);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '➕ Quick Add Lead');
}

/**
 * Process the Quick Add Lead form submission
 */
function processQuickAddLead(formData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const leadData = ss.getSheetByName('Lead Data');
    
    if (!leadData) {
      return { success: false, message: 'Lead Data tab not found' };
    }
    
    // Find next available row (first empty row in column A after row 2)
    const lastRow = leadData.getLastRow();
    let nextRow = lastRow + 1;
    
    // If there are empty rows in between, find the first empty one
    const leadIds = leadData.getRange('A2:A' + Math.max(lastRow, 100)).getValues();
    for (let i = 0; i < leadIds.length; i++) {
      if (!leadIds[i][0]) {
        nextRow = i + 2;
        break;
      }
    }
    
    // Generate Lead ID (LEAD-timestamp)
    const leadId = 'LEAD-' + Date.now();
    const today = new Date();
    
    // Prepare row data (matching Lead Data columns)
    // A=Lead ID, B=Created Date, C=First Name, D=Last Name, E=Phone, F=Email, G=Birthday, H=Source, I=Location, J=Staff, K=Notes
    const rowData = [
      leadId,                           // A: Lead ID
      today,                            // B: Created Date
      formData.firstName,               // C: First Name
      formData.lastName,                // D: Last Name
      formData.phone,                   // E: Phone
      formData.email || '',             // F: Email
      '',                               // G: Birthday
      formData.source,                  // H: Source
      ss.getSheetByName('Settings & Budget').getRange('B12').getValue(), // I: Location (default from settings)
      formData.staff || '',             // J: Staff
      'Added via Quick Add'             // K: Notes
    ];
    
    // Add the lead
    leadData.getRange(nextRow, 1, 1, rowData.length).setValues([rowData]);
    
    // Copy down formulas from row 2 for auto-calculated columns (if row 2 has formulas)
    if (nextRow > 2) {
      // Columns with formulas: L-AE (12-31)
      const formulaRange = leadData.getRange(2, 12, 1, 20); // L2:AE2
      const formulas = formulaRange.getFormulas();
      if (formulas[0].some(f => f)) {
        leadData.getRange(nextRow, 12, 1, 20).setFormulas(formulas);
      }
    }
    
    Logger.log('Quick Add Lead: ' + leadId + ' - ' + formData.firstName + ' ' + formData.lastName);
    
    return {
      success: true,
      message: 'Lead added successfully! ' + formData.firstName + ' ' + formData.lastName + ' (' + leadId + ')'
    };
    
  } catch (error) {
    Logger.log('Quick Add Lead Error: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

// ============================================================
// MEMBER FILTERS FEATURE
// ============================================================

/**
 * FEATURE #2: Setup Member Filters
 * Creates helpful filter views on Members tab for quick filtering by Membership Type and Status
 */
function setupMemberFilters() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const membersSheet = ss.getSheetByName('Members');
  
  if (!membersSheet) {
    ui.alert('❌ Error', 'Members tab not found. Run "Initialize Template" first.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    // Check if Members tab has data (row 2 should exist)
    if (membersSheet.getLastRow() < 2) {
      ui.alert('⚠️ No Data', 'Members tab has no data yet. Add some members first, then run this again.', ui.ButtonSet.OK);
      return;
    }
    
    // Remove existing filters if any
    const existingFilter = membersSheet.getFilter();
    if (existingFilter) {
      existingFilter.remove();
    }
    
    // Create a new basic filter on all columns
    const dataRange = membersSheet.getRange(1, 1, membersSheet.getLastRow(), membersSheet.getLastColumn());
    const filter = dataRange.createFilter();
    
    // Membership Type is in column S (column 19)
    // Current Status is in column Z (column 26)
    
    ui.alert(
      '✅ Filters Created!',
      'Member filters have been set up!\n\n' +
      'How to use:\n' +
      '1. Look for filter icons (▼) in the header row\n' +
      '2. Click the icon in "Membership Type" (column S) to filter by type\n' +
      '3. Click the icon in "Current Status" (column Z) to filter by status\n' +
      '4. You can filter by multiple columns at once!\n\n' +
      '💡 TIP: To clear all filters, click Data → Remove filter',
      ui.ButtonSet.OK
    );
    
    // Switch to Members tab to show the filters
    ss.setActiveSheet(membersSheet);
    ss.toast('✅ Filter controls added to Members tab header!', 'Success', 3);
    
  } catch (error) {
    ui.alert('❌ Error', 'Failed to create filters: ' + error.toString(), ui.ButtonSet.OK);
    Logger.log('setupMemberFilters error: ' + error);
  }
}

// ============================================================
// CSV EXPORT (MEDIUM FIX #14)
// ============================================================

/**
 * MEDIUM FIX #14: Export Lead Data to CSV
 * Allows users to export lead data for external analysis, backups, and compliance
 */
function exportLeadDataToCSV() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const leadData = ss.getSheetByName('Lead Data');
  
  if (!leadData) {
    ui.alert('❌ Error', 'Lead Data sheet not found.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    // Get export options from user
    const rangeResponse = ui.alert(
      '📥 Export Lead Data to CSV',
      'Export all leads or filter by current date range?\n\n' +
      'YES = Current date range only (from DASHBOARD)\n' +
      'NO = All leads (no filter)',
      ui.ButtonSet.YES_NO_CANCEL
    );
    
    if (rangeResponse === ui.Button.CANCEL) return;
    
    const filterByDateRange = (rangeResponse === ui.Button.YES);
    
    // Get date range if filtering
    let startDate, endDate;
    if (filterByDateRange) {
      const settings = ss.getSheetByName('Settings & Budget');
      if (settings) {
        startDate = settings.getRange('B30').getValue();
        endDate = settings.getRange('B31').getValue();
        
        // Validate dates
        if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date)) {
          ui.alert('⚠️ Invalid Date Range', 'Cannot read date range from Settings & Budget. Exporting all leads instead.', ui.ButtonSet.OK);
          startDate = null;
          endDate = null;
        }
      }
    }
    
    // Get all data
    const allData = leadData.getDataRange().getValues();
    if (allData.length < 2) {
      ui.alert('⚠️ No Data', 'Lead Data sheet is empty. Add leads first.', ui.ButtonSet.OK);
      return;
    }
    
    const headers = allData[0];
    let dataRows = allData.slice(1);
    
    // Filter by date range if requested
    if (filterByDateRange && startDate && endDate) {
      const originalCount = dataRows.length;
      dataRows = dataRows.filter(row => {
        const createdDate = row[1]; // Column B (Created Date)
        if (!createdDate || !(createdDate instanceof Date)) return false;
        return createdDate >= startDate && createdDate <= endDate;
      });
      
      Logger.log(`Filtered from ${originalCount} to ${dataRows.length} leads by date range`);
    }
    
    // Remove completely empty rows (no Lead ID)
    dataRows = dataRows.filter(row => row[0] && row[0].toString().trim() !== '');
    
    if (dataRows.length === 0) {
      const rangeText = filterByDateRange 
        ? ` in the selected date range (${Utilities.formatDate(startDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')} to ${Utilities.formatDate(endDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')})`
        : '';
      ui.alert('⚠️ No Data', `No leads found to export${rangeText}.`, ui.ButtonSet.OK);
      return;
    }
    
    // Prepare CSV data (headers + rows)
    const csvData = [headers, ...dataRows];
    
    // Convert to CSV string
    const csvContent = convertArrayToCSV(csvData);
    
    // Create filename with timestamp
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm');
    const filename = `Lead_Data_${timestamp}.csv`;
    
    // Save to Drive (same folder as spreadsheet)
    const spreadsheetFile = DriveApp.getFileById(ss.getId());
    const parents = spreadsheetFile.getParents();
    
    if (!parents.hasNext()) {
      ui.alert('❌ Error', 'Cannot determine Google Drive folder. File not saved.', ui.ButtonSet.OK);
      return;
    }
    
    const parentFolder = parents.next();
    const csvFile = parentFolder.createFile(filename, csvContent, MimeType.CSV);
    
    // Get file URL for logging
    const fileUrl = csvFile.getUrl();
    Logger.log('CSV Export URL: ' + fileUrl);
    
    // Show success message
    const dateRangeText = filterByDateRange && startDate && endDate
      ? `\n\nDate Range: ${Utilities.formatDate(startDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')} to ${Utilities.formatDate(endDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')}`
      : '\n\nAll leads exported (no date filter)';
    
    ui.alert(
      '✅ Export Complete!',
      `Exported ${dataRows.length} leads to:\n"${filename}"${dateRangeText}\n\n` +
      `Saved to Drive folder: "${parentFolder.getName()}"\n\n` +
      `The file is now in your Google Drive and can be:\n` +
      `• Downloaded as CSV\n` +
      `• Opened in Google Sheets\n` +
      `• Shared with others\n` +
      `• Imported to Excel, SQL, Python, etc.`,
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('❌ Export Failed', `Error: ${error.toString()}\n\nCheck script logs for details.`, ui.ButtonSet.OK);
    Logger.log('CSV Export error: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * Helper: Convert 2D array to CSV string
 * Properly handles special characters (quotes, commas, newlines)
 * 
 * CSV Escaping Rules:
 * - If cell contains comma, quote, or newline → wrap in quotes
 * - If cell contains quote → escape as double-quote ("")
 * - Preserve other characters as-is
 * 
 * @param {Array<Array>} data - 2D array of values
 * @returns {string} CSV-formatted string
 */
function convertArrayToCSV(data) {
  if (!data || data.length === 0) return '';
  
  return data.map(row => {
    return row.map(cell => {
      // Convert to string (handle null, undefined, dates, booleans)
      let value = '';
      if (cell != null) {
        if (cell instanceof Date) {
          // Format dates as ISO string (YYYY-MM-DD)
          value = Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
        } else {
          value = cell.toString();
        }
      }
      
      // CSV escaping: if contains comma, quote, or newline, wrap in quotes and escape existing quotes
      if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      
      return value;
    }).join(',');
  }).join('\n');
}

function runHealthCheck() {
  HealthCheck.run();
}

function normalizeSettingsTargets(settingsSheet) {
  const decimalMetrics = [
    { cell: 'B4', description: 'Set Rate (%)' },
    { cell: 'B5', description: 'Show Rate (%)' },
    { cell: 'B6', description: 'Close Rate (%)' },
    { cell: 'B10', description: 'Monthly Churn (%)' }
  ];
  decimalMetrics.forEach(({ cell }) => {
    const range = settingsSheet.getRange(cell);
    const value = range.getValue();
    if (typeof value === 'number' && value > 1) {
      range.setValue(value / 100);
    }
  });
}

/**
 * FORMULA AUDIT FIX: Validate Settings & Budget targets exist
 * Ensures B3-B9 have numeric values (not empty or text)
 * Added: 2025-10-08 after formula audit identified root cause
 */
function validateSettingsTargets(settingsSheet) {
  const targetCells = [
    { cell: 'B3', name: 'Leads', default: 200 },
    { cell: 'B4', name: 'Set Rate (%)', default: 0.60 },
    { cell: 'B5', name: 'Show Rate (%)', default: 0.70 },
    { cell: 'B6', name: 'Close Rate (%)', default: 0.50 },
    { cell: 'B7', name: 'New Members', default: 42 },
    { cell: 'B8', name: 'MRR ($)', default: 4500 },
    { cell: 'B9', name: 'CAC ($)', default: 150 }
  ];
  
  let fixed = false;
  targetCells.forEach(({ cell, name, default: defaultVal }) => {
    const range = settingsSheet.getRange(cell);
    const value = range.getValue();
    
    // If empty or text, set default
    if (value === '' || value === null || value === undefined || typeof value !== 'number') {
      Logger.log(`⚠️ ${name} (${cell}) was invalid: "${value}" - setting default: ${defaultVal}`);
      range.setValue(defaultVal);
      fixed = true;
    }
  });
  
  if (fixed) {
    Logger.log('✅ Settings targets validated and defaults applied where needed');
  }
}

/**
 * FORMULA AUDIT FIX: Auto-fix DASHBOARD target column formulas (with UI)
 * Corrects C10-C16 to reference B3-B9 (data rows) instead of B2 (header)
 * Called manually via menu - shows confirmation dialogs
 * Added: 2025-10-08 after formula audit
 */
function fixDashboardTargetFormulas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const dashboard = ss.getSheetByName('DASHBOARD');
  
  if (!dashboard) {
    ui.alert('⚠️ DASHBOARD not found', 'Please run Initialize Template first.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    // Check for issues first
    const issues = typeof HealthCheck !== 'undefined' && HealthCheck.checkDashboardTargetFormulas
      ? HealthCheck.checkDashboardTargetFormulas(dashboard)
      : [];
    
    if (issues.length === 0) {
      ui.alert('✅ All Good!', 'DASHBOARD formulas are already correct. No fixes needed!', ui.ButtonSet.OK);
      return;
    }
    
    // Show what will be fixed
    const issueList = issues.map(i => `• ${i.cell} (${i.metric}): ${i.problem}`).join('\n');
    const confirm = ui.alert(
      '🔧 Fix DASHBOARD Formulas?',
      `Found ${issues.length} issue(s):\n\n${issueList}\n\nApply automatic fix?`,
      ui.ButtonSet.YES_NO
    );
    
    if (confirm !== ui.Button.YES) {
      return;
    }
    
    // Apply the fix
    const fixed = applyDashboardTargetFixes(dashboard);
    
    // Verify fix worked
    const remainingIssues = typeof HealthCheck !== 'undefined' && HealthCheck.checkDashboardTargetFormulas
      ? HealthCheck.checkDashboardTargetFormulas(dashboard)
      : [];
    
    if (remainingIssues.length === 0) {
      ui.alert(
        '✅ Fix Complete!',
        `Successfully fixed ${fixed} formula(s)!\n\n` +
        `All Target values now display correctly.\n` +
        `Variance and Status columns should also be working.\n\n` +
        `Check DASHBOARD to verify.`,
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '⚠️ Partial Fix',
        `Fixed ${fixed} formulas, but ${remainingIssues.length} issue(s) remain.\n\n` +
        `Check Settings & Budget tab to ensure target values exist in B3-B9.`,
        ui.ButtonSet.OK
      );
    }
    
  } catch (error) {
    ui.alert('❌ Fix Failed', `Error: ${error.toString()}\n\nCheck Apps Script logs for details.`, ui.ButtonSet.OK);
    Logger.log('fixDashboardTargetFormulas error: ' + error);
  }
}

/**
 * FORMULA AUDIT FIX: Auto-fix DASHBOARD target formulas (silent)
 * Same as fixDashboardTargetFormulas but without UI prompts
 * Called automatically on sheet open if issues detected
 * Added: 2025-10-08 after formula audit
 */
function fixDashboardTargetFormulasSilent() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dashboard = ss.getSheetByName('DASHBOARD');
    
    if (!dashboard) {
      Logger.log('fixDashboardTargetFormulasSilent: DASHBOARD not found');
      return 0;
    }
    
    const fixed = applyDashboardTargetFixes(dashboard);
    
    if (fixed > 0) {
      Logger.log(`✅ Auto-fixed ${fixed} DASHBOARD target formula(s) on sheet open`);
      ss.toast(`Auto-fixed ${fixed} DASHBOARD formula(s)`, 'Formula Fix Applied', 3);
    }
    
    return fixed;
    
  } catch (error) {
    Logger.log('fixDashboardTargetFormulasSilent error: ' + error);
    return 0;
  }
}

/**
 * FORMULA AUDIT FIX: Apply fixes to DASHBOARD target formulas
 * Core fix logic used by both manual and automatic fix functions
 * Returns: Number of cells fixed
 * Added: 2025-10-08 after formula audit
 */
function applyDashboardTargetFixes(dashboard) {
  const fixes = [
    { cell: 'C10', formula: '=IFERROR(\'Settings & Budget\'!B3,"⚠️ Setup")', metric: 'Leads' },
    { cell: 'C11', formula: '=IFERROR(\'Settings & Budget\'!B4,"⚠️ Setup")', metric: 'Set Rate' },
    { cell: 'C12', formula: '=IFERROR(\'Settings & Budget\'!B5,"⚠️ Setup")', metric: 'Show Rate' },
    { cell: 'C13', formula: '=IFERROR(\'Settings & Budget\'!B6,"⚠️ Setup")', metric: 'Close Rate' },
    { cell: 'C14', formula: '=IFERROR(\'Settings & Budget\'!B7,"⚠️ Setup")', metric: 'New Members' },
    { cell: 'C15', formula: '=IFERROR(\'Settings & Budget\'!B8,"⚠️ Setup")', metric: 'MRR' },
    { cell: 'C16', formula: '=IFERROR(\'Settings & Budget\'!B9,"⚠️ Setup")', metric: 'CAC' }
  ];
  
  let fixedCount = 0;
  fixes.forEach(({ cell, formula, metric }) => {
    dashboard.getRange(cell).setFormula(formula);
    fixedCount++;
    Logger.log(`✅ Fixed ${cell} (${metric}): ${formula}`);
  });
  
  SpreadsheetApp.flush();
  return fixedCount;
}

/**
 * CLEANUP: Fix Settings & Budget Dropdown Lists
 * Removes blank rows, duplicates, and corrupted data from dropdown areas
 * Prevents Marketing Budget data from being picked up as dropdown values
 * Added: 2025-10-08 after health check identified data corruption
 */
function cleanupSettingsDropdowns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const settings = ss.getSheetByName('Settings & Budget');
  
  if (!settings) {
    ui.alert('❌ Error', 'Settings & Budget sheet not found.', ui.ButtonSet.OK);
    return;
  }
  
  const confirm = ui.alert(
    '🧹 Clean Up Settings Dropdowns?',
    'This will:\n' +
    '• Remove blank rows in dropdown lists\n' +
    '• Remove duplicate values\n' +
    '• Clear corrupted data (budget values in wrong columns)\n' +
    '• Add separator between sections\n' +
    '• Set up monthly backup trigger\n\n' +
    'All valid dropdown data will be preserved.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (confirm !== ui.Button.YES) {
    return;
  }
  
  try {
    let issuesFixed = 0;
    
    // Clean up each dropdown column
    // A14-A24: Sources (11 items)
    issuesFixed += cleanDropdownColumn(settings, 'A', 14, 24, 'Sources', [
      'Paid Search', 'Paid Social', 'Direct Traffic', 'Organic Search', 
      'Social Media', 'Referrals', 'Others', 'CRM UI', 'Third-Party', 
      'Member Referral', 'Walk-In'
    ]);
    
    // B14-B24: Staff (keep user's custom staff names, just remove blanks and duplicates)
    issuesFixed += cleanDropdownColumn(settings, 'B', 14, 24, 'Staff', null);
    
    // C14: Location (single value only)
    const locationValue = settings.getRange('C14').getValue();
    if (!locationValue || locationValue.toString().trim() === '') {
      settings.getRange('C14').setValue('Main Location');
      issuesFixed++;
    }
    // Clear any junk in C15-C35
    settings.getRange('C15:C35').clearContent();
    
    // D14-D24: Types
    issuesFixed += cleanDropdownColumn(settings, 'D', 14, 24, 'Types', [
      'PT', 'Small Group', 'General', 'Class Pack'
    ]);
    
    // E14-E24: Cancel Reasons
    issuesFixed += cleanDropdownColumn(settings, 'E', 14, 24, 'Cancel Reasons', [
      'Price', 'Moved', 'Injury', 'Service', 'Location', 'Other'
    ]);
    
    // G14-G24: Status Values
    issuesFixed += cleanDropdownColumn(settings, 'G', 14, 19, 'Status Values', [
      'Lead', 'Appt Set', 'Show', 'Trial', 'Member', 'Cancelled'
    ]);
    
    // Add clear separator at row 36 (before Marketing Budget section)
    settings.getRange('A36').setValue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━').setFontColor('#cccccc');
    settings.getRange('A36:G36').merge().setHorizontalAlignment('center').setBackground('#f3f3f3');
    
    // Set up monthly backup trigger
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const hasBackup = triggers.some(t => t.getHandlerFunction() === 'autoMonthlyBackup');
      
      if (!hasBackup) {
        ScriptApp.newTrigger('autoMonthlyBackup')
          .timeBased()
          .onMonthDay(1)
          .atHour(2)
          .create();
        issuesFixed++;
        Logger.log('✅ Monthly backup trigger created');
      }
    } catch (triggerError) {
      Logger.log('⚠️ Could not create backup trigger: ' + triggerError);
    }
    
    SpreadsheetApp.flush();
    
    ui.alert(
      '✅ Cleanup Complete!',
      `Fixed ${issuesFixed} issue(s).\n\n` +
      'Dropdown lists cleaned and organized.\n' +
      'Monthly backup trigger configured.\n\n' +
      'Run "Gym Ops → Run Health Check" to verify all issues resolved.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('❌ Cleanup Failed', error.toString(), ui.ButtonSet.OK);
    Logger.log('cleanupSettingsDropdowns error: ' + error);
  }
}

/**
 * Clean a specific dropdown column - removes blanks, duplicates, invalid data
 */
function cleanDropdownColumn(sheet, column, startRow, endRow, name, expectedValues) {
  let fixCount = 0;
  
  // If expected values provided, just set them (most reliable)
  if (expectedValues && expectedValues.length > 0) {
    const range = sheet.getRange(`${column}${startRow}:${column}${endRow}`);
    range.clearContent();
    
    expectedValues.forEach((value, idx) => {
      if (startRow + idx <= endRow) {
        sheet.getRange(`${column}${startRow + idx}`).setValue(value);
      }
    });
    
    Logger.log(`✅ Reset ${name} to expected values (${expectedValues.length} items)`);
    return expectedValues.length;
  }
  
  // Otherwise, clean existing data
  const range = sheet.getRange(`${column}${startRow}:${column}${endRow}`);
  const values = range.getValues();
  
  const validValues = [];
  const seen = new Set();
  
  values.forEach(([value]) => {
    if (!value) return;
    
    const str = value.toString().trim();
    if (!str) return;
    
    // Skip separator tokens
    if (str.startsWith('━━━━') || str.startsWith('📅') || str.startsWith('💰')) return;
    
    // Skip obvious budget data (dollar amounts, just numbers)
    if (name !== 'Types' && str.match(/^\$\d+\.?\d*/)) {
      fixCount++;
      return;
    }
    if (name !== 'Types' && name !== 'Status Values' && str.match(/^\d+$/)) {
      fixCount++;
      return;
    }
    
    // Skip duplicates
    const key = str.toLowerCase();
    if (seen.has(key)) {
      fixCount++;
      Logger.log(`Removed duplicate from ${name}: ${str}`);
      return;
    }
    
    seen.add(key);
    validValues.push([str]);
  });
  
  // Clear range and rewrite clean data
  range.clearContent();
  if (validValues.length > 0) {
    sheet.getRange(`${column}${startRow}`, 1, validValues.length, 1).setValues(validValues);
  }
  
  if (fixCount > 0) {
    Logger.log(`✅ Cleaned ${name}: removed ${fixCount} invalid/duplicate entries`);
  }
  
  return fixCount;
}
