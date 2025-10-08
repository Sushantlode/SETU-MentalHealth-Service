// Migration to ensure assessment table has imageUrl column
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if imageUrl column exists
    const tableDescription = await queryInterface.describeTable('assessments');
    
    if (!tableDescription.imageUrl) {
      // Add imageUrl column if it doesn't exist
      await queryInterface.addColumn('assessments', 'imageUrl', {
        type: Sequelize.STRING(1000),
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Check if imageUrl column exists
    const tableDescription = await queryInterface.describeTable('assessments');
    
    if (tableDescription.imageUrl) {
      // Remove imageUrl column
      await queryInterface.removeColumn('assessments', 'imageUrl');
    }
  }
};
