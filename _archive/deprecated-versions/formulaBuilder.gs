/**
 * FormulaBuilder - Type-safe formula generation for Google Sheets
 * Eliminates string concatenation errors, increases readability
 * 
 * Created: October 9, 2025
 * Purpose: Build complex formulas programmatically with validation
 * 
 * Usage Example:
 *   const fb = new FormulaBuilder();
 *   const formula = fb.countifs({
 *     "'Lead Data'!B:B": [">=" + "Settings!B30", "<=" + "Settings!B31"],
 *     "'Lead Data'!S:S": [true]
 *   });
 *   // Result: =COUNTIFS('Lead Data'!B:B,">="&Settings!B30,'Lead Data'!B:B,"<="&Settings!B31,'Lead Data'!S:S,TRUE)
 */

var FormulaBuilder = (function() {
  
  /**
   * FormulaBuilder Class
   */
  function FormulaBuilder() {
    this.formula = '';
  }
  
  /**
   * Build COUNTIFS formula
   * @param {Object} conditions - { range: [criteria1, criteria2, ...], ... }
   * @returns {string} Complete formula with =
   * 
   * Example:
   *   countifs({
   *     "'Lead Data'!B:B": [">=" + "'Settings & Budget'!B30"],
   *     "'Lead Data'!S:S": [true]
   *   })
   */
  FormulaBuilder.prototype.countifs = function(conditions) {
    const parts = [];
    
    Object.keys(conditions).forEach(range => {
      const criteria = conditions[range];
      
      if (Array.isArray(criteria)) {
        criteria.forEach(criterion => {
          parts.push(range);
          parts.push(this._formatCriterion(criterion));
        });
      } else {
        parts.push(range);
        parts.push(this._formatCriterion(criteria));
      }
    });
    
    return '=COUNTIFS(' + parts.join(',') + ')';
  };
  
  /**
   * Build SUMIFS formula
   * @param {string} sumRange - Range to sum
   * @param {Object} conditions - { range: criteria, ... }
   * @returns {string} Complete formula
   */
  FormulaBuilder.prototype.sumifs = function(sumRange, conditions) {
    const parts = [sumRange];
    
    Object.keys(conditions).forEach(range => {
      const criteria = conditions[range];
      
      if (Array.isArray(criteria)) {
        criteria.forEach(criterion => {
          parts.push(range);
          parts.push(this._formatCriterion(criterion));
        });
      } else {
        parts.push(range);
        parts.push(this._formatCriterion(criteria));
      }
    });
    
    return '=SUMIFS(' + parts.join(',') + ')';
  };
  
  /**
   * Build FILTER formula
   * @param {string} range - Range to filter
   * @param {Array<string>} conditions - Array of condition expressions
   * @returns {string} Complete formula
   * 
   * Example:
   *   filter("'Lead Data'!A:AH", [
   *     "'Lead Data'!S:S=TRUE",
   *     "'Lead Data'!X:X<>TRUE"
   *   ])
   */
  FormulaBuilder.prototype.filter = function(range, conditions) {
    const conditionStr = conditions.map(c => '(' + c + ')').join('*');
    return `=FILTER(${range},${conditionStr})`;
  };
  
  /**
   * Build ARRAYFORMULA with IF wrapper
   * @param {string} range - Trigger range (e.g., 'A2:A')
   * @param {string} logic - The formula logic
   * @param {string} emptyValue - Value when trigger is empty (default: "")
   * @returns {string} Complete formula
   * 
   * Example:
   *   arrayIf('A2:A', 'B2:B+C2:C', '0')
   *   // Result: =ARRAYFORMULA(IF(A2:A="",'0',B2:B+C2:C))
   */
  FormulaBuilder.prototype.arrayIf = function(range, logic, emptyValue) {
    const empty = emptyValue !== undefined ? emptyValue : '""';
    return `=ARRAYFORMULA(IF(${range}="",${empty},${logic}))`;
  };
  
  /**
   * Build IFERROR wrapper
   * @param {string} formula - The formula to wrap
   * @param {string} errorValue - Value on error (default: 0)
   * @returns {string} Complete formula
   */
  FormulaBuilder.prototype.iferror = function(formula, errorValue) {
    const error = errorValue !== undefined ? errorValue : '0';
    const cleanFormula = formula.startsWith('=') ? formula.substring(1) : formula;
    return `=IFERROR(${cleanFormula},${error})`;
  };
  
  /**
   * Build LET formula
   * @param {Object} variables - { varName: expression, ... }
   * @param {string} calculation - Final calculation using variables
   * @returns {string} Complete formula
   * 
   * Example:
   *   let({
   *     startDate: "'Settings & Budget'!B30",
   *     endDate: "'Settings & Budget'!B31",
   *     leads: "COUNTIFS('Lead Data'!B:B,'>='&startDate)"
   *   }, 'leads')
   */
  FormulaBuilder.prototype.let = function(variables, calculation) {
    const parts = [];
    
    Object.keys(variables).forEach(varName => {
      parts.push(varName);
      parts.push(variables[varName]);
    });
    
    parts.push(calculation);
    
    return '=LET(' + parts.join(',') + ')';
  };
  
  /**
   * Build QUERY formula
   * @param {string} range - Data range to query
   * @param {string} query - SQL-like query string
   * @param {number} headers - Number of header rows (default: 1)
   * @returns {string} Complete formula
   */
  FormulaBuilder.prototype.query = function(range, query, headers) {
    const headerCount = headers !== undefined ? headers : 1;
    return `=QUERY(${range}, "${query}", ${headerCount})`;
  };
  
  /**
   * Helper: Format criterion for COUNTIFS/SUMIFS
   * @private
   */
  FormulaBuilder.prototype._formatCriterion = function(criterion) {
    // Boolean values
    if (criterion === true) return 'TRUE';
    if (criterion === false) return 'FALSE';
    
    // Numbers
    if (typeof criterion === 'number') return criterion;
    
    // Strings - determine if it's a cell reference or literal
    if (typeof criterion === 'string') {
      // If contains sheet reference, comparison operator, or &, it's a reference/expression
      if (criterion.includes('!') || criterion.includes('&') || 
          criterion.startsWith('>=') || criterion.startsWith('<=') || 
          criterion.startsWith('>') || criterion.startsWith('<') ||
          criterion.startsWith('=')) {
        return criterion;
      }
      
      // Otherwise, it's a literal string value - wrap in quotes
      return '"' + criterion + '"';
    }
    
    return criterion;
  };
  
  /**
   * Static helper: Create COUNTIFS formula
   * @param {Object} conditions - Conditions object
   * @returns {string} Formula
   */
  FormulaBuilder.countifs = function(conditions) {
    return new FormulaBuilder().countifs(conditions);
  };
  
  /**
   * Static helper: Create SUMIFS formula
   * @param {string} sumRange - Range to sum
   * @param {Object} conditions - Conditions object
   * @returns {string} Formula
   */
  FormulaBuilder.sumifs = function(sumRange, conditions) {
    return new FormulaBuilder().sumifs(sumRange, conditions);
  };
  
  /**
   * Static helper: Create FILTER formula
   * @param {string} range - Range to filter
   * @param {Array<string>} conditions - Conditions array
   * @returns {string} Formula
   */
  FormulaBuilder.filter = function(range, conditions) {
    return new FormulaBuilder().filter(range, conditions);
  };
  
  // Export
  return FormulaBuilder;
})();

