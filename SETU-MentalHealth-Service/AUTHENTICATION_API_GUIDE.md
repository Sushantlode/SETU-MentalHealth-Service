# 🔐 Authentication API Guide

This guide provides complete authentication setup and API testing for your Stress Quantification Device Booking Service.

## 🚨 CRITICAL: Environment Setup

**You MUST create a `.env` file first!** Copy the contents from `env.txt` to `.env`:

```bash
# Copy this to .env file
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stress_quantification_db
DB_USER=postgres
DB_PASSWORD=password
DB_DIALECT=postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_URL=http://localhost:3000/api/auth/refresh
```

## 🔑 Authentication Endpoints

### 1. **Register User**
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_1703123456789",
      "email": "newuser@example.com",
      "name": "New User",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. **Login User**
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "admin123",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. **Get Current User**
```bash
GET http://localhost:3000/api/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 4. **Refresh Token**
```bash
POST http://localhost:3000/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

## 👥 Pre-configured Users

For testing, these users are already configured:

### Admin User
- **Email:** `admin@example.com`
- **Password:** `password`
- **Role:** `admin`

### Regular User
- **Email:** `user@example.com`
- **Password:** `password`
- **Role:** `user`

## 📋 Protected API Endpoints

### 🔒 Assessment Routes (Authentication Required)

#### Create Assessment
```bash
POST http://localhost:3000/api/v1/assessments
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Stress Assessment",
  "subTitle": "Evaluate your stress levels",
  "questions": [
    {
      "text": "How often do you feel stressed?",
      "order": 1,
      "options": [
        {"text": "Never", "value": 0},
        {"text": "Sometimes", "value": 1},
        {"text": "Often", "value": 2},
        {"text": "Always", "value": 3}
      ]
    }
  ],
  "scoreBands": [
    {
      "label": "Low Stress",
      "minScore": 0,
      "maxScore": 5,
      "color": "green"
    }
  ]
}
```

#### Submit Assessment
```bash
POST http://localhost:3000/api/v1/assessments/ASSESSMENT_ID/submit
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "answers": [
    {"questionId": 1, "selectedOption": 2}
  ]
}
```

### 🔒 Booking Routes (Authentication Required)

#### Create Booking
```bash
POST http://localhost:3000/api/bookings
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "fullName": "John Doe",
  "age": 30,
  "gender": "male",
  "phoneNumber": "1234567890",
  "email": "john@example.com",
  "houseNumber": "123",
  "streetName": "Main Street",
  "landmark": "Near Park",
  "city": "Mumbai",
  "pincode": "400001",
  "state": "Maharashtra",
  "scheduleDate": "2024-01-15",
  "scheduleTime": "10:00:00"
}
```

#### Get Booking Statistics (Admin Only)
```bash
GET http://localhost:3000/api/bookings/stats
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

#### Update Booking Status (Admin Only)
```bash
PATCH http://localhost:3000/api/bookings/BOOKING_ID/status
Authorization: Bearer ADMIN_ACCESS_TOKEN
Content-Type: application/json

{
  "status": "confirmed"
}
```

### 🔒 Time Slot Routes (Authentication Required)

#### Create Time Slot
```bash
POST http://localhost:3000/api/time-slots
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "date": "2024-01-15",
  "time": "10:00:00",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

#### Generate Multiple Time Slots
```bash
POST http://localhost:3000/api/time-slots/generate
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "startDate": "2024-01-15",
  "endDate": "2024-01-20",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

#### Get Time Slot Statistics
```bash
GET http://localhost:3000/api/time-slots/stats
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

## 🧪 Testing Scripts

### 1. **Test Authentication Flow**
```bash
# 1. Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# 2. Copy the accessToken from response and use it
export TOKEN="YOUR_ACCESS_TOKEN_HERE"

# 3. Test protected route
curl -X GET http://localhost:3000/api/protected/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 2. **Test Booking Creation**
```bash
# Login first
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}')

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Create booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "age": 25,
    "gender": "female",
    "phoneNumber": "9876543210",
    "email": "test@example.com",
    "city": "Mumbai",
    "pincode": "400001",
    "state": "Maharashtra",
    "scheduleDate": "2024-01-15",
    "scheduleTime": "10:00:00"
  }'
```

### 3. **Test Time Slot Creation (Any Authenticated User)**
```bash
# Login as any user
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}')

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Create time slot (now works for any authenticated user)
curl -X POST http://localhost:3000/api/time-slots \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "time": "10:00:00",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }'
```

## 🚨 Common Issues & Solutions

### 1. **"JWT_SECRET is not defined"**
**Solution:** Create `.env` file with JWT_SECRET

### 2. **"Access token is required"**
**Solution:** Include `Authorization: Bearer YOUR_TOKEN` header

### 3. **"Access denied. Admin role required"**
**Solution:** Use admin user token (`admin@example.com`)

### 4. **"Token has expired"**
**Solution:** Login again to get new token

### 5. **"Invalid access token"**
**Solution:** Check token format and ensure it's valid

## 🔧 Quick Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (copy from env.txt)
cp env.txt .env

# 3. Start server
npm run dev

# 4. Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

## 📊 API Response Format

All API responses follow this format:
```json
{
  "success": true/false,
  "message": "Description",
  "data": { ... }
}
```

## 🔐 Security Notes

1. **JWT_SECRET**: Change in production
2. **Token Expiration**: 1 hour for access tokens
3. **Role-based Access**: Admin vs User permissions
4. **HTTPS**: Use in production
5. **Rate Limiting**: Already configured

Your authentication system is now fully functional! 🎉
