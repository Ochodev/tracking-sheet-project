/**
 * Health check utilities for the Gym Ops tracker.
 */
var HealthCheck = (function () {
  function run() {
    var ss = SpreadsheetApp.getActive();
    var issues = [];

    // Check required sheets exist
    Object.keys(Sheets).forEach(function (key) {
      if (!ss.getSheetByName(Sheets[key])) {
        issues.push('Missing sheet: ' + Sheets[key]);
      }
    });

    // Check for REF errors in dashboard
    var dashboard = ss.getSheetByName(Sheets.DASHBOARD);
    if (dashboard) {
      var refErrors = dashboard.createTextFinder('#REF!').useRegularExpression(false).matchEntireCell(false).findAll();
      if (refErrors && refErrors.length) {
        issues.push('Dashboard contains #REF! errors.');
      }
      
      // CRITICAL: Check for Target column formula errors (2025-10-08 Formula Audit Fix)
      var targetIssues = checkDashboardTargetFormulas(dashboard);
      if (targetIssues.length > 0) {
        issues.push('⚠️ CRITICAL: DASHBOARD Target column issues detected!');
        targetIssues.forEach(function(issue) {
          issues.push('  → ' + issue.cell + ' (' + issue.metric + '): ' + issue.problem);
        });
        issues.push('  💡 FIX: Run "Gym Ops → Fix DASHBOARD Formulas" to auto-correct');
      }
      
      // Check for #VALUE! errors in dashboard
      var valueErrors = dashboard.createTextFinder('#VALUE!').useRegularExpression(false).matchEntireCell(false).findAll();
      if (valueErrors && valueErrors.length) {
        issues.push('⚠️ Dashboard contains #VALUE! errors (' + valueErrors.length + ' cells)');
        issues.push('  💡 This often indicates Target column formula errors');
      }
    }

    // Check backup trigger
    var hasBackupTrigger = ScriptApp.getProjectTriggers().some(function (trigger) {
      return trigger.getHandlerFunction && trigger.getHandlerFunction() === 'autoMonthlyBackup';
    });
    if (!hasBackupTrigger) {
      issues.push('Monthly backup trigger is not configured.');
    }

    var lookupIssues = validateListSources(ss, issues);

    var allIssues = issues.concat(lookupIssues);

    if (!allIssues.length) {
      SpreadsheetApp.getUi().alert('✅ Health Check Passed', 'No issues detected.', SpreadsheetApp.getUi().ButtonSet.OK);
    } else {
      SpreadsheetApp.getUi().alert('⚠️ Health Check Results', allIssues.join('\n'), SpreadsheetApp.getUi().ButtonSet.OK);
    }
  }

  function validateListSources(ss, existingIssues) {
    var issues = [];
    var settingsSheet = ss.getSheetByName('Settings & Budget');
    if (!settingsSheet) {
      issues.push('Settings & Budget sheet missing; cannot audit source lists.');
      return issues;
    }

    // Audit Source list block (improved with explicit maxRows and stop before Marketing Budget)
    auditListBlock({
      sheet: settingsSheet,
      headerCell: 'A13',
      firstDataCell: 'A14',
      maxRows: 11,
      stopTokens: ['━━━━━━━━', '📅 ', '💰 '],
      label: 'Lead Source dropdown'
    }, issues);

    // Audit Staff list block (limited to reasonable range, stops at row 24)
    auditListBlock({
      sheet: settingsSheet,
      headerCell: 'B13',
      firstDataCell: 'B14',
      maxRows: 10,
      stopTokens: ['━━━━━━━━', '📅 ', '💰 '],
      label: 'Staff dropdown'
    }, issues);

    // Audit Location list block (single value)
    auditListBlock({
      sheet: settingsSheet,
      headerCell: 'C13',
      firstDataCell: 'C14',
      maxRows: 1,
      label: 'Location dropdown'
    }, issues);

    // Audit Membership Type list block (limited to 10 rows max)
    auditListBlock({
      sheet: settingsSheet,
      headerCell: 'D13',
      firstDataCell: 'D14',
      maxRows: 10,
      stopTokens: ['━━━━━━━━', '📅 ', '💰 '],
      label: 'Membership Type dropdown'
    }, issues);

    // Audit Cancel Reason list block (limited to 10 rows max)
    auditListBlock({
      sheet: settingsSheet,
      headerCell: 'E13',
      firstDataCell: 'E14',
      maxRows: 10,
      stopTokens: ['━━━━━━━━', '📅 ', '💰 '],
      label: 'Cancel Reason dropdown'
    }, issues);

    // Audit Status Values list block (6 values only)
    auditListBlock({
      sheet: settingsSheet,
      headerCell: 'G13',
      firstDataCell: 'G14',
      maxRows: 6,
      stopTokens: ['━━━━━━━━', '📅 ', '💰 '],
      label: 'Status Value dropdown'
    }, issues);

    return issues;
  }

  function auditListBlock(config, issues) {
    var sheet = config.sheet;
    var firstCell = sheet.getRange(config.firstDataCell);
    var maxRows = config.maxRows || 100;
    var stopTokens = config.stopTokens || [];
    var blockValues = sheet.getRange(firstCell.getRow(), firstCell.getColumn(), maxRows, 1).getDisplayValues();
    var emptyRows = 0;
    var dataRows = [];
    var invalidDataDetected = false;

    for (var i = 0; i < blockValues.length; i++) {
      var cellValue = blockValues[i][0];
      var value = cellValue ? cellValue.toString().trim() : '';

      if (!value) {
        emptyRows++;
        continue;
      }

      var shouldStop = stopTokens.some(function (token) {
        return value.indexOf(token) === 0;
      });

      if (shouldStop) {
        break;
      }
      
      // IMPROVED: Detect invalid data (budget section data in dropdown columns)
      // Skip dollar amounts (unless this is a currency field)
      if (config.label.indexOf('$') === -1 && value.match(/^\$\d+\.?\d*/)) {
        invalidDataDetected = true;
        continue; // Don't count as valid dropdown value
      }
      
      // Skip standalone numbers that look like budget data (days in month, rates)
      if (config.label.indexOf('Type') === -1 && config.label.indexOf('Status') === -1) {
        if (value.match(/^\d+$/) && parseInt(value) > 25) {
          invalidDataDetected = true;
          continue; // Likely "days in month" from budget section
        }
      }

      dataRows.push(value);
    }

    if (!dataRows.length) {
      issues.push(config.label + ' is empty. Add at least one value in ' + config.firstDataCell + '.');
    }
    
    // IMPROVED: Only report blank rows if significant and no invalid data detected
    // If invalid data detected, it means we're reading too far - just report that
    if (invalidDataDetected) {
      issues.push(config.label + ' contains corrupted data (budget values mixed with dropdown values). Run "Gym Ops → Cleanup Settings Dropdowns" to fix.');
    } else if (emptyRows > 3 && dataRows.length > 0) {
      // Only report if more than 3 blank rows (a few blanks are OK for user spacing)
      issues.push(config.label + ' contains ' + emptyRows + ' blank row(s). Consider removing blank lines to keep data organized.');
    }

    // Detect duplicates
    var duplicates = findDuplicates(dataRows);
    if (duplicates.length) {
      issues.push(config.label + ' contains duplicates: ' + duplicates.join(', ') + '. Run "Gym Ops → Cleanup Settings Dropdowns" to fix.');
    }
  }

  function findDuplicates(values) {
    var seen = {};
    var duplicates = [];

    values.forEach(function (value) {
      var key = value.toLowerCase();
      if (seen[key]) {
        if (duplicates.indexOf(value) === -1) {
          duplicates.push(value);
        }
      } else {
        seen[key] = true;
      }
    });

    return duplicates;
  }
  
  /**
   * FORMULA AUDIT FIX: Check DASHBOARD target formulas
   * Validates that C10-C16 reference correct rows (B3-B9, not B2)
   * Added: 2025-10-08
   */
  function checkDashboardTargetFormulas(dashboard) {
    var issues = [];
    
    try {
      var targetCells = [
        { cell: 'C10', shouldContain: 'B3', metric: 'Leads' },
        { cell: 'C11', shouldContain: 'B4', metric: 'Set Rate' },
        { cell: 'C12', shouldContain: 'B5', metric: 'Show Rate' },
        { cell: 'C13', shouldContain: 'B6', metric: 'Close Rate' },
        { cell: 'C14', shouldContain: 'B7', metric: 'New Members' },
        { cell: 'C15', shouldContain: 'B8', metric: 'MRR' },
        { cell: 'C16', shouldContain: 'B9', metric: 'CAC' }
      ];
      
      targetCells.forEach(function(config) {
        var range = dashboard.getRange(config.cell);
        var formula = range.getFormula();
        var value = range.getDisplayValue();
        
        // Critical check: Shows "Target" text (the bug symptom)
        if (value === 'Target') {
          issues.push({
            cell: config.cell,
            metric: config.metric,
            problem: 'Shows "Target" text instead of number',
            severity: 'CRITICAL'
          });
          return;
        }
        
        // Check formula references wrong row
        if (formula && formula.indexOf('!B2') > -1 && formula.indexOf('B2:') === -1) {
          issues.push({
            cell: config.cell,
            metric: config.metric,
            problem: 'References header B2 instead of data row',
            severity: 'CRITICAL'
          });
          return;
        }
        
        // Check formula doesn't contain expected reference
        if (formula && formula.indexOf(config.shouldContain) === -1) {
          issues.push({
            cell: config.cell,
            metric: config.metric,
            problem: 'Should reference ' + config.shouldContain,
            severity: 'WARNING'
          });
        }
      });
      
    } catch (error) {
      Logger.log('checkDashboardTargetFormulas error: ' + error);
    }
    
    return issues;
  }

  return {
    run: run,
    checkDashboardTargetFormulas: checkDashboardTargetFormulas
  };
})();
