'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adiciona a nova coluna que será a chave estrangeira
    await queryInterface.addColumn('questions', 'nps_criterion_id', {
      type: Sequelize.UUID,
      allowNull: true, // Permite nulo, pois nem toda pergunta é de NPS
      references: {
        model: 'NpsCriterions', // Nome da tabela de critérios
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Se um critério for deletado, a pergunta não será, apenas o campo ficará nulo
    });

    // Opcional: Renomear a coluna antiga para não perder dados e para limpeza futura
    // await queryInterface.renameColumn('questions', 'nps_criterion', 'nps_criterion_old');
    // Por simplicidade e como a funcionalidade não estava em uso, vamos apenas remover a coluna antiga.
    await queryInterface.removeColumn('questions', 'nps_criterion');
  },

  async down(queryInterface, Sequelize) {
    // Recria a coluna antiga no caso de um rollback
    await queryInterface.addColumn('questions', 'nps_criterion', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Remove a chave estrangeira
    await queryInterface.removeColumn('questions', 'nps_criterion_id');
  }
};