/**
 * Onboarding utilities for Quick Start enhancements.
 */
var OnboardingService = (function () {
  function ensureSampleLead() {
    var sheet = LeadDataService.getLeadSheet();
    if (!sheet) return;
    if (sheet.getLastRow() > 1) return; // already populated

    var settings = SpreadsheetApp.getActive().getSheetByName(Sheets.SETTINGS);

    var source = 'Direct Traffic';
    var staffOwner = 'Front Desk';
    var location = 'Main Location';
    var membershipType = 'General';

    if (settings) {
      var sourceValues = settings.getRange('A14:A100').getDisplayValues().flat().map(function (v) { return v ? v.trim() : ''; }).filter(Boolean);
      if (sourceValues.length) {
        source = sourceValues[0];
      }

      var staffValues = settings.getRange('B14:B100').getDisplayValues().flat().map(function (v) { return v ? v.trim() : ''; }).filter(Boolean);
      if (staffValues.length) {
        staffOwner = staffValues[0];
      }

      var locationValue = settings.getRange('C14').getDisplayValue();
      if (locationValue) {
        location = locationValue;
      }

      var membershipValues = settings.getRange('D14:D100').getDisplayValues().flat().map(function (v) { return v ? v.trim() : ''; }).filter(Boolean);
      if (membershipValues.length) {
        membershipType = membershipValues[0];
      }
    }

    var today = new Date();
    var apptDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    var trialStart = new Date(apptDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days after appt

    var baseValues = [
      'LEAD-0001',          // Lead ID
      today,                // Created Date
      'Sample',             // First Name
      'Lead',               // Last Name
      '555-0100',           // Phone
      'sample@example.com', // Email
      '',                   // DOB
      source,               // Source
      'Sample Campaign',    // Campaign
      staffOwner,           // Staff Owner
      location,             // Location
      true,                 // Appt Set?
      apptDate,             // Appt Date
      true,                 // Show?
      apptDate,             // Show Date
      trialStart,           // Trial Start
      '',                   // Trial End (auto)
      false,                // Converted?
      '',                   // Member Start
      membershipType,       // Membership Type
      150,                  // MRR ($)
      50,                   // Upfront Fee ($)
      false,                // Cancelled?
      '',                   // Cancel Date
      '',                   // Cancel Reason
      'Initial sample lead' // Notes
    ];
    sheet.getRange(2, LeadCol.LEAD_ID, 1, LeadCol.NOTES).setValues([baseValues]);
  }

  function ensureSampleBudget() {
    var settings = SpreadsheetApp.getActive().getSheetByName(Sheets.SETTINGS);
    if (!settings) return;
    if (settings.getRange('A40').getValue()) return;
    var currentMonth = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
    settings.getRange('A40').setNumberFormat('@');
    settings.getRange('A40').setValue(currentMonth);
    settings.getRange('B40').setValue('Paid Social');
    settings.getRange('C40').setValue(3000);
    settings.getRange('D40').setFormula('=LET(m,A40,IF(m="",,DAY(EOMONTH(DATE(VALUE(LEFT(m,4)),VALUE(RIGHT(m,2)),1),0))))');
    settings.getRange('E40').setFormula('=IFERROR(IF(C40="","",C40/D40),"")');
  }

  function updateHelpDocs() {
    var doc = SpreadsheetApp.getActive().getSheetByName(Sheets.HELP);
    if (!doc) return;
    doc.showSheet();
    doc.getRange('A3').setValue('DASHBOARD SETUP CHECKLIST');
    doc.getRange('A4:A8').setValues([
      ['1. Confirm Sources & Staff lists in Settings & Budget'],
      ['2. Enter at least one marketing budget row (or keep sample)'],
      ['3. Add your first lead or use sample lead'],
      ['4. Run Health Check from Gym Ops menu'],
      ['5. Replace sample data once integration is live']
    ]);
    doc.hideSheet();
  }

  function runOnboardingSetup() {
    ensureSampleLead();
    ensureSampleBudget();
    updateHelpDocs();
  }

  return {
    runOnboardingSetup: runOnboardingSetup
  };
})();
