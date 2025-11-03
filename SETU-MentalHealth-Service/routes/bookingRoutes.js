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
  console.log('POST /api/bookings route called');
  console.log('Headers:', req.headers.authorization);
  console.log('User object:', req.user);
  try {
    const userIdFromToken = req.user?.id ?? req.user?.user_id ?? req.user?.userId ?? null;

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
      userId: userIdFromToken,
      createdBy: userIdFromToken
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

// PATCH /api/bookings/:id/cancel - Cancel own upcoming booking (Authenticated users)
router.patch('/:id/cancel', validateUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    let booking;

    try {
      booking = await bookingService.getBookingById(id);
    } catch (error) {
      const message = error.message || '';
      if (message.includes('Booking not found')) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      throw error;
    }

    const requesterIds = [
      req.user?.id,
      req.user?.user_id,
      req.user?.userId,
      req.user?.sub
    ]
      .filter((value) => value !== undefined && value !== null)
      .map((value) => String(value).trim());

    if (requesterIds.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Unable to determine current user identifier.'
      });
    }

    const bookingOwnerIds = [
      booking.userId,
      booking.user_id,
      booking.userId,
      booking.createdBy,
      booking.created_by
    ]
      .filter((value) => value !== undefined && value !== null)
      .map((value) => String(value).trim());

    const ownsBooking =
      bookingOwnerIds.length > 0 &&
      requesterIds.some((reqId) =>
        bookingOwnerIds.some((ownerId) => ownerId === reqId)
      );

    if (!ownsBooking) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings.'
      });
    }

    const bookingDateTime = new Date(`${booking.scheduleDate}T${booking.scheduleTime}`);
    if (Number.isNaN(bookingDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Unable to determine booking schedule time.'
      });
    }

    if (bookingDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Only upcoming bookings can be cancelled.'
      });
    }

    if (String(booking.status || '').toLowerCase() === 'cancelled') {
      return res.json({
        success: true,
        message: 'Booking already cancelled.',
        data: booking
      });
    }

    const updatedBooking = await bookingService.updateBooking(id, {
      status: 'cancelled',
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/bookings/:id/self - Delete own past booking (Authenticated users)
router.delete('/:id/self', validateUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    let booking;

    try {
      booking = await bookingService.getBookingById(id);
    } catch (error) {
      const message = error.message || '';
      if (message.includes('Booking not found')) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      throw error;
    }

    const requesterIds = [
      req.user?.id,
      req.user?.user_id,
      req.user?.userId,
      req.user?.sub
    ].filter(value => value !== undefined && value !== null)
     .map(value => String(value).trim());

    if (requesterIds.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Unable to determine current user identifier.'
      });
    }

    const bookingOwnerIds = [
      booking.userId,
      booking.user_id,
      booking.userId,
      booking.createdBy,
      booking.created_by
    ].filter(value => value !== undefined && value !== null)
     .map(value => String(value).trim());

    const ownsBooking = bookingOwnerIds.length > 0 && requesterIds.some(reqId =>
      bookingOwnerIds.some(ownerId => ownerId === reqId)
    );

    if (!ownsBooking) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own bookings.'
      });
    }

    const bookingDateTime = new Date(`${booking.scheduleDate}T${booking.scheduleTime}`);
    if (Number.isNaN(bookingDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Unable to determine booking schedule time.'
      });
    }

    const isCancelled = String(booking.status || '').toLowerCase() === 'cancelled';

    if (!isCancelled && bookingDateTime > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Only past bookings can be deleted.'
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