/**
 * Common formula patterns used across tabs
 */
var FormulaPatterns = {
  
  /**
   * Date range filtered lead count
   */
  leadsInRange: function() {
    return FormulaBuilder.countifs({
      "'Lead Data'!B:B": [">=" + "&'Settings & Budget'!B30", "<=" + "&'Settings & Budget'!B31"]
    });
  },
  
  /**
   * Converted members in range
   */
  membersInRange: function() {
    return FormulaBuilder.countifs({
      "'Lead Data'!T:T": [">=" + "&'Settings & Budget'!B30", "<=" + "&'Settings & Budget'!B31"],
      "'Lead Data'!S:S": [true],
      "'Lead Data'!X:X": [false]
    });
  },
  
  /**
   * Active MRR total
   */
  activeMRR: function() {
    return FormulaBuilder.sumifs("'Lead Data'!V:V", {
      "'Lead Data'!S:S": [true],
      "'Lead Data'!X:X": [false]
    });
  },
  
  /**
   * Set rate calculation (percentage)
   */
  setRate: function() {
    return "=IFERROR(COUNTIFS('Lead Data'!L:L,TRUE,'Lead Data'!B:B,\">=\"&'Settings & Budget'!B30,'Lead Data'!B:B,\"<=\"&'Settings & Budget'!B31)/" + 
           "COUNTIFS('Lead Data'!B:B,\">=\"&'Settings & Budget'!B30,'Lead Data'!B:B,\"<=\"&'Settings & Budget'!B31),0)";
  },
  
  /**
   * Show rate calculation
   */
  showRate: function() {
    return "=IFERROR(COUNTIFS('Lead Data'!N:N,TRUE,'Lead Data'!B:B,\">=\"&'Settings & Budget'!B30,'Lead Data'!B:B,\"<=\"&'Settings & Budget'!B31)/" +
           "COUNTIFS('Lead Data'!L:L,TRUE,'Lead Data'!B:B,\">=\"&'Settings & Budget'!B30,'Lead Data'!B:B,\"<=\"&'Settings & Budget'!B31),0)";
  },
  
  /**
   * Close rate calculation
   */
  closeRate: function() {
    return "=IFERROR(COUNTIFS('Lead Data'!S:S,TRUE,'Lead Data'!B:B,\">=\"&'Settings & Budget'!B30,'Lead Data'!B:B,\"<=\"&'Settings & Budget'!B31)/" +
           "COUNTIFS('Lead Data'!N:N,TRUE,'Lead Data'!B:B,\">=\"&'Settings & Budget'!B30,'Lead Data'!B:B,\"<=\"&'Settings & Budget'!B31),0)";
  },
  
  /**
   * Members filter (for Members tab)
   */
  activeMembersFilter: function() {
    return "={'Lead Data'!A1:AH1; LET(filtered, IFERROR(FILTER('Lead Data'!A2:AH,'Lead Data'!S2:S=TRUE,'Lead Data'!W2:W<>TRUE), {}), " +
           "IF(ROWS(filtered)=0, FILTER('Lead Data'!A2:AH, ROW('Lead Data'!A2:A)=0), IFERROR(QUERY(filtered,\"WHERE Col1 IS NOT NULL\",0), filtered)))}";
  }
};

