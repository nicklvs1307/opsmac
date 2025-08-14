module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('questions');
    if (!tableExists) {
      await queryInterface.createTable('questions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        survey_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'surveys',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        question_text: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        question_type: {
          type: Sequelize.ENUM('text', 'textarea', 'radio', 'checkboxes', 'dropdown', 'nps', 'csat', 'ratings', 'like_dislike'),
          allowNull: false,
        },
        options: {
          type: Sequelize.JSONB, // For radio, checkboxes, dropdown
          allowNull: true,
        },
        order: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        nps_criterion_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'nps_criterions', // Use lowercase and plural for table name
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('questions');
  },
};