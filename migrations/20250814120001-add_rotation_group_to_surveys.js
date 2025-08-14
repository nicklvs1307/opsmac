module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Surveys', 'rotation_group', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Surveys', 'rotation_group');
  },
};
