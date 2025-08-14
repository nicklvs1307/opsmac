module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('answers');
    if (!tableExists) {
      await queryInterface.createTable('answers', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        response_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'survey_responses',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        question_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'questions',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        answer_value: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('answers');
  },
};