require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// Import MySQL database connection
const db = require('./config/mysql-database');

const mouRoutes = require('./routes/mouRoutes');
const { registerValidation, loginValidation } = require('./middleware/validation');

const app = express();

// Security: Helmet adds various HTTP headers for security
app.use(helmet());

// CORS Configuration - restrict to allowed origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all routes
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Test database connection on startup
(async () => {
  const isConnected = await db.testConnection();
  if (!isConnected) {
    console.error('Failed to connect to MySQL database. Please check your configuration.');
    console.error('Server will continue but database operations will fail.');
  }
})();

// Protected MOU routes
app.use('/api/mou', mouRoutes);

/**
 * Register endpoint with password hashing and validation
 */
app.post('/api/register', authLimiter, registerValidation, async (req, res) => {
  try {
    const { email, username, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username || email]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Add new user to MySQL database
    await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username || email, email, hashedPassword, role || 'user']
    );
    
    res.status(201).json({ message: 'Registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Login endpoint with bcrypt comparison and JWT generation
 */
app.post('/api/login', authLimiter, loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email from MySQL database
    const users = await db.query(
      'SELECT * FROM users WHERE email = ? AND is_active = true',
      [email]
    );
    
    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login timestamp
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.json({ 
      message: 'Login successful',
      token,
      user: { 
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await db.pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await db.closePool();
    process.exit(0);
  });
});
