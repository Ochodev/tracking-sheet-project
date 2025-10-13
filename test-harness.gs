/**
 * TEST HARNESS for Gym Ops Tracker
 * Validates formula correctness and tab structure
 * 
 * Usage: Call testAll() to run all tests
 */

/**
 * Run all tests
 */
function testAll() {
  Logger.log('🧪 Starting Test Harness...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Test 1: Column Constants Match Reality
  testColumnConstants(results);
  
  // Test 2: LTV Analysis Formulas Are setFormula (not setValue)
  testLTVAnalysisFormulas(results);
  
  // Test 3: DASHBOARD Formulas Reference Correct Columns
  testDashboardFormulas(results);
  
  // Test 4: _Chart Data Formulas Reference Correct Columns
  testChartDataFormulas(results);
  
  // Test 5: Tab Structure Integrity
  testTabStructure(results);
  
  // Print Results
  Logger.log('\n📊 TEST RESULTS:');
  Logger.log(`✅ Passed: ${results.passed}`);
  Logger.log(`❌ Failed: ${results.failed}`);
  Logger.log(`📈 Total: ${results.tests.length}`);
  
  results.tests.forEach(test => {
    const icon = test.passed ? '✅' : '❌';
    Logger.log(`${icon} ${test.name}: ${test.message}`);
  });
  
  return results;
}

/**
 * Test 1: Validate column constants match Lead Data tab
 */
function testColumnConstants(results) {
  const testName = 'Column Constants Validation';
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const leadDataSheet = ss.getSheetByName('Lead Data');
    
    if (!leadDataSheet) {
      results.tests.push({
        name: testName,
        passed: false,
        message: 'Lead Data sheet not found'
      });
      results.failed++;
      return;
    }
    
    // Get headers from actual sheet
    const headers = leadDataSheet.getRange(1, 1, 1, 34).getValues()[0];
    
    // Validate key columns match constants
    const validations = [
      { col: 16, expected: 'Trial Start?', constant: 'TRIAL_START (checkbox)' },
      { col: 17, expected: 'Trial Start', constant: 'TRIAL_START_DATE' },
      { col: 18, expected: 'Trial End', constant: 'TRIAL_END' },
      { col: 19, expected: 'Converted?', constant: 'CONVERTED' },
      { col: 20, expected: 'Member Start', constant: 'MEMBER_START' },
      { col: 21, expected: 'Membership Type', constant: 'MEMBERSHIP_TYPE' },
      { col: 22, expected: 'MRR ($)', constant: 'MRR' },
      { col: 23, expected: 'Upfront Fee ($)', constant: 'UPFRONT_FEE' },
      { col: 24, expected: 'Cancelled?', constant: 'CANCELLED' },
      { col: 25, expected: 'Cancel Date', constant: 'CANCEL_DATE' },
      { col: 28, expected: 'Current Status', constant: 'CURRENT_STATUS' }
    ];
    
    const mismatches = validations.filter(v => {
      const actual = headers[v.col - 1];
      return !actual || !actual.includes(v.expected.replace('?', ''));
    });
    
    if (mismatches.length === 0) {
      results.tests.push({
        name: testName,
        passed: true,
        message: `All ${validations.length} key columns validated successfully`
      });
      results.passed++;
    } else {
      results.tests.push({
        name: testName,
        passed: false,
        message: `${mismatches.length} column mismatches found: ${mismatches.map(m => m.constant).join(', ')}`
      });
      results.failed++;
    }
    
  } catch (error) {
    results.tests.push({
      name: testName,
      passed: false,
      message: `Error: ${error.message}`
    });
    results.failed++;
  }
}

/**
 * Test 2: Validate LTV Analysis uses setFormula not setValue
 */
