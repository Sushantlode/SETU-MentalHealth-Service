'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop existing foreign key constraints
    await queryInterface.removeConstraint('questions', 'questions_assessmentId_fkey');
    await queryInterface.removeConstraint('score_bands', 'score_bands_assessmentId_fkey');
    await queryInterface.removeConstraint('submissions', 'submissions_assessmentId_fkey');
    await queryInterface.removeConstraint('options', 'options_questionId_fkey');
    await queryInterface.removeConstraint('submission_answers', 'submission_answers_submissionId_fkey');
    await queryInterface.removeConstraint('submission_answers', 'submission_answers_questionId_fkey');
    await queryInterface.removeConstraint('submission_answers', 'submission_answers_optionId_fkey');

    // Add new foreign key constraints with CASCADE
    await queryInterface.addConstraint('questions', {
      fields: ['assessmentId'],
      type: 'foreign key',
      name: 'questions_assessmentId_fkey',
      references: {
        table: 'assessments',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('score_bands', {
      fields: ['assessmentId'],
      type: 'foreign key',
      name: 'score_bands_assessmentId_fkey',
      references: {
        table: 'assessments',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('submissions', {
      fields: ['assessmentId'],
      type: 'foreign key',
      name: 'submissions_assessmentId_fkey',
      references: {
        table: 'assessments',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('options', {
      fields: ['questionId'],
      type: 'foreign key',
      name: 'options_questionId_fkey',
      references: {
        table: 'questions',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('submission_answers', {
      fields: ['submissionId'],
      type: 'foreign key',
      name: 'submission_answers_submissionId_fkey',
      references: {
        table: 'submissions',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('submission_answers', {
      fields: ['questionId'],
      type: 'foreign key',
      name: 'submission_answers_questionId_fkey',
      references: {
        table: 'questions',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('submission_answers', {
      fields: ['optionId'],
      type: 'foreign key',
      name: 'submission_answers_optionId_fkey',
      references: {
        table: 'options',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to original constraints without CASCADE
    await queryInterface.removeConstraint('questions', 'questions_assessmentId_fkey');
    await queryInterface.removeConstraint('score_bands', 'score_bands_assessmentId_fkey');
    await queryInterface.removeConstraint('submissions', 'submissions_assessmentId_fkey');
    await queryInterface.removeConstraint('options', 'options_questionId_fkey');
    await queryInterface.removeConstraint('submission_answers', 'submission_answers_submissionId_fkey');
    await queryInterface.removeConstraint('submission_answers', 'submission_answers_questionId_fkey');
    await queryInterface.removeConstraint('submission_answers', 'submission_answers_optionId_fkey');

    // Add back original constraints
    await queryInterface.addConstraint('questions', {
      fields: ['assessmentId'],
      type: 'foreign key',
      name: 'questions_assessmentId_fkey',
      references: {
        table: 'assessments',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('score_bands', {
      fields: ['assessmentId'],
      type: 'foreign key',
      name: 'score_bands_assessmentId_fkey',
      references: {
        table: 'assessments',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('submissions', {
      fields: ['assessmentId'],
      type: 'foreign key',
      name: 'submissions_assessmentId_fkey',
      references: {
        table: 'assessments',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('options', {
      fields: ['questionId'],
      type: 'foreign key',
      name: 'options_questionId_fkey',
      references: {
        table: 'questions',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('submission_answers', {
      fields: ['submissionId'],
      type: 'foreign key',
      name: 'submission_answers_submissionId_fkey',
      references: {
        table: 'submissions',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('submission_answers', {
      fields: ['questionId'],
      type: 'foreign key',
      name: 'submission_answers_questionId_fkey',
      references: {
        table: 'questions',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('submission_answers', {
      fields: ['optionId'],
      type: 'foreign key',
      name: 'submission_answers_optionId_fkey',
      references: {
        table: 'options',
        field: 'id'
      }
    });
  }
};
