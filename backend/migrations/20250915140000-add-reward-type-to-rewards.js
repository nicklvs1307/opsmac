'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('rewards', 'reward_type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'default', // Ou um valor padrão mais apropriado
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('rewards', 'reward_type');
  },
};