function testLTVAnalysisFormulas(results) {
  const testName = 'LTV Analysis Formula Validation';
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ltvSheet = ss.getSheetByName('LTV Analysis');
    
    if (!ltvSheet) {
      results.tests.push({
        name: testName,
        passed: false,
        message: 'LTV Analysis sheet not found - run Initialize Template first'
      });
      results.failed++;
      return;
    }
    
    // Check if formulas exist (not literal text)
    const testCells = ['A4', 'A18', 'A31', 'F31', 'M31'];
    const formulaChecks = testCells.map(cell => {
      const value = ltvSheet.getRange(cell).getValue();
      const formula = ltvSheet.getRange(cell).getFormula();
      
      // Should have a formula, not just text starting with =
      const isValid = formula.length > 0 && !value.toString().startsWith('=QUERY');
      
      return {
        cell: cell,
        isValid: isValid,
        value: value.toString().substring(0, 50)
      };
    });
    
    const invalidCells = formulaChecks.filter(c => !c.isValid);
    
    if (invalidCells.length === 0) {
      results.tests.push({
        name: testName,
        passed: true,
        message: `All ${testCells.length} LTV sections have valid formulas`
      });
      results.passed++;
    } else {
      results.tests.push({
        name: testName,
        passed: false,
        message: `${invalidCells.length} cells have setValue instead of setFormula: ${invalidCells.map(c => c.cell).join(', ')}`
      });
      results.failed++;
    }
    
  } catch (error) {
    results.tests.push({
      name: testName,
      passed: false,
      message: `Error: ${error.message}`
    });
    results.failed++;
  }
}

/**
 * Test 3: Validate DASHBOARD formulas reference correct columns
 */
function testDashboardFormulas(results) {
  const testName = 'DASHBOARD Formula Validation';
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dashboard = ss.getSheetByName('DASHBOARD');
    
    if (!dashboard) {
      results.tests.push({
        name: testName,
        passed: false,
        message: 'DASHBOARD sheet not found - run Initialize Template first'
      });
      results.failed++;
      return;
    }
    
    // Check key formulas reference correct columns
    const checks = [
      {
        cell: 'B5',
        name: 'Hot Leads',
        shouldContain: ['AD:AD', 'S:S', 'X:X'],
        shouldNotContain: ['AB:AB', 'Q:Q', 'V:V']
      },
      {
        cell: 'B6',
        name: 'Active MRR',
        shouldContain: ['V:V', 'S:S', 'X:X'],
        shouldNotContain: ['T:T', 'Q:Q', 'V:V']
      },
      {
        cell: 'B14',
        name: 'New Members',
        shouldContain: ['T:T', 'S:S', 'X:X'],
        shouldNotContain: ['S:S,">="', 'R:R,TRUE', 'V:V,FALSE']
      },
      {
        cell: 'B15',
        name: 'MRR Total',
        shouldContain: ['V:V', 'S:S', 'X:X'],
        shouldNotContain: ['T:T,', 'R:R,TRUE', 'V:V,FALSE']
      }
    ];
    
    const errors = [];
    
    checks.forEach(check => {
      const formula = dashboard.getRange(check.cell).getFormula();
      
      // Check for required strings
      const missingRequired = check.shouldContain.filter(str => formula.indexOf(str) === -1);
      if (missingRequired.length > 0) {
        errors.push(`${check.name} (${check.cell}) missing: ${missingRequired.join(', ')}`);
      }
      
      // Check for strings that shouldn't be there
      const foundProhibited = check.shouldNotContain.filter(str => formula.indexOf(str) > -1);
      if (foundProhibited.length > 0) {
        errors.push(`${check.name} (${check.cell}) has old references: ${foundProhibited.join(', ')}`);
      }
    });
    
    if (errors.length === 0) {
      results.tests.push({
        name: testName,
        passed: true,
        message: `All ${checks.length} key formulas validated successfully`
      });
      results.passed++;
    } else {
      results.tests.push({
        name: testName,
        passed: false,
        message: `${errors.length} issues found: ${errors.join('; ')}`
      });
      results.failed++;
    }
    
  } catch (error) {
    results.tests.push({
      name: testName,
      passed: false,
      message: `Error: ${error.message}`
    });
    results.failed++;
  }
}

/**
 * Test 4: Validate _Chart Data formulas
 */
