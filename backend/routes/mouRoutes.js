const express = require('express');
const multer = require('multer');
const router = express.Router();
const MOUModel = require('../models/mysql/mouModel');
const { authenticateToken } = require('../middleware/auth');
const { mouValidation } = require('../middleware/validation');

/**
 * Get all MOU data with filtering and pagination
 * Protected route - requires authentication
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, faculty, academicYear, search } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (faculty) filters.faculty = faculty;
    if (academicYear) filters.academicYear = academicYear;
    if (search) filters.search = search;
    
    const result = await MOUModel.findAll(parseInt(page), parseInt(limit), filters);
    res.json(result);
  } catch (error) {
    console.error('Get MOU error:', error);
    res.status(500).json({ error: 'Failed to retrieve MOU data' });
  }
});

/**
 * Filter MOU data with query parameters (legacy endpoint - redirects to main GET)
 * Protected route - requires authentication
 */
router.get('/filter', authenticateToken, async (req, res) => {
  try {
    const { academicYear, facultyName, duration, institute, status } = req.query;
    
    const filters = {};
    if (academicYear) filters.academicYear = academicYear;
    if (facultyName) filters.faculty = facultyName;
    if (institute) filters.search = institute;
    if (status) filters.status = status;
    
    const result = await MOUModel.findAll(1, 1000, filters);
    res.json(result.mous);
  } catch (error) {
    console.error('Filter error:', error);
    res.status(500).json({ error: 'Failed to filter MOU data' });
  }
});

/**
 * Get MOU statistics
 * Protected route - requires authentication
 */
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const stats = await MOUModel.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

/**
 * Get expiring MOUs
 * Protected route - requires authentication
 */
router.get('/expiring/list', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const mous = await MOUModel.getExpiringMous(days);
    res.json(mous);
  } catch (error) {
    console.error('Get expiring MOUs error:', error);
    res.status(500).json({ error: 'Failed to retrieve expiring MOUs' });
  }
});

/**
 * Get MOU by ID
 * Protected route - requires authentication
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const mou = await MOUModel.findById(req.params.id);
    
    if (!mou) {
      return res.status(404).json({ error: 'MOU not found' });
    }
    
    res.json(mou);
  } catch (error) {
    console.error('Get MOU by ID error:', error);
    res.status(500).json({ error: 'Failed to retrieve MOU' });
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
    const mouData = {
      mouId: req.body.mouId || `MOU-${Date.now()}`,
      institute: req.body.institute,
      contactPerson: req.body.contactPerson,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      faculty: req.body.faculty,
      department: req.body.department,
      academicYear: req.body.academicYear,
      startDate: req.body.startDate,
      duration: parseInt(req.body.duration),
      expiryDate: req.body.expiryDate,
      purpose: req.body.purpose,
      expectedOutcome: req.body.expectedOutcome,
      signedDocument: req.file ? req.file.filename : null
    };

    const mouId = await MOUModel.create(mouData, req.user.userId);
    const createdMou = await MOUModel.findById(mouId);
    
    res.status(201).json({ 
      message: 'MOU added successfully!',
      data: createdMou 
    });
  } catch (error) {
    console.error('Add MOU error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'MOU ID already exists' });
    }
    
    res.status(500).json({ error: 'Failed to add MOU' });
  }
});

/**
 * Update existing MOU
 * Protected route - requires authentication
 */
router.put('/:id', authenticateToken, upload.single('SignedDoc'), async (req, res) => {
  try {
    const mouData = {
      institute: req.body.institute,
      contactPerson: req.body.contactPerson,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      faculty: req.body.faculty,
      department: req.body.department,
      academicYear: req.body.academicYear,
      startDate: req.body.startDate,
      duration: parseInt(req.body.duration),
      expiryDate: req.body.expiryDate,
      purpose: req.body.purpose,
      expectedOutcome: req.body.expectedOutcome,
      status: req.body.status
    };

    // Add file if uploaded
    if (req.file) {
      mouData.signedDocument = req.file.filename;
    }

    const updated = await MOUModel.update(req.params.id, mouData, req.user.userId);
    
    if (!updated) {
      return res.status(404).json({ error: 'MOU not found' });
    }
    
    const updatedMou = await MOUModel.findById(req.params.id);
    res.json({ 
      message: 'MOU updated successfully',
      data: updatedMou 
    });
  } catch (error) {
    console.error('Update MOU error:', error);
    res.status(500).json({ error: 'Failed to update MOU' });
  }
});

/**
 * Delete MOU
 * Protected route - requires authentication
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await MOUModel.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'MOU not found' });
    }
    
    res.json({ message: 'MOU deleted successfully' });
  } catch (error) {
    console.error('Delete MOU error:', error);
    res.status(500).json({ error: 'Failed to delete MOU' });
  }
});

module.exports = router;
