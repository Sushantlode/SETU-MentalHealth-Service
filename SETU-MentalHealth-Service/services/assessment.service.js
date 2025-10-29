const { Op } = require('sequelize');  // Import Sequelize operators for queries
const { getImageUrl } = require('./s3.js');

// Import models using require for CommonJS modules
const { 
  Assessments: Assessment, 
  Questions: Question, 
  Options: Option, 
  Score_bands: ScoreBand, 
  Submissions: Submission, 
  Submission_answers: SubmissionAnswer, 
  sequelize 
} = require('../models');

// Helper function to transform assessment data to include image URL
const transformAssessmentData = async (assessment) => {
  if (!assessment) return null;
  
  const assessmentData = assessment.toJSON ? assessment.toJSON() : assessment;
  
  // Generate presigned URL for the image if imageUrl contains S3 key
  if (assessmentData.imageUrl && !assessmentData.imageUrl.startsWith('http')) {
    // imageUrl contains S3 key, generate presigned URL
    const presignedUrl = await getImageUrl(assessmentData.imageUrl);
    assessmentData.imageUrl = presignedUrl;
  }
  
  return assessmentData;
};

 

// Function to create an assessment
const createAssessment = async (data) => {
  const { title, subTitle, imageKey, status, questions = [], scoreBands = [] } = data;

  return sequelize.transaction(async (t) => {
    const assessment = await Assessment.create(
      { title, subTitle, imageUrl: imageKey, status }, // Store S3 key in imageUrl field
      { transaction: t }
    );

    // Handling questions and options
    for (const qData of questions) {
      const { text, order, options = [] } = qData;
      const question = await Question.create(
        { assessmentId: assessment.id, text, order },
        { transaction: t }
      );

      // Handling options for each question
      for (const optData of options) {
        await Option.create(
          { questionId: question.id, text: optData.text, value: optData.value },
          { transaction: t }
        );
      }
    }

    // Handling score bands
    for (const bandData of scoreBands) {
      await ScoreBand.create(
        { assessmentId: assessment.id, ...bandData },
        { transaction: t }
      );
    }

    // Return the details of the created assessment
    const assessmentDetail = await getAssessmentDetail(assessment.id);
    return await transformAssessmentData(assessmentDetail);
  });
};

// Function to list all assessments
const listAssessments = async () => {
  const assessments = await Assessment.findAll({
    include: [
      { model: Question, as: 'questions', include: [{ model: Option, as: 'options' }] },
      { model: ScoreBand, as: 'scoreBands' }
    ],
    order: [['createdAt', 'DESC']]
  });
  
  // Transform all assessments to include image URLs
  const transformedAssessments = await Promise.all(
    assessments.map(assessment => transformAssessmentData(assessment))
  );
  
  return transformedAssessments;
};

// Function to get the details of a specific assessment by ID
const getAssessmentDetail = async (id) => {
  const assessment = await Assessment.findByPk(id, {
    include: [
      { model: Question, as: 'questions', include: [{ model: Option, as: 'options' }] },
      { model: ScoreBand, as: 'scoreBands' }
    ],
    order: [[{ model: Question, as: 'questions' }, 'order', 'ASC']] // Ensure questions are ordered
  });
  
  return await transformAssessmentData(assessment);
};

// Function to submit answers for an assessment
const submitAnswers = async (assessmentId, answers = [], userId = null) => {
  console.log('submitAnswers called with:', { assessmentId, answers, answersType: typeof answers, isArray: Array.isArray(answers) });
  
  if (!Array.isArray(answers)) {
    throw new Error(`Expected answers to be an array, but received ${typeof answers}. Received: ${JSON.stringify(answers)}`);
  }
  
  const detail = await getAssessmentDetail(assessmentId);
  if (!detail) throw new Error('Assessment not found');

  const qMap = new Map(detail.questions.map(q => [q.id, q]));
  let total = 0;
  const normalized = [];

  for (const a of answers) {
    const q = qMap.get(a.questionId);
    if (!q) throw new Error('Invalid questionId in answers');

    let value;
    let optionId = a.optionId ?? null;

    if (a.value !== undefined) {
      if (![0, 1, 2, 3].includes(a.value)) throw new Error('Answer value must be 0..3');
      value = a.value;
      const opt = q.options.find(o => o.value === value);
      optionId = opt ? opt.id : null;
    } else {
      const opt = q.options.find(o => o.id === optionId);
      if (!opt) throw new Error('Invalid optionId for a question');
      value = opt.value;
    }

    total += value;
    normalized.push({ questionId: q.id, optionId, value });
  }

  const band = detail.scoreBands.find(b => total >= b.minScore && total <= b.maxScore);
  if (!band) throw new Error('Score band not configured for total: ' + total);

  const submission = await sequelize.transaction(async (t) => {
    const sub = await Submission.create(
      { assessmentId, userId, totalScore: total, bandLabel: band.label, bandColor: band.color },
      { transaction: t }
    );

    for (const ans of normalized) {
      await SubmissionAnswer.create({ submissionId: sub.id, ...ans }, { transaction: t });
    }
    return sub;
  });

  return {
    totalScore: total,
    band: { label: band.label, color: band.color, recommendation: band.recommendation }
  };
};

