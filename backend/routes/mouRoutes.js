const express = require('express');
const multer = require('multer');
const router = express.Router();
const { readExcelData, writeExcelData } = require('../utils/excelHandler');

router.get('/filter', (req, res) => {
  const { academicYear, facultyName, duration, institute } = req.query;
  let data = readExcelData();

  if (academicYear) data = data.filter(d => d.AcademicYear === academicYear);
  if (facultyName) data = data.filter(d => d.FacultyName === facultyName);
  if (duration) data = data.filter(d => d.Duration === duration);
  if (institute) data = data.filter(d => d.Institute === institute);

  res.json(data);
});

router.post('/overwrite', (req, res) => {
  try {
    writeExcelData(req.body);
    res.json({ message: 'Excel file updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update Excel file.' });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Add MOU entry with file
router.post('/add', upload.single('SignedDoc'), (req, res) => {
  const mouData = req.body;
  if (req.file) {
    mouData.SignedDoc = req.file.filename; // just save the filename
  }

  const data = readExcelData();
  data.push(mouData);
  writeExcelData(data);
  res.json({ message: 'MOU added with file!' });
});


module.exports = router;
