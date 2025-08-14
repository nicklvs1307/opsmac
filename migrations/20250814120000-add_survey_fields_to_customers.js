module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Customers', 'last_survey_completed_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Customers', 'last_survey_id', {
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
    await queryInterface.removeColumn('Customers', 'last_survey_id');
    await queryInterface.removeColumn('Customers', 'last_survey_completed_at');
  },
};
