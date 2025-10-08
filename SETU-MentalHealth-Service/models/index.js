// models/index.js
'use strict';

const fs = require('fs');
const path = require('path');
const SequelizeLib = require('sequelize'); // for DataTypes only
const sequelize = require('../config/db'); // ✅ single Sequelize instance
const basename = path.basename(__filename);

const db = {};

// Auto-load all model files (factory pattern)
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.endsWith('.js') &&
      !file.endsWith('.test.js')
  )
  .forEach((file) => {
    const mod = require(path.join(__dirname, file));
    const factory =
      typeof mod === 'function'
        ? mod
        : (mod && typeof mod.default === 'function' ? mod.default : null);

    if (!factory) {
      console.warn(`[models] Skipping ${file}: export is not a factory function.`);
      return;
    }

    const model = factory(sequelize, SequelizeLib.DataTypes);
    if (!model || !model.name) {
      console.warn(`[models] Skipping ${file}: factory did not return a model instance.`);
      return;
    }

    const modelName = model.name.charAt(0).toUpperCase() + model.name.slice(1);
    db[modelName] = model;
  });

/* ----------------------- Associations ----------------------- */
if (db.Assessments && db.Questions) {
  db.Assessments.hasMany(db.Questions, {
    foreignKey: 'assessmentId',
    as: 'questions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  db.Questions.belongsTo(db.Assessments, {
    foreignKey: 'assessmentId',
    as: 'assessment',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
}

if (db.Assessments && db.Score_bands) {
  db.Assessments.hasMany(db.Score_bands, {
    foreignKey: 'assessmentId',
    as: 'scoreBands',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  db.Score_bands.belongsTo(db.Assessments, {
    foreignKey: 'assessmentId',
    as: 'assessment',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
}

if (db.Assessments && db.Submissions) {
  db.Assessments.hasMany(db.Submissions, {
    foreignKey: 'assessmentId',
    as: 'submissions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  db.Submissions.belongsTo(db.Assessments, {
    foreignKey: 'assessmentId',
    as: 'assessment',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
}

if (db.Questions && db.Options) {
  db.Questions.hasMany(db.Options, {
    foreignKey: 'questionId',
    as: 'options',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  db.Options.belongsTo(db.Questions, {
    foreignKey: 'questionId',
    as: 'question',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
}

if (db.Submissions && db.Submission_answers) {
  db.Submissions.hasMany(db.Submission_answers, {
    foreignKey: 'submissionId',
    as: 'answers',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  db.Submission_answers.belongsTo(db.Submissions, {
    foreignKey: 'submissionId',
    as: 'submission',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
}

if (db.Questions && db.Submission_answers) {
  db.Submission_answers.belongsTo(db.Questions, {
    foreignKey: 'questionId',
    as: 'question',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
}

if (db.Options && db.Submission_answers) {
  db.Submission_answers.belongsTo(db.Options, {
    foreignKey: 'optionId',
    as: 'option',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
}

/* ----------------------- Exports ----------------------- */
db.sequelize = sequelize;
db.Sequelize = SequelizeLib;

module.exports = db;
