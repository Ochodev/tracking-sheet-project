/**
 * TabBuilder - Modern pattern for creating Google Sheets tabs
 * Eliminates repetition, increases maintainability, reduces code by ~50%
 * 
 * Created: October 9, 2025
 * Purpose: Refactor 15 tab creation functions (2,000 lines → ~1,000 lines)
 * 
 * Usage Example:
 *   new TabBuilder(ss, 'DASHBOARD')
 *     .create()
 *     .addHeader('📊 GYM OPS DASHBOARD', 18)
 *     .addRow(1, 'A', 'Date Range:', { bold: true })
 *     .addFormula(1, 'B', '=Settings!B30', { validation: dateRangeList })
 *     .build();
 */

var TabBuilder = (function() {
  
  /**
   * TabBuilder Class
   * @param {Spreadsheet} ss - The active spreadsheet
   * @param {string} tabName - Name of the tab to create/modify
   */
  function TabBuilder(ss, tabName) {
    this.ss = ss;
    this.tabName = tabName;
    this.sheet = null;
    this.conditionalRules = [];
    this.rowPointer = 1; // Current row for sequential operations
  }
  
  /**
   * Create or clear the sheet
   * @param {Object} options - { clearIfExists: true, position: 0 }
   * @returns {TabBuilder} this (for chaining)
   */
  TabBuilder.prototype.create = function(options) {
    const opts = options || { clearIfExists: true };
    
    this.sheet = this.ss.getSheetByName(this.tabName);
    
    if (!this.sheet) {
      // Create new sheet
      if (opts.position !== undefined) {
        this.sheet = this.ss.insertSheet(this.tabName, opts.position);
      } else {
        this.sheet = this.ss.insertSheet(this.tabName);
      }
      Logger.log(`✅ Created new sheet: ${this.tabName}`);
    } else if (opts.clearIfExists) {
      // Clear existing sheet
      this.sheet.clear();
      Logger.log(`✅ Cleared existing sheet: ${this.tabName}`);
    }
    
    return this;
  };
  
  /**
   * Add a header row with styling
   * @param {string} text - Header text
   * @param {number} fontSize - Font size (default: 14)
   * @param {Object} options - { row: 1, col: 'A', color: '#4285f4', bold: true, merge: null }
   * @returns {TabBuilder} this
   */
  TabBuilder.prototype.addHeader = function(text, fontSize, options) {
    const opts = options || {};
    const row = opts.row || this.rowPointer;
    const col = opts.col || 'A';
    const fontSize = fontSize || 14;
    
    const range = this.sheet.getRange(col + row);
    range.setValue(text)
      .setFontSize(fontSize)
      .setFontWeight(opts.bold !== false ? 'bold' : 'normal');
    
    if (opts.color) {
      range.setFontColor(opts.color);
    }
    
    if (opts.background) {
      range.setBackground(opts.background);
    }
    
    if (opts.merge) {
      // opts.merge = 'B1:F1' or { endCol: 'F' }
      if (typeof opts.merge === 'string') {
        this.sheet.getRange(opts.merge).merge();
      } else if (opts.merge.endCol) {
        this.sheet.getRange(col + row + ':' + opts.merge.endCol + row).merge();
      }
    }
    
    this.rowPointer = row + 1;
    return this;
  };
  
  /**
   * Add a simple row with value
   * @param {number} row - Row number
   * @param {string} col - Column letter (e.g., 'A', 'B')
   * @param {*} value - Value to set
   * @param {Object} options - { bold, italic, color, background, note, format }
   * @returns {TabBuilder} this
   */
  TabBuilder.prototype.addRow = function(row, col, value, options) {
    const opts = options || {};
    const range = this.sheet.getRange(col + row);
    
    range.setValue(value);
    
    if (opts.bold) range.setFontWeight('bold');
    if (opts.italic) range.setFontStyle('italic');
    if (opts.color) range.setFontColor(opts.color);
    if (opts.background) range.setBackground(opts.background);
    if (opts.note) range.setNote(opts.note);
    if (opts.format) range.setNumberFormat(opts.format);
    if (opts.fontSize) range.setFontSize(opts.fontSize);
    
    return this;
  };
  
  /**
   * Add a formula to a cell
   * @param {number} row - Row number
   * @param {string} col - Column letter or range (e.g., 'B', 'B2:B10')
   * @param {string} formula - Formula string (with or without leading =)
   * @param {Object} options - { format, note, validation, background }
   * @returns {TabBuilder} this
   */
  TabBuilder.prototype.addFormula = function(row, col, formula, options) {
    const opts = options || {};
    const rangeNotation = col.includes(':') ? col : (col + row);
    const range = this.sheet.getRange(rangeNotation);
    
    // Ensure formula starts with =
    const formulaText = formula.startsWith('=') ? formula : '=' + formula;
    range.setFormula(formulaText);
    
    if (opts.format) range.setNumberFormat(opts.format);
    if (opts.note) range.setNote(opts.note);
    if (opts.background) range.setBackground(opts.background);
    if (opts.validation) range.setDataValidation(opts.validation);
    
    return this;
  };
  
  /**
   * Add multiple rows of data at once
   * @param {number} startRow - Starting row number
   * @param {string} startCol - Starting column letter
   * @param {Array<Array>} data - 2D array of values
   * @param {Object} options - { headerRow: true, bold, background }
   * @returns {TabBuilder} this
   */
  TabBuilder.prototype.addTable = function(startRow, startCol, data, options) {
    const opts = options || {};
    const numRows = data.length;
    const numCols = data[0].length;
    
    // Get starting column number
    const startColNum = startCol.charCodeAt(0) - 64; // A=1, B=2, etc.
    
    const range = this.sheet.getRange(startRow, startColNum, numRows, numCols);
    range.setValues(data);
    
    // Apply header styling if specified
    if (opts.headerRow) {
      const headerRange = this.sheet.getRange(startRow, startColNum, 1, numCols);
      headerRange.setFontWeight('bold');
      
      if (opts.headerBackground) {
        headerRange.setBackground(opts.headerBackground);
      } else {
        headerRange.setBackground('#4285f4').setFontColor('#fff');
      }
    }
    
    if (opts.bold) {
      range.setFontWeight('bold');
    }
    
    if (opts.background) {
      range.setBackground(opts.background);
    }
    
    this.rowPointer = startRow + numRows;
    return this;
  };
  
  /**
   * Set column widths
   * @param {Object} widths - { 'A': 120, 'B-D': 100, '1-5': 150 }
   * @returns {TabBuilder} this
   */
  TabBuilder.prototype.setColumnWidths = function(widths) {
    Object.keys(widths).forEach(key => {
      const width = widths[key];
      
      if (key.includes('-')) {
        // Range: 'B-D' or '1-5'
        const [start, end] = key.split('-');
        
        if (isNaN(start)) {
          // Letter range: 'B-D'
          const startCol = start.charCodeAt(0) - 64;
          const endCol = end.charCodeAt(0) - 64;
          this.sheet.setColumnWidths(startCol, endCol - startCol + 1, width);
        } else {
          // Number range: '1-5'
          const startCol = parseInt(start);
          const endCol = parseInt(end);
          this.sheet.setColumnWidths(startCol, endCol - startCol + 1, width);
        }
      } else {
        // Single column: 'A' or '1'
        if (isNaN(key)) {
          // Letter: 'A'
          const colNum = key.charCodeAt(0) - 64;
          this.sheet.setColumnWidth(colNum, width);
        } else {
          // Number: '1'
          this.sheet.setColumnWidth(parseInt(key), width);
        }
      }
    });
    
    return this;
  };
  
  /**
   * Add conditional formatting rule
   * @param {ConditionalFormatRule} rule - Google Sheets conditional format rule
   * @returns {TabBuilder} this
   */
  TabBuilder.prototype.addConditionalFormat = function(rule) {
    this.conditionalRules.push(rule);
    return this;
  };
  
  /**
   * Apply all conditional formatting rules at once
   * @returns {TabBuilder} this
   */
  TabBuilder.prototype.applyConditionalFormatting = function() {
    if (this.conditionalRules.length > 0) {
      this.sheet.setConditionalFormatRules(this.conditionalRules);
      Logger.log(`✅ Applied ${this.conditionalRules.length} conditional formatting rules`);
    }
    return this;
  };
  
  /**
   * Set frozen rows/columns
   * @param {Object} freeze - { rows: 1, columns: 2 }
   * @returns {TabBuilder} this
   */
  TabBuilder.prototype.setFrozen = function(freeze) {
    if (freeze.rows) {
      this.sheet.setFrozenRows(freeze.rows);
    }
    if (freeze.columns) {
      this.sheet.setFrozenColumns(freeze.columns);
    }
    return this;
  };
  
  /**
   * Hide the sheet
   * @returns {TabBuilder} this
   */
  TabBuilder.prototype.hide = function() {
    this.sheet.hideSheet();
    Logger.log(`✅ Hidden sheet: ${this.tabName}`);
    return this;
  };
  
  /**
   * Build and return the sheet
   * @returns {Sheet} The created/modified sheet
   */
  TabBuilder.prototype.build = function() {
    // Apply any pending conditional formatting
    this.applyConditionalFormatting();
    
    Logger.log(`✅ Built sheet: ${this.tabName}`);
    return this.sheet;
  };
  
  /**
   * Get the sheet (for custom operations)
   * @returns {Sheet} The sheet object
   */
  TabBuilder.prototype.getSheet = function() {
    return this.sheet;
  };
  
  /**
   * Advanced: Add a section with title and content
   * @param {string} title - Section title
   * @param {Array<Array>} content - 2D array of content
   * @param {Object} options - { titleRow: auto, titleSize: 14, spacing: 1 }
   * @returns {TabBuilder} this
   */
  TabBuilder.prototype.addSection = function(title, content, options) {
    const opts = options || {};
    const titleRow = opts.titleRow || this.rowPointer;
    const spacing = opts.spacing !== undefined ? opts.spacing : 1;
    
    // Add title
    if (title) {
      this.addHeader(title, opts.titleSize || 14, { 
        row: titleRow,
        bold: true,
        background: opts.titleBackground
      });
    }
    
    // Add content
    if (content && content.length > 0) {
      const contentRow = titleRow + (title ? 1 : 0);
      this.addTable(contentRow, 'A', content, opts);
    }
    
    // Add spacing
    this.rowPointer += spacing;
    
    return this;
  };
  
  // Export for use in other files
  return TabBuilder;
})();

