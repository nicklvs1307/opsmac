'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Preencher 'stockableType' para os registros existentes
      await queryInterface.sequelize.query("UPDATE \"stocks\" SET \"stockableType\" = 'Product'", { transaction });
      
      // Alterar a coluna para não permitir nulos após o preenchimento
      await queryInterface.changeColumn('stocks', 'stockableType', {
        type: Sequelize.STRING,
        allowNull: false
      }, { transaction });

      // Preencher 'stockableType' para os registros existentes
      await queryInterface.sequelize.query("UPDATE \"stock_movements\" SET \"stockableType\" = 'Product'", { transaction });

      // Alterar a coluna para não permitir nulos após o preenchimento
      await queryInterface.changeColumn('stock_movements', 'stockableType', {
        type: Sequelize.STRING,
        allowNull: false
      }, { transaction });
      
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Reverter 'stock_movements'
      await queryInterface.changeColumn('stock_movements', 'stockableType', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      // Reverter 'stocks'
      await queryInterface.changeColumn('stocks', 'stockableType', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};