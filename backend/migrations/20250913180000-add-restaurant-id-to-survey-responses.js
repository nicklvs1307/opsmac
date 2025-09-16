export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('survey_responses', 'restaurant_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'restaurants', key: 'id' },
      onDelete: 'CASCADE',
    });
  }
export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('survey_responses', 'restaurant_id');
  }
