// routes/timeSlots.js
const express = require("express");
const router = express.Router();
const timeSlotService = require("../services/timeSlotService");
const {
  validateTimeSlotInput,
  validatePartialTimeSlotInput,
  validateGenerateSlotsInput,
  validateBulkTimeSlotsInput
} = require("../middleware/validation");
const { validateUser } = require("../middleware/simpleAuth");

// Helper: normalize location from query/body
function pickLocation(obj) {
  const location = { city: obj.city, state: obj.state, pincode: obj.pincode };
  Object.keys(location).forEach((k) => (location[k] == null || location[k] === "") && delete location[k]);
  return location;
}

// GET /api/time-slots?date=...&startDate=...&endDate=...&city=...&state=...&pincode=...
router.get("/", async (req, res, next) => {
  try {
    const { date, startDate, endDate } = req.query;
    const location = pickLocation(req.query);

    let slots;
    if (startDate && endDate) {
      slots = await timeSlotService.getTimeSlotsByDateRange(startDate, endDate, location);
    } else if (date) {
      slots = await timeSlotService.getTimeSlotsByDate(date, location);
    } else {
      slots = await timeSlotService.getAllTimeSlots(location);
    }

    res.json({ success: true, data: slots, count: slots.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/time-slots/today?city=...&state=...&pincode=...
router.get("/today", async (req, res, next) => {
  try {
    const location = pickLocation(req.query);
    const todaySlots = await timeSlotService.getTodayTimeSlots(location);
    res.json({ success: true, data: todaySlots });
  } catch (error) {
    next(error);
  }
});

// GET /api/time-slots/stats?city=...&state=...&pincode=... (Admin only)
router.get("/stats", validateUser, async (req, res, next) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required to view statistics.'
      });
    }

    const location = pickLocation(req.query);
    const stats = await timeSlotService.getTimeSlotStats(location);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/time-slots/:id
router.get("/:id", async (req, res, next) => {
  try {
    const timeSlot = await timeSlotService.getTimeSlotById(req.params.id);
    res.json({ success: true, data: timeSlot });
  } catch (error) {
    next(error);
  }
});

// POST /api/time-slots  body: {date,time,city,state,pincode} (Authenticated users)
router.post("/", validateUser, validateTimeSlotInput, async (req, res, next) => {
  try {
    const timeSlot = await timeSlotService.createTimeSlot({
      date: req.body.date,
      time: req.body.time,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Time slot created successfully",
      data: timeSlot,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/time-slots/bulk  body: {date, times: [..], city, state, pincode} (Authenticated users)
router.post("/bulk", validateUser, validateBulkTimeSlotsInput, async (req, res, next) => {
  try {
    const created = await timeSlotService.createMultipleForDate({
      date: req.body.date,
      times: req.body.times,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      createdBy: req.user.id
    });
    res.status(201).json({
      success: true,
      message: `Created ${created.length} time slots`,
      data: created,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/time-slots/generate  body: {startDate,endDate,city,state,pincode} (Authenticated users)
router.post("/generate", validateUser, validateGenerateSlotsInput, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    const createdSlots = await timeSlotService.generateTimeSlots(startDate, endDate, {
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: `Generated ${createdSlots.length} time slots successfully`,
      data: { createdCount: createdSlots.length, startDate, endDate },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/time-slots/:id  body can include any of {date,time,city,state,pincode} (Authenticated users)
router.put("/:id", validateUser, validatePartialTimeSlotInput, async (req, res, next) => {
  try {
    const updateData = {
      date: req.body.date,
      time: req.body.time,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      updatedBy: req.user.id
    };
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

    const timeSlot = await timeSlotService.updateTimeSlot(req.params.id, updateData);

    res.json({ success: true, message: "Time slot updated successfully", data: timeSlot });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/time-slots/:id (Authenticated users)
router.delete("/:id", validateUser, async (req, res, next) => {
  try {
    const result = await timeSlotService.deleteTimeSlot(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
