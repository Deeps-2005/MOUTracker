const XLSX = require('xlsx');
const fs = require('fs').promises;
const fsSync = require('fs');
const lockfile = require('proper-lockfile');
const filePath = './mou_data.xlsx';

// Lock options configuration
const lockOptions = {
  stale: 10000,        // Consider lock stale after 10 seconds
  retries: {
    retries: 5,        // Retry 5 times
    minTimeout: 100,   // Wait 100ms between retries
    maxTimeout: 1000   // Max 1s between retries
  }
};

/**
 * Read Excel data asynchronously with file locking
 * @returns {Promise<Array>} Array of MOU data
 */
async function readExcelData() {
  let release = null;
  try {
    // Check if file exists using synchronous check (XLSX.readFile requires sync)
    if (!fsSync.existsSync(filePath)) {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([]), 'MOUs');
      XLSX.writeFile(wb, filePath);
    }
    
    // Acquire lock before reading (shared lock for reading)
    release = await lockfile.lock(filePath, { ...lockOptions, realpath: false });
    
    // XLSX.readFile is synchronous but we wrap in async function for consistency
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets['MOUs'];
    const data = XLSX.utils.sheet_to_json(ws);
    
    return data;
  } catch (error) {
    if (error.code === 'ELOCKED') {
      console.error('Excel file is locked by another process');
      throw new Error('File is currently locked. Please try again.');
    }
    console.error('Error reading Excel data:', error);
    throw new Error('Failed to read Excel data');
  } finally {
    // Always release the lock
    if (release) {
      try {
        await release();
      } catch (err) {
        console.error('Error releasing lock:', err);
      }
    }
  }
}

/**
 * Write Excel data asynchronously with file locking
 * Prevents concurrent write operations and data corruption
 * @param {Array} data - Array of MOU data to write
 * @returns {Promise<void>}
 */
async function writeExcelData(data) {
  let release = null;
  try {
    // Ensure file exists before attempting to lock
    if (!fsSync.existsSync(filePath)) {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([]), 'MOUs');
      XLSX.writeFile(wb, filePath);
    }
    
    // Acquire exclusive lock before writing
    release = await lockfile.lock(filePath, { ...lockOptions, realpath: false });
    
    // Perform write operation
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MOUs');
    XLSX.writeFile(wb, filePath);
    
    console.log('Excel data written successfully with lock protection');
  } catch (error) {
    if (error.code === 'ELOCKED') {
      console.error('Excel file is locked by another process');
      throw new Error('File is currently locked. Please try again.');
    }
    console.error('Error writing Excel data:', error);
    throw new Error('Failed to write Excel data');
  } finally {
    // Always release the lock
    if (release) {
      try {
        await release();
      } catch (err) {
        console.error('Error releasing lock:', err);
      }
    }
  }
}

module.exports = { readExcelData, writeExcelData };
