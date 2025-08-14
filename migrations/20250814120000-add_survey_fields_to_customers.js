module.exports = {
  up: async (queryInterface, Sequelize) => {
    // last_survey_completed_at is assumed to exist or be handled elsewhere
    await queryInterface.addColumn('customers', 'last_survey_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Surveys',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('customers', 'last_survey_id');
    await queryInterface.removeColumn('customers', 'last_survey_completed_at');
  },
};
