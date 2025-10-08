// middleware/validation.js
const Joi = require('joi');

/* ----------------------------- Helpers ----------------------------- */
// date >= today (compare as YYYY-MM-DD in UTC to avoid TZ issues)
const isTodayOrFuture = (value, helpers) => {
  if (!value) return value;
  const m = /^\d{4}-\d{2}-\d{2}$/.exec(value);
  if (!m) return helpers.message('Date must be in ISO format (YYYY-MM-DD)');
  const d = new Date(value + 'T00:00:00Z'); // force UTC
  if (isNaN(d.getTime())) return helpers.message('Date must be valid');
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (d < today) return helpers.message('Date cannot be in the past');
  return value;
};

// Expect HH:MM:SS 24h, minutes 00 or 30, between 10:00:00 and 16:30:00 inclusive
const isValidHalfHour = (value, helpers) => {
  const m = /^([01]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/.exec(value || '');
  if (!m) return helpers.message('Time must be in format HH:MM:SS (24-hour)');
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (!(min === 0 || min === 30)) {
    return helpers.message('Time must be at 30-minute intervals (e.g., 10:00:00, 10:30:00)');
  }
  const total = h * 60 + min;
  if (total < 600 || total > 990) { // 600=10:00, 990=16:30
    return helpers.message('Time must be between 10:00:00 and 16:30:00');
  }
  return value;
};

const locationSchema = {
  city: Joi.string().min(2).max(100).required().messages({
    'string.min': 'City must be at least 2 characters',
    'string.max': 'City cannot exceed 100 characters',
    'any.required': 'City is required'
  }),
  state: Joi.string().min(2).max(100).required().messages({
    'string.min': 'State must be at least 2 characters',
    'string.max': 'State cannot exceed 100 characters',
    'any.required': 'State is required'
  }),
  pincode: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'Pincode must be exactly 6 digits',
    'any.required': 'Pincode is required'
  })
};

/* ------------------------- Booking validation (unchanged) ------------------------- */
// Keep your existing booking schemas as you had them (not repeating here to stay concise)
// If you need them again, paste your previous bookingSchema and partialBookingSchema here.

const bookingSchema = Joi.object({}); // placeholder if you keep separate booking validator
const validateBookingInput = (req, res, next) => next();
const partialBookingSchema = Joi.object({});
const validatePartialBookingInput = (req, res, next) => next();

/* ------------------------- Time slot validation ------------------------- */
const timeSlotSchema = Joi.object({
  date: Joi.string().custom(isTodayOrFuture).required().messages({
    'any.required': 'Date is required'
  }),
  time: Joi.string().custom(isValidHalfHour).required().messages({
    'any.required': 'Time is required'
  }),
  ...locationSchema
});

const validateTimeSlotInput = (req, res, next) => {
  const { error, value } = timeSlotSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  if (error) {
    const errorMessages = error.details.map(d => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errorMessages });
  }
  req.body = value;
  next();
};

// For PUT /:id — all fields optional
const partialTimeSlotSchema = Joi.object({
  date: Joi.string().custom(isTodayOrFuture).optional(),
  time: Joi.string().custom(isValidHalfHour).optional(),
  city: Joi.string().min(2).max(100).optional(),
  state: Joi.string().min(2).max(100).optional(),
  pincode: Joi.string().pattern(/^\d{6}$/).optional().messages({
    'string.pattern.base': 'Pincode must be exactly 6 digits'
  })
});

const validatePartialTimeSlotInput = (req, res, next) => {
  const { error, value } = partialTimeSlotSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  if (error) {
    const errorMessages = error.details.map(d => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errorMessages });
  }
  req.body = value;
  next();
};

/* ------------------------- Assessment validation ------------------------- */
const optionSchema = Joi.object({
  text: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Option text must be at least 1 character',
    'string.max': 'Option text cannot exceed 200 characters',
    'any.required': 'Option text is required'
  }),
  value: Joi.number().integer().min(0).max(3).required().messages({
    'number.base': 'Option value must be a number',
    'number.integer': 'Option value must be an integer',
    'number.min': 'Option value must be at least 0',
    'number.max': 'Option value must be at most 3',
    'any.required': 'Option value is required'
  })
});

const questionSchema = Joi.object({
  text: Joi.string().min(5).max(500).required().messages({
    'string.min': 'Question text must be at least 5 characters',
    'string.max': 'Question text cannot exceed 500 characters',
    'any.required': 'Question text is required'
  }),
  order: Joi.number().integer().min(1).required().messages({
    'number.base': 'Question order must be a number',
    'number.integer': 'Question order must be an integer',
    'number.min': 'Question order must be at least 1',
    'any.required': 'Question order is required'
  }),
  options: Joi.array().items(optionSchema).length(4).required().messages({
    'array.length': 'Each question must have exactly 4 options',
    'any.required': 'Question options are required'
  })
});

