# Stress Quantification Device Booking Backend

A comprehensive Node.js/Express backend API for managing bookings of Stress Quantification Device appointments with PostgreSQL database integration.

## Features

- ✅ **Complete CRUD Operations** for bookings
- ✅ **PostgreSQL Database** with Sequelize ORM
- ✅ **Input Validation** with Joi schema validation
- ✅ **Scheduling Conflict Detection** to prevent double bookings
- ✅ **Available Time Slots** calculation
- ✅ **Today's Availability Check** - Check if today has any available slots
- ✅ **Booking Statistics** and analytics
- ✅ **Address Management** - Complete address fields with validation
- ✅ **Location-based Filtering** - Filter bookings by city and pincode
- ✅ **Error Handling** with consistent error responses
- ✅ **Security Features** (Helmet, CORS, Rate Limiting)
- ✅ **Database Migrations** and Seeders

## Data Model

Each booking contains the following information:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | String | Yes | Full name of the person (2-100 characters) |
| `age` | Number | Yes | Age (1-120 years) |
| `gender` | String | Yes | Gender (male, female, other, prefer not to say) |
| `phoneNumber` | String | Yes | Phone number (international format) |
| `email` | String | No | Email address (optional) |
| `houseNumber` | String | Yes | House number (1-20 characters) |
| `streetName` | String | Yes | Street name (2-200 characters) |
| `landmark` | String | No | Landmark (optional, max 200 characters) |
| `city` | String | Yes | City (2-100 characters) |
| `pincode` | String | Yes | Pincode (exactly 6 digits) |
| `state` | String | Yes | State (2-100 characters) |
| `scheduleDate` | Date | Yes | Appointment date (YYYY-MM-DD format) |
| `scheduleTime` | Time | Yes | Appointment time (HH:MM:SS format) |
| `status` | String | No | Booking status (pending, confirmed, cancelled, completed) |

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SETU-QuantificationDevice-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb stress_quantification_db
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env file with your PostgreSQL configuration
   ```

5. **Run database migrations and seeders**
   ```bash
   # Run migrations
   npm run db:migrate
   
   # Seed with sample data
   npm run db:seed
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## Environment Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stress_quantification_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_DIALECT=postgres
```

## API Endpoints

### Health Check
- `GET /health` - Check if the service is running

### Bookings

#### Get All Bookings
```http
GET /api/bookings
```

**Query Parameters:**
- `status` - Filter by status (pending, confirmed, cancelled, completed)
- `date` - Filter by date (YYYY-MM-DD format)
- `fullName` - Search by full name
- `city` - Filter by city
- `pincode` - Filter by pincode
- `state` - Filter by state

**Example:**
```bash
curl "http://localhost:3000/api/bookings?status=confirmed&city=New York"
```

#### Get Booking by ID
```http
GET /api/bookings/:id
```

#### Create New Booking
```http
POST /api/bookings
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "age": 30,
  "gender": "male",
  "phoneNumber": "+1234567890",
  "email": "john.doe@example.com",
  "houseNumber": "123",
  "streetName": "Main Street",
  "landmark": "Near Central Park",
  "city": "New York",
  "pincode": "10001",
  "state": "New York",
  "scheduleDate": "2024-01-15",
  "scheduleTime": "10:00:00"
}
```

#### Update Booking
```http
PUT /api/bookings/:id
```

#### Update Booking Status
```http
PATCH /api/bookings/:id/status
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

#### Delete Booking
```http
DELETE /api/bookings/:id
```

### Location-based Filtering

#### Get Bookings by City
```http
GET /api/bookings/city/:city
```

**Example:**
```bash
curl "http://localhost:3000/api/bookings/city/New York"
```

#### Get Bookings by Pincode
```http
GET /api/bookings/pincode/:pincode
```

**Example:**
```bash
curl "http://localhost:3000/api/bookings/pincode/10001"
```

### Available Time Slots
```http
GET /api/bookings/available-slots?date=2024-01-15
```

Returns available 30-minute time slots for the specified date.

### Today's Availability
```http
GET /api/bookings/today-availability
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-12-20",
    "hasAvailableSlots": true,
    "availableSlotsCount": 8,
    "availableSlots": [
      "09:00:00",
      "09:30:00",
      "10:00:00",
      "10:30:00",
      "11:00:00",
      "11:30:00",
      "12:00:00",
      "12:30:00"
    ],
    "message": "There are 8 available time slots today."
  }
}
```

