/**
 * Gym Operations Tracking Sheet - v2.1-beta
 * 
 * ✅ COMPLETE FEATURE SET:
 * ✅ Lead ID column (A) for GHL integration
 * ✅ _UTM Tracking tab with auto-source mapping (hidden)
 * ✅ Monthly marketing spend (auto-generates daily rates)
 * ✅ Date range dropdown (9 presets + custom range)
 * ✅ Protections on auto-calculated columns
 * ✅ Source Performance Analysis table on DASHBOARD (12 metrics per source)
 * ✅ Sample data generator for testing (50 realistic leads)
 * ✅ 7 analytics charts on DASHBOARD (interactive visuals)
 * ✅ _Chart Data helper tab (pre-aggregated chart data)
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
 * 9. _Daily Spend - Hidden, auto-generated from monthly
 * 10. _Chart Data - Hidden, chart data aggregation (7 sections)
 * 11. _Data - Hidden, active members calculation
 */

// ============================================================
// MENU & INITIALIZATION
// ============================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Gym Ops')
    .addItem('🧙 Quick Start Wizard', 'quickStartWizard')
    .addSeparator()
    .addItem('➕ Quick Add Lead', 'quickAddLead')
    .addSeparator()
    .addItem('⚙️ Initialize Template', 'initializeTemplate')
    .addItem('🔄 Refresh Dashboards', 'refreshDashboards')
    .addItem('📊 Generate Daily Spend', 'generateDailySpend')
    .addSeparator()
    .addItem('💾 Create Backup Now', 'createBackupSnapshot')
    .addItem('🔄 Restore from Backup', 'restoreFromBackup')
    .addSeparator()
    .addItem('📥 Export Lead Data to CSV', 'exportLeadDataToCSV')
    .addItem('📊 Generate Daily Report', 'generateDailyReport')
    .addSeparator()
    .addItem('🌙 Toggle Dark Mode (DASHBOARD)', 'toggleDarkMode')
    .addSeparator()
    .addItem('🔍 Setup Member Filters', 'setupMemberFilters')
    .addSeparator()
    .addItem('🧪 Add Sample Data (for testing)', 'addSampleData')
    .addSeparator()
    .addItem('❓ View Help', 'showHelp')
    .addToUi();
}

/**
 * onEdit Trigger - Auto-fill dates when checkboxes are checked
 * Handles: Trial Start, Conversion, Cancellation
 */
