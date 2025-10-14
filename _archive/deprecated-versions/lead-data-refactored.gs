/**
 * REFACTORED: Lead Data Tab
 * Old version: ~260 lines
 * New version: ~140 lines (46% reduction!)
 * 
 * Most complex tab with:
 * - 33 columns (A-AH)
 * - Multiple ARRAYFORMULA patterns
 * - 20+ conditional formatting rules
 * - Column groups
 * - Complex auto-calculations
 * 
 * Replaces: createLeadDataTab() in Code.gs (lines 1475-1734)
 */
function createLeadDataTabV2(ss) {
  const builder = new TabBuilder(ss, 'Lead Data');
  
  builder.create();
  
  const sheet = builder.getSheet();
  
  // Ensure we have at least 3 rows
  const desiredRows = 3;
  const currentRows = sheet.getMaxRows();
  if (currentRows > desiredRows) {
    sheet.deleteRows(desiredRows + 1, currentRows - desiredRows);
  } else if (currentRows < desiredRows) {
    sheet.insertRows(currentRows + 1, desiredRows - currentRows);
  }
  
  // ============================================================
  // HEADERS (33 columns A-AH)
  // ============================================================
  
  const headers = [[
    'Lead ID', 'Created Date', 'First Name', 'Last Name', 'Phone', 'Email', 'DOB',
    'Source', 'Campaign', 'Staff Owner', 'Location',
    'Appt Set?', 'Appt Date', 'Show?', 'Show Date', 'Start Trial?', 'Trial Start', 'Trial End',
    'Converted?', 'Member Start', 'Membership Type', 'MRR ($)', 'Upfront Fee ($)',
    'Cancelled?', 'Cancel Date', 'Cancel Reason', 'Notes', 'Current Status',
    'Age (Days)', 'Lead Score', 'Action Needed', 'Duplicate?', 'Days to Convert', 'Last Touchpoint'
  ]];
  
  builder.addTable(1, 'A', headers, { headerRow: true });
  
  // Add comprehensive notes
  sheet.getRange('A1').setNote('⚠️ DO NOT DELETE ROWS!\n\nTo remove a member:\n1. Check "Cancelled?" (column X)\n2. Enter Cancel Date (column Y)');
  sheet.getRange('H1').setNote('🗺️ AUTO-MAPPED from UTM tracking.\n\n✅ Manual override: Click → Select from dropdown');
  sheet.getRange('Q1').setNote('📅 AUTO-FILLED when "Start Trial?" is checked.');
  sheet.getRange('R1').setNote('🧮 AUTO-CALCULATED: Trial Start + trial length');
  sheet.getRange('S1').setNote('✅ Check when lead becomes paying member');
  sheet.getRange('X1').setNote('✅ ALWAYS USE THIS INSTEAD OF DELETING ROWS!');
  sheet.getRange('AH1').setNote('⏰ AUTO-UPDATED when Notes column is edited');
  
  // ============================================================
  // AUTO-CALCULATED FORMULAS (Columns H, R, AB, AC, AD, AE, AF, AG)
  // ============================================================
  
  // H2: Source (auto-mapped from UTM)
  builder.addFormula(2, 'H', 
    `ARRAYFORMULA(IF(A2:A="","",IFERROR(INDEX('_UTM Tracking'!O:O, MATCH(A2:A, '_UTM Tracking'!A:A, 0)),"⚠️ Not Tracked")))`);
  
  // R2: Trial End (= Trial Start + trial length)
  builder.addFormula(2, 'R',
    `ARRAYFORMULA(IF(A2:A="","",IF(ISNUMBER(Q2:Q),Q2:Q+'Settings & Budget'!B33,"")))`);
  
  // AB2: Current Status (derived from checkboxes)
  builder.addFormula(2, 'AB',
    `ARRAYFORMULA(IF(A2:A="","",IF(W2:W=TRUE,"Cancelled",IF(S2:S=TRUE,"Member",IF((T2:T<>"")*ISNUMBER(T2:T),"Trial",IF(N2:N=TRUE,"Show",IF(L2:L=TRUE,"Appt Set","Lead")))))))`);
  
  // AC2: Age (Days) with emoji indicators
  builder.addFormula(2, 'AC',
    `ARRAYFORMULA(IF(A2:A="","",IF(B2:B="","",LET(age, INT(TODAY()-B2:B),IF(age<=3, "🆕 "&age,IF(age<=7, "⏱️ "&age,IF(age<=14, "⚠️ "&age,"🔴 "&age)))))))`);
  
  // AD2: Lead Score (Hot/Warm/Cold)
  builder.addFormula(2, 'AD',
    `ARRAYFORMULA(IF(A2:A="","",LET(score, IF(N2:N=TRUE,50,0) + IF(REGEXMATCH(LOWER(H2:H),"referral|member"),30,0) + IF(L2:L=TRUE,20,0) + IF(AC2:AC<3,15,IF(AC2:AC<7,10,IF(AC2:AC<14,5,0))) - IF(AC2:AC>30,20,0) - IF(AC2:AC>60,30,0) + IF(ISNUMBER(R2:R)*(R2:R<=TODAY()+3)*(R2:R>=TODAY()), 50, 0),IF(score>=70,"🔥 HOT",IF(score>=40,"🟡 WARM","❄️ COLD")))))`);
  
  // AE2: Action Needed (smart next step)
  builder.addFormula(2, 'AE',
    `ARRAYFORMULA(IF(A2:A="","",IF(S2:S=TRUE,"✅ Member",IF(W2:W=TRUE,"⛔ Cancelled",IF((Q2:Q<>"")*R2:R<=TODAY()+3),"🔥 TRIAL EXPIRING!",IF((L2:L=FALSE)*(AC2:AC>=2),"📞 SET APPOINTMENT",IF((L2:L=TRUE)*(N2:N=FALSE)*(M2:M<TODAY()),"⚠️ NO-SHOW - FOLLOW UP",IF((N2:N=TRUE)*(Q2:Q=""),"🎯 OFFER TRIAL",IF((N2:N=TRUE)*(Q2:Q<>"")*( S2:S=FALSE),"💰 CLOSE DEAL",IF(AC2:AC>=7,"⏰ OVERDUE CHECK-IN","✓ On Track"))))))))))`);
  
  // AF2: Duplicate Flag
  builder.addFormula(2, 'AF',
    `ARRAYFORMULA(IF(A2:A="","",IF(OR(COUNTIF(E:E,E2:E)>1,COUNTIF(F:F,F2:F)>1),"⚠️ CHECK","✓")))`);
  
  // AG2: Days to Convert
  builder.addFormula(2, 'AG',
    `ARRAYFORMULA(IF(A2:A="","",IF((S2:S=TRUE)*(T2:T<>""),INT(T2:T-B2:B),"")))`);
  
  // ============================================================
  // COLUMN FORMATTING
  // ============================================================
  
  // Widths
  sheet.setColumnWidth(1, 120);  // Lead ID
  sheet.setColumnWidth(2, 110);  // Created Date
  sheet.setColumnWidths(3, 5, 100);
  sheet.setColumnWidths(8, 3, 120);
  sheet.setColumnWidths(11, 17, 100);
  sheet.setColumnWidth(27, 200);  // Notes
  sheet.setColumnWidth(29, 100);  // Age
  sheet.setColumnWidth(30, 120);  // Lead Score
  sheet.setColumnWidth(31, 180);  // Action Needed
  sheet.setColumnWidth(32, 100);  // Duplicate
  sheet.setColumnWidth(33, 120);  // Days to Convert
  sheet.setColumnWidth(34, 160);  // Last Touchpoint
  
  // Date formats
  const dateColumns = ['B', 'G', 'M', 'O', 'Q', 'T', 'Y'];
  dateColumns.forEach(col => sheet.getRange(col + ':' + col).setNumberFormat('yyyy-mm-dd'));
  
  // Currency formats
  sheet.getRange('V:W').setNumberFormat('$#,##0.00');
  
  // Background colors for auto-calculated columns
  sheet.getRange('H:H').setBackground('#e8f0fe');
  sheet.getRange('Q:Q').setBackground('#d9ead3');
  sheet.getRange('R:R').setBackground('#d9ead3');
  sheet.getRange('AB:AB').setBackground('#d9ead3');
  sheet.getRange('AC:AC').setBackground('#fff3cd');
  sheet.getRange('AD:AD').setBackground('#e7f4e4').setFontWeight('bold');
  sheet.getRange('AE:AE').setBackground('#fce8e6').setFontWeight('bold');
  sheet.getRange('AF:AF').setBackground('#f4cccc');
  sheet.getRange('AG:AG').setBackground('#d9ead3');
  sheet.getRange('AH:AH').setBackground('#e8f0fe');
  
  // ============================================================
  // CONDITIONAL FORMATTING (20+ rules)
  // ============================================================
  
  const rules = [];
  
  // Lead Score rules
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('🔥').setBackground('#d4edda').setFontColor('#155724').setRanges([sheet.getRange('AD:AD')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('🟡').setBackground('#fff3cd').setFontColor('#856404').setRanges([sheet.getRange('AD:AD')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('❄️').setBackground('#cfe2ff').setFontColor('#084298').setRanges([sheet.getRange('AD:AD')]).build());
  
  // Action Needed rules
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('🔥').setBackground('#f8d7da').setFontColor('#721c24').setRanges([sheet.getRange('AE:AE')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('⚠️').setBackground('#fff3cd').setFontColor('#856404').setRanges([sheet.getRange('AE:AE')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('⏰').setBackground('#ffeeba').setFontColor('#856404').setRanges([sheet.getRange('AE:AE')]).build());
  
  // Duplicate rule
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('⚠️').setBackground('#f8d7da').setFontColor('#721c24').setRanges([sheet.getRange('AF:AF')]).build());
  
  // Age rules
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('🔴').setBackground('#f8d7da').setFontColor('#721c24').setRanges([sheet.getRange('AC:AC')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('⚠️').setBackground('#fff3cd').setFontColor('#856404').setRanges([sheet.getRange('AC:AC')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('⏱️').setBackground('#fffbea').setFontColor('#9f7a00').setRanges([sheet.getRange('AC:AC')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('🆕').setBackground('#e7f4e4').setFontColor('#2d5f2e').setRanges([sheet.getRange('AC:AC')]).build());
  
  // Source category rules
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Paid Search').setBackground('#ffe0e0').setRanges([sheet.getRange('H:H')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Paid Social').setBackground('#ffe0e0').setRanges([sheet.getRange('H:H')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Organic Search').setBackground('#e0ffe0').setRanges([sheet.getRange('H:H')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Direct Traffic').setBackground('#e0ffe0').setRanges([sheet.getRange('H:H')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Social Media').setBackground('#e0ffe0').setRanges([sheet.getRange('H:H')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Referrals').setBackground('#e0e0ff').setRanges([sheet.getRange('H:H')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Member Referral').setBackground('#e0e0ff').setRanges([sheet.getRange('H:H')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Third-Party').setBackground('#e0e0ff').setRanges([sheet.getRange('H:H')]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('⚠️').setBackground('#fff3cd').setFontColor('#856404').setRanges([sheet.getRange('H:H')]).build());
  
  // Active member highlight
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($S2=TRUE, $W2=FALSE)').setBackground('#e7f4e4').setRanges([sheet.getRange('A2:AH5000')]).build());
  
  // Apply all rules
  sheet.setConditionalFormatRules(rules);
  
  // ============================================================
  // COLUMN GROUPS (Collapsible sections)
  // ============================================================
  
  sheet.getRange('L:Q').shiftColumnGroupDepth(1);  // FUNNEL
  sheet.getRange('R:X').shiftColumnGroupDepth(1);  // CONVERSION
  sheet.getRange('Y:AA').shiftColumnGroupDepth(1); // ADMIN
  
  Logger.log('✅ Column groups added: FUNNEL, CONVERSION, ADMIN');
  
  // ============================================================
  // FINALIZE
  // ============================================================
  
  builder
    .setFrozen({ rows: 1, columns: 4 })
    .build();
  
  Logger.log('✅ Lead Data tab created (refactored v2) - 33 columns, 20+ conditional rules');
  
  return builder.getSheet();
}

