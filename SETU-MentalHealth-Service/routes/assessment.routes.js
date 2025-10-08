// routes/assessment.route.js
const { Router } = require('express');
const ctl = require('../controllers/assessment.controller');
const { validateAssessmentInput, validatePartialAssessmentInput } = require('../middleware/validation');
const { validateUser } = require('../middleware/simpleAuth');
const { uploadImage } = require('../middleware/upload');

const r = Router();

// Public routes (no authentication required)
r.get('/', ctl.list);
r.get('/:id', ctl.detail);

// Protected routes (authentication required)
r.post('/', validateUser, uploadImage, validateAssessmentInput, ctl.create);
r.put('/:id', validateUser, uploadImage, validatePartialAssessmentInput, ctl.update);
r.delete('/:id', validateUser, ctl.deleteAssessment);
r.post('/:id/submit', validateUser, ctl.submit);

module.exports = r;
