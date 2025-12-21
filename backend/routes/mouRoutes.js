const express = require('express');
const multer = require('multer');
const router = express.Router();
const { readExcelData, writeExcelData } = require('../utils/excelHandler');
const { authenticateToken } = require('../middleware/auth');
const { mouValidation } = require('../middleware/validation');

/**
 * Filter MOU data with query parameters
 * Protected route - requires authentication
 */
router.get('/filter', authenticateToken, async (req, res) => {
  try {
    const { academicYear, facultyName, duration, institute } = req.query;
    let data = await readExcelData();

    if (academicYear) data = data.filter(d => d.AcademicYear === academicYear);
    if (facultyName) data = data.filter(d => d.FacultyName === facultyName);
    if (duration) data = data.filter(d => d.Duration === duration);
    if (institute) data = data.filter(d => d.Institute === institute);

    res.json(data);
  } catch (error) {
    console.error('Filter error:', error);
    res.status(500).json({ error: 'Failed to filter MOU data' });
  }
});

/**
 * Overwrite entire MOU dataset
 * Protected route - requires authentication
 */
router.post('/overwrite', authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Request body must be an array' });
    }
    
    await writeExcelData(req.body);
    res.json({ message: 'Excel file updated successfully' });
  } catch (err) {
    console.error('Overwrite error:', err);
    res.status(500).json({ error: 'Failed to update Excel file.' });
  }
});

// Configure multer for file uploads with validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

/**
 * Add new MOU entry with optional file upload
 * Protected route - requires authentication
 */
router.post('/add', authenticateToken, upload.single('SignedDoc'), mouValidation, async (req, res) => {
  try {
    const mouData = req.body;
    
    // Add file information if uploaded
    if (req.file) {
      mouData.SignedDoc = req.file.filename;
    }

    const data = await readExcelData();
    data.push(mouData);
    await writeExcelData(data);
    
    res.status(201).json({ 
      message: 'MOU added successfully!',
      data: mouData 
    });
  } catch (error) {
    console.error('Add MOU error:', error);
    res.status(500).json({ error: 'Failed to add MOU' });
  }
});

/**
 * Get all MOU data
 * Protected route - requires authentication
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const data = await readExcelData();
    res.json(data);
  } catch (error) {
    console.error('Get MOU error:', error);
    res.status(500).json({ error: 'Failed to retrieve MOU data' });
  }
});

module.exports = router;
