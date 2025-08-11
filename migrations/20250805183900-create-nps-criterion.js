'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('NpsCriterions');
    if (!tableExists) {
      await queryInterface.createTable('NpsCriterions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        restaurant_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'restaurants', // Nome da tabela de restaurantes
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
      });
    }
  },
  async down(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('NpsCriterions');
    if (tableExists) {
      await queryInterface.dropTable('NpsCriterions');
    }
  }
};