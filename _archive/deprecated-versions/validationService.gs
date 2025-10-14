/**
 * ValidationService - Centralized validation logic
 * Makes duplicate detection and date validation configurable
 * 
 * Created: October 9, 2025
 * Purpose: Extract validation logic, make it reusable and configurable
 * 
 * Configuration stored in Settings & Budget tab:
 * - B35: Enable duplicate detection (TRUE/FALSE)
 * - B36: Duplicate check fields (Phone, Email, Both)
 * - B37: Date validation strictness (Strict, Warning, Off)
 */

var ValidationService = (function() {
  
  /**
   * Get validation configuration from Settings & Budget
   * @param {Spreadsheet} ss - Active spreadsheet
   * @returns {Object} Configuration object
   */
  function getConfig(ss) {
    const settings = ss.getSheetByName('Settings & Budget');
    
    if (!settings) {
      // Return defaults if Settings not found
      return {
        duplicateDetectionEnabled: true,
        duplicateCheckFields: 'Both', // 'Phone', 'Email', or 'Both'
        dateValidationLevel: 'Warning' // 'Strict', 'Warning', or 'Off'
      };
    }
    
    return {
      duplicateDetectionEnabled: settings.getRange('B35').getValue() !== false, // Default: true
      duplicateCheckFields: settings.getRange('B36').getValue() || 'Both',
      dateValidationLevel: settings.getRange('B37').getValue() || 'Warning'
    };
  }
  
  /**
   * Check for duplicate lead (phone or email)
   * @param {Sheet} sheet - Lead Data sheet
   * @param {number} currentRow - Row being edited
   * @param {number} col - Column being edited
   * @param {*} value - Value entered
   * @returns {Object|null} Duplicate info or null
   */
  function checkDuplicate(sheet, currentRow, col, value) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const config = getConfig(ss);
      
      // Check if duplicate detection is enabled
      if (!config.duplicateDetectionEnabled) {
        return null; // Disabled
      }
      
      // Check if this field should be validated
      const isPhoneCol = (col === 5); // Column E
      const isEmailCol = (col === 6); // Column F
      
      if (config.duplicateCheckFields === 'Phone' && !isPhoneCol) return null;
      if (config.duplicateCheckFields === 'Email' && !isEmailCol) return null;
      // 'Both' allows both
      
      // Normalize value
      const searchValue = value.toString().trim().toLowerCase();
      if (!searchValue) return null;
      
      // Search for duplicate (using LeadDataService logic)
      if (typeof LeadDataService !== 'undefined' && LeadDataService.checkForDuplicate) {
        return LeadDataService.checkForDuplicate(sheet, currentRow, col, value);
      }
      
      // Fallback: inline duplicate check
      const columnData = sheet.getRange(2, col, sheet.getLastRow() - 1, 1).getValues();
      
      for (let i = 0; i < columnData.length; i++) {
        const checkRow = i + 2;
        if (checkRow === currentRow) continue;
        
        const cellValue = columnData[i][0];
        if (cellValue && cellValue.toString().trim().toLowerCase() === searchValue) {
          const leadRow = sheet.getRange(checkRow, 1, 1, 34).getValues()[0];
          
          return {
            row: checkRow,
            leadId: leadRow[0] || 'N/A',
            firstName: leadRow[2] || '',
            lastName: leadRow[3] || '',
            phone: leadRow[4] || '',
            email: leadRow[5] || '',
            createdDate: leadRow[1] || '',
            status: leadRow[27] || 'Unknown', // AB = Current Status
            duplicateField: isPhoneCol ? 'PHONE' : 'EMAIL'
          };
        }
      }
      
      return null;
      
    } catch (error) {
      Logger.log('ValidationService.checkDuplicate error: ' + error);
      return null;
    }
  }
  
  /**
   * Validate date chronology
   * @param {Sheet} sheet - Lead Data sheet
   * @param {number} row - Row being edited
   * @param {number} col - Column being edited
   * @returns {Object|null} Error object or null
   */
  function validateDates(sheet, row, col) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const config = getConfig(ss);
      
      // Check if date validation is enabled
      if (config.dateValidationLevel === 'Off') {
        return null; // Disabled
      }
      
      // Use existing logic from LeadDataService
      if (typeof LeadDataService !== 'undefined' && LeadDataService.validateDateChronology) {
        const error = LeadDataService.validateDateChronology(sheet, row, col);
        
        // If in Warning mode and it's just a warning (not error), allow it
        if (config.dateValidationLevel === 'Warning' && error && error.warning) {
          return null; // Allow warnings in Warning mode
        }
        
        return error;
      }
      
      return null;
      
    } catch (error) {
      Logger.log('ValidationService.validateDates error: ' + error);
      return null;
    }
  }
  
  /**
   * Initialize validation configuration in Settings & Budget
   * Called during template initialization
   */
  function initializeConfig(ss) {
    const settings = ss.getSheetByName('Settings & Budget');
    if (!settings) return;
    
    // Add validation config section
    settings.getRange('A34').setValue('⚙️ VALIDATION SETTINGS').setFontSize(14).setFontWeight('bold');
    
    const configLabels = [
      ['Enable Duplicate Detection:'],
      ['Duplicate Check Fields:'],
      ['Date Validation Level:']
    ];
    settings.getRange('A35:A37').setValues(configLabels).setFontWeight('bold');
    
    // Set defaults if empty
    if (!settings.getRange('B35').getValue()) {
      settings.getRange('B35').setValue(true); // Enabled by default
    }
    
    if (!settings.getRange('B36').getValue()) {
      settings.getRange('B36').setValue('Both'); // Check both phone and email
    }
    
    if (!settings.getRange('B37').getValue()) {
      settings.getRange('B37').setValue('Warning'); // Warning mode
    }
    
    // Add data validations
    const booleanValidation = SpreadsheetApp.newDataValidation()
      .requireCheckbox()
      .build();
    settings.getRange('B35').setDataValidation(booleanValidation);
    
    const fieldsValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Phone', 'Email', 'Both'], true)
      .build();
    settings.getRange('B36').setDataValidation(fieldsValidation);
    
    const levelValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Strict', 'Warning', 'Off'], true)
      .build();
    settings.getRange('B37').setDataValidation(levelValidation);
    
    // Add helpful notes
    settings.getRange('B35').setNote('✅ Enabled = Show alert when duplicate phone/email detected\n❌ Disabled = Allow duplicates without warning\n\nRecommended: Enabled');
    settings.getRange('B36').setNote('Phone = Only check phone numbers\nEmail = Only check email addresses\nBoth = Check both fields\n\nRecommended: Both');
    settings.getRange('B37').setNote('Strict = Block invalid dates (cannot override)\nWarning = Warn about invalid dates (can override)\nOff = No date validation\n\nRecommended: Warning (allows flexibility with validation)');
    
    Logger.log('✅ Validation configuration initialized in Settings & Budget');
  }
  
  // Export public API
  return {
    getConfig: getConfig,
    checkDuplicate: checkDuplicate,
    validateDates: validateDates,
    initializeConfig: initializeConfig
  };
})();

