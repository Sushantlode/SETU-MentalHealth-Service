// services/timeSlotService.js
const { Op } = require("sequelize");
const moment = require("moment");
const { AvailableTimeSlot } = require("../models");

// Build WHERE with optional location filters
function buildWhere(base = {}, location = {}) {
  const { city, state, pincode } = location || {};
  const where = { ...base };
  if (city) where.city = city;
  if (state) where.state = state;
  if (pincode) where.pincode = pincode;
  return where;
}

class TimeSlotService {
  // Create a single time slot (location REQUIRED)
  async createTimeSlot(slotData) {
    try {
      const { date, time, city, state, pincode } = slotData;
      if (!city || !state || !pincode) {
        throw new Error("city, state, and pincode are required");
      }
      return await AvailableTimeSlot.create({ date, time, city, state, pincode });
    } catch (error) {
      throw new Error(`Failed to create time slot: ${error.message}`);
    }
  }

  // Create multiple time slots for a single date
  async createMultipleForDate({ date, times, city, state, pincode }) {
    try {
      if (!Array.isArray(times) || times.length === 0) {
        throw new Error("times must be a non-empty array");
      }
      const rows = times.map((time) => ({ date, time, city, state, pincode }));
      return await AvailableTimeSlot.bulkCreate(rows, {
        ignoreDuplicates: true,
        returning: true,
      });
    } catch (error) {
      throw new Error(`Failed to create multiple time slots: ${error.message}`);
    }
  }

  // Generate time slots for a date range (location REQUIRED)
  async generateTimeSlots(startDate, endDate, location) {
    try {
      const slots = AvailableTimeSlot.generateTimeSlots(startDate, endDate, location);
      return await AvailableTimeSlot.bulkCreate(slots, {
        ignoreDuplicates: true,
        returning: true,
      });
    } catch (error) {
      throw new Error(`Failed to generate time slots: ${error.message}`);
    }
  }

  // Get all time slots for a specific date (optional location filter)
  async getTimeSlotsByDate(date, location) {
    try {
      return await AvailableTimeSlot.findAll({
        where: buildWhere({ date }, location),
        order: [["time", "ASC"]],
      });
    } catch (error) {
      throw new Error(`Failed to get time slots: ${error.message}`);
    }
  }

  // Get time slots for a date range (optional location filter)
  async getTimeSlotsByDateRange(startDate, endDate, location) {
    try {
      return await AvailableTimeSlot.findAll({
        where: buildWhere({ date: { [Op.between]: [startDate, endDate] } }, location),
        order: [["date", "ASC"], ["time", "ASC"]],
      });
    } catch (error) {
      throw new Error(`Failed to get time slots by date range: ${error.message}`);
    }
  }

  // Get all time slots (optional location filter)
  async getAllTimeSlots(location) {
    try {
      return await AvailableTimeSlot.findAll({
        where: buildWhere({}, location),
        order: [["date", "ASC"], ["time", "ASC"]],
      });
    } catch (error) {
      throw new Error(`Failed to get all time slots: ${error.message}`);
    }
  }

  // Get time slot by ID
  async getTimeSlotById(id) {
    try {
      const timeSlot = await AvailableTimeSlot.findByPk(id);
      if (!timeSlot) throw new Error("Time slot not found");
      return timeSlot;
    } catch (error) {
      throw new Error(`Failed to get time slot: ${error.message}`);
    }
  }

  // Update time slot (can also move between locations)
  async updateTimeSlot(id, updateData) {
    try {
      const timeSlot = await AvailableTimeSlot.findByPk(id);
      if (!timeSlot) throw new Error("Time slot not found");

      const allowed = ["date", "time", "city", "state", "pincode"];
      const payload = {};
      for (const k of allowed) {
        if (updateData[k] !== undefined) payload[k] = updateData[k];
      }

      await timeSlot.update(payload);
      return timeSlot;
    } catch (error) {
      throw new Error(`Failed to update time slot: ${error.message}`);
    }
  }

  // Delete time slot
  async deleteTimeSlot(id) {
    try {
      const timeSlot = await AvailableTimeSlot.findByPk(id);
      if (!timeSlot) throw new Error("Time slot not found");
      await timeSlot.destroy();
      return { message: "Time slot deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete time slot: ${error.message}`);
    }
  }

  // Get today's time slots (optional location filter)
  async getTodayTimeSlots(location) {
    try {
      const today = moment().format("YYYY-MM-DD");
      const slots = await AvailableTimeSlot.findAll({
        where: buildWhere({ date: today }, location),
        order: [["time", "ASC"]],
      });

      return { date: today, timeSlots: slots, count: slots.length };
    } catch (error) {
      throw new Error(`Failed to get today's time slots: ${error.message}`);
    }
  }

  // Stats (optionally scoped by location)
  async getTimeSlotStats(location) {
    try {
      const where = buildWhere({}, location);
      const totalSlots = await AvailableTimeSlot.count({ where });

      const today = moment().format("YYYY-MM-DD");
      const todaySlots = await AvailableTimeSlot.count({
        where: buildWhere({ date: today }, location),
      });

      const dates = await AvailableTimeSlot.findAll({
        attributes: ["date"],
        where,
        group: ["date"],
        order: [["date", "ASC"]],
        raw: true,
      });

      return {
        totalSlots,
        todaySlots,
        uniqueDates: dates.length,
        nextAvailableDate: dates.length > 0 ? dates[0].date : null,
      };
    } catch (error) {
      throw new Error(`Failed to get time slot statistics: ${error.message}`);
    }
  }
}

module.exports = new TimeSlotService();
