const XLSX = require('xlsx');
const fs = require('fs');
const filePath = './mou_data.xlsx';

function readExcelData() {
  if (!fs.existsSync(filePath)) {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([]), 'MOUs');
    XLSX.writeFile(wb, filePath);
  }
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets['MOUs'];
  return XLSX.utils.sheet_to_json(ws);
}

function writeExcelData(data) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'MOUs');
  XLSX.writeFile(wb, filePath);
}

module.exports = { readExcelData, writeExcelData };
