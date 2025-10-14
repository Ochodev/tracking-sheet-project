/**
 * Lead Data related utilities extracted from Code.gs
 */

var LeadDataService = (function () {
  function getLeadSheet() {
    return SpreadsheetApp.getActive().getSheetByName(Sheets.LEAD_DATA);
  }

  function getLeadRowData(sheet, row) {
    return sheet.getRange(row, LeadCol.LEAD_ID, 1, LeadCol.LAST_TOUCHPOINT).getValues()[0];
  }

  function checkForDuplicate(sheet, currentRow, col, value) {
    try {
      var searchValue = value.toString().trim().toLowerCase();
      if (!searchValue) return null;

      var columnData = sheet.getRange(2, col, sheet.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < columnData.length; i++) {
        var checkRow = i + 2;
        if (checkRow === currentRow) continue;
        var cellValue = columnData[i][0];
        if (cellValue && cellValue.toString().trim().toLowerCase() === searchValue) {
          var leadRow = getLeadRowData(sheet, checkRow);
          return {
            row: checkRow,
            leadId: leadRow[LeadCol.LEAD_ID - 1] || 'N/A',
            firstName: leadRow[LeadCol.FIRST_NAME - 1] || '',
            lastName: leadRow[LeadCol.LAST_NAME - 1] || '',
            phone: leadRow[LeadCol.PHONE - 1] || '',
            email: leadRow[LeadCol.EMAIL - 1] || '',
            createdDate: leadRow[LeadCol.CREATED_DATE - 1] || '',
            status: leadRow[LeadCol.CURRENT_STATUS - 1] || 'Unknown',
            duplicateField: col === LeadCol.PHONE ? 'PHONE' : 'EMAIL'
          };
        }
      }
      return null;
    } catch (error) {
      Logger.log('checkForDuplicate error: ' + error.toString());
      return null;
    }
  }

  function validateDateChronology(sheet, row, col) {
    try {
      if (![LeadCol.CREATED_DATE, LeadCol.APPT_DATE, LeadCol.TRIAL_START, LeadCol.MEMBER_START, LeadCol.CANCEL_DATE].includes(col)) return null;
      var rowData = getLeadRowData(sheet, row);
      var createdDate = rowData[LeadCol.CREATED_DATE - 1];
      var apptDate = rowData[LeadCol.APPT_DATE - 1];
      var trialStart = rowData[LeadCol.TRIAL_START - 1];
      var memberStart = rowData[LeadCol.MEMBER_START - 1];
      var cancelDate = rowData[LeadCol.CANCEL_DATE - 1];
      var isValidDate = function (val) { return val instanceof Date && !isNaN(val.getTime()); };

      if (isValidDate(apptDate) && isValidDate(createdDate) && apptDate < createdDate) {
        return {
          field: 'Appointment Date',
          message: 'Appointment date (' + formatDate(apptDate) + ') cannot be before lead created date (' + formatDate(createdDate) + ').'
        };
      }
      if (isValidDate(trialStart) && isValidDate(createdDate) && trialStart < createdDate) {
        return {
          field: 'Trial Start',
          message: 'Trial start (' + formatDate(trialStart) + ') cannot be before lead created date (' + formatDate(createdDate) + ').'
        };
      }
      if (isValidDate(trialStart) && isValidDate(apptDate) && trialStart < apptDate) {
        return {
          field: 'Trial Start',
          message: 'Trial start (' + formatDate(trialStart) + ') is before appointment date (' + formatDate(apptDate) + ').\n\nThis is unusual but might be intentional.',
          warning: true
        };
      }
      if (isValidDate(memberStart) && isValidDate(trialStart) && memberStart < trialStart) {
        return {
          field: 'Member Start',
          message: 'Member start (' + formatDate(memberStart) + ') cannot be before trial start (' + formatDate(trialStart) + ').'
        };
      }
      if (isValidDate(cancelDate) && isValidDate(memberStart) && cancelDate < memberStart) {
        return {
          field: 'Cancel Date',
          message: 'Cancel date (' + formatDate(cancelDate) + ') cannot be before member start (' + formatDate(memberStart) + ').'
        };
      }
      return null;
    } catch (error) {
      Logger.log('validateDateChronology error: ' + error.toString());
      return null;
    }
  }

  return {
    getLeadSheet: getLeadSheet,
    checkForDuplicate: checkForDuplicate,
    validateDateChronology: validateDateChronology
  };
})();
