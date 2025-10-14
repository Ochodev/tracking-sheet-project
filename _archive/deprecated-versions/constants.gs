/**
 * Shared constants for sheet names, column indexes, and default lists.
 */
const SHEET = Object.freeze({
  DASHBOARD: 'DASHBOARD',
  LEAD_DATA: 'Lead Data',
  MEMBERS: 'Members',
  SETTINGS: 'Settings & Budget',
  IMPORT_MEMBERS: 'Import Members',
  HELP: 'Help',
  CHART_DATA: '_Chart Data',
  DATA: '_Data',
  METRICS: '_Metrics',
  LTV_CALCULATIONS: '_LTV Calculations',
  LTV_ANALYSIS: 'LTV Analysis',
  UTM_TRACKING: '_UTM Tracking'
});

const LEAD_COL = Object.freeze({
  LEAD_ID: 1,
  CREATED_DATE: 2,
  FIRST_NAME: 3,
  LAST_NAME: 4,
  PHONE: 5,
  EMAIL: 6,
  DOB: 7,
  SOURCE: 8,
  CAMPAIGN: 9,
  STAFF_OWNER: 10,
  LOCATION: 11,
  APPT_SET: 12,
  APPT_DATE: 13,
  SHOW: 14,
  SHOW_DATE: 15,
  TRIAL_START: 16,        // P - Checkbox "Start Trial?"
  TRIAL_START_DATE: 17,   // Q - Date (auto-filled when P is checked) ← NEW COLUMN!
  TRIAL_END: 18,          // R - Formula (was Q)
  CONVERTED: 19,          // S - Checkbox (was R)
  MEMBER_START: 20,       // T - Date (was S)
  MEMBERSHIP_TYPE: 21,    // U - Dropdown (was T)
  MRR: 22,                // V - Currency (was U)
  UPFRONT_FEE: 23,        // W - Currency (was V)
  CANCELLED: 24,          // X - Checkbox (was W)
  CANCEL_DATE: 25,        // Y - Date (was X)
  CANCEL_REASON: 26,      // Z - Dropdown (was Y)
  NOTES: 27,              // AA - Text (was Z)
  CURRENT_STATUS: 28,     // AB - Formula (was AA)
  AGE_DAYS: 29,           // AC - Formula (was AB)
  LEAD_SCORE: 30,         // AD - Formula (was AC)
  ACTION_NEEDED: 31,      // AE - Formula (was AD)
  DUPLICATE_FLAG: 32,     // AF - Formula (was AE)
  DAYS_TO_CONVERT: 33,    // AG - Formula (was AF)
  LAST_TOUCHPOINT: 34     // AH - Auto-updated (was AG)
});

const DEFAULT_LISTS = Object.freeze({
  SOURCES: Object.freeze([
    'Paid Search',
    'Paid Social',
    'Direct Traffic',
    'Organic Search',
    'Social Media',
    'Referrals',
    'Others',
    'CRM UI',
    'Third-Party',
    'Member Referral',
    'Walk-In'
  ]),
  STAFF: Object.freeze([
    'Front Desk',
    'Coach A',
    'Coach B'
  ]),
  MEMBERSHIP_TYPES: Object.freeze([
    'PT',
    'Small Group',
    'General',
    'Class Pack'
  ]),
  CANCEL_REASONS: Object.freeze([
    'Price',
    'Moved',
    'Injury',
    'Service',
    'Location',
    'Other'
  ]),
  STATUS_VALUES: Object.freeze([
    'Lead',
    'Appt Set',
    'Show',
    'Trial',
    'Member',
    'Cancelled'
  ]),
  LOCATION: 'Main Location',
  SAMPLE_CAMPAIGNS: Object.freeze([
    'spring-promo',
    'summer-sale',
    'back-to-school',
    'new-year',
    'organic',
    '',
    'portal',
    'api',
    'member-program'
  ]),
  SAMPLE_FIRST_NAMES: Object.freeze([
    'John',
    'Sarah',
    'Mike',
    'Emma',
    'David',
    'Lisa',
    'Chris',
    'Anna',
    'James',
    'Maria',
    'Tom',
    'Kate',
    'Alex',
    'Jen',
    'Dan'
  ]),
  SAMPLE_LAST_NAMES: Object.freeze([
    'Smith',
    'Johnson',
    'Brown',
    'Davis',
    'Wilson',
    'Moore',
    'Taylor',
    'Anderson',
    'Thomas',
    'Jackson',
    'White',
    'Harris',
    'Martin',
    'Garcia',
    'Lee'
  ]),
  SAMPLE_UTM_SOURCES: Object.freeze([
    'google',
    'facebook',
    'direct',
    'organic',
    'instagram',
    'referral',
    'other',
    'gohighlevel',
    'third-party',
    'member_referral',
    'walkin'
  ]),
  AVERAGE_MRR: 150
});