If no slots are available:
```json
{
  "success": true,
  "data": {
    "date": "2024-12-20",
    "hasAvailableSlots": false,
    "availableSlotsCount": 0,
    "availableSlots": [],
    "message": "No available time slots for today. Please check another date."
  }
}
```

### Statistics
```http
GET /api/bookings/stats
```

Returns booking statistics including total, pending, confirmed, cancelled bookings, and counts for today, this week, and this month.

## Usage Examples

### Creating a Booking

```javascript
const response = await fetch('http://localhost:3000/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fullName: 'Jane Smith',
    age: 25,
    gender: 'female',
    phoneNumber: '+1987654321',
    email: 'jane.smith@example.com',
    houseNumber: '456',
    streetName: 'Oak Avenue',
    landmark: 'Opposite Library',
    city: 'Los Angeles',
    pincode: '90210',
    state: 'California',
    scheduleDate: '2024-01-15',
    scheduleTime: '14:30:00'
  })
});

const booking = await response.json();
console.log(booking);
```

### Checking Today's Availability

```javascript
const response = await fetch('http://localhost:3000/api/bookings/today-availability');
const todayAvailability = await response.json();
console.log(todayAvailability.data.message);
```

### Getting Available Slots

```javascript
const response = await fetch('http://localhost:3000/api/bookings/available-slots?date=2024-01-15');
const slots = await response.json();
console.log(slots.data.availableSlots);
```

### Filtering by City

```javascript
const response = await fetch('http://localhost:3000/api/bookings/city/New York');
const cityBookings = await response.json();
console.log(cityBookings.data);
```

### Filtering by Pincode

```javascript
const response = await fetch('http://localhost:3000/api/bookings/pincode/10001');
const pincodeBookings = await response.json();
console.log(pincodeBookings.data);
```

### Updating Booking Status

```javascript
const response = await fetch('http://localhost:3000/api/bookings/booking-id/status', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'confirmed'
  })
});
```

## Validation Rules

### Personal Information
- **Full Name**: Required, 2-100 characters
- **Age**: Required, 1-120 years, whole number
- **Gender**: Required, one of: male, female, other, prefer not to say
- **Phone Number**: Required, international format
- **Email**: Optional, valid email format if provided

### Address Information
- **House Number**: Required, 1-20 characters
- **Street Name**: Required, 2-200 characters
- **Landmark**: Optional, max 200 characters
- **City**: Required, 2-100 characters
- **Pincode**: Required, exactly 6 digits
- **State**: Required, 2-100 characters

### Schedule Information
- **Schedule Date**: Required, ISO format (YYYY-MM-DD), cannot be in the past
- **Schedule Time**: Required, format HH:MM:SS (24-hour), 30-minute buffer between appointments

## Database Management

### Migrations
```bash
# Run migrations
npm run db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo
```

### Seeders
```bash
# Run all seeders
npm run db:seed

# Undo last seeder
npx sequelize-cli db:seed:undo
```

### Reset Database
```bash
# Drop, create, migrate, and seed database
npm run db:reset
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (scheduling conflicts)
- `500` - Internal Server Error

## Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Input Validation** - Comprehensive validation with Joi
- **Error Handling** - No sensitive information in error responses
- **Database Validation** - Sequelize model validation

## Development

### Project Structure
```
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── config/
│   └── database.js        # Database configuration
├── models/
│   ├── index.js           # Sequelize models index
│   └── Booking.js         # Booking model
├── services/
│   └── bookingService.js  # Business logic
├── routes/
│   └── bookingRoutes.js   # API routes
├── middleware/
│   ├── validation.js      # Input validation
│   └── errorHandler.js    # Error handling
├── migrations/            # Database migrations
├── seeders/              # Database seeders
└── env.example           # Environment variables template
```

### Testing

```bash
npm test
```

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Email notifications for booking confirmations
- [ ] SMS notifications
- [ ] Calendar integration
- [ ] Admin dashboard
- [ ] Booking reminders
- [ ] Payment integration
- [ ] Multi-device support
- [ ] API documentation with Swagger
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Address geocoding
- [ ] Distance-based scheduling
- [ ] Multiple location support

## License

MIT License