// List submissions for a user across all assessments
const normalizeUserId = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return String(value);
};

const getSubmissionsByUser = async (userId, requestingUser = null, includeLegacy = false) => {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedRequesterId = normalizeUserId(requestingUser?.id ?? requestingUser?.user_id ?? requestingUser?.userId);

  // Enforce access: non-admin can only see their own
  if (requestingUser && requestingUser.role !== 'admin' && normalizedRequesterId !== normalizedUserId) {
    throw new Error('Forbidden');
  }

  let where = {};
  if (normalizedUserId) {
    where.userId = normalizedUserId;
  } else if (includeLegacy && requestingUser && requestingUser.role === 'admin') {
    where.userId = null;  // Legacy submissions only for admin
  } else {
    // Default to current user if no userId provided
    where.userId = requestingUser ? requestingUser.id : null;
  }

  const submissions = await Submission.findAll({
    where,
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'assessmentId', 'userId', 'totalScore', 'bandLabel', 'bandColor', 'createdAt'],
    include: [{ model: Assessment, as: 'assessment', attributes: ['id', 'title'] }]
  });
  return submissions;
};

// Function to update an existing assessment
const updateAssessment = async (id, data) => {
  const { title, subTitle, imageKey, status, questions = [], scoreBands = [] } = data;

  return sequelize.transaction(async (t) => {
    const existingAssessment = await Assessment.findByPk(id, { transaction: t });
    if (!existingAssessment) throw new Error('Assessment not found');

    await existingAssessment.update({ title, subTitle, imageUrl: imageKey, status }, { transaction: t });

    // Remove old questions/options
    const existingQuestions = await Question.findAll({
      where: { assessmentId: id },
      include: [{ model: Option, as: 'options' }],
      transaction: t
    });

    for (const question of existingQuestions) {
      await Option.destroy({ where: { questionId: question.id }, transaction: t });
    }
    await Question.destroy({ where: { assessmentId: id }, transaction: t });

    // Remove old score bands
    await ScoreBand.destroy({ where: { assessmentId: id }, transaction: t });

    // Add new questions/options
    for (const qData of questions) {
      const { text, order, options = [] } = qData;
      const question = await Question.create(
        { assessmentId: id, text, order },
        { transaction: t }
      );

      for (const optData of options) {
        await Option.create(
          { questionId: question.id, text: optData.text, value: optData.value },
          { transaction: t }
        );
      }
    }

    // Add new score bands
    for (const bandData of scoreBands) {
      await ScoreBand.create(
        { assessmentId: id, ...bandData },
        { transaction: t }
      );
    }

    const assessmentDetail = await getAssessmentDetail(id);
    return await transformAssessmentData(assessmentDetail);
  });
};

// Function to delete an assessment
const deleteAssessment = async (id, options = {}) => {
  const { force = false } = options;

  return sequelize.transaction(async (t) => {
    const existingAssessment = await Assessment.findByPk(id, { transaction: t });
    if (!existingAssessment) throw new Error('Assessment not found');

    const submissionCount = await Submission.count({ where: { assessmentId: id }, transaction: t });
    if (submissionCount > 0 && !force) {
      throw new Error('Cannot delete assessment with existing submissions');
    }

    if (submissionCount > 0) {
      const submissions = await Submission.findAll({
        where: { assessmentId: id },
        attributes: ['id'],
        transaction: t
      });
      const submissionIds = submissions.map(s => s.id);

      if (submissionIds.length > 0) {
        await SubmissionAnswer.destroy({
          where: { submissionId: { [Op.in]: submissionIds } },
          transaction: t,
          force
        });
        await Submission.destroy({
          where: { id: { [Op.in]: submissionIds } },
          transaction: t,
          force
        });
      }
    }

    const questionIds = (
      await Question.findAll({
        where: { assessmentId: id },
        attributes: ['id'],
        transaction: t
      })
    ).map(q => q.id);

    if (questionIds.length > 0) {
      await Option.destroy({
        where: { questionId: { [Op.in]: questionIds } },
        transaction: t,
        force
      });
      await Question.destroy({
        where: { id: { [Op.in]: questionIds } },
        transaction: t,
        force
      });
    }

    await ScoreBand.destroy({ where: { assessmentId: id }, transaction: t, force });
    await existingAssessment.destroy({ transaction: t, force });

    return { message: 'Assessment deleted successfully' };
  });
};

module.exports = {
  createAssessment,
  listAssessments,
  getAssessmentDetail,
  submitAnswers,
  getSubmissionsByUser,
  updateAssessment,
  deleteAssessment
};
