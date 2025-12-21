const XLSX = require('xlsx');
const fs = require('fs').promises;
const fsSync = require('fs');
const filePath = './mou_data.xlsx';

/**
 * Read Excel data asynchronously
 * @returns {Promise<Array>} Array of MOU data
 */
async function readExcelData() {
  try {
    // Check if file exists using synchronous check (XLSX.readFile requires sync)
    if (!fsSync.existsSync(filePath)) {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([]), 'MOUs');
      XLSX.writeFile(wb, filePath);
    }
    
    // XLSX.readFile is synchronous but we wrap in async function for consistency
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets['MOUs'];
    return XLSX.utils.sheet_to_json(ws);
  } catch (error) {
    console.error('Error reading Excel data:', error);
    throw new Error('Failed to read Excel data');
  }
}

/**
 * Write Excel data asynchronously
 * @param {Array} data - Array of MOU data to write
 * @returns {Promise<void>}
 */
async function writeExcelData(data) {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MOUs');
    // XLSX.writeFile is synchronous but we wrap in async function for consistency
    XLSX.writeFile(wb, filePath);
  } catch (error) {
    console.error('Error writing Excel data:', error);
    throw new Error('Failed to write Excel data');
  }
}

module.exports = { readExcelData, writeExcelData };
