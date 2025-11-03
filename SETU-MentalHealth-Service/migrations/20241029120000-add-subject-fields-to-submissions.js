'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('submissions', 'subjectType', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'self',
    });

    await queryInterface.addColumn('submissions', 'subjectName', {
      type: Sequelize.STRING(200),
      allowNull: true,
    });

    await queryInterface.addColumn('submissions', 'subjectRelation', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.addColumn('submissions', 'subjectAgeRange', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn('submissions', 'subjectMeta', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('submissions', 'subjectMeta');
    await queryInterface.removeColumn('submissions', 'subjectAgeRange');
    await queryInterface.removeColumn('submissions', 'subjectRelation');
    await queryInterface.removeColumn('submissions', 'subjectName');
    await queryInterface.removeColumn('submissions', 'subjectType');
  },
};
