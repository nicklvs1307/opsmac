'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('tables')) {
      await queryInterface.createTable('tables', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        restaurant_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'restaurants',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        table_number: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        qr_code_url: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });

      // Add unique constraint for table_number per restaurant_id
      await queryInterface.addConstraint('tables', {
        fields: ['restaurant_id', 'table_number'],
        type: 'unique',
        name: 'unique_table_number_per_restaurant'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('tables');
    if (tableExists) {
      await queryInterface.dropTable('tables');
    }
  }
};