const express = require('express');
const router = express.Router();
const bookingService = require('../services/bookingService');
const { validateBookingInput } = require('../middleware/validation');
const { validateUser } = require('../middleware/simpleAuth');

// GET /api/bookings - Get all bookings with optional filters
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      date: req.query.date,
      fullName: req.query.fullName,
      city: req.query.city,
      pincode: req.query.pincode,
      state: req.query.state
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const bookings = await bookingService.getBookings(filters);
    
    res.json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/stats - Get booking statistics (Admin only)
router.get('/stats', validateUser, async (req, res, next) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required to view statistics.'
      });
    }

    const stats = await bookingService.getBookingStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/available-slots - Get available time slots for a date
router.get('/available-slots', async (req, res, next) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required (YYYY-MM-DD format)'
      });
    }

    const availableSlots = await bookingService.getAvailableTimeSlots(date);
    
    res.json({
      success: true,
      data: {
        date,
        availableSlots,
        count: availableSlots.length,
        message: availableSlots.length > 0 
          ? `Found ${availableSlots.length} available time slots for ${date}`
          : `No available time slots for ${date}. Please try another date.`
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/today-availability - Check today's availability
router.get('/today-availability', async (req, res, next) => {
  try {
    const todayAvailability = await bookingService.checkTodayAvailability();
    
    res.json({
      success: true,
      data: todayAvailability
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/city/:city - Get bookings by city (Authenticated users)
router.get('/city/:city', validateUser, async (req, res, next) => {
  try {
    const { city } = req.params;
    const bookings = await bookingService.getBookingsByCity(city);
    
    res.json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/pincode/:pincode - Get bookings by pincode (Authenticated users)
router.get('/pincode/:pincode', validateUser, async (req, res, next) => {
  try {
    const { pincode } = req.params;
    const bookings = await bookingService.getBookingsByPincode(pincode);
    
    res.json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/my-bookings - Get current user's bookings (TEMPORARILY NO AUTH for testing)
router.get('/my-bookings', async (req, res, next) => {
  try {
    // TEMPORARY: For testing, get userId from query param or use a test user
    const userId = req.query.userId || 'test-user-id';

    const bookings = await bookingService.getBookingsByUserId(userId);

    res.json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/bookings - Create a new booking (Authenticated users)
router.post('/', validateUser, validateBookingInput, async (req, res, next) => {
  try {
    const bookingData = {
      fullName: req.body.fullName,
      age: parseInt(req.body.age),
      gender: req.body.gender,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      houseNumber: req.body.houseNumber,
      streetName: req.body.streetName,
      landmark: req.body.landmark,
      city: req.body.city,
      pincode: req.body.pincode,
      state: req.body.state,
      scheduleDate: req.body.scheduleDate,
      scheduleTime: req.body.scheduleTime,
      // Add user information from JWT token
      userId: req.user.id,
      createdBy: req.user.id
    };

    const booking = await bookingService.createBooking(bookingData);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id - Update booking (Authenticated users)
router.put('/:id', validateUser, validateBookingInput, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = {
      fullName: req.body.fullName,
      age: req.body.age ? parseInt(req.body.age) : undefined,
      gender: req.body.gender,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      houseNumber: req.body.houseNumber,
      streetName: req.body.streetName,
      landmark: req.body.landmark,
      city: req.body.city,
      pincode: req.body.pincode,
      state: req.body.state,
      scheduleDate: req.body.scheduleDate,
      scheduleTime: req.body.scheduleTime,
      status: req.body.status,
      // Add user information from JWT token
      updatedBy: req.user.id
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const booking = await bookingService.updateBooking(id, updateData);
    
    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/bookings/:id/status - Update booking status only (Admin only)
router.patch('/:id/status', validateUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required to update booking status.'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, confirmed, cancelled, completed'
      });
    }

    const booking = await bookingService.updateBooking(id, { 
      status,
      updatedBy: req.user.id
    });
    
    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/bookings/:id - Delete booking (Admin only)
router.delete('/:id', validateUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required to delete bookings.'
      });
    }

    const result = await bookingService.deleteBooking(id);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
