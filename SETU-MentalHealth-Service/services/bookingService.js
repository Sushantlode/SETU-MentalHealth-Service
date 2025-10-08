const { Booking } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

class BookingService {
  // Create a new booking
  async createBooking(bookingData) {
    try {
      const booking = await Booking.create(bookingData);
      
      // Check for scheduling conflicts
      const conflict = await this.checkSchedulingConflict(booking.scheduleDate, booking.scheduleTime, booking.id);
      if (conflict) {
        // Delete the created booking if there's a conflict
        await booking.destroy();
        throw new Error('This time slot is already booked. Please choose a different time.');
      }
      
      return booking.toJSON();
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      throw error;
    }
  }

  // Get all bookings with optional filters
  async getBookings(filters = {}) {
    try {
      const whereClause = {};
      const orderClause = [['scheduleDate', 'ASC'], ['scheduleTime', 'ASC']];

      // Apply filters
      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.date) {
        whereClause.scheduleDate = filters.date;
      }

      if (filters.fullName) {
        whereClause.fullName = {
          [Op.iLike]: `%${filters.fullName}%`
        };
      }

      if (filters.city) {
        whereClause.city = {
          [Op.iLike]: `%${filters.city}%`
        };
      }

      if (filters.pincode) {
        whereClause.pincode = filters.pincode;
      }

      if (filters.state) {
        whereClause.state = {
          [Op.iLike]: `%${filters.state}%`
        };
      }

      const bookings = await Booking.findAll({
        where: whereClause,
        order: orderClause
      });

      return bookings.map(booking => booking.toJSON());
    } catch (error) {
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }
  }

  // Get booking by ID
  async getBookingById(id) {
    try {
      const booking = await Booking.findByPk(id);
      if (!booking) {
        throw new Error('Booking not found');
      }
      return booking.toJSON();
    } catch (error) {
      throw new Error(`Failed to fetch booking: ${error.message}`);
    }
  }

  // Update booking
  async updateBooking(id, updateData) {
    try {
      const booking = await Booking.findByPk(id);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check for scheduling conflicts if scheduleDate or scheduleTime is being updated
      if (updateData.scheduleDate || updateData.scheduleTime) {
        const newDate = updateData.scheduleDate || booking.scheduleDate;
        const newTime = updateData.scheduleTime || booking.scheduleTime;
        const conflict = await this.checkSchedulingConflict(newDate, newTime, id);
        if (conflict) {
          throw new Error('This time slot is already booked. Please choose a different time.');
        }
      }

      await booking.update(updateData);
      return booking.toJSON();
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      throw error;
    }
  }

  // Delete booking
  async deleteBooking(id) {
    try {
      const booking = await Booking.findByPk(id);
      if (!booking) {
        throw new Error('Booking not found');
      }

      await booking.destroy();
      return { message: 'Booking deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete booking: ${error.message}`);
    }
  }

  // Check for scheduling conflicts
  async checkSchedulingConflict(scheduleDate, scheduleTime, excludeId = null) {
    try {
      const scheduleMoment = moment(`${scheduleDate} ${scheduleTime}`, 'YYYY-MM-DD HH:mm:ss');
      const bufferMinutes = 30; // 30-minute buffer between appointments
      
      const startTime = scheduleMoment.clone().subtract(bufferMinutes, 'minutes');
      const endTime = scheduleMoment.clone().add(bufferMinutes, 'minutes');

      const whereClause = {
        scheduleDate: scheduleDate
      };

      if (excludeId) {
        whereClause.id = {
          [Op.ne]: excludeId
        };
      }

      const conflictingBookings = await Booking.findAll({
        where: whereClause
      });

      // Check if any existing bookings conflict with the new time
      for (const booking of conflictingBookings) {
        const bookingMoment = moment(`${booking.scheduleDate} ${booking.scheduleTime}`, 'YYYY-MM-DD HH:mm:ss');
        const timeDiff = Math.abs(scheduleMoment.diff(bookingMoment, 'minutes'));
        
        if (timeDiff < bufferMinutes) {
          return true; // Conflict found
        }
      }

      return false; // No conflict
    } catch (error) {
      throw new Error(`Failed to check scheduling conflicts: ${error.message}`);
    }
  }

  // Get available time slots for a given date
  async getAvailableTimeSlots(date) {
    try {
      const workingHours = {
        start: 9, // 9 AM
        end: 17   // 5 PM
      };

      const appointmentDuration = 30; // 30 minutes per appointment
      const bufferMinutes = 30; // 30-minute buffer between appointments

      const availableSlots = [];
      const targetDate = moment(date).startOf('day');
      const now = moment();

      // If the date is today, start from the next available slot
      let startHour = workingHours.start;
      if (targetDate.isSame(now, 'day') && now.hour() >= workingHours.start) {
        startHour = Math.max(workingHours.start, now.hour() + 1);
      }

      // Get all bookings for the target date
      const existingBookings = await Booking.findAll({
        where: { scheduleDate: date },
        order: [['scheduleTime', 'ASC']]
      });

      const bookedTimes = existingBookings.map(booking => 
        moment(`${booking.scheduleDate} ${booking.scheduleTime}`, 'YYYY-MM-DD HH:mm:ss')
      );

      for (let hour = startHour; hour < workingHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += appointmentDuration) {
          const slotTime = targetDate.clone().hour(hour).minute(minute);
          
          // Skip if the slot is in the past
          if (slotTime.isBefore(now)) continue;

          // Check if this slot conflicts with existing bookings
          let hasConflict = false;
          for (const bookedTime of bookedTimes) {
            const timeDiff = Math.abs(slotTime.diff(bookedTime, 'minutes'));
            if (timeDiff < bufferMinutes) {
              hasConflict = true;
              break;
            }
          }
          
          if (!hasConflict) {
            availableSlots.push(slotTime.format('HH:mm:ss'));
          }
        }
      }

      return availableSlots;
    } catch (error) {
      throw new Error(`Failed to get available time slots: ${error.message}`);
    }
  }

  // Get booking statistics
  async getBookingStats() {
    try {
      const now = moment();
      const today = now.format('YYYY-MM-DD');
      const startOfWeek = now.clone().startOf('week').format('YYYY-MM-DD');
      const startOfMonth = now.clone().startOf('month').format('YYYY-MM-DD');

      const [
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        todayBookings,
        thisWeekBookings,
        thisMonthBookings
      ] = await Promise.all([
        Booking.count(),
        Booking.count({ where: { status: 'pending' } }),
        Booking.count({ where: { status: 'confirmed' } }),
        Booking.count({ where: { status: 'cancelled' } }),
        Booking.count({
          where: {
            scheduleDate: {
              [Op.gte]: today
            }
          }
        }),
        Booking.count({
          where: {
            scheduleDate: {
              [Op.gte]: startOfWeek
            }
          }
        }),
        Booking.count({
          where: {
            scheduleDate: {
              [Op.gte]: startOfMonth
            }
          }
        })
      ]);

      return {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        today: todayBookings,
        thisWeek: thisWeekBookings,
        thisMonth: thisMonthBookings
      };
    } catch (error) {
      throw new Error(`Failed to get booking statistics: ${error.message}`);
    }
  }

  // Check if today has any available slots
  async checkTodayAvailability() {
    try {
      const today = moment().format('YYYY-MM-DD');
      const availableSlots = await this.getAvailableTimeSlots(today);
      
      return {
        date: today,
        hasAvailableSlots: availableSlots.length > 0,
        availableSlotsCount: availableSlots.length,
        availableSlots: availableSlots,
        message: availableSlots.length > 0 
          ? `There are ${availableSlots.length} available time slots today.`
          : 'No available time slots for today. Please check another date.'
      };
    } catch (error) {
      throw new Error(`Failed to check today's availability: ${error.message}`);
    }
  }

  // Get bookings by city
  async getBookingsByCity(city) {
    try {
      const bookings = await Booking.findByCity(city);
      return bookings.map(booking => booking.toJSON());
    } catch (error) {
      throw new Error(`Failed to fetch bookings by city: ${error.message}`);
    }
  }

  // Get bookings by pincode
  async getBookingsByPincode(pincode) {
    try {
      const bookings = await Booking.findByPincode(pincode);
      return bookings.map(booking => booking.toJSON());
    } catch (error) {
      throw new Error(`Failed to fetch bookings by pincode: ${error.message}`);
    }
  }
}

module.exports = new BookingService();
