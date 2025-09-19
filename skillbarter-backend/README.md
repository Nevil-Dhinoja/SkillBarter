# SkillBarter Backend - Registration & Authentication Setup

## 🎯 **Overview**
This setup provides a complete user registration and authentication system with email OTP verification for the SkillBarter platform.

## 📋 **Features Implemented**

### **Backend Features:**
- ✅ Complete database schema with 11 tables
- ✅ User registration with email OTP verification
- ✅ Secure password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Email service with HTML templates
- ✅ Rate limiting for OTP attempts
- ✅ Comprehensive error handling
- ✅ RESTful API endpoints

### **Frontend Features:**
- ✅ Modern registration form with validation
- ✅ Step-by-step OTP verification flow
- ✅ Updated login form with backend integration
- ✅ Progress indicators and loading states
- ✅ Error and success message handling
- ✅ Responsive design with Bootstrap

## 🗄️ **Database Schema**

### **Tables Created:**
1. **users** - Core user accounts and profiles
2. **skills** - Master list of skills
3. **user_skills_teach** - Skills users can teach
4. **user_skills_learn** - Skills users want to learn
5. **matches** - User matching system
6. **messages** - Chat system
7. **quizzes** - Quiz system
8. **quiz_questions** - Quiz questions
9. **quiz_results** - Quiz results tracking
10. **performance** - User performance analytics
11. **otp_verifications** - Email verification system

## 🚀 **Setup Instructions**

### **1. Environment Configuration**
Update your `.env` file with your email credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=skillbarter
JWT_SECRET=supersecret

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Configuration
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### **2. Install Dependencies**
```bash
cd skillbarter-backend
npm install nodemailer
```

### **3. Database Setup**
1. Create MySQL database named `skillbarter`
2. Start the backend server to auto-sync tables:
```bash
npm start
```

### **4. Email Setup (Gmail)**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Update SMTP_USER and SMTP_PASS in `.env`

## 📡 **API Endpoints**

### **Authentication Routes (`/api/auth`)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user (sends OTP) |
| POST | `/verify-otp` | Verify email with OTP |
| POST | `/resend-otp` | Resend OTP code |
| POST | `/login` | User login |
| GET | `/me` | Get current user (requires auth) |

### **API Examples:**

#### **Register User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "location": "New York, USA",
  "bio": "I love learning new skills"
}
```

#### **Verify OTP**
```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp_code": "123456"
}
```

#### **Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### **Forgot Password**
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### **Reset Password with OTP**
```bash
POST /api/auth/verify-password-reset
Content-Type: application/json

{
  "email": "john@example.com",
  "otp_code": "123456",
  "newPassword": "newpassword123"
}
```

#### **Change Password (Authenticated)**
```bash
PUT /api/auth/reset-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

## 🔐 **Security Features**

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: 1-hour expiration
- **OTP Security**: 10-minute expiration, max 5 attempts
- **Email Verification**: Required before login
- **Rate Limiting**: Built-in attempt tracking
- **Input Validation**: Comprehensive server-side validation

## 🎨 **Frontend Integration**

### **Registration Flow:**
1. User fills registration form
2. Backend creates user and sends OTP email
3. User enters OTP from email
4. Email verification completes
5. User can now login

### **Login Flow:**
1. User enters email/password
2. Backend validates credentials
3. Returns JWT token on success
4. Token stored in localStorage
5. User redirected to dashboard

## 🧪 **Testing the System**

### **1. Start Backend**
```bash
cd skillbarter-backend
npm start
```

### **2. Start Frontend**
```bash
cd SkillBarter-frontend
npm run dev
```

### **3. Test Registration**
1. Navigate to registration page
2. Fill in user details
3. Submit form
4. Check email for OTP
5. Enter OTP to verify
6. Try logging in

### **4. Test API with curl**
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"test123"}'

# Health check
curl http://localhost:5000/health
```

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **Email not sending:**
   - Check SMTP credentials in `.env`
   - Ensure Gmail app password is correct
   - Check firewall/antivirus blocking port 587

2. **Database connection fails:**
   - Verify MySQL is running
   - Check database credentials
   - Ensure `skillbarter` database exists

3. **CORS errors:**
   - Frontend URL is configured in CORS settings
   - Check if backend is running on port 5000

### **Debug Mode:**
Set `NODE_ENV=development` in `.env` for detailed error messages.

## 📈 **Next Steps**

After successful setup, you can:
1. Implement skill management endpoints
2. Build the matching algorithm
3. Add chat functionality
4. Create quiz system
5. Implement dashboard analytics

## 🎯 **Key Files Created**

### **Backend:**
- `models/` - All 11 database models
- `controllers/authController.js` - Authentication logic
- `routes/auth.js` - Authentication routes
- `middlewares/authMiddleware.js` - JWT middleware
- `services/emailService.js` - Email service
- `.env` - Environment configuration

### **Frontend:**
- `pages/Register.jsx` - Registration component
- `pages/Login.jsx` - Updated login component

The system is now ready for user registration with email verification and secure authentication! 🚀