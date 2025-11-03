const { uploadImageToS3 } = require('../services/s3.js'); // Import the S3 upload utility
const svc = require('../services/assessment.service.js'); // Import the assessment service

const ok = (res, data, extra = {}) => res.status(200).json({ success: true, ...extra, data });
const created = (res, data) => res.status(201).json({ success: true, data });
const err = (res, e, code = 500) => res.status(code).json({ success: false, message: e?.message || 'Error' });

const toPlain = (value) => (value && typeof value.toJSON === 'function' ? value.toJSON() : value);
const normalizeUserMeta = (tokenUser = {}, fallbackId = null) => {
  const id = tokenUser.id ?? tokenUser.user_id ?? tokenUser.userId ?? fallbackId ?? null;
  return {
    id,
    username: tokenUser.username ?? tokenUser.name ?? null,
    email: tokenUser.email ?? null,
    role: tokenUser.role ?? null
  };
};

const create = async (req, res) => {
  try {
    if (req.file) {
      const imageKey = await uploadImageToS3(req.file); // Helper function to upload image
      req.body.imageKey = imageKey;
    }

    // Add user information from JWT token
    const assessmentData = {
      ...req.body,
      createdBy: req.user.id,
      userId: req.user.id
    };

    const a = await svc.createAssessment(assessmentData); 
    return created(res, a); 
  } catch (e) { return err(res, e); }
};

const list = async (_req, res) => {
  try { 
    const a = await svc.listAssessments(); 
    return ok(res, a); 
  } catch (e) { 
    return err(res, e); 
  }
};

const detail = async (req, res) => {
  try {
    const a = await svc.getAssessmentDetail(req.params.id);
    if (!a) return err(res, new Error('Not found'), 404);
    return ok(res, a);
  } catch (e) { 
    return err(res, e); 
  }
};

const submit = async (req, res) => {
  try {
    console.log('Submit request body:', req.body);
    console.log('Submit request params:', req.params);
    
    // Handle different data formats from frontend
    let answers = [];
    
    if (req.body?.answerData && Array.isArray(req.body.answerData)) {
      // Frontend is sending answerData as array
      answers = req.body.answerData;
    } else if (req.body?.answers) {
      if (Array.isArray(req.body.answers)) {
        // Frontend is sending answers as array
        answers = req.body.answers;
      } else if (typeof req.body.answers === 'object') {
        // Frontend is sending answers as object, convert to array
        answers = Object.values(req.body.answers);
      }
    }
    
    console.log('Final answers:', answers);
    console.log('Answers type:', typeof answers);
    console.log('Is answers array:', Array.isArray(answers));
    
    const out = await svc.submitAnswers(req.params.id, answers, req.user.id, req.body?.subject);
    return ok(res, out);
  } catch (e) { 
    console.error('Submit error:', e);
    return err(res, e); 
  }
};

const update = async (req, res) => {
  try {
    if (req.file) {
      const imageKey = await uploadImageToS3(req.file); // Helper function to upload image
      req.body.imageKey = imageKey;
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };
    const a = await svc.updateAssessment(req.params.id, updateData);
    return ok(res, a);
  } catch (e) {
    if (e.message === 'Assessment not found') return err(res, e, 404);
    return err(res, e);
  }
};

const deleteAssessment = async (req, res) => {
  try {
    const force = String(req.query.force).toLowerCase() === 'true';
    const result = await svc.deleteAssessment(req.params.id, { force });
    return ok(res, result);
  } catch (e) {
    if (e.message === 'Assessment not found') return err(res, e, 404);
    if (e.message === 'Cannot delete assessment with existing submissions') return err(res, e, 400);
    return err(res, e);
  }
};

const getUserSubmissions = async (req, res) => {
  try {
    // Get userId from query params, params, or current user
    const userId = req.query.userId || req.params.userId || req.user.id;

    const submissions = await svc.getSubmissionsByUser(userId, req.user);
    const userMeta = normalizeUserMeta(req.user, userId);
    const submissionsWithUser = submissions.map((item) => ({ ...toPlain(item), user: userMeta }));
    return ok(res, submissionsWithUser, { count: submissionsWithUser.length, user: userMeta });
  } catch (e) {
    if (e.message === 'Forbidden') return err(res, e, 403);
    return err(res, e);
  }
};

module.exports = {
  create,
  list,
  detail,
  submit,
  update,
  deleteAssessment,
  getUserSubmissions
};