const scoreBandSchema = Joi.object({
  label: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Score band label must be at least 2 characters',
    'string.max': 'Score band label cannot exceed 50 characters',
    'any.required': 'Score band label is required'
  }),
  minScore: Joi.number().integer().min(0).required().messages({
    'number.base': 'Min score must be a number',
    'number.integer': 'Min score must be an integer',
    'number.min': 'Min score must be at least 0',
    'any.required': 'Min score is required'
  }),
  maxScore: Joi.number().integer().min(0).required().messages({
    'number.base': 'Max score must be a number',
    'number.integer': 'Max score must be an integer',
    'number.min': 'Max score must be at least 0',
    'any.required': 'Max score is required'
  }),
  color: Joi.string().valid('green', 'blue', 'orange', 'red').required().messages({
    'any.only': 'Color must be one of: green, blue, orange, red',
    'any.required': 'Color is required'
  }),
  recommendation: Joi.string().max(1000).optional().messages({
    'string.max': 'Recommendation cannot exceed 1000 characters'
  })
});

const assessmentSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required'
  }),
  subTitle: Joi.string().min(5).max(400).optional().messages({
    'string.min': 'Subtitle must be at least 5 characters',
    'string.max': 'Subtitle cannot exceed 400 characters'
  }),
  imageUrl: Joi.any().optional(),
  status: Joi.string().valid('draft', 'active', 'archived').default('active').messages({
    'any.only': 'Status must be one of: draft, active, archived'
  }),
  questions: Joi.array().items(questionSchema).min(1).max(20).required().messages({
    'array.min': 'Assessment must have at least 1 question',
    'array.max': 'Assessment cannot have more than 20 questions',
    'any.required': 'Questions are required'
  }),
  scoreBands: Joi.array().items(scoreBandSchema).min(1).max(10).required().messages({
    'array.min': 'Assessment must have at least 1 score band',
    'array.max': 'Assessment cannot have more than 10 score bands',
    'any.required': 'Score bands are required'
  })
});

const validateAssessmentInput = (req, res, next) => {
  // Parse JSON strings for questions and scoreBands if they exist
  if (req.body.questions && typeof req.body.questions === 'string') {
    try {
      req.body.questions = JSON.parse(req.body.questions);
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid JSON format for questions' 
      });
    }
  }
  
  if (req.body.scoreBands && typeof req.body.scoreBands === 'string') {
    try {
      req.body.scoreBands = JSON.parse(req.body.scoreBands);
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid JSON format for scoreBands' 
      });
    }
  }

  const { error, value } = assessmentSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  if (error) {
    const errorMessages = error.details.map(d => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errorMessages });
  }
  req.body = value;
  next();
};

const partialAssessmentSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  subTitle: Joi.string().min(5).max(400).optional(),
  imageUrl: Joi.any().optional(),
  status: Joi.string().valid('draft', 'active', 'archived').optional(),
  questions: Joi.array().items(questionSchema).min(1).max(20).optional(),
  scoreBands: Joi.array().items(scoreBandSchema).min(1).max(10).optional()
});

const validatePartialAssessmentInput = (req, res, next) => {
  // Parse JSON strings for questions and scoreBands if they exist
  if (req.body.questions && typeof req.body.questions === 'string') {
    try {
      req.body.questions = JSON.parse(req.body.questions);
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid JSON format for questions' 
      });
    }
  }
  
  if (req.body.scoreBands && typeof req.body.scoreBands === 'string') {
    try {
      req.body.scoreBands = JSON.parse(req.body.scoreBands);
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid JSON format for scoreBands' 
      });
    }
  }

  const { error, value } = partialAssessmentSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  if (error) {
    const errorMessages = error.details.map(d => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errorMessages });
  }
  req.body = value;
  next();
};

// For POST /generate — requires startDate, endDate, and location
const generateSlotsSchema = Joi.object({
  startDate: Joi.string().custom(isTodayOrFuture).required().messages({
    'any.required': 'startDate is required'
  }),
  endDate: Joi.string().required().custom((value, helpers) => {
    const { startDate } = helpers.state.ancestors[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return helpers.message('endDate must be in ISO format (YYYY-MM-DD)');
    if (startDate && value < startDate) return helpers.message('endDate cannot be before startDate');
    return isTodayOrFuture(value, helpers);
  }).messages({
    'any.required': 'endDate is required'
  }),
  ...locationSchema
});

const validateGenerateSlotsInput = (req, res, next) => {
  const { error, value } = generateSlotsSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  if (error) {
    const errorMessages = error.details.map(d => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errorMessages });
  }
  req.body = value;
  next();
};

// For POST /bulk — create multiple times for a date
const bulkTimeSlotsSchema = Joi.object({
  date: Joi.string().custom(isTodayOrFuture).required().messages({
    'any.required': 'Date is required'
  }),
  times: Joi.array().items(Joi.string().custom(isValidHalfHour)).min(1).required().messages({
    'array.min': 'At least one time must be provided',
    'any.required': 'times is required'
  }),
  ...locationSchema
});

const validateBulkTimeSlotsInput = (req, res, next) => {
  const { error, value } = bulkTimeSlotsSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  if (error) {
    const errorMessages = error.details.map(d => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errorMessages });
  }
  req.body = value;
  next();
};

module.exports = {
  // bookings (replace with your real ones if you use them here)
  validateBookingInput,
  validatePartialBookingInput,

  // time slots
  validateTimeSlotInput,
  validatePartialTimeSlotInput,
  validateGenerateSlotsInput,
  validateBulkTimeSlotsInput,

  // assessments
  validateAssessmentInput,
  validatePartialAssessmentInput
};
