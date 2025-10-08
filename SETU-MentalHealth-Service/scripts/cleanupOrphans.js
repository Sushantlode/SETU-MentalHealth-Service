// scripts/cleanupOrphans.js
require('dotenv').config();
const sequelize = require('../config/db');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query(`
      DELETE FROM submission_answers sa
      WHERE NOT EXISTS (SELECT 1 FROM questions q WHERE q.id = sa."questionId");
    `);
    await sequelize.query(`
      DELETE FROM submission_answers sa
      WHERE NOT EXISTS (SELECT 1 FROM submissions s WHERE s.id = sa."submissionId");
    `);
    await sequelize.query(`
      DELETE FROM submission_answers sa
      WHERE sa."optionId" IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM options o WHERE o.id = sa."optionId");
    `);
    console.log('✅ Orphans cleaned');
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
})();