function testChartDataFormulas(results) {
  const testName = '_Chart Data Formula Validation';
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const chartData = ss.getSheetByName('_Chart Data');
    
    if (!chartData) {
      results.tests.push({
        name: testName,
        passed: false,
        message: '_Chart Data sheet not found - run Initialize Template first'
      });
      results.failed++;
      return;
    }
    
    // Check that key formulas exist and reference correct columns
    const checks = [
      {
        cell: 'B97',
        name: 'Funnel - Leads',
        shouldContain: ['B:B']
      },
      {
        cell: 'B101',
        name: 'Funnel - Members',
        shouldContain: ['T:T', 'S:S,TRUE']
      }
    ];
    
    const errors = [];
    
    checks.forEach(check => {
      const formula = chartData.getRange(check.cell).getFormula();
      
      if (!formula) {
        errors.push(`${check.name} (${check.cell}) has no formula`);
        return;
      }
      
      const missingRequired = check.shouldContain.filter(str => formula.indexOf(str) === -1);
      if (missingRequired.length > 0) {
        errors.push(`${check.name} (${check.cell}) missing: ${missingRequired.join(', ')}`);
      }
    });
    
    if (errors.length === 0) {
      results.tests.push({
        name: testName,
        passed: true,
        message: `All ${checks.length} chart formulas validated successfully`
      });
      results.passed++;
    } else {
      results.tests.push({
        name: testName,
        passed: false,
        message: `${errors.length} issues found: ${errors.join('; ')}`
      });
      results.failed++;
    }
    
  } catch (error) {
    results.tests.push({
      name: testName,
      passed: false,
      message: `Error: ${error.message}`
    });
    results.failed++;
  }
}

/**
 * Test 5: Validate tab structure
 */
function testTabStructure(results) {
  const testName = 'Tab Structure Validation';
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    const requiredTabs = [
      'DASHBOARD',
      'Lead Data',
      'Members',
      'Settings & Budget',
      'Marketing',
      'Staff',
      'Help',
      'LTV Analysis',
      '_Chart Data',
      '_Data',
      '_Metrics',
      '_LTV Calculations'
    ];
    
    const missingTabs = requiredTabs.filter(tabName => !ss.getSheetByName(tabName));
    
    if (missingTabs.length === 0) {
      results.tests.push({
        name: testName,
        passed: true,
        message: `All ${requiredTabs.length} required tabs exist`
      });
      results.passed++;
    } else {
      results.tests.push({
        name: testName,
        passed: false,
        message: `${missingTabs.length} tabs missing: ${missingTabs.join(', ')}`
      });
      results.failed++;
    }
    
  } catch (error) {
    results.tests.push({
      name: testName,
      passed: false,
      message: `Error: ${error.message}`
    });
    results.failed++;
  }
}

/**
 * Quick test - just check if main formulas work
 */
function quickTest() {
  Logger.log('🚀 Running Quick Test...\n');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Test 1: Can we access all main tabs?
  const tabs = ['DASHBOARD', 'Lead Data', 'LTV Analysis'];
  const accessible = tabs.filter(name => ss.getSheetByName(name) !== null);
  Logger.log(`✅ Accessible tabs: ${accessible.length}/${tabs.length}`);
  
  // Test 2: Does DASHBOARD have formulas?
  const dashboard = ss.getSheetByName('DASHBOARD');
  if (dashboard) {
    const hasFormula = dashboard.getRange('B5').getFormula().length > 0;
    Logger.log(`✅ DASHBOARD formulas: ${hasFormula ? 'Working' : 'Missing'}`);
  }
  
  // Test 3: Does LTV Analysis have formulas?
  const ltv = ss.getSheetByName('LTV Analysis');
  if (ltv) {
    const hasFormula = ltv.getRange('A4').getFormula().length > 0;
    const hasText = ltv.getRange('A4').getValue().toString().startsWith('=QUERY');
    Logger.log(`✅ LTV Analysis formulas: ${hasFormula && !hasText ? 'Working' : 'Broken'}`);
  }
  
  Logger.log('\n✅ Quick test complete!');
}