function onEdit(e) {
  if (!e) return;
  
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const row = range.getRow();
  const col = range.getColumn();
  
  // CRITICAL FIX #1: Detect date range changes and force recalculation
  if (sheet.getName() === 'DASHBOARD' && range.getA1Notation() === 'B2') {
    // User changed date range dropdown in DASHBOARD
    updateDateRange();
    return; // Exit early, no other processing needed
  }
  
  if (sheet.getName() === 'Settings & Budget' && range.getA1Notation() === 'B27') {
    // User manually changed date preset in Settings
    updateDateRange();
    return; // Exit early
  }
  
  // Only process Lead Data tab and rows 2+ for checkbox auto-fill
  if (sheet.getName() !== 'Lead Data' || row < 2) return;
  
  const value = range.getValue();
  
  // Column O (15): Trial Start checkbox → auto-fill Trial Start date (column O)
  if (col === 15 && value === true) {
    const trialStartCell = sheet.getRange(row, 15);
    // If cell is empty or just checked, set to today
    if (trialStartCell.getValue() === true || trialStartCell.getValue() === '') {
      trialStartCell.setValue(new Date());
      SpreadsheetApp.getActiveSpreadsheet().toast('✅ Trial start date set to today!', 'Auto-filled', 2);
    }
  }
  
  // Column Q (17): Converted? checkbox → auto-fill Member Start date (column R)
  if (col === 17 && value === true) {
    const memberStartCell = sheet.getRange(row, 18);
    // Only auto-fill if Member Start is empty
    if (!memberStartCell.getValue()) {
      memberStartCell.setValue(new Date());
      SpreadsheetApp.getActiveSpreadsheet().toast('✅ Member start date set to today!', 'Auto-filled', 2);
    }
  }
  
  // Column V (22): Cancelled? checkbox → auto-fill Cancel Date (column W)
  if (col === 22 && value === true) {
    const cancelDateCell = sheet.getRange(row, 23);
    // Only auto-fill if Cancel Date is empty
    if (!cancelDateCell.getValue()) {
      cancelDateCell.setValue(new Date());
      SpreadsheetApp.getActiveSpreadsheet().toast('✅ Cancel date set to today!', 'Auto-filled', 2);
    }
  }
  
  // Column L (12): Appt Set? checkbox → auto-fill Appt Date (column M)
  if (col === 12 && value === true) {
    const apptDateCell = sheet.getRange(row, 13);
    // Only auto-fill if Appt Date is empty
    if (!apptDateCell.getValue()) {
      apptDateCell.setValue(new Date());
      SpreadsheetApp.getActiveSpreadsheet().toast('✅ Appointment date set to today!', 'Auto-filled', 2);
    }
  }
  
  // Column Y (25): Notes edited → auto-update Last Touchpoint (column AF/32)
  if (col === 25) {
    const lastTouchpointCell = sheet.getRange(row, 32);
    // Update Last Touchpoint with current timestamp (frozen value, not volatile)
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    lastTouchpointCell.setValue(timestamp);
    // Silent update - no toast to avoid disrupting note-taking flow
  }
  
  // HIGH FIX #6: Duplicate Detection for Phone (E/5) and Email (F/6)
  if ((col === 5 || col === 6) && value && value.toString().trim() !== '') {
    const duplicateInfo = checkForDuplicate(sheet, row, col, value);
    if (duplicateInfo) {
      const action = showDuplicateAlert(duplicateInfo, row, col);
      if (action === 'CANCEL') {
        // Clear the cell
        range.setValue('');
        SpreadsheetApp.getActiveSpreadsheet().toast('⚠️ Entry cancelled - duplicate detected', 'Cancelled', 3);
      }
      // If 'CONTINUE', do nothing (keep the value)
    }
  }
  
  // HIGH FIX #8: Date Chronology Validation for date columns
  if (value instanceof Date || (value && !isNaN(Date.parse(value)))) {
    const validationError = validateDateChronology(sheet, row, col);
    if (validationError) {
      const ui = SpreadsheetApp.getUi();
      const title = validationError.warning ? '⚠️ Date Order Warning' : '❌ Invalid Date Order';
      const message = validationError.message + '\n\nDo you want to keep this date anyway?';
      
      const response = ui.alert(title, message, ui.ButtonSet.YES_NO);
      
      if (response === ui.Button.NO) {
        // Clear the invalid date
        range.setValue('');
        SpreadsheetApp.getActiveSpreadsheet().toast(`⚠️ ${validationError.field} cleared - invalid date order`, 'Date Validation', 3);
      }
      // If YES, keep the date (user override)
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
          duplicateField: col === 5 ? 'PHONE' : 'EMAIL'
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
function quickStartWizard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  // Step 1: Welcome & Auto-Initialize
  const welcome = ui.alert(
    '👋 Welcome to Gym Ops Tracker v2.2!',
    'This 5-minute wizard will fully configure your tracker.\n\nNo need to touch Settings & Budget afterward!\n\nClick OK to continue.',
    ui.ButtonSet.OK_CANCEL
  );
  if (welcome !== ui.Button.OK) return;
  
  if (!ss.getSheetByName('DASHBOARD')) {
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
  const staffNames = staffInput ? staffInput.split(',').map(s => s.trim()).filter(s => s) : ['Front Desk', 'Coach A', 'Coach B'];
  
  // Step 6: Membership Types
  const typesConfirm = ui.alert(
    'Step 5 of 6: Membership Types',
    'Default packages:\n• PT (Personal Training)\n• Small Group\n• General Membership\n• Class Pack\n\nKeep defaults?',
    ui.ButtonSet.YES_NO
  );
  
  let membershipTypes = ['PT', 'Small Group', 'General', 'Class Pack'];
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
      // Set targets
      settingsSheet.getRange('B6').setValue(targetMembers); // New Members
      settingsSheet.getRange('B2').setValue(Math.ceil(targetMembers * 3.5)); // Leads
      
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
        const currentMonth = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
        
        // Write each allocation to Settings & Budget starting at row 40
        budgetAllocations.forEach((allocation, index) => {
          const row = 40 + index;
          settingsSheet.getRange(`A${row}`).setValue(currentMonth);
          settingsSheet.getRange(`B${row}`).setValue(allocation.source);
          settingsSheet.getRange(`C${row}`).setValue(allocation.amount);
          // Use TEXT() to ensure month value works as text, whether stored as text or date
          settingsSheet.getRange(`D${row}`).setFormula(`=IFERROR(IF(A${row}="","",DAY(EOMONTH(DATEVALUE(TEXT(A${row},"@")&"-01"),0))), "")`);
          settingsSheet.getRange(`E${row}`).setFormula(`=IFERROR(IF(C${row}="","",C${row}/D${row}), "")`);
        });
        
        // Force calculation by flushing
        SpreadsheetApp.flush();
        
        // Auto-generate daily spend
        Utilities.sleep(2000); // Wait for formulas to calculate
        generateDailySpend();
      }
    }
    
    // Add sample data if requested
    if (sampleData === ui.Button.YES) {
      addSampleData();
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
    createHelpTab(ss);
    createSettingsTab(ss);
    createLeadDataTab(ss);
    createMembersTab(ss);
    createStaffViewTab(ss);
    createSalesViewTab(ss);
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
  sheet.getRange('B5').setFormula('=COUNTIFS(\'Lead Data\'!AB:AB,"🔥 HOT",\'Lead Data\'!Q:Q,FALSE,\'Lead Data\'!V:V,FALSE)').setNumberFormat('0');
  sheet.getRange('A5').setNote('HOT leads (score 70+) who are NOT yet members.\n\nThese are your highest-priority leads - follow up ASAP!');
  
  sheet.getRange('C5').setValue('⚠️ Action Needed:').setFontWeight('bold');
  sheet.getRange('D5').setFormula('=COUNTA(A20:A23)+COUNTA(A25:A28)+COUNTA(A30:A33)+COUNTA(A40:A43)+COUNTA(A45:A48)').setNumberFormat('0');
  sheet.getRange('C5').setNote('Total action items from sections below:\n• No Appt Set (24h)\n• No Shows\n• Trials Expiring (3d)\n• Member Alerts');
  
  sheet.getRange('E5').setValue('⏰ Trials Expiring (3d):').setFontWeight('bold');
  sheet.getRange('F5').setFormula('=COUNTIFS(\'Lead Data\'!P:P,">="&TODAY(),\'Lead Data\'!P:P,"<="&TODAY()+3,\'Lead Data\'!Q:Q,FALSE,\'Lead Data\'!O:O,"<>")').setNumberFormat('0');
  sheet.getRange('E5').setNote('Trials expiring within 3 days who haven\'t converted yet.\n\nUrgent: Follow up to close these sales!');
  
  // Row 6: More metrics
  sheet.getRange('A6').setValue('💰 Active MRR:').setFontWeight('bold');
  sheet.getRange('B6').setFormula('=SUMIFS(\'Lead Data\'!T:T,\'Lead Data\'!Q:Q,TRUE,\'Lead Data\'!V:V,FALSE)').setNumberFormat('$#,##0');
  sheet.getRange('A6').setNote('Total Monthly Recurring Revenue from all active members (not cancelled).');
  
  sheet.getRange('C6').setValue('📈 LTV:CAC Health:').setFontWeight('bold');
  sheet.getRange('D6').setFormula('=IF(ISNUMBER(B67),IF(B67>=5,"✅ Excellent",IF(B67>=3,"✅ Good","⚠️ Review")),"⚠️ No Data")').setFontWeight('bold');
  sheet.getRange('C6').setNote('Overall profitability health based on LTV:CAC ratio.\n\n✅ Excellent = 5x+\n✅ Good = 3-5x\n⚠️ Review = <3x');
  
  sheet.getRange('E6').setValue('🆕 New Members (30d):').setFontWeight('bold');
  sheet.getRange('F6').setFormula('=COUNTIFS(\'Lead Data\'!R:R,">="&TODAY()-30,\'Lead Data\'!R:R,"<="&TODAY(),\'Lead Data\'!Q:Q,TRUE)').setNumberFormat('0');
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
  const kpiHeaders = [['Metric', 'Actual', 'Target', 'Goal To Date', 'Variance', 'Status']];
  sheet.getRange('A9:F9').setValues(kpiHeaders).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  const metrics = ['Leads', 'Set %', 'Show %', 'Close %', 'New Members', 'MRR', 'CAC'];
  sheet.getRange(10, 1, metrics.length, 1).setValues(metrics.map(m => [m]));
  
  const pace = '(MAX(0,MIN(\'Settings & Budget\'!B31,TODAY())-\'Settings & Budget\'!B30+1))/(MAX(1,\'Settings & Budget\'!B31-\'Settings & Budget\'!B30+1))';
  
  // Formulas - updated for new row positions (starting at row 10 instead of 7) and fixed sheet references
  sheet.getRange('B10').setFormula('=COUNTIFS(\'Lead Data\'!B:B,">="&\'Settings & Budget\'!B30,\'Lead Data\'!B:B,"<="&\'Settings & Budget\'!B31)');
  sheet.getRange('B11').setFormula('=IFERROR(COUNTIFS(\'Lead Data\'!L:L,TRUE,\'Lead Data\'!B:B,">="&\'Settings & Budget\'!B30,\'Lead Data\'!B:B,"<="&\'Settings & Budget\'!B31)/B10,0)');
  sheet.getRange('B12').setFormula('=IFERROR(COUNTIFS(\'Lead Data\'!N:N,TRUE,\'Lead Data\'!B:B,">="&\'Settings & Budget\'!B30,\'Lead Data\'!B:B,"<="&\'Settings & Budget\'!B31)/COUNTIFS(\'Lead Data\'!L:L,TRUE,\'Lead Data\'!B:B,">="&\'Settings & Budget\'!B30,\'Lead Data\'!B:B,"<="&\'Settings & Budget\'!B31),0)');
  sheet.getRange('B13').setFormula('=IFERROR(COUNTIFS(\'Lead Data\'!Q:Q,TRUE,\'Lead Data\'!B:B,">="&\'Settings & Budget\'!B30,\'Lead Data\'!B:B,"<="&\'Settings & Budget\'!B31)/COUNTIFS(\'Lead Data\'!N:N,TRUE,\'Lead Data\'!B:B,">="&\'Settings & Budget\'!B30,\'Lead Data\'!B:B,"<="&\'Settings & Budget\'!B31),0)'); // ✅ FIXED: Cohort-based (both by created date)
  sheet.getRange('B14').setFormula('=COUNTIFS(\'Lead Data\'!R:R,">="&\'Settings & Budget\'!B30,\'Lead Data\'!R:R,"<="&\'Settings & Budget\'!B31,\'Lead Data\'!Q:Q,TRUE)');
  sheet.getRange('B15').setFormula('=SUMIFS(\'Lead Data\'!T:T,\'Lead Data\'!Q:Q,TRUE,\'Lead Data\'!V:V,FALSE)'); // ✅ FIXED: Total Active MRR (all active members)
  // CRITICAL FIX #3: Enhanced CAC formula - handles zero members gracefully
  sheet.getRange('B16').setFormula('=IF(B14=0,IF(SUMIFS(\'_Daily Spend\'!C:C,\'_Daily Spend\'!A:A,">="&\'Settings & Budget\'!B30,\'_Daily Spend\'!A:A,"<="&\'Settings & Budget\'!B31)>0,"⚠️ Spend/0","-"),SUMIFS(\'_Daily Spend\'!C:C,\'_Daily Spend\'!A:A,">="&\'Settings & Budget\'!B30,\'_Daily Spend\'!A:A,"<="&\'Settings & Budget\'!B31)/B14)');
  
  // Targets - Fixed to reference 'Settings & Budget' tab
  for (let i = 2; i <= 7; i++) {
    sheet.getRange(8 + i, 3).setFormula(`=IFERROR('Settings & Budget'!B${i},"⚠️ Setup")`);
  }
  sheet.getRange('C15').setFormula('=IFERROR(C14*\'Settings & Budget\'!B9,"⚠️ Setup")');
  
  // Goal To Date, Variance, Status (updated for new row positions: 10-16)
  for (let row = 10; row <= 16; row++) {
    sheet.getRange(row, 4).setFormula(`=IF(C${row}="","",C${row}*${pace})`);
    sheet.getRange(row, 5).setFormula(`=IF(D${row}="","",B${row}-D${row})`);
    if (row === 16) {
      sheet.getRange(row, 6).setFormula(`=IF(D${row}="","",IF(B${row}<=D${row},"ON PACE","BEHIND"))`);
    } else {
      sheet.getRange(row, 6).setFormula(`=IF(D${row}="","",IF(B${row}>=D${row},"ON PACE","BEHIND"))`);
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
  sheet.getRange('B11:F13').setNumberFormat('0.0%');
  sheet.getRange('B15:F15').setNumberFormat('$#,##0');
  sheet.getRange('B16:F16').setNumberFormat('$#,##0');
  
  // Action Items
  sheet.getRange('A17').setValue('🔔 ACTION ITEMS').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A19').setValue('🔴 No Appt Set (24h)').setFontWeight('bold');
  sheet.getRange('A20').setFormula('=IFERROR(ARRAYFORMULA("→ "&FILTER(\'Lead Data\'!C:C&" "&\'Lead Data\'!D:D,\'Lead Data\'!B:B<TODAY()-1,\'Lead Data\'!L:L=FALSE,\'Lead Data\'!Q:Q=FALSE)),"✓ None")');
  
  sheet.getRange('A24').setValue('🟡 No Shows').setFontWeight('bold');
  sheet.getRange('A25').setFormula('=IFERROR(ARRAYFORMULA("→ "&FILTER(\'Lead Data\'!C:C&" "&\'Lead Data\'!D:D,\'Lead Data\'!N:N=FALSE,\'Lead Data\'!M:M<>"",\'Lead Data\'!M:M<TODAY(),\'Lead Data\'!Q:Q=FALSE)),"✓ None")');
  
  sheet.getRange('A29').setValue('🟠 Trials Expiring (3d)').setFontWeight('bold');
  sheet.getRange('A30').setFormula('=IFERROR(ARRAYFORMULA("→ "&FILTER(\'Lead Data\'!C:C&" "&\'Lead Data\'!D:D,\'Lead Data\'!P:P>=TODAY(),\'Lead Data\'!P:P<=TODAY()+3,\'Lead Data\'!Q:Q=FALSE,\'Lead Data\'!O:O<>"")),"✓ None")');
  
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
  sheet.getRange('A45').setFormula('=IFERROR(ARRAYFORMULA("→ "&FILTER(\'Lead Data\'!C:C&" "&\'Lead Data\'!D:D,\'Lead Data\'!P:P>=TODAY(),\'Lead Data\'!P:P<=TODAY()+7,\'Lead Data\'!O:O<>"")),"✓ None")');
  
  sheet.getRange('A49').setValue('🎂 Birthdays This Month').setFontWeight('bold');
  sheet.getRange('A50').setFormula('=IFERROR(ARRAYFORMULA("→ "&FILTER(\'Lead Data\'!C:C&" "&\'Lead Data\'!D:D,MONTH(\'Lead Data\'!G:G)=MONTH(TODAY()),\'Lead Data\'!Q:Q=TRUE,\'Lead Data\'!V:V<>TRUE,\'Lead Data\'!G:G<>"")),"✓ None")');
  
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
  
  // E57: Show Rate = Showed / Appointments
  sheet.getRange('E57').setFormula(`
    =ARRAYFORMULA(IF(A57:A66="","",IFERROR(D57:D66/C57:C66,0)))
  `);
  
  // F57: Lead→Member Rate = Members / Leads
  sheet.getRange('F57').setFormula(`
    =ARRAYFORMULA(IF(A57:A66="","",
      IFERROR(
        COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!Q:Q,TRUE,'Lead Data'!R:R,">="&'Settings & Budget'!$B$30,'Lead Data'!R:R,"<="&'Settings & Budget'!$B$31)
        /B57:B66,
        0
      )
    ))
  `);
  
  // G57: Spend (window) - sum daily spend by source in date range
  sheet.getRange('G57').setFormula(`
    =ARRAYFORMULA(IF(A57:A66="","",
      SUMIFS('_Daily Spend'!C:C,'_Daily Spend'!B:B,A57:A66,'_Daily Spend'!A:A,">="&'Settings & Budget'!$B$30,'_Daily Spend'!A:A,"<="&'Settings & Budget'!$B$31)
    ))
  `); // ✅ UPDATED: Daily spend now in column C (was D)
  
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
        trials, COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!O:O,">="&'Settings & Budget'!$B$30,'Lead Data'!O:O,"<="&'Settings & Budget'!$B$31,'Lead Data'!O:O,"<>"),
        IF(G57:G66=0, "Organic", IF(trials=0, IF(G57:G66>0, "Spend/0 Trials", "-"), G57:G66/trials))
      )
    ))
  `);
  
  // L57: CAC = Spend / New Members - CRITICAL FIX #3 + MEDIUM FIX #11
  sheet.getRange('L57').setFormula(`
    =ARRAYFORMULA(IF(A57:A66="","",
      LET(
        members, COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!Q:Q,TRUE,'Lead Data'!R:R,">="&'Settings & Budget'!$B$30,'Lead Data'!R:R,"<="&'Settings & Budget'!$B$31),
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
  // CRITICAL FIX #3: Enhanced LTV:CAC calculation - shows descriptive message when no CAC data
  sheet.getRange('B67').setFormula('=LET(avgLTV,AVERAGE(FILTER(B70:B80,A70:A80<>"")),avgCAC,AVERAGE(FILTER(C70:C80,A70:A80<>"",C70:C80>0)),IF(avgCAC=0,"No CAC Data",avgLTV/avgCAC))').setNumberFormat('0.0"x"').setFontWeight('bold').setFontSize(12);
  sheet.getRange('C67').setFormula('=IF(ISNUMBER(B67),IF(B67>=5,"✅ HIGHLY PROFITABLE",IF(B67>=3,"✅ PROFITABLE","⚠️ REVIEW")),"⚠️")').setFontWeight('bold');
  sheet.getRange('D67').setValue('(Target: 5x+ | Industry: 3-5x)').setFontStyle('italic').setFontColor('#666666');
  
  // Priority 1: LTV by Source (Enhanced with CAC and Status)
  sheet.getRange('A69').setValue('LTV by Source (All-Time) - Transparent Calculation').setFontWeight('bold').setFontSize(12);
  const ltvHeaders = [['Source', 'Avg LTV', 'CAC', 'LTV:CAC Ratio', 'Status', 'Total Members', 'Retention %']];
  sheet.getRange('A70:G70').setValues(ltvHeaders).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // Add hover note to explain LTV:CAC
  sheet.getRange('D70').setNote('LTV:CAC Ratio = Customer Lifetime Value ÷ Customer Acquisition Cost\n\nWhat it means:\n• <3x = Unprofitable (losing money)\n• 3-5x = Profitable (industry standard)\n• 5-10x = Highly profitable (great!)\n• 10x+ = Exceptional (scale this!)\n\nYour Target: 5x or higher');
  
  // A71: Pull sources from Settings (single source of truth)
  sheet.getRange('A71').setFormula('=ARRAYFORMULA(IF(LEN('Settings & Budget'!A14:A24)=0,"",'Settings & Budget'!A14:A24))');
  
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
  sheet.getRange('A87').setFormula('=ARRAYFORMULA(IF(LEN('Settings & Budget'!B14:B16)=0,"",'Settings & Budget'!B14:B16))');
  
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
      COUNTIFS('Lead Data'!J:J,A87:A89,'Lead Data'!Q:Q,TRUE,'Lead Data'!R:R,">="&'Settings & Budget'!$B$30,'Lead Data'!R:R,"<="&'Settings & Budget'!$B$31)
    ))
  `);
  
  // F87: Close Rate
  sheet.getRange('F87').setFormula('=ARRAYFORMULA(IF(A87:A89="","",IFERROR(E87:E89/B87:B89,0)))').setNumberFormat('0.0%');
  
  // G87: Avg Days to Close
  sheet.getRange('G87').setFormula(`
    =ARRAYFORMULA(IF(A87:A89="","",
      IFERROR(AVERAGEIFS('Lead Data'!AE:AE,'Lead Data'!J:J,A87:A89,'Lead Data'!Q:Q,TRUE,'Lead Data'!R:R,">="&'Settings & Budget'!$B$30,'Lead Data'!R:R,"<="&'Settings & Budget'!$B$31),0)
    ))
  `).setNumberFormat('0.0');
  
  // H87: Total MRR Generated
  sheet.getRange('H87').setFormula(`
    =ARRAYFORMULA(IF(A87:A89="","",
      SUMIFS('Lead Data'!T:T,'Lead Data'!J:J,A87:A89,'Lead Data'!Q:Q,TRUE,'Lead Data'!R:R,">="&'Settings & Budget'!$B$30,'Lead Data'!R:R,"<="&'Settings & Budget'!$B$31)
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
  
  // Conditional formatting for KPIs (updated for new row positions: 10-16)
  const onPace = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('ON PACE').setBackground('#b7e1cd').setFontColor('#0f6938')
    .setRanges([sheet.getRange('F10:F16')]).build();
  const behind = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('BEHIND').setBackground('#f4c7c3').setFontColor('#cc0000')
    .setRanges([sheet.getRange('F10:F16')]).build();
  
  // Combine all conditional formatting rules (including snapshot card rules)
  const allRules = [onPace, behind, ...snapshotRules, ...ltvCacRules, ...statusRules];
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
  } else if (sheet.getLastRow() > 1) {
    return;
  } else {
    sheet.clear();
  }
  
  // 32 columns (A-Z, AA-AF) - Added 6 smart columns including Last Touchpoint
  const headers = [[
    'Lead ID', 'Created Date', 'First Name', 'Last Name', 'Phone', 'Email', 'DOB',
    'Source', 'Campaign', 'Staff Owner', 'Location',
    'Appt Set?', 'Appt Date', 'Show?', 'Start Trial?', 'Trial End',
    'Converted?', 'Member Start', 'Membership Type', 'MRR ($)', 'Upfront Fee ($)',
    'Cancelled?', 'Cancel Date', 'Cancel Reason', 'Notes', 'Current Status',
    'Age (Days)', 'Lead Score', 'Action Needed', 'Duplicate?', 'Days to Convert', 'Last Touchpoint'
  ]];
  
  sheet.getRange('A1:AF1').setValues(headers).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff').setWrap(true);
  
  // Add helpful notes for auto-fill behavior + MEDIUM FIX #16: Deletion warnings
  sheet.getRange('A1').setNote('⚠️ LEAD ID\n\n❌ DO NOT DELETE ROWS!\n\nDeleting rows permanently removes data and cannot be undone.\n\n✅ To remove a member:\n1. Check "Cancelled?" (column V)\n2. Enter Cancel Date (column W)\n3. Select Cancel Reason (column X)\n\nThis preserves data for reporting and LTV analysis.\n\n💡 TIP: Copy row 2 down to add more leads - formulas will automatically copy!');
  sheet.getRange('H1').setNote('🗺️ AUTO-MAPPED from UTM data via _UTM Tracking tab.\n\n✅ To manually override: Click cell → Select from dropdown\n\n🎨 COLOR-CODED by Source Type (UX #9):\n  • 🔴 Light Red = Paid Sources (Paid Search, Paid Social)\n  • 🟢 Light Green = Organic Sources (Organic Search, Direct Traffic, Social Media)\n  • 🔵 Light Blue = Referral Sources (Referrals, Member Referral, Third-Party)\n  • ⚠️ Yellow = Warning/Error (mapping issues)\n\n⚠️ Warning symbols indicate mapping issues:\n  • ⚠️ Not Tracked = Lead not in UTM Tracking\n  • ⚠️ No UTM = No UTM source provided\n  • ⚠️ Unmapped = UTM source not in Settings mapping table\n\n💡 Add new UTM mappings in Settings & Budget tab (columns G-H)');
  sheet.getRange('O1').setNote('✅ Check this box to auto-fill with today\'s date! The checkbox will convert to a date automatically.');
  sheet.getRange('Q1').setNote('✅ Check when lead becomes a paying member\n\n⚠️ Once checked, this member adds to MRR tracking.\n\nTo cancel a member:\n• Use "Cancelled?" checkbox (column V)\n• DO NOT delete the row\n\nDeleting active members loses revenue tracking!\n\nMember Start date (R) will auto-fill with today\'s date.');
  sheet.getRange('V1').setNote('✅ Check this box to mark a member as cancelled\n\n⚠️ ALWAYS USE THIS INSTEAD OF DELETING ROWS!\n\nWhy?\n• Preserves historical data\n• Maintains LTV calculations\n• Enables churn analysis\n• Allows member reactivation\n• Prevents MRR tracking errors\n\nDeleting rows = permanent data loss!\n\nCancel Date (W) will auto-fill with today\'s date.');
  sheet.getRange('AA1').setNote('📊 AGE (DAYS) - UX #11 Enhanced Visual System\n\nShows days since lead was created with visual urgency:\n\n🆕 0-3 days = New lead (green)\n⏱️ 4-7 days = Watch closely (light yellow)\n⚠️ 8-14 days = Warning - needs attention (yellow)\n🔴 15+ days = URGENT - follow up now! (red)\n\nColor-coded backgrounds help you spot old leads instantly.\n\nGoal: Contact all leads within 7 days!');
  
  // UX #3: Auto-Complete tips for dropdown fields
  sheet.getRange('J1').setNote('👤 STAFF - Assign lead to team member\n\n⚡ SPEED TIP: Use TAB key for auto-complete!\n  • Type "Em" → TAB → "Emily (Sales)"\n  • Type "J" → TAB → First staff starting with J\n  • 40% faster than clicking dropdown!\n\n💡 Configure staff list in Settings & Budget tab.');
  sheet.getRange('S1').setNote('🎫 MEMBERSHIP TYPE\n\n⚡ SPEED TIP: Use TAB key for auto-complete!\n  • Type "P" → TAB → "Personal Training"\n  • Type "G" → TAB → "General Membership"\n  • 40% faster than clicking!\n\n💡 Configure membership types in Settings & Budget tab.');
  sheet.getRange('X1').setNote('📝 CANCEL REASON (required when Cancelled? is checked)\n\n⚡ SPEED TIP: Use TAB key for auto-complete!\n  • Type "P" → TAB → "Price Too High"\n  • Type "M" → TAB → "Moved Away"\n  • 40% faster than clicking dropdown!\n\n💡 Configure reasons in Settings & Budget tab.');
  
  // Add note for Notes column (Y1)
  sheet.getRange('Y1').setNote('📝 MEMBER NOTES\n\nFree-text field for tracking member interactions, follow-ups, and important details.\n\n⚡ AUTO-UPDATE: When you edit this field, "Last Touchpoint" (column AF) automatically updates with the current timestamp!\n\n💡 TIP: Notes are visible on both Lead Data and Members tabs.\n\nBest practices:\n• Include date of interaction\n• Note action taken or promised\n• Mark follow-up dates\n• Track member preferences');
  
  // Add note for Last Touchpoint column (AF1)
  sheet.getRange('AF1').setNote('⏰ LAST TOUCHPOINT (Auto-Updated)\n\n📌 This timestamp automatically updates when you edit the "Notes" column (Y).\n\n✅ Purpose:\n• Track when member was last contacted\n• Identify members needing follow-up\n• Measure engagement frequency\n• Sort by recency of contact\n\n⚠️ DO NOT manually edit this column - it updates automatically!\n\nTimestamp format: YYYY-MM-DD HH:MM:SS');
  
  // Auto formulas
  // H2: Source (lookup from UTM Tracking) - CRITICAL FIX #2: Enhanced with better error handling - HIGH FIX #4: Bounded to 5000 rows
  sheet.getRange('H2').setFormula(`=ARRAYFORMULA(IF(A2:A5000="","",
    IFERROR(
      INDEX('_UTM Tracking'!O:O, MATCH(A2:A5000, '_UTM Tracking'!A:A, 0)),
      "⚠️ Not Tracked"
    )
  ))`);
  
  // P2: Trial End (calculated from Trial Start date + trial length) - HIGH FIX #4 & #7: Simplified to eliminate race condition
  // Removed checkbox check - just calculates when O is a date (after auto-conversion)
  sheet.getRange('P2').setFormula('=ARRAYFORMULA(IF(A2:A5000="","",IF(ISNUMBER(O2:O5000),O2:O5000+\'Settings & Budget\'!B33,"")))');
  
  // Z2: Current Status (check if O is date, not boolean) - HIGH FIX #4: Bounded to 5000 rows
  sheet.getRange('Z2').setFormula('=ARRAYFORMULA(IF(A2:A5000="","",IF(V2:V5000=TRUE,"Cancelled",IF(Q2:Q5000=TRUE,"Member",IF((O2:O5000<>"")*ISNUMBER(O2:O5000),"Trial",IF(N2:N5000=TRUE,"Show",IF(L2:L5000=TRUE,"Appt Set","Lead")))))))');
  
  // AA2: Age (Days) - Days since created - HIGH FIX #4 + UX #11: Enhanced with emoji indicators
  sheet.getRange('AA2').setFormula(`=ARRAYFORMULA(IF(A2:A5000="","",IF(B2:B5000="","",
    LET(age, INT(TODAY()-B2:B5000),
      IF(age<=3, "🆕 "&age,
        IF(age<=7, "⏱️ "&age,
          IF(age<=14, "⚠️ "&age,
            "🔴 "&age
          )
        )
      )
    )
  )))`);
  
  // AB2: Lead Score - Hot/Warm/Cold based on multiple factors - HIGH FIX #4 + MEDIUM FIX #12: Trial expiring bonus
  sheet.getRange('AB2').setFormula(`=ARRAYFORMULA(IF(A2:A5000="","",
    LET(
      score, 
      IF(N2:N5000=TRUE,50,0) + 
      IF(REGEXMATCH(LOWER(H2:H5000),"referral|member"),30,0) +
      IF(L2:L5000=TRUE,20,0) +
      IF(AA2:AA5000<3,15,IF(AA2:AA5000<7,10,IF(AA2:AA5000<14,5,0))) -
      IF(AA2:AA5000>30,20,0) -
      IF(AA2:AA5000>60,30,0) +
      IF(ISNUMBER(P2:P5000)*(P2:P5000<=TODAY()+3)*(P2:P5000>=TODAY()), 50, 0),
      IF(score>=70,"🔥 HOT",IF(score>=40,"🟡 WARM","❄️ COLD"))
    )
  ))`);
  
  // AC2: Action Needed - Smart next step - HIGH FIX #4: Bounded to 5000 rows
  sheet.getRange('AC2').setFormula(`=ARRAYFORMULA(IF(A2:A5000="","",
    IF(Q2:Q5000=TRUE,"✅ Member",
      IF(V2:V5000=TRUE,"⛔ Cancelled",
        IF((O2:O5000<>"")*(P2:P5000<=TODAY()+3),"🔥 TRIAL EXPIRING!",
          IF((L2:L5000=FALSE)*(AA2:AA5000>=2),"📞 SET APPOINTMENT",
            IF((L2:L5000=TRUE)*(N2:N5000=FALSE)*(M2:M5000<TODAY()),"⚠️ NO-SHOW - FOLLOW UP",
              IF((N2:N5000=TRUE)*(O2:O5000=""),"🎯 OFFER TRIAL",
                IF((N2:N5000=TRUE)*(O2:O5000<>"")*(Q2:Q5000=FALSE),"💰 CLOSE DEAL",
                  IF(AA2:AA5000>=7,"⏰ OVERDUE CHECK-IN",
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
  
  // AD2: Duplicate Check - Flag potential duplicates - HIGH FIX #4: Bounded to 5000 rows
  sheet.getRange('AD2').setFormula('=ARRAYFORMULA(IF(A2:A5000="","",IF(OR(COUNTIF(E:E,E2:E5000)>1,COUNTIF(F:F,F2:F5000)>1),"⚠️ CHECK","✓")))');
  
  // AE2: Days to Convert - Time from lead to member - HIGH FIX #4: Bounded to 5000 rows
  sheet.getRange('AE2').setFormula('=ARRAYFORMULA(IF(A2:A5000="","",IF((Q2:Q5000=TRUE)*(R2:R5000<>""),INT(R2:R5000-B2:B5000),"")))');
  
  // Column widths
  sheet.setColumnWidth(1, 120);  // Lead ID
  sheet.setColumnWidth(2, 110);  // Created Date
  sheet.setColumnWidths(3, 5, 100);
  sheet.setColumnWidths(8, 3, 120);
  sheet.setColumnWidths(11, 15, 100);
  sheet.setColumnWidth(25, 200);  // Notes
  
  // Formats
  const dateColumns = ['B', 'G', 'M', 'O', 'P', 'R', 'W'];
  dateColumns.forEach(col => sheet.getRange(col + ':' + col).setNumberFormat('yyyy-mm-dd'));
  sheet.getRange('T:U').setNumberFormat('$#,##0.00');
  
  // Visual cues for auto columns
  sheet.getRange('H:H').setBackground('#e8f0fe').setNote('Auto-filled from UTM tracking');
  sheet.getRange('P:P').setBackground('#d9ead3').setNote('Auto-calculated: Trial Start + trial length');
  sheet.getRange('Z:Z').setBackground('#d9ead3').setNote('Auto-calculated from checkboxes');
  
  // Smart columns styling
  sheet.getRange('AA:AA').setBackground('#fff3cd').setNote('Auto-calculated: Days since created');
  sheet.getRange('AB:AB').setBackground('#e7f4e4').setFontWeight('bold').setNote('Auto-scored: 🔥 Hot (70+), 🟡 Warm (40-69), ❄️ Cold (<40)');
  sheet.getRange('AC:AC').setBackground('#fce8e6').setFontWeight('bold').setNote('Smart next action based on lead stage');
  sheet.getRange('AD:AD').setBackground('#f4cccc').setNote('Flags potential duplicates by phone/email');
  sheet.getRange('AE:AE').setBackground('#d9ead3').setNote('Auto-calculated: Days from lead to member');
  sheet.getRange('AF:AF').setBackground('#e8f0fe').setNote('Auto-updated: Timestamp of last note edit');
  
  // Column widths for new columns
  sheet.setColumnWidth(27, 100);  // Age
  sheet.setColumnWidth(28, 120);  // Lead Score
  sheet.setColumnWidth(29, 180);  // Action Needed
  sheet.setColumnWidth(30, 100);  // Duplicate
  sheet.setColumnWidth(31, 120);  // Days to Convert
  sheet.setColumnWidth(32, 160);  // Last Touchpoint
  
  // Conditional formatting for Lead Score
  const hotRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🔥').setBackground('#d4edda').setFontColor('#155724')
    .setRanges([sheet.getRange('AB:AB')]).build();
  const warmRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🟡').setBackground('#fff3cd').setFontColor('#856404')
    .setRanges([sheet.getRange('AB:AB')]).build();
  const coldRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('❄️').setBackground('#cfe2ff').setFontColor('#084298')
    .setRanges([sheet.getRange('AB:AB')]).build();
  
  // Conditional formatting for Action Needed urgency
  const urgentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🔥').setBackground('#f8d7da').setFontColor('#721c24')
    .setRanges([sheet.getRange('AC:AC')]).build();
  const warningRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('⚠️').setBackground('#fff3cd').setFontColor('#856404')
    .setRanges([sheet.getRange('AC:AC')]).build();
  const overdueRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('⏰').setBackground('#ffeeba').setFontColor('#856404')
    .setRanges([sheet.getRange('AC:AC')]).build();
  
  // Conditional formatting for Duplicates
  const dupRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('⚠️').setBackground('#f8d7da').setFontColor('#721c24')
    .setRanges([sheet.getRange('AD:AD')]).build();
  
  // Conditional formatting for Age (UX #11: Enhanced with emoji-based colors)
  const urgentLeadRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🔴').setBackground('#f8d7da').setFontColor('#721c24')
    .setRanges([sheet.getRange('AA:AA')]).build();
  const warningLeadRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('⚠️').setBackground('#fff3cd').setFontColor('#856404')
    .setRanges([sheet.getRange('AA:AA')]).build();
  const watchLeadRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('⏱️').setBackground('#fffbea').setFontColor('#9f7a00')
    .setRanges([sheet.getRange('AA:AA')]).build();
  const newLeadRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('🆕').setBackground('#e7f4e4').setFontColor('#2d5f2e')
    .setRanges([sheet.getRange('AA:AA')]).build();
  
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
  
  // MEDIUM FIX #16: Highlight active members (visual warning against deletion)
  const activeMemberRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($Q2=TRUE, $V2=FALSE)')
    .setBackground('#e7f4e4')  // Light green background
    .setRanges([sheet.getRange('A2:AE5000')])
    .build();
  
  const rules = [hotRule, warmRule, coldRule, urgentRule, warningRule, overdueRule, dupRule, urgentLeadRule, warningLeadRule, watchLeadRule, newLeadRule, paidSourceRule1, paidSourceRule2, organicSourceRule1, organicSourceRule2, organicSourceRule3, referralSourceRule1, referralSourceRule2, referralSourceRule3, sourceWarningRule, activeMemberRule];
  sheet.setConditionalFormatRules(rules);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COLUMN GROUPS (Phase 2.1 - Mobile-Friendly Collapsible Sections)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Group 1: FUNNEL (Columns L-P: 12-16)
  sheet.getRange('L:P').shiftColumnGroupDepth(1);
  
  // Group 2: CONVERSION (Columns Q-W: 17-23)
  sheet.getRange('Q:W').shiftColumnGroupDepth(1);
  
  // Group 3: ADMIN (Columns X-Z: 24-26)
  sheet.getRange('X:Z').shiftColumnGroupDepth(1);
  
  // Note: CORE (A-K) and SMART (AA-AE) remain always visible
  
  Logger.log('✅ Column groups added: FUNNEL, CONVERSION, ADMIN are collapsible');
  
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(4);
}

/**
 * Tab 3: Members (updated for new columns - now includes smart columns)
 */
function createMembersTab(ss) {
  let sheet = ss.getSheetByName('Members');
  if (!sheet) sheet = ss.insertSheet('Members');
  else sheet.clear();
  
  // Updated to include column AF (Last Touchpoint) - now A1:AF
  sheet.getRange('A1').setFormula('={\'Lead Data\'!A1:AF1; QUERY(FILTER(\'Lead Data\'!A2:AF,\'Lead Data\'!Q2:Q=TRUE,\'Lead Data\'!V2:V<>TRUE),"WHERE Col1 IS NOT NULL",0)}');
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
    ['CAC ($)', 150],
    ['Monthly Churn (%)', 0.05],
    ['ARPU ($)', 150]
  ];
  sheet.getRange(2, 1, targets.length, 2).setValues(targets);
  sheet.getRange('A2:B2').setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // Dropdowns
  sheet.getRange('A12').setValue('📋 DROPDOWN LISTS').setFontSize(14).setFontWeight('bold');
  const listHeaders = [['Sources', 'Staff', 'Location', 'Types', 'Cancel Reasons', '', 'Status Values']];
  sheet.getRange('A13:G13').setValues(listHeaders).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  const sources = ['Paid Search', 'Paid Social', 'Direct Traffic', 'Organic Search', 'Social Media', 'Referrals', 'Others', 'CRM UI', 'Third-Party', 'Member Referral', 'Walk-In'];
  const staff = ['Front Desk', 'Coach A', 'Coach B'];
  const location = 'Main Location'; // ✅ SIMPLIFIED: Single location (will be set to gym name by wizard)
  const types = ['PT', 'Small Group', 'General', 'Class Pack'];
  const reasons = ['Price', 'Moved', 'Injury', 'Service', 'Location', 'Other'];
  const statusValues = ['Lead', 'Appt Set', 'Show', 'Trial', 'Member', 'Cancelled'];
  
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
  // Requires valid dates between 1900-2100
  const dateRangeValidation = SpreadsheetApp.newDataValidation()
    .requireDate()
    .requireDateBetween(new Date(1900, 0, 1), new Date(2100, 11, 31))
    .setAllowInvalid(false)
    .setHelpText('⚠️ Enter a valid date (YYYY-MM-DD)')
    .build();
  sheet.getRange('B28:B29').setDataValidation(dateRangeValidation);
  
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
    .requireFormulaSatisfied('=OR(INDIRECT("RC",FALSE)="", REGEXMATCH(TEXT(INDIRECT("RC",FALSE),"@"), "^\\d{4}-\\d{2}$"))')
    .setAllowInvalid(false)
    .setHelpText('⚠️ Invalid format! Use YYYY-MM (e.g., 2025-10 for October 2025)')
    .build();
  sheet.getRange('A40:A100').setDataValidation(monthValidation);
  
  // Enhance help text for Month header
  sheet.getRange('A39').setNote('💡 Enter months in YYYY-MM format (e.g., 2025-10 for October 2025)\n\nThis ensures accurate daily spend calculations.');
  
  sheet.setColumnWidths(1, 6, 150);
  sheet.setColumnWidths(7, 3, 150);
  sheet.setFrozenRows(2);
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
function createHelpTab(ss) {
  let sheet = ss.getSheetByName('Help');
  if (!sheet) sheet = ss.insertSheet('Help');
  else sheet.clear();
  
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
    ['  • Column Groups: Collapse/expand sections for easier mobile use'],
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
    ['📱 MOBILE VIEWS'],
    ['  • Staff View: Front desk, filtered by staff member'],
    ['  • Sales View: Prioritized by lead score for closers'],
    ['  • Both show only essential columns'],
    [''],
    ['🗺️ UTM ATTRIBUTION & SOURCE MAPPING'],
    ['  • GHL workflow populates _UTM Tracking tab'],
    ['  • Settings & Budget has mapping table (fb_ad → Paid Social)'],
    ['  • Source in Lead Data auto-fills from mapping'],
    ['  • Add custom mappings in Settings & Budget column G-H'],
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
    ['1. Check "Cancelled?" checkbox (column V)'],
    ['2. Enter "Cancel Date" (column W) - auto-fills when you check box'],
    ['3. Select "Cancel Reason" (column X) - for analysis'],
    ['4. Add any notes (column Y)'],
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
 * Tab 7.1: 📱 Mobile View (UNIFIED - Phase 2.2: Role-based display)
 */
function createStaffViewTab(ss) {
  // Rename old tabs if they exist
  const oldStaffSheet = ss.getSheetByName('📱 Staff View');
  if (oldStaffSheet) oldStaffSheet.setName('📱 Mobile View');
  
  let sheet = ss.getSheetByName('📱 Mobile View');
  if (!sheet) sheet = ss.insertSheet('📱 Mobile View');
  sheet.clear();
  
  sheet.getRange('A1').setValue('📱 MOBILE VIEW').setFontSize(16).setFontWeight('bold');
  
  // Role selector (Phase 2.2)
  sheet.getRange('A3').setValue('Select Your Role:').setFontWeight('bold');
  const roleRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['📋 Front Desk (All Leads)', '💰 Sales (Score Sorted)', '📊 Manager (Quick Stats)'], true)
    .build();
  sheet.getRange('B3').setDataValidation(roleRule).setValue('📋 Front Desk (All Leads)');
  
  // Staff filter
  sheet.getRange('D3').setValue('Filter by Staff:').setFontWeight('bold');
  const settingsSheet = ss.getSheetByName('Settings & Budget') || ss.getSheetByName('Settings');
  const staffList = settingsSheet.getRange('B14:B16').getValues().flat().filter(s => s !== '');
  const staffRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['All Leads', 'Unassigned', ...staffList], true)
    .build();
  sheet.getRange('E3').setDataValidation(staffRule).setValue('All Leads');
  
  // Instructions (dynamic based on role)
  sheet.getRange('A4').setFormula(`
    =IF(B3="📋 Front Desk (All Leads)", 
      "💡 Quick data entry - perfect for front desk staff. Filter by staff owner above.",
      IF(B3="💰 Sales (Score Sorted)",
        "💡 Leads sorted by score - call 🔥 HOT leads first for best conversion!",
        "💡 Manager view - key metrics at a glance."
      )
    )
  `).setFontStyle('italic').setFontColor('#0f6938');
  
  // Dynamic data display based on role
  sheet.getRange('A6').setFormula(`
    =IF(B3="📋 Front Desk (All Leads)",
      {
        {"Lead ID", "Name", "Phone", "Email", "Source", "Staff Owner", "Age", "Score", "Action Needed", "Status"};
        ARRAYFORMULA(
          IF('Lead Data'!A2:A="","",
            {'Lead Data'!A2:A, 
             'Lead Data'!C2:C&" "&'Lead Data'!D2:D,
             'Lead Data'!E2:E,
             'Lead Data'!F2:F,
             'Lead Data'!H2:H,
             'Lead Data'!J2:J,
             'Lead Data'!AA2:AA,
             'Lead Data'!AB2:AB,
             'Lead Data'!AC2:AC,
             'Lead Data'!Z2:Z
            }
          )
        )
      },
      IF(B3="💰 Sales (Score Sorted)",
        SORT(
          {
            {"Score", "Action", "Name", "Phone", "Email", "Source", "Age", "Appt Date", "Status", "Staff"};
            ARRAYFORMULA(
              IF(AND('Lead Data'!A2:A<>"", 'Lead Data'!Q2:Q<>TRUE),"",
                {'Lead Data'!AB2:AB,
                 'Lead Data'!AC2:AC,
                 'Lead Data'!C2:C&" "&'Lead Data'!D2:D,
                 'Lead Data'!E2:E,
                 'Lead Data'!F2:F,
                 'Lead Data'!H2:H,
                 'Lead Data'!AA2:AA,
                 'Lead Data'!M2:M,
                 'Lead Data'!Z2:Z,
                 'Lead Data'!J2:J
                }
              )
            )
          },
          1, TRUE
        ),
        {
          {"Metric", "Today", "This Week", "This Month"};
          {"New Leads", COUNTIF('Lead Data'!B:B, TODAY()), COUNTIFS('Lead Data'!B:B, ">="&TODAY()-7), COUNTIFS('Lead Data'!B:B, ">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))};
          {"Appts Set", COUNTIF('Lead Data'!M:M, TODAY()), COUNTIFS('Lead Data'!M:M, ">="&TODAY()-7), COUNTIFS('Lead Data'!M:M, ">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))};
          {"Shows", COUNTIFS('Lead Data'!N:N, TRUE, 'Lead Data'!M:M, TODAY()), COUNTIFS('Lead Data'!N:N, TRUE, 'Lead Data'!M:M, ">="&TODAY()-7), COUNTIFS('Lead Data'!N:N, TRUE, 'Lead Data'!M:M, ">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))};
          {"Closes", COUNTIF('Lead Data'!R:R, TODAY()), COUNTIFS('Lead Data'!R:R, ">="&TODAY()-7), COUNTIFS('Lead Data'!R:R, ">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))}
        }
      )
    )
  `);
  
  sheet.getRange('A6:J6').setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  sheet.setColumnWidths(1, 10, 130);
  sheet.setFrozenRows(6);
  sheet.setFrozenColumns(2);
  
  Logger.log('✅ Mobile View created with role selector (Front Desk | Sales | Manager)');
}

/**
 * Tab 7.2: 📱 Sales View (DEPRECATED - Merged into Mobile View)
 */
function createSalesViewTab(ss) {
  const oldSheet = ss.getSheetByName('📱 Sales View');
  if (oldSheet) {
    ss.deleteSheet(oldSheet);
    Logger.log('✅ Removed old Sales View tab (now in Mobile View with role selector)');
  }
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
  sheet.getRange('A4').setValue('=QUERY(\'_LTV Calculations\'!N2:U11, "SELECT * WHERE Col1 IS NOT NULL ORDER BY Col7 DESC", 1)');
  
  // Section 2: LTV by Package (All-Time)
  sheet.getRange('A17').setValue('📦 LTV by Package Type (All-Time Data)').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A18').setValue('=QUERY(\'_LTV Calculations\'!W2:AD6, "SELECT * WHERE Col1 IS NOT NULL ORDER BY Col7 DESC", 1)');
  
  // Section 3: Monthly Churn Rate Trend
  sheet.getRange('A30').setValue('📉 Monthly Churn Rate (Last 12 Months)').setFontSize(14).setFontWeight('bold');
  sheet.getRange('A31').setValue('=QUERY(\'_LTV Calculations\'!A15:D27, "SELECT * WHERE Col1 IS NOT NULL ORDER BY Col1 DESC", 1)');
  
  // Section 4: Cohort Analysis - Monthly
  sheet.getRange('F30').setValue('📅 Cohort Analysis - Monthly (Last 12 Months)').setFontSize(14).setFontWeight('bold');
  sheet.getRange('F31').setValue('=QUERY(\'_LTV Calculations\'!F15:K27, "SELECT * WHERE Col1 IS NOT NULL ORDER BY Col1 DESC", 1)');
  
  // Section 5: Cohort Analysis - Quarterly
  sheet.getRange('M30').setValue('📅 Cohort Analysis - Quarterly (Last 8 Quarters)').setFontSize(14).setFontWeight('bold');
  sheet.getRange('M31').setValue('=QUERY(\'_LTV Calculations\'!M15:R23, "SELECT * WHERE Col1 IS NOT NULL ORDER BY Col1 DESC", 1)');
  
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
  else if (sheet.getLastRow() > 1) return;
  else sheet.clear();
  
  const headers = [[
    'Lead ID', 'Date Created', 'UTM Source', 'UTM Medium', 'UTM Campaign',
    'UTM Content', 'Match Type', 'Campaign ID', 'Ad Group ID', 'Ad ID',
    'GCLID', 'Contact Source', 'Opportunity Source', 'Pipeline Stage', 'Standardized Source'
  ]];
  
  sheet.getRange('A1:O1').setValues(headers).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // O2: Standardized Source (auto-mapped) - CRITICAL FIX #2: Enhanced with better fallback logic - HIGH FIX #4: Bounded to 5000 rows
  sheet.getRange('O2').setFormula(`=ARRAYFORMULA(IF(A2:A5000="","",
    IF(C2:C5000="","⚠️ No UTM",
      IFERROR(
        VLOOKUP(LOWER(C2:C5000),'Settings & Budget'!$G$3:$H$100,2,FALSE),
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
  
  sheet.getRange('A2').setValue('Run "Gym Ops → Generate Daily Spend" to populate this tab from Settings & Budget monthly budgets.');
  
  sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd');
  sheet.getRange('C:C').setNumberFormat('$#,##0.00'); // ✅ Updated column reference (was D)
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
  const chartSources = chartSettingsSheet ? chartSettingsSheet.getRange('A14:A24').getValues().flat().filter(s => s !== '') : 
    ['Paid Search', 'Paid Social', 'Direct Traffic', 'Organic Search', 'Social Media', 'Referrals', 'Others', 'CRM UI', 'Third-Party', 'Member Referral', 'Walk-In'];
  
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
    ['Leads', '=COUNTIFS(\'Lead Data\'!B:B,">="&'Settings & Budget'!$B$30,\'Lead Data\'!B:B,"<="&'Settings & Budget'!$B$31)'],
    ['Appts Set', '=COUNTIFS(\'Lead Data\'!L:L,TRUE,\'Lead Data\'!B:B,">="&'Settings & Budget'!$B$30,\'Lead Data\'!B:B,"<="&'Settings & Budget'!$B$31)'],
    ['Showed', '=COUNTIFS(\'Lead Data\'!N:N,TRUE,\'Lead Data\'!B:B,">="&'Settings & Budget'!$B$30,\'Lead Data\'!B:B,"<="&'Settings & Budget'!$B$31)'],
    ['Trials', '=COUNTIFS(\'Lead Data\'!O:O,">="&'Settings & Budget'!$B$30,\'Lead Data\'!O:O,"<="&'Settings & Budget'!$B$31,\'Lead Data\'!O:O,"<>")'],
    ['Members', '=COUNTIFS(\'Lead Data\'!R:R,">="&'Settings & Budget'!$B$30,\'Lead Data\'!R:R,"<="&'Settings & Budget'!$B$31,\'Lead Data\'!Q:Q,TRUE)']
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
    sheet.getRange(row, 5).setFormula(`=SUMIFS('Lead Data'!T:T,'Lead Data'!R:R,">="&D${row},'Lead Data'!R:R,"<="&(D${row}+6),'Lead Data'!Q:Q,TRUE)`).setNumberFormat('$#,##0');
    sheet.getRange(row, 6).setFormula(`=SUMIFS('Lead Data'!U:U,'Lead Data'!R:R,">="&D${row},'Lead Data'!R:R,"<="&(D${row}+6),'Lead Data'!Q:Q,TRUE)`).setNumberFormat('$#,##0');
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
    sheet.getRange(row, 10).setFormula(`=LET(spend,SUMIFS('_Daily Spend'!C:C,'_Daily Spend'!B:B,"${source}",'_Daily Spend'!A:A,">="&'Settings & Budget'!$B$30,'_Daily Spend'!A:A,"<="&'Settings & Budget'!$B$31),members,COUNTIFS('Lead Data'!H:H,"${source}",'Lead Data'!R:R,">="&'Settings & Budget'!$B$30,'Lead Data'!R:R,"<="&'Settings & Budget'!$B$31,'Lead Data'!Q:Q,TRUE),IF(members=0,IF(spend>0,"Spend/0","-"),spend/members))`).setNumberFormat('$#,##0');
  });
  
  // Section 5: Monthly New Members vs Target (last 12 months)
  sheet.getRange('L95').setValue('Monthly New Members vs Target').setFontWeight('bold');
  const headers5 = [['Month', 'New Members', 'Target']];
  sheet.getRange('L96:N96').setValues(headers5).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  for (let i = 11; i >= 0; i--) {
    const row = 108 - i;
    sheet.getRange(row, 12).setFormula(`=DATE(YEAR(TODAY()),MONTH(TODAY())-${i},1)`).setNumberFormat('mmm yyyy');
    sheet.getRange(row, 13).setFormula(`=COUNTIFS('Lead Data'!R:R,">="&L${row},'Lead Data'!R:R,"<"&EOMONTH(L${row},0)+1,'Lead Data'!Q:Q,TRUE)`);
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
    sheet.getRange(row, 20).setFormula(`=LET(spend,SUMIFS('_Daily Spend'!C:C,'_Daily Spend'!B:B,"${source}",'_Daily Spend'!A:A,">="&'Settings & Budget'!$B$30,'_Daily Spend'!A:A,"<="&'Settings & Budget'!$B$31),members,COUNTIFS('Lead Data'!H:H,"${source}",'Lead Data'!R:R,">="&'Settings & Budget'!$B$30,'Lead Data'!R:R,"<="&'Settings & Budget'!$B$31,'Lead Data'!Q:Q,TRUE),IF(members=0,IF(spend>0,"Spend/0","-"),spend/members))`).setNumberFormat('$#,##0');
    // Lead Volume
    sheet.getRange(row, 21).setFormula(`=COUNTIFS('Lead Data'!H:H,"${source}",'Lead Data'!B:B,">="&'Settings & Budget'!$B$30,'Lead Data'!B:B,"<="&'Settings & Budget'!$B$31)`);
    // Close Rate
    sheet.getRange(row, 22).setFormula(`=IFERROR(COUNTIFS('Lead Data'!H:H,"${source}",'Lead Data'!Q:Q,TRUE,'Lead Data'!R:R,">="&'Settings & Budget'!$B$30,'Lead Data'!R:R,"<="&'Settings & Budget'!$B$31)/U${row},0)`).setNumberFormat('0.0%');
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
    sheet.getRange(row, 2).setFormula(`=COUNTIFS('Lead Data'!R:R,"<="&A${row},'Lead Data'!Q:Q,TRUE)-COUNTIFS('Lead Data'!W:W,"<="&A${row},'Lead Data'!V:V,TRUE)`);
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
  const membershipTypes = ['PT', 'Small Group', 'General', 'Class Pack'];
  
  // Create formulas for each membership type
  membershipTypes.forEach((type, idx) => {
    const row = idx + 5;
    
    // A: Membership Type
    sheet.getRange(row, 1).setValue(type);
    
    // B: Gains = COUNT where Member Start (R/col 18) is in range AND Membership Type (S/col 19) matches
    sheet.getRange(row, 2).setFormula(
      `=COUNTIFS('Lead Data'!R:R,">="&'Settings & Budget'!$B$30,'Lead Data'!R:R,"<="&'Settings & Budget'!$B$31,'Lead Data'!S:S,"${type}",'Lead Data'!Q:Q,TRUE)`
    );
    
    // C: Losses = COUNT where Cancel Date (W/col 23) is in range AND Membership Type (S/col 19) matches
    sheet.getRange(row, 3).setFormula(
      `=COUNTIFS('Lead Data'!W:W,">="&'Settings & Budget'!$B$30,'Lead Data'!W:W,"<="&'Settings & Budget'!$B$31,'Lead Data'!S:S,"${type}",'Lead Data'!V:V,TRUE)`
    );
    
    // D: Net = Gains - Losses
    sheet.getRange(row, 4).setFormula(`=B${row}-C${row}`);
    
    // E: % Change = Net / (Active Members of this type at start of period)
    // For simplicity, we'll calculate: Net / MAX(Losses, 1) to avoid divide by zero
    sheet.getRange(row, 5).setFormula(`=IF(C${row}=0,IF(B${row}=0,"—","+∞"),B${row}/C${row}-1)`);
  });
  
  // Add "All Types" rollup row
  const rollupRow = 9;
  sheet.getRange(rollupRow, 1).setValue('All Types').setFontWeight('bold');
  sheet.getRange(rollupRow, 2).setFormula('=SUM(B5:B8)').setFontWeight('bold');
  sheet.getRange(rollupRow, 3).setFormula('=SUM(C5:C8)').setFontWeight('bold');
  sheet.getRange(rollupRow, 4).setFormula('=SUM(D5:D8)').setFontWeight('bold');
  sheet.getRange(rollupRow, 5).setFormula('=IF(C9=0,IF(B9=0,"—","+∞"),B9/C9-1)').setFontWeight('bold');
  
  // Formatting
  sheet.getRange('B5:D9').setNumberFormat('0'); // Integer counts
  sheet.getRange('E5:E9').setNumberFormat('0.0%'); // Percentage
  
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
  const combinedMembersFormula = '=QUERY({' +
    'QUERY(\'Import Members\'!A4:L500, "SELECT Col8, Col1, Col2&\' \'&Col3, Col4, Col5, Col6, Col7, Col8, Col11, Col12, Col4, Col4 WHERE Col1 IS NOT NULL", 0);' +
    'QUERY(\'Lead Data\'!A2:Z5000, "SELECT Col8, Col1, Col3&\' \'&Col4, Col18, Col19, Col20, Col7, Col23, Col4, Col20*12, Col4, Col4 WHERE Col17=TRUE", 0)' +
    '}, "SELECT * WHERE Col1 IS NOT NULL", 0)';
  sheet.getRange('A3').setFormula(combinedMembersFormula).setNote('Combines Import Members + Converted members from Lead Data');
  
  // Section 2: LTV by Source (All-Time) - using all sources from Settings
  sheet.getRange('N1').setValue('LTV by Source (All-Time)').setFontWeight('bold');
  const headers2 = [['Source', 'Total Members', 'Active', 'Cancelled', 'Avg Lifespan', 'Avg MRR', 'Avg LTV', 'Retention Rate %']];
  sheet.getRange('N2:U2').setValues(headers2).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
  
  // Pull all 11 sources from Settings & Budget (single source of truth)
  const settingsSheet = ss.getSheetByName('Settings & Budget');
  const allSources = settingsSheet ? settingsSheet.getRange('A14:A24').getValues().flat().filter(s => s !== '') : 
    ['Paid Search', 'Paid Social', 'Direct Traffic', 'Organic Search', 'Social Media', 'Referrals', 'Others', 'CRM UI', 'Third-Party', 'Member Referral', 'Walk-In'];
  
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
  
  const packages = ['PT', 'Small Group', 'General', 'Class Pack'];
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
    
    // Membership Type list (D14:D17 - 4 types: PT, Small Group, General, Class Pack)
    ss.setNamedRange('MembershipTypes', settings.getRange('D14:D17'));
    
    // Status values (for filtering) - using Current Status auto-calculated values
    // Create a reference range in Settings for allowed status values
    ss.setNamedRange('StatusValues', settings.getRange('G14:G19'));
    
    Logger.log('✅ Named ranges created: rngStart, rngEnd, MembershipTypes, StatusValues');
  } catch (e) {
    Logger.log('Named ranges error: ' + e);
  }
}

function setupDataValidations(ss) {
  const leadData = ss.getSheetByName('Lead Data');
  const settings = ss.getSheetByName('Settings & Budget');
  const marketing = ss.getSheetByName('Marketing');
  
  if (!leadData || !settings) return;
  
  const sourceRange = settings.getRange('A14:A100');
  const staffRange = settings.getRange('B14:B100');
  const locationRange = settings.getRange('C14:C100');
  const typeRange = settings.getRange('D14:D100');
  const reasonRange = settings.getRange('E14:E100');
  
  // CRITICAL FIX #2: Source (H) data validation - auto-filled formula, but users can override by selecting from dropdown
  leadData.getRange('H2:H5000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(sourceRange, true).setAllowInvalid(true).build());
  
  leadData.getRange('J2:J5000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(staffRange, true).build()); // Staff
  leadData.getRange('K2:K5000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(locationRange, true).build()); // Location
  leadData.getRange('S2:S5000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(typeRange, true).build()); // Membership Type
  leadData.getRange('X2:X5000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(reasonRange, true).build()); // Cancel Reason
  
  const checkbox = SpreadsheetApp.newDataValidation().requireCheckbox().build();
  leadData.getRange('L2:L5000').setDataValidation(checkbox); // Appt Set?
  leadData.getRange('N2:N5000').setDataValidation(checkbox); // Show?
  leadData.getRange('O2:O5000').setDataValidation(checkbox); // Start Trial? (converts to date on check)
  leadData.getRange('Q2:Q5000').setDataValidation(checkbox); // Converted?
  leadData.getRange('V2:V5000').setDataValidation(checkbox); // Cancelled?
  
  if (marketing) {
    marketing.getRange('B3:B5000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(sourceRange, true).build());
    marketing.getRange('C3:C5000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(locationRange, true).build());
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
      protectColumn(leadData, 'P', 'Trial End (auto)');
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
    const range = sheet.getRange(column + '2:' + column + '5000');
    const protection = range.protect();
    protection.setDescription(description);
    protection.setWarningOnly(true);
  } catch (e) {
    Logger.log('Protection error for column ' + column + ': ' + e);
  }
}

function reorderTabs(ss) {
  const order = ['DASHBOARD', 'Lead Data', 'Members', 'Settings', 'Marketing', 'Staff', 'Help', '_UTM Tracking', '_Daily Spend', '_Data'];
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
// MONTHLY → DAILY SPEND GENERATOR
// ============================================================

function generateDailySpend() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const settings = ss.getSheetByName('Settings & Budget'); // ✅ UPDATED: Now in Settings & Budget tab
  const dailySpend = ss.getSheetByName('_Daily Spend');
  
  if (!settings || !dailySpend) {
    ui.alert('Error', 'Settings & Budget or _Daily Spend tab not found', ui.ButtonSet.OK);
    return;
  }
  
  try {
    // Clear existing data
    if (dailySpend.getLastRow() > 1) {
      dailySpend.getRange(2, 1, dailySpend.getLastRow() - 1, 3).clear(); // ✅ UPDATED: Only 3 columns now
    }
    
    // Get monthly budget data (starting from row 40)
    const lastRow = settings.getLastRow();
    if (lastRow < 40) {
      ui.alert('⚠️ No Data', 'No monthly budgets found in Settings & Budget tab (row 40+).\n\nTo add budgets:\n1. Go to Settings & Budget tab\n2. Scroll to row 40+\n3. Enter: Month (YYYY-MM), Source, Monthly Budget', ui.ButtonSet.OK);
      return;
    }
    
    const data = settings.getRange(40, 1, lastRow - 39, 5).getValues(); // ✅ Read from row 40, columns A-E
    const dailyRows = [];
    let validRowsFound = 0;
    
    for (let i = 0; i < data.length; i++) {
      if (!data[i][0]) continue; // Skip empty rows
      
      const month = data[i][0]; // "2025-01" or Date object
      const source = data[i][1];
      const monthlyBudget = data[i][2]; // ✅ UPDATED: Column C (was D)
      const daysInMonth = data[i][3]; // ✅ UPDATED: Column D (was E) - may be formula result
      const dailyRate = data[i][4]; // ✅ UPDATED: Column E (was F) - may be formula result
      
      // Skip if essential data is missing or formula hasn't calculated
      if (!month || !source || !monthlyBudget || monthlyBudget === 0) continue;
      if (!daysInMonth || daysInMonth === "" || daysInMonth === 0) continue;
      if (!dailyRate || dailyRate === "" || dailyRate === 0) continue;
      
      validRowsFound++;
      
      // Parse month (handle both string "2025-01" and Date objects)
      let monthStr = month;
      if (month instanceof Date) {
        monthStr = Utilities.formatDate(month, Session.getScriptTimeZone(), 'yyyy-MM');
      }
      
      const monthDate = new Date(monthStr + '-01');
      const year = monthDate.getFullYear();
      const monthNum = monthDate.getMonth();
      
      // Generate daily rows
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthNum, day);
        dailyRows.push([date, source, dailyRate]); // ✅ SIMPLIFIED: No location column
      }
    }
    
    if (dailyRows.length > 0) {
      dailySpend.getRange(2, 1, dailyRows.length, 3).setValues(dailyRows); // ✅ UPDATED: 3 columns (was 4)
      ui.alert('✅ Success', `Generated ${dailyRows.length} daily spend rows from ${validRowsFound} monthly budget(s).`, ui.ButtonSet.OK);
    } else {
      ui.alert(
        '⚠️ No Valid Data', 
        'No valid monthly budgets found in Settings & Budget tab (row 40+).\n\n' +
        'Make sure columns D and E show calculated values (not empty or zero).\n\n' +
        'To fix:\n' +
        '1. Go to Settings & Budget tab\n' +
        '2. Check row 40+ has: Month, Source, Monthly Budget\n' +
        '3. Wait for formulas in columns D & E to calculate\n' +
        '4. Try again', 
        ui.ButtonSet.OK
      );
    }
    
  } catch (error) {
    ui.alert('Error', 'Generation failed: ' + error.toString() + '\n\nPlease check Settings & Budget tab row 40+', ui.ButtonSet.OK);
  }
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
  
  if (confirm !== ui.Button.YES) return;
  
  try {
    const leadData = ss.getSheetByName('Lead Data');
    const utmTracking = ss.getSheetByName('_UTM Tracking');
    
    if (!leadData || !utmTracking) {
      ui.alert('Error', 'Please run "Initialize Template" first.', ui.ButtonSet.OK);
      return;
    }
    
    // Sample data configuration - using all 11 sources from Settings
    const sources = ['Paid Search', 'Paid Social', 'Direct Traffic', 'Organic Search', 'Social Media', 'Referrals', 'Others', 'CRM UI', 'Third-Party', 'Member Referral', 'Walk-In'];
    const utmSources = ['google', 'facebook', 'direct', 'organic', 'instagram', 'referral', 'other', 'gohighlevel', 'third-party', 'member_referral', 'walkin'];
    const campaigns = ['spring-promo', 'summer-sale', 'back-to-school', 'new-year', 'organic', '', 'portal', 'api', 'member-program'];
    const firstNames = ['John', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'Chris', 'Anna', 'James', 'Maria', 'Tom', 'Kate', 'Alex', 'Jen', 'Dan'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia', 'Lee'];
    const staff = ['Coach A', 'Coach B', 'Front Desk'];
    const location = 'Main Location'; // ✅ SIMPLIFIED: Single location
    const membershipTypes = ['PT', 'Small Group', 'General', 'Class Pack'];
    const cancelReasons = ['Price', 'Moved', 'Injury', 'Service', 'Location', 'Other'];
    
    const today = new Date();
    const leadRows = [];
    const utmRows = [];
    
    // Generate 50 sample leads
    for (let i = 1; i <= 50; i++) {
      const leadId = 'LEAD-' + String(10000 + i).padStart(5, '0');
      const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
      const createdDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const phone = '555-' + String(Math.floor(Math.random() * 900) + 100) + '-' + String(Math.floor(Math.random() * 9000) + 1000);
      const email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + '@example.com';
      
      // Random DOB (25-45 years old)
      const birthYear = new Date().getFullYear() - (25 + Math.floor(Math.random() * 20));
      const dob = new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      
      const sourceIdx = Math.floor(Math.random() * sources.length);
      const source = sources[sourceIdx];
      const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
      const staffOwner = staff[Math.floor(Math.random() * staff.length)];
      // location already defined above as single value ('Main Location')
      
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
      const utmSource = utmSources[sourceIdx];
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
      '1. Go to Marketing tab and add monthly budgets\n' +
      '2. Run "Gym Ops → Generate Daily Spend"\n' +
      '3. Check DASHBOARD to see metrics and Source Analysis\n\n' +
      'Note: Source column will auto-fill based on UTM mapping.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('Error', error.toString(), ui.ButtonSet.OK);
    Logger.log('Sample data error: ' + error.toString());
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
// DAILY REPORT GENERATOR (UX #5 - PHASE B)
// ============================================================

/**
 * UX #5: Generate Daily Report - One-click end-of-day summary
 * Creates a comprehensive daily report with key metrics and action items
 */
function generateDailyReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const leadData = ss.getSheetByName('Lead Data');
  
  if (!leadData) {
    ui.alert('❌ Error', 'Lead Data tab not found. Run "Initialize Template" first.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    const today = new Date();
    const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'EEEE, MMMM dd, yyyy');
    
    // Get all lead data
    const lastRow = leadData.getLastRow();
    if (lastRow < 2) {
      ui.alert('📊 Daily Report', 'No lead data available yet.', ui.ButtonSet.OK);
      return;
    }
    
    const data = leadData.getRange(2, 1, lastRow - 1, 31).getValues(); // A2:AE (all columns)
    
    // Calculate metrics
    const metrics = calculateDailyMetrics(data, today);
    
    // Build report
    const report = buildDailyReportText(todayStr, metrics, data);
    
    // Show report in dialog
    const htmlOutput = HtmlService.createHtmlOutput(
      `<html>
        <head>
          <base target="_top">
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; white-space: pre-wrap; }
            h2 { color: #4285f4; }
            .copy-btn { 
              position: fixed; 
              top: 10px; 
              right: 10px; 
              padding: 10px 20px; 
              background: #4285f4; 
              color: white; 
              border: none; 
              border-radius: 4px; 
              cursor: pointer;
              font-size: 14px;
            }
            .copy-btn:hover { background: #3367d6; }
          </style>
        </head>
        <body>
          <button class="copy-btn" onclick="copyReport()">📋 Copy to Clipboard</button>
          <div id="report">${report.replace(/\n/g, '<br>')}</div>
          <script>
            function copyReport() {
              const text = document.getElementById('report').innerText;
              navigator.clipboard.writeText(text).then(() => {
                alert('✅ Report copied to clipboard!');
              });
            }
          </script>
        </body>
      </html>`
    )
    .setWidth(700)
    .setHeight(600);
    
    ui.showModalDialog(htmlOutput, '📊 Daily Report - ' + todayStr);
    
  } catch (error) {
    ui.alert('❌ Error', 'Failed to generate report: ' + error.toString(), ui.ButtonSet.OK);
    Logger.log('Daily Report Error: ' + error.toString());
  }
}

/**
 * Calculate daily metrics from lead data
 */
function calculateDailyMetrics(data, today) {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 30);
  
  const metrics = {
    // New leads today
    newLeadsToday: 0,
    newLeadsYesterday: 0,
    
    // Appointments
    apptsSetToday: 0,
    apptsShowedToday: 0,
    
    // Trials
    trialsStartedToday: 0,
    trialsExpiringNext3Days: 0,
    
    // Conversions
    conversionsToday: 0,
    conversionsLast30Days: 0,
    
    // Action items
    noApptSet24h: [],
    noShows: [],
    trialsExpiringSoon: [],
    
    // Source breakdown
    sourceBreakdown: {},
    
    // Hot leads
    hotLeads: 0,
    
    // Old leads needing follow-up
    oldLeads7Plus: 0
  };
  
  data.forEach(row => {
    const leadId = row[0];
    const createdDate = row[1];
    const firstName = row[2];
    const lastName = row[3];
    const source = row[7];
    const apptSet = row[11];
    const show = row[13];
    const trialStart = row[14];
    const trialEnd = row[15];
    const converted = row[16];
    const memberStart = row[17];
    const cancelled = row[21];
    const age = row[26];
    const leadScore = row[27];
    
    // Skip empty rows
    if (!leadId) return;
    
    // New leads
    if (createdDate instanceof Date) {
      if (isSameDay(createdDate, today)) {
        metrics.newLeadsToday++;
      }
      if (isSameDay(createdDate, yesterday)) {
        metrics.newLeadsYesterday++;
      }
    }
    
    // Appointments set today
    if (apptSet instanceof Date && isSameDay(apptSet, today)) {
      metrics.apptsSetToday++;
    }
    
    // Shows today
    if (show === true) {
      // Approximation: if appointment date exists and they showed
      metrics.apptsShowedToday++;
    }
    
    // Trials started today
    if (trialStart instanceof Date && isSameDay(trialStart, today)) {
      metrics.trialsStartedToday++;
    }
    
    // Trials expiring in next 3 days
    if (trialEnd instanceof Date && !converted && !cancelled) {
      const daysUntilExpiry = Math.ceil((trialEnd - today) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry >= 0 && daysUntilExpiry <= 3) {
        metrics.trialsExpiringNext3Days++;
        metrics.trialsExpiringSoon.push(`${firstName} ${lastName}`);
      }
    }
    
    // Conversions
    if (converted === true) {
      if (memberStart instanceof Date && isSameDay(memberStart, today)) {
        metrics.conversionsToday++;
      }
      if (memberStart instanceof Date && memberStart >= last30Days) {
        metrics.conversionsLast30Days++;
      }
    }
    
    // Action items: No appt set within 24h
    if (!apptSet && !converted && !cancelled && createdDate instanceof Date) {
      const daysSinceCreated = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
      if (daysSinceCreated >= 1) {
        metrics.noApptSet24h.push(`${firstName} ${lastName}`);
      }
    }
    
    // Source breakdown
    if (source) {
      metrics.sourceBreakdown[source] = (metrics.sourceBreakdown[source] || 0) + 1;
    }
    
    // Hot leads
    if (typeof leadScore === 'string' && leadScore.includes('🔥 HOT') && !converted && !cancelled) {
      metrics.hotLeads++;
    }
    
    // Old leads (7+ days)
    if (typeof age === 'string' && (age.includes('⚠️') || age.includes('🔴'))) {
      metrics.oldLeads7Plus++;
    }
  });
  
  return metrics;
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Build the daily report text
 */
function buildDailyReportText(dateStr, metrics, data) {
  const lines = [];
  
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('📊 DAILY REPORT - ' + dateStr);
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  
  // NEW LEADS
  lines.push('🆕 NEW LEADS');
  lines.push(`   Today: ${metrics.newLeadsToday}`);
  lines.push(`   Yesterday: ${metrics.newLeadsYesterday}`);
  
  // Top sources
  if (Object.keys(metrics.sourceBreakdown).length > 0) {
    const topSources = Object.entries(metrics.sourceBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    lines.push(`   Top Sources: ${topSources.map(([source, count]) => `${source} (${count})`).join(', ')}`);
  }
  
  if (metrics.hotLeads > 0) {
    lines.push(`   🔥 Hot: ${metrics.hotLeads} | 🟡 Warm: N/A | 🔵 Cold: N/A`);
  }
  lines.push('');
  
  // APPOINTMENTS
  lines.push('📞 APPOINTMENTS');
  lines.push(`   Set Today: ${metrics.apptsSetToday}`);
  if (metrics.apptsSetToday > 0) {
    const setRate = Math.round((metrics.apptsSetToday / Math.max(metrics.newLeadsToday, 1)) * 100);
    lines.push(`   Set Rate: ${setRate}%`);
  }
  lines.push('');
  
  // TRIALS
  lines.push('🎟️ TRIALS');
  lines.push(`   Started Today: ${metrics.trialsStartedToday}`);
  lines.push(`   Expiring Soon (3d): ${metrics.trialsExpiringNext3Days}`);
  if (metrics.trialsExpiringSoon.length > 0) {
    lines.push(`   🎯 ACTION: Follow up with ${metrics.trialsExpiringSoon.slice(0, 5).join(', ')}${metrics.trialsExpiringSoon.length > 5 ? ` +${metrics.trialsExpiringSoon.length - 5} more` : ''}`);
  }
  lines.push('');
  
  // CONVERSIONS
  lines.push('💰 CONVERSIONS');
  lines.push(`   New Members Today: ${metrics.conversionsToday}`);
  if (metrics.conversionsToday > 0) {
    lines.push(`   🎉 Great work! ${metrics.conversionsToday} new member${metrics.conversionsToday > 1 ? 's' : ''}!`);
  }
  lines.push(`   Last 30 Days: ${metrics.conversionsLast30Days}`);
  lines.push('');
  
  // ACTION NEEDED
  lines.push('⚠️ ATTENTION NEEDED');
  lines.push(`   No Appt Set (24h+): ${metrics.noApptSet24h.length}`);
  if (metrics.noApptSet24h.length > 0) {
    lines.push(`   🎯 ACTION: Contact ${metrics.noApptSet24h.slice(0, 5).join(', ')}${metrics.noApptSet24h.length > 5 ? ` +${metrics.noApptSet24h.length - 5} more` : ''}`);
  }
  
  if (metrics.oldLeads7Plus > 0) {
    lines.push(`   Old Leads (7+ days): ${metrics.oldLeads7Plus}`);
    lines.push(`   🎯 ACTION: Review and follow up on aging leads`);
  }
  lines.push('');
  
  // SUMMARY
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('📈 SUMMARY');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const totalActionItems = metrics.noApptSet24h.length + metrics.trialsExpiringNext3Days;
  
  if (metrics.conversionsToday > 0) {
    lines.push(`✅ Excellent day! ${metrics.conversionsToday} new member${metrics.conversionsToday > 1 ? 's' : ''} joined!`);
  } else if (metrics.newLeadsToday > 5) {
    lines.push('✅ Great lead flow today!');
  } else if (metrics.newLeadsToday > 0) {
    lines.push('✅ Keep up the good work!');
  } else {
    lines.push('⚠️ No new leads today - review marketing!');
  }
  
  if (totalActionItems > 0) {
    lines.push(`⚠️ ${totalActionItems} action item${totalActionItems > 1 ? 's' : ''} need${totalActionItems === 1 ? 's' : ''} attention`);
  } else {
    lines.push('✅ No urgent action items - great job staying on top of leads!');
  }
  
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('🎯 Keep up the great work! 💪');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return lines.join('\n');
}

// ============================================================
// DARK MODE TOGGLE (LOW FIX #18 - FINAL FIX!)
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

/**
 * LOW FIX #18: Toggle Dark Mode
 * Switches DASHBOARD between light and dark theme for better viewing in low-light environments
 * This is the FINAL fix to reach 100% completion! 🎉
 */
function toggleDarkMode() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const dashboard = ss.getSheetByName('DASHBOARD');
  
  if (!dashboard) {
    ui.alert('❌ Error', 'DASHBOARD not found. Run "Initialize Template" first.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    // Check current background color of A1 to determine current mode
    const currentBg = dashboard.getRange('A1').getBackground().toLowerCase();
    const isDarkMode = (currentBg === '#1e1e1e');
    
    if (isDarkMode) {
      // ═══════════════════════════════════════════════════════════
      // Switch to LIGHT MODE
      // ═══════════════════════════════════════════════════════════
      
      dashboard.setTabColor('#4285f4');  // Blue tab
      
      // Reset all content to white background, black text
      dashboard.getRange('A:Z').setBackground('#ffffff').setFontColor('#000000');
      
      // Reset header rows to original blue
      dashboard.getRange('A6:F6').setBackground('#4285f4').setFontColor('#ffffff');
      dashboard.getRange('A51:L51').setBackground('#4285f4').setFontColor('#ffffff');
      dashboard.getRange('A70:G70').setBackground('#4285f4').setFontColor('#ffffff');
      dashboard.getRange('I70:J70').setBackground('#4285f4').setFontColor('#ffffff');
      dashboard.getRange('A86:H86').setBackground('#4285f4').setFontColor('#ffffff');
      
      // Reset section headers
      const sectionHeaders = ['A1', 'A5', 'A17', 'A37', 'A50', 'A65', 'A85', 'A95'];
      sectionHeaders.forEach(cell => {
        dashboard.getRange(cell).setBackground('#ffffff').setFontColor('#000000');
      });
      
      ui.alert(
        '☀️ Light Mode Enabled',
        'DASHBOARD switched to light theme.\n\nTo switch back: Gym Ops → Toggle Dark Mode',
        ui.ButtonSet.OK
      );
      
    } else {
      // ═══════════════════════════════════════════════════════════
      // Switch to DARK MODE
      // ═══════════════════════════════════════════════════════════
      
      dashboard.setTabColor('#2d2d30');  // Dark gray tab
      
      // Apply dark background and white text to all content
      dashboard.getRange('A:Z').setBackground('#1e1e1e').setFontColor('#ffffff');
      
      // Update header rows for dark mode (darker gray)
      dashboard.getRange('A6:F6').setBackground('#2d2d30').setFontColor('#ffffff');
      dashboard.getRange('A51:L51').setBackground('#2d2d30').setFontColor('#ffffff');
      dashboard.getRange('A70:G70').setBackground('#2d2d30').setFontColor('#ffffff');
      dashboard.getRange('I70:J70').setBackground('#2d2d30').setFontColor('#ffffff');
      dashboard.getRange('A86:H86').setBackground('#2d2d30').setFontColor('#ffffff');
      
      // Update section headers (slightly lighter than content for contrast)
      const sectionHeaders = ['A1', 'A5', 'A17', 'A37', 'A50', 'A65', 'A85', 'A95'];
      sectionHeaders.forEach(cell => {
        dashboard.getRange(cell).setBackground('#2d2d30').setFontColor('#ffffff');
      });
      
      ui.alert(
        '🌙 Dark Mode Enabled',
        'DASHBOARD switched to dark theme.\n\nBenefits:\n• Reduces eye strain in low light\n• Modern, professional appearance\n• Better for late-night reviews\n\nTo revert: Gym Ops → Toggle Dark Mode',
        ui.ButtonSet.OK
      );
    }
    
    Logger.log('Dark mode toggled successfully. New mode: ' + (isDarkMode ? 'Light' : 'Dark'));
    
  } catch (error) {
    ui.alert('❌ Error', `Failed to toggle dark mode: ${error.toString()}\n\nCheck script logs for details.`, ui.ButtonSet.OK);
    Logger.log('Dark mode toggle error: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
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
