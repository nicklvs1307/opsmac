'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Adicionar campos para o módulo de etiquetas em Produtos
      await queryInterface.addColumn('products', 'default_expiration_days', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });
      await queryInterface.addColumn('products', 'default_label_status', {
        type: Sequelize.ENUM('RESFRIADO', 'CONGELADO', 'AMBIENTE'),
        allowNull: true,
      }, { transaction });

      // Adicionar campos para o módulo de etiquetas em Ingredientes
      await queryInterface.addColumn('ingredients', 'default_expiration_days', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });
      await queryInterface.addColumn('ingredients', 'default_label_status', {
        type: Sequelize.ENUM('RESFRIADO', 'CONGELADO', 'AMBIENTE'),
        allowNull: true,
      }, { transaction });

      // Refatorar a tabela 'stocks' para ser polimórfica
      await queryInterface.addColumn('stocks', 'stockable_type', {
        type: Sequelize.STRING,
        allowNull: true // Temporariamente nulo para preenchimento
      }, { transaction });
      
      // Preencher 'stockable_type' para os registros existentes
      await queryInterface.sequelize.query("UPDATE stocks SET stockable_type = 'Product'", { transaction });
      
      // Alterar a coluna para não permitir nulos após o preenchimento
      await queryInterface.changeColumn('stocks', 'stockable_type', {
        type: Sequelize.STRING,
        allowNull: false
      }, { transaction });

      // Renomear product_id para stockable_id
      await queryInterface.renameColumn('stocks', 'product_id', 'stockable_id', { transaction });


      // Refatorar a tabela 'stock_movements' para ser polimórfica
      await queryInterface.addColumn('stock_movements', 'stockable_type', {
        type: Sequelize.STRING,
        allowNull: true // Temporariamente nulo para preenchimento
      }, { transaction });

      // Preencher 'stockable_type' para os registros existentes
      await queryInterface.sequelize.query("UPDATE stock_movements SET stockable_type = 'Product'", { transaction });

      // Alterar a coluna para não permitir nulos após o preenchimento
      await queryInterface.changeColumn('stock_movements', 'stockable_type', {
        type: Sequelize.STRING,
        allowNull: false
      }, { transaction });
      
      // Renomear product_id para stockable_id
      await queryInterface.renameColumn('stock_movements', 'product_id', 'stockable_id', { transaction });

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
      await queryInterface.renameColumn('stock_movements', 'stockable_id', 'product_id', { transaction });
      await queryInterface.removeColumn('stock_movements', 'stockable_type', { transaction });

      // Reverter 'stocks'
      await queryInterface.renameColumn('stocks', 'stockable_id', 'product_id', { transaction });
      await queryInterface.removeColumn('stocks', 'stockable_type', { transaction });

      // Remover colunas de 'ingredients'
      await queryInterface.removeColumn('ingredients', 'default_label_status', { transaction });
      await queryInterface.removeColumn('ingredients', 'default_expiration_days', { transaction });

      // Remover colunas de 'products'
      await queryInterface.removeColumn('products', 'default_label_status', { transaction });
      await queryInterface.removeColumn('products', 'default_expiration_days', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};