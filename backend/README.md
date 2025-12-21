# MOUTracker Backend API

Secure backend API for the MOUTracker application with JWT authentication, password hashing, and comprehensive security features.

## 🚀 Features

- ✅ **Password Security**: Bcrypt hashing with salt rounds
- ✅ **JWT Authentication**: Stateless token-based authentication
- ✅ **Input Validation**: Express-validator for request validation
- ✅ **Security Headers**: Helmet middleware for HTTP security
- ✅ **Rate Limiting**: Brute-force protection with express-rate-limit
- ✅ **CORS Protection**: Configurable allowed origins
- ✅ **Async/Await**: Non-blocking file operations
- ✅ **Error Handling**: Centralized error handling middleware

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🔧 Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **IMPORTANT**: Change `JWT_SECRET` to a strong random string in production!

## 🔐 Password Migration

If you have existing users with plaintext passwords, run the migration script:

```bash
npm run migrate
```

This will hash all plaintext passwords in `users.json`.

## 🚀 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 📡 API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Validation Rules:**
- Email must be valid
- Password minimum 6 characters
- Password must contain uppercase, lowercase, and number

#### Login User
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com"
  }
}
```

### Protected MOU Endpoints

All MOU endpoints require authentication. Include JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

#### Get All MOUs
```http
GET /api/mou
Authorization: Bearer <token>
```

#### Filter MOUs
```http
GET /api/mou/filter?academicYear=2024&facultyName=John
Authorization: Bearer <token>
```

**Query Parameters:**
- `academicYear`: Filter by academic year
- `facultyName`: Filter by faculty name
- `duration`: Filter by duration
- `institute`: Filter by institute

#### Add MOU
```http
POST /api/mou/add
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "AcademicYear": "2024",
  "FacultyName": "John Doe",
  "Duration": "2 years",
  "Institute": "ABC University",
  "SignedDoc": <file>
}
```

**File Upload:**
- Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG
- Max size: 5MB

#### Overwrite MOUs
```http
POST /api/mou/overwrite
Authorization: Bearer <token>
Content-Type: application/json

[
  {
    "AcademicYear": "2024",
    "FacultyName": "John Doe",
    ...
  }
]
```

## 🔒 Security Features

### 1. Password Hashing
- Uses bcrypt with 10 salt rounds
- Passwords never stored in plaintext
- Secure comparison with `bcrypt.compare()`

### 2. JWT Authentication
- Tokens expire after 24 hours (configurable)
- Signed with secret key from environment
- Stateless authentication

### 3. Rate Limiting
- **General**: 100 requests per 15 minutes per IP
- **Auth routes**: 5 attempts per 15 minutes per IP
- Prevents brute-force attacks

### 4. Helmet Security Headers
- XSS Protection
- Content Security Policy
- HTTP Strict Transport Security
- And more...

### 5. CORS Protection
- Configurable allowed origins
- Production-ready CORS setup
- Credentials support

### 6. Input Validation
- Email validation
- Password strength requirements
- Request body sanitization
- File type validation

### 7. Async Operations
- Non-blocking file I/O
- Better performance under load
- Proper error handling

## 🏗️ Project Structure

```
backend/
├── middleware/
│   ├── auth.js           # JWT authentication middleware
│   └── validation.js     # Input validation rules
├── routes/
│   └── mouRoutes.js      # MOU API routes
├── utils/
│   └── excelHandler.js   # Excel file operations
├── uploads/              # Uploaded files
├── .env                  # Environment variables (git-ignored)
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
├── migrate-passwords.js  # Password migration script
├── package.json          # Dependencies and scripts
├── server.js            # Main server file
└── users.json           # User storage (git-ignored)
```

## 🔄 Frontend Integration

Update your frontend to:

1. **Store JWT token** after login:
```javascript
const response = await fetch('http://localhost:5000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
localStorage.setItem('token', data.token);
```

2. **Include token in requests**:
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/mou', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

3. **Handle token expiration**:
```javascript
if (response.status === 401) {
  // Token expired, redirect to login
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Valid email is required",
      "param": "email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "message": "Invalid token"
}
```

### 429 Too Many Requests
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## 📝 Best Practices

1. **Never commit `.env` file** - It contains sensitive secrets
2. **Use strong JWT_SECRET** - Minimum 32 characters, random string
3. **Set NODE_ENV=production** in production
4. **Configure ALLOWED_ORIGINS** for your production frontend URL
5. **Use HTTPS** in production (required for secure tokens)
6. **Regularly rotate JWT_SECRET** in production
7. **Monitor rate limit logs** for suspicious activity
8. **Keep dependencies updated** - Run `npm audit` regularly

## 🔧 Production Deployment

1. Set environment to production:
```env
NODE_ENV=production
```

2. Use a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. Configure production CORS:
```env
ALLOWED_ORIGINS=https://yourdomain.com
```

4. Use process manager (PM2):
```bash
npm install -g pm2
pm2 start server.js --name moutracker-api
```

5. Set up reverse proxy (nginx) for HTTPS
6. Enable firewall rules
7. Set up logging and monitoring

## 📦 Dependencies

- **express**: Web framework
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT authentication
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **express-validator**: Input validation
- **cors**: CORS handling
- **multer**: File upload handling
- **xlsx**: Excel file processing
- **dotenv**: Environment variables

## 🐛 Troubleshooting

### Issue: "JWT_SECRET is not defined"
**Solution**: Make sure `.env` file exists and contains `JWT_SECRET`

### Issue: "CORS error from frontend"
**Solution**: Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

### Issue: "Too many requests" error
**Solution**: Rate limit exceeded. Wait 15 minutes or adjust limits in `.env`

### Issue: "Invalid token" after some time
**Solution**: Token expired. Login again to get a new token

## 📄 License

ISC

## 👥 Support

For issues and questions, please open an issue in the repository.
