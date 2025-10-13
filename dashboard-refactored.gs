/**
 * REFACTORED: DASHBOARD Tab
 * Old version: ~550 lines
 * New version: ~280 lines (49% reduction!)
 * 
 * The most complex tab with 10 major sections:
 * 1. Header & Date Range
 * 2. Today's Snapshot
 * 3. Key Metrics (7 KPIs)
 * 4. Action Items (3 lists)
 * 5. Net Gain/Loss by Type
 * 6. Member Alerts
 * 7. Source Analysis (12 metrics per source)
 * 8. LTV Metrics
 * 9. Staff Performance
 * 10. Charts Note
 * 
 * Replaces: createDashboardTab() in Code.gs (lines 920-1470)
 */
function createDashboardTabV2(ss) {
  const builder = new TabBuilder(ss, 'DASHBOARD');
  
  builder.create();
  
  const sheet = builder.getSheet();
  
  // ============================================================
  // SECTION 1: Header & Date Range
  // ============================================================
  
  const currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  
  builder
    .addHeader('📊 GYM OPS DASHBOARD', 18)
    .addRow(1, 'D', `Status: ✅ Ready`, { bold: true, fontSize: 10, color: '#0b5394' })
    .addRow(1, 'E', `Last Updated: ${currentDate}`, { fontSize: 9, color: '#666666' })
    .addRow(2, 'A', 'Date Range:', { bold: true });
  
  const dateRangeValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Last 7 Days', 'Last 14 Days', 'Last 30 Days', 'Last 90 Days', 'Last 6 Months', 'Last 12 Months', 'Quarter-to-Date', 'Year-to-Date', 'Custom Range'], true)
    .build();
  
  sheet.getRange('B2').setDataValidation(dateRangeValidation);
  sheet.getRange('B2').setValue('Last 30 Days');
  
  builder
    .addRow(3, 'A', 'Showing:', { bold: true })
    .addFormula(3, 'B', 'IFERROR(TEXT(\'Settings & Budget\'!B30,"yyyy-mm-dd") & " to " & TEXT(\'Settings & Budget\'!B31,"yyyy-mm-dd"), "Calculating...")');
  
  // ============================================================
  // SECTION 2: Today's Snapshot
  // ============================================================
  
  builder.addRow(4, 'A', '📊 TODAY\'S SNAPSHOT', { bold: true, fontSize: 13, background: '#e7f4e4' });
  sheet.getRange('B4:F4').merge().setBackground('#e7f4e4');
  
  builder
    .addRow(5, 'A', '🔥 HOT Leads:', { bold: true })
    .addFormula(5, 'B', "COUNTIFS('Lead Data'!AD:AD,\"🔥 HOT\",'Lead Data'!S:S,FALSE,'Lead Data'!X:X,FALSE)", { format: '0', note: 'HOT leads (score 70+) not yet members' })
    .addRow(5, 'C', '⚠️ Action Needed:', { bold: true })
    .addFormula(5, 'D', 'LET(values,{A20,A25,A30,A45,A50},SUM(BYROW(values,LAMBDA(v,IF(OR(v="✓ None",v=""),0,COUNTA(TEXTSPLIT(v,CHAR(10))))))))', { format: '0' })
    .addRow(5, 'E', '⏰ Trials Expiring (3d):', { bold: true })
    .addFormula(5, 'F', "COUNTIFS('Lead Data'!R:R,\">=\"&TODAY(),'Lead Data'!R:R,\"<=\"&TODAY()+3,'Lead Data'!S:S,FALSE,'Lead Data'!Q:Q,\"<>\")", { format: '0' })
    .addRow(6, 'A', '💰 Active MRR:', { bold: true })
    .addFormula(6, 'B', "SUMIFS('Lead Data'!V:V,'Lead Data'!S:S,TRUE,'Lead Data'!X:X,FALSE)", { format: '$#,##0' })
    .addRow(6, 'C', '📈 LTV:CAC Health:', { bold: true })
    .addFormula(6, 'D', 'IF(ISNUMBER(B67),IF(B67>=5,"✅ Excellent",IF(B67>=3,"✅ Good","⚠️ Review")),"⚠️ No Data")', { bold: true })
    .addRow(6, 'E', '🆕 New Members (30d):', { bold: true })
    .addFormula(6, 'F', "COUNTIFS('Lead Data'!T:T,\">=\"&TODAY()-30,'Lead Data'!T:T,\"<=\"&TODAY(),'Lead Data'!S:S,TRUE)", { format: '0' });
  
  // Snapshot conditional formatting
  const snapshotRules = [
    SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThan(5).setBackground('#fff3cd').setRanges([sheet.getRange('B5')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThan(0).setBackground('#ffe0e0').setRanges([sheet.getRange('D5')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThan(0).setBackground('#fff3cd').setRanges([sheet.getRange('F5')]).build()
  ];
  
  // ============================================================
  // SECTION 3: Key Metrics (Rows 8-16)
  // ============================================================
  
  builder
    .addRow(8, 'A', '🎯 KEY METRICS', { bold: true, fontSize: 14 })
    .addTable(9, 'A', [['Metric', 'Actual', 'Target', 'Variance', 'Status']], { headerRow: true });
  
  const metrics = ['Leads', 'Set %', 'Show %', 'Close %', 'New Members', 'MRR', 'CAC'];
  sheet.getRange(10, 1, metrics.length, 1).setValues(metrics.map(m => [m]));
  
  // Add metric formulas (using FormulaPatterns where applicable)
  builder
    .addFormula(10, 'B', FormulaPatterns.leadsInRange())
    .addFormula(11, 'B', FormulaPatterns.setRate(), { format: '0.0%' })
    .addFormula(12, 'B', FormulaPatterns.showRate(), { format: '0.0%' })
    .addFormula(13, 'B', FormulaPatterns.closeRate(), { format: '0.0%' })
    .addFormula(14, 'B', "COUNTIFS('Lead Data'!T:T,\">=\"&'Settings & Budget'!B30,'Lead Data'!T:T,\"<=\"&'Settings & Budget'!B31,'Lead Data'!S:S,TRUE,'Lead Data'!X:X,FALSE)")
    .addFormula(15, 'B', FormulaPatterns.activeMRR(), { format: '$#,##0' });
  
  // CAC formula (complex LET)
  const cacFormula = `LET(
    startDate,'Settings & Budget'!$B$30,
    endDate,'Settings & Budget'!$B$31,
    rawMonths,'Settings & Budget'!$A$40:$A$100,
    rates,'Settings & Budget'!$E$40:$E$100,
    monthStarts,ARRAYFORMULA(IF(rawMonths="",,IF(ISNUMBER(rawMonths),DATE(YEAR(rawMonths),MONTH(rawMonths),1),DATE(VALUE(LEFT(rawMonths,4)),VALUE(MID(rawMonths,6,2)),1)))),
    monthEnds,ARRAYFORMULA(IF(monthStarts="",,EOMONTH(monthStarts,0))),
    totalSpend,IFERROR(SUM(BYROW(FILTER({monthStarts,monthEnds,rates},(rates<>"")*(monthStarts<>"")*(monthEnds>=startDate)*(monthStarts<=endDate)),
      LAMBDA(row,LET(mStart,INDEX(row,1),mEnd,INDEX(row,2),rate,INDEX(row,3),overlapStart,MAX(mStart,startDate),overlapEnd,MIN(mEnd,endDate),days,MAX(0,overlapEnd-overlapStart+1),days*rate))
    )),0),
    IF(B14=0,IF(totalSpend>0,"⚠️ Spend/0","-"),totalSpend/B14)
  )`;
  
  builder.addFormula(16, 'B', cacFormula, { format: '$#,##0' });
  
  // Target formulas (C10-C16)
  for (let i = 0; i < 7; i++) {
    const row = 10 + i;
    const targetRow = 3 + i; // B3-B9
    builder.addFormula(row, 'C', `IFERROR('Settings & Budget'!B${targetRow},"⚠️ Setup")`);
  }
  
  // Variance and Status formulas (D10-E16)
  for (let row = 10; row <= 16; row++) {
    builder.addFormula(row, 'D', `IF(C${row}="","",B${row}-C${row})`);
    
    if (row === 16) {
      // CAC: lower is better
      builder.addFormula(row, 'E', `IF(C${row}="","",IF(B${row}<=C${row},"✅ ON PACE","⚠️ OVER"))`);
    } else {
      // Others: higher is better
      builder.addFormula(row, 'E', `IF(C${row}="","",IF(B${row}>=C${row},"✅ ON PACE","📉 BEHIND"))`);
    }
  }
  
  // Format metrics
  sheet.getRange('B11:E13').setNumberFormat('0.0%');
  sheet.getRange('B15:E15').setNumberFormat('$#,##0');
  sheet.getRange('B16:E16').setNumberFormat('$#,##0');
  
  // ============================================================
  // SECTION 4: Action Items
  // ============================================================
  
  builder
    .addRow(17, 'A', '🔔 ACTION ITEMS', { bold: true, fontSize: 14 })
    .addRow(19, 'A', '🔴 No Appt Set (24h)', { bold: true })
    .addFormula(20, 'A', "IFERROR(LET(items,FILTER('Lead Data'!C:C&\" \"&'Lead Data'!D:D,'Lead Data'!B:B<TODAY()-1,'Lead Data'!L:L=FALSE,'Lead Data'!S:S=FALSE,'Lead Data'!T:T=\"\",'Lead Data'!A:A<>\"\"),\"→ \"&TEXTJOIN(CHAR(10)&\"→ \",TRUE,items)) ,\"✓ None\")")
    .addRow(24, 'A', '🟡 No Shows', { bold: true })
    .addFormula(25, 'A', "IFERROR(LET(items,FILTER('Lead Data'!C:C&\" \"&'Lead Data'!D:D,'Lead Data'!N:N=FALSE,'Lead Data'!M:M<>\"\",'Lead Data'!M:M<TODAY(),'Lead Data'!S:S=FALSE,'Lead Data'!T:T=\"\",'Lead Data'!A:A<>\"\"),\"→ \"&TEXTJOIN(CHAR(10)&\"→ \",TRUE,items)) ,\"✓ None\")")
    .addRow(29, 'A', '🟠 Trials Expiring (3d)', { bold: true })
    .addFormula(30, 'A', "IFERROR(LET(items,FILTER('Lead Data'!C:C&\" \"&'Lead Data'!D:D,'Lead Data'!R:R>=TODAY(),'Lead Data'!R:R<=TODAY()+3,'Lead Data'!S:S=FALSE,'Lead Data'!Q:Q<>\"\",'Lead Data'!T:T=\"\",'Lead Data'!A:A<>\"\"),\"→ \"&TEXTJOIN(CHAR(10)&\"→ \",TRUE,items)) ,\"✓ None\")");
  
  sheet.getRange('A20').setWrap(true);
  sheet.getRange('A25').setWrap(true);
  sheet.getRange('A30').setWrap(true);
  
  // ============================================================
  // SECTION 5: Net Gain/Loss (Pulls from _Metrics)
  // ============================================================
  
  builder
    .addRow(34, 'A', '📊 NET GAIN/LOSS BY MEMBERSHIP TYPE (Selected Range)', { bold: true, fontSize: 14 })
    .addTable(35, 'A', [['Type', 'Gains', 'Losses', 'Net', '% Change']], { headerRow: true })
    .addFormula(36, 'A', '=_Metrics!A5:E9');
  
  sheet.getRange('B36:D40').setNumberFormat('0');
  sheet.getRange('E36:E40').setNumberFormat('0.0%');
  
  // Net gain/loss conditional formatting
  const netRules = [
    SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThan(0).setBackground('#d4edda').setFontColor('#155724').setRanges([sheet.getRange('D36:D40')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberLessThan(0).setBackground('#f8d7da').setFontColor('#721c24').setRanges([sheet.getRange('D36:D40')]).build()
  ];
  
  // ============================================================
  // SECTION 6: Member Alerts
  // ============================================================
  
  builder
    .addRow(42, 'A', '👥 MEMBER ALERTS', { bold: true, fontSize: 14 })
    .addRow(44, 'A', '🎯 Trials Ending (7d)', { bold: true })
    .addFormula(45, 'A', "IFERROR(LET(items,FILTER('Lead Data'!C:C&\" \"&'Lead Data'!D:D,'Lead Data'!R:R>=TODAY(),'Lead Data'!R:R<=TODAY()+7,'Lead Data'!Q:Q<>\"\",'Lead Data'!A:A<>\"\"),\"→ \"&TEXTJOIN(CHAR(10)&\"→ \",TRUE,items)) ,\"✓ None\")")
    .addRow(49, 'A', '🎂 Birthdays This Month', { bold: true })
    .addFormula(50, 'A', "IFERROR(LET(items,FILTER('Lead Data'!C:C&\" \"&'Lead Data'!D:D,MONTH('Lead Data'!G:G)=MONTH(TODAY()),'Lead Data'!S:S=TRUE,'Lead Data'!X:X<>TRUE,'Lead Data'!G:G<>\"\"),\"→ \"&TEXTJOIN(CHAR(10)&\"→ \",TRUE,items)) ,\"✓ None\")");
  
  sheet.getRange('A45').setWrap(true);
  sheet.getRange('A50').setWrap(true);
  
  // ============================================================
  // SECTION 7: Source Analysis (12 metrics per source)
  // ============================================================
  
  const sourceHeaders = [[
    'Lead Source', 'Leads (window)', 'Appointments', 'Showed', 'Show Rate', 'Lead→Member Rate',
    'Spend (window)', 'CPL', 'CPA (Appt)', 'CPS (Show)', 'CP/Trial', 'CAC'
  ]];
  
  builder
    .addRow(55, 'A', '📈 SOURCE ANALYSIS (by Lead Source)', { bold: true, fontSize: 14 })
    .addTable(56, 'A', sourceHeaders, { headerRow: true });
  
  // Pull sources from Settings using ARRAYFORMULA
  builder.addFormula(57, 'A', "ARRAYFORMULA(IF(LEN('Settings & Budget'!A14:A24)=0,\"\", 'Settings & Budget'!A14:A24))");
  
  // Source metrics formulas (B-L columns, rows 57-66)
  const sourceFormulas = {
    'B': "ARRAYFORMULA(IF(A57:A66=\"\",\"\",COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!B:B,\">=\"&'Settings & Budget'!$B$30,'Lead Data'!B:B,\"<=\"&'Settings & Budget'!$B$31)))",
    'C': "ARRAYFORMULA(IF(A57:A66=\"\",\"\",COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!L:L,TRUE,'Lead Data'!B:B,\">=\"&'Settings & Budget'!$B$30,'Lead Data'!B:B,\"<=\"&'Settings & Budget'!$B$31)))",
    'D': "ARRAYFORMULA(IF(A57:A66=\"\",\"\",COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!N:N,TRUE,'Lead Data'!B:B,\">=\"&'Settings & Budget'!$B$30,'Lead Data'!B:B,\"<=\"&'Settings & Budget'!$B$31)))",
    'E': "ARRAYFORMULA(IF(A57:A66=\"\",\"\",IFERROR(D57:D66/C57:C66,0)))",
    'F': "ARRAYFORMULA(IF(A57:A66=\"\",\"\",IFERROR(COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!S:S,TRUE,'Lead Data'!T:T,\">=\"&'Settings & Budget'!$B$30,'Lead Data'!T:T,\"<=\"&'Settings & Budget'!$B$31)/B57:B66,0)))"
  };
  
  Object.keys(sourceFormulas).forEach(col => {
    builder.addFormula(57, col, sourceFormulas[col]);
  });
  
  // Complex spend formula using MAP/LAMBDA
  const spendFormula = `ARRAYFORMULA(MAP(A57:A66,LAMBDA(src,IF(src="","",LET(
    startDate,'Settings & Budget'!$B$30,
    endDate,'Settings & Budget'!$B$31,
    rawMonths,'Settings & Budget'!$A$40:$A$100,
    sources,'Settings & Budget'!$B$40:$B$100,
    rates,'Settings & Budget'!$E$40:$E$100,
    monthStarts,ARRAYFORMULA(IF(rawMonths="",,IF(ISNUMBER(rawMonths),DATE(YEAR(rawMonths),MONTH(rawMonths),1),DATE(VALUE(LEFT(rawMonths,4)),VALUE(MID(rawMonths,6,2)),1)))),
    monthEnds,ARRAYFORMULA(IF(monthStarts="",,EOMONTH(monthStarts,0))),
    valid,(sources=src)*(rates<>"")*(monthStarts<>"")*(monthEnds>=startDate)*(monthStarts<=endDate),
    IF(SUM(valid)=0,0,SUM(MAP(FILTER(monthStarts,valid),FILTER(monthEnds,valid),FILTER(rates,valid),LAMBDA(mStart,mEnd,rate,LET(overlapStart,MAX(mStart,startDate),overlapEnd,MIN(mEnd,endDate),days,MAX(0,overlapEnd-overlapStart+1),days*rate)))))
  )))))`;
  
  builder.addFormula(57, 'G', spendFormula);
  
  // Cost metrics (CPL, CPA, CPS, CP/Trial, CAC)
  builder
    .addFormula(57, 'H', 'ARRAYFORMULA(IF(A57:A66="","",IF(G57:G66=0,"Organic",IF(B57:B66=0,IF(G57:G66>0,"Spend/0 Leads","-"),G57:G66/B57:B66))))')
    .addFormula(57, 'I', 'ARRAYFORMULA(IF(A57:A66="","",IF(G57:G66=0,"Organic",IF(C57:C66=0,IF(G57:G66>0,"Spend/0 Appts","-"),G57:G66/C57:C66))))')
    .addFormula(57, 'J', 'ARRAYFORMULA(IF(A57:A66="","",IF(G57:G66=0,"Organic",IF(D57:D66=0,IF(G57:G66>0,"Spend/0 Shows","-"),G57:G66/D57:D66))))')
    .addFormula(57, 'K', `ARRAYFORMULA(IF(A57:A66="","",LET(trials, COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!Q:Q,">="&'Settings & Budget'!$B$30,'Lead Data'!Q:Q,"<="&'Settings & Budget'!$B$31,'Lead Data'!Q:Q,"<>"),IF(G57:G66=0, "Organic", IF(trials=0, IF(G57:G66>0, "Spend/0 Trials", "-"), G57:G66/trials)))))`)
    .addFormula(57, 'L', `ARRAYFORMULA(IF(A57:A66="","",LET(members, COUNTIFS('Lead Data'!H:H,A57:A66,'Lead Data'!S:S,TRUE,'Lead Data'!T:T,">="&'Settings & Budget'!$B$30,'Lead Data'!T:T,"<="&'Settings & Budget'!$B$31),IF(G57:G66=0, "Organic", IF(members=0, IF(G57:G66>0, "Spend/0 Members", "-"), G57:G66/members)))))`);
  
  // Format source analysis
  sheet.getRange('E57:F66').setNumberFormat('0.0%');
  sheet.getRange('G57:L66').setNumberFormat('$#,##0.00');
  sheet.getRange('E57:E66').setBackground('#fff3cd');
  sheet.getRange('F57:F66').setBackground('#d4edda');
  sheet.getRange('L57:L66').setBackground('#f8d7da');
  
  // ============================================================
  // SECTION 8: LTV Metrics
  // ============================================================
  
  builder
    .addRow(65, 'A', '💰 LIFETIME VALUE (LTV) METRICS', { bold: true, fontSize: 14 })
    .addRow(66, 'A', 'PROFITABILITY HEALTH CHECK', { bold: true, fontSize: 11 })
    .addRow(67, 'A', 'Overall LTV:CAC Ratio:', { bold: true })
    .addFormula(67, 'B', 'LET(avgLTV,AVERAGE(FILTER(B70:B80,A70:A80<>"")),avgCAC,AVERAGE(FILTER(C70:C80,A70:A80<>"",C70:C80>0)),IF(avgCAC=0,"No CAC Data",avgLTV/avgCAC))', { format: '0.0"x"', bold: true, fontSize: 12 })
    .addFormula(67, 'C', 'IF(ISNUMBER(B67),IF(B67>=5,"✅ HIGHLY PROFITABLE",IF(B67>=3,"✅ PROFITABLE","⚠️ REVIEW")),"⚠️")', { bold: true })
    .addRow(69, 'A', 'LTV by Source (All-Time) - Transparent Calculation', { bold: true, fontSize: 12 })
    .addTable(70, 'A', [['Source', 'Avg LTV', 'CAC', 'LTV:CAC Ratio', 'Status', 'Total Members', 'Retention %']], { headerRow: true })
    .addFormula(71, 'A', "ARRAYFORMULA(IF(LEN('Settings & Budget'!A14:A24)=0,\"\", 'Settings & Budget'!A14:A24))")
    .addFormula(71, 'B', "ARRAYFORMULA(IF(A71:A81=\"\",\"\",IFERROR(INDEX('_LTV Calculations'!T:T, MATCH(A71:A81, '_LTV Calculations'!N:N, 0)), 0)))", { format: '$#,##0' })
    .addFormula(71, 'C', "ARRAYFORMULA(IF(A71:A81=\"\",\"\",IFERROR(INDEX(L:L,MATCH(A71:A81,A57:A66,0)+56),0)))", { format: '$#,##0' })
    .addFormula(71, 'D', "ARRAYFORMULA(IF(A71:A81=\"\",\"\",IFERROR(IF(C71:C81=0,\"∞\",B71:B81/C71:C81),0)))", { format: '0.0"x"' })
    .addFormula(71, 'E', "ARRAYFORMULA(IF(A71:A81=\"\",\"\",IF(D71:D81=\"∞\",\"🟢 FREE\",IF(VALUE(LEFT(D71:D81,FIND(\"x\",D71:D81)-1))>=10,\"🟢 EXCELLENT\",IF(VALUE(LEFT(D71:D81,FIND(\"x\",D71:D81)-1))>=5,\"🟢 GREAT\",IF(VALUE(LEFT(D71:D81,FIND(\"x\",D71:D81)-1))>=3,\"🟡 GOOD\",\"🔴 REVIEW\"))))))")
    .addFormula(71, 'F', "ARRAYFORMULA(IF(A71:A81=\"\",\"\",IFERROR(INDEX('_LTV Calculations'!O:O, MATCH(A71:A81, '_LTV Calculations'!N:N, 0)), 0)))")
    .addFormula(71, 'G', "ARRAYFORMULA(IF(A71:A81=\"\",\"\",IFERROR(INDEX('_LTV Calculations'!U:U, MATCH(A71:A81, '_LTV Calculations'!N:N, 0)), 0)))", { format: '0.0%' });
  
  // LTV section formatting
  sheet.getRange('B71:B81').setBackground('#e7f4e4');
  sheet.getRange('C71:C81').setBackground('#fce8e6');
  sheet.getRange('D71:D81').setBackground('#fff3cd');
  
  // LTV:CAC conditional formatting
  const ltvRules = [
    SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThan(10).setBackground('#d4edda').setFontColor('#155724').setRanges([sheet.getRange('D71:D81')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberBetween(5, 10).setBackground('#d4edda').setFontColor('#155724').setRanges([sheet.getRange('D71:D81')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberBetween(3, 5).setBackground('#fff3cd').setFontColor('#856404').setRanges([sheet.getRange('D71:D81')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberLessThan(3).setBackground('#f8d7da').setFontColor('#721c24').setRanges([sheet.getRange('D71:D81')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextContains('🟢').setBackground('#d4edda').setFontColor('#155724').setRanges([sheet.getRange('E71:E81')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextContains('🟡').setBackground('#fff3cd').setFontColor('#856404').setRanges([sheet.getRange('E71:E81')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextContains('🔴').setBackground('#f8d7da').setFontColor('#721c24').setRanges([sheet.getRange('E71:E81')]).build()
  ];
  
  // ============================================================
  // SECTION 9: Staff Performance
  // ============================================================
  
  const staffHeaders = [['Staff Member', 'Leads Assigned', 'Appointments Set', 'Shows', 'Closes', 'Close Rate', 'Avg Days to Close', 'Total MRR']];
  
  builder
    .addRow(85, 'A', '👥 STAFF PERFORMANCE (Current Date Range)', { bold: true, fontSize: 14 })
    .addTable(86, 'A', staffHeaders, { headerRow: true })
    .addFormula(87, 'A', "ARRAYFORMULA(IF(LEN('Settings & Budget'!B14:B16)=0,\"\", 'Settings & Budget'!B14:B16))")
    .addFormula(87, 'B', "ARRAYFORMULA(IF(A87:A89=\"\",\"\",COUNTIFS('Lead Data'!J:J,A87:A89,'Lead Data'!B:B,\">=\"&'Settings & Budget'!$B$30,'Lead Data'!B:B,\"<=\"&'Settings & Budget'!$B$31)))")
    .addFormula(87, 'C', "ARRAYFORMULA(IF(A87:A89=\"\",\"\",COUNTIFS('Lead Data'!J:J,A87:A89,'Lead Data'!L:L,TRUE,'Lead Data'!B:B,\">=\"&'Settings & Budget'!$B$30,'Lead Data'!B:B,\"<=\"&'Settings & Budget'!$B$31)))")
    .addFormula(87, 'D', "ARRAYFORMULA(IF(A87:A89=\"\",\"\",COUNTIFS('Lead Data'!J:J,A87:A89,'Lead Data'!N:N,TRUE,'Lead Data'!B:B,\">=\"&'Settings & Budget'!$B$30,'Lead Data'!B:B,\"<=\"&'Settings & Budget'!$B$31)))")
    .addFormula(87, 'E', "ARRAYFORMULA(IF(A87:A89=\"\",\"\",COUNTIFS('Lead Data'!J:J,A87:A89,'Lead Data'!S:S,TRUE,'Lead Data'!T:T,\">=\"&'Settings & Budget'!$B$30,'Lead Data'!T:T,\"<=\"&'Settings & Budget'!$B$31)))")
    .addFormula(87, 'F', "ARRAYFORMULA(IF(A87:A89=\"\",\"\",IFERROR(E87:E89/B87:B89,0)))", { format: '0.0%' })
    .addFormula(87, 'G', "ARRAYFORMULA(IF(A87:A89=\"\",\"\",IFERROR(AVERAGEIFS('Lead Data'!AG:AG,'Lead Data'!J:J,A87:A89,'Lead Data'!S:S,TRUE,'Lead Data'!T:T,\">=\"&'Settings & Budget'!$B$30,'Lead Data'!T:T,\"<=\"&'Settings & Budget'!$B$31),0)))", { format: '0.0' })
    .addFormula(87, 'H', "ARRAYFORMULA(IF(A87:A89=\"\",\"\",SUMIFS('Lead Data'!V:V,'Lead Data'!J:J,A87:A89,'Lead Data'!S:S,TRUE,'Lead Data'!T:T,\">=\"&'Settings & Budget'!$B$30,'Lead Data'!T:T,\"<=\"&'Settings & Budget'!$B$31)))", { format: '$#,##0' });
  
  sheet.getRange('E87:E89').setBackground('#e7f4e4');
  sheet.getRange('F87:F89').setBackground('#fff3cd');
  sheet.getRange('H87:H89').setBackground('#d4edda');
  
  // ============================================================
  // SECTION 10: Charts Note
  // ============================================================
  
  builder
    .addRow(95, 'A', '📊 ANALYTICS CHARTS', { bold: true, fontSize: 14 })
    .addRow(96, 'A', '7 interactive charts created below (scroll down to view)', { italic: true, color: '#0f6938' });
  
  // ============================================================
  // CONDITIONAL FORMATTING (All Rules)
  // ============================================================
  
  const kpiRules = [
    SpreadsheetApp.newConditionalFormatRule().whenTextContains('ON PACE').setBackground('#b7e1cd').setFontColor('#0f6938').setRanges([sheet.getRange('E10:E16')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextContains('BEHIND').setBackground('#f4c7c3').setFontColor('#cc0000').setRanges([sheet.getRange('E10:E16')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextContains('OVER').setBackground('#fff3cd').setFontColor('#856404').setRanges([sheet.getRange('E10:E16')]).build()
  ];
  
  const allRules = [...kpiRules, ...snapshotRules, ...netRules, ...ltvRules];
  sheet.setConditionalFormatRules(allRules);
  
  // ============================================================
  // FINALIZE
  // ============================================================
  
  builder
    .setColumnWidths({ '1-12': 120 })
    .setFrozen({ rows: 9 })
    .build();
  
  ss.setNamedRange('dashboardDateRange', sheet.getRange('B2'));
  
  Logger.log('✅ DASHBOARD tab created (refactored v2) - 10 sections, 49% code reduction');
  
  return builder.getSheet();
}

