'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('customers', 'rfvScore', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
    });
    await queryInterface.addColumn('customers', 'npsSegment', {
      type: Sequelize.ENUM('promoter', 'passive', 'detractor', 'unknown'),
      allowNull: true,
      defaultValue: 'unknown',
    });
    await queryInterface.addColumn('customers', 'lastPurchaseDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('customers', 'totalOrders', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn('customers', 'averageTicket', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
    });
    await queryInterface.addColumn('customers', 'lastTicketValue', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
    });
    await queryInterface.addColumn('customers', 'mostBoughtProducts', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: [],
    });
    await queryInterface.addColumn('customers', 'mostBoughtCategories', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: [],
    });
    await queryInterface.addColumn('customers', 'purchaseBehaviorTags', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: [],
    });
    await queryInterface.addColumn('customers', 'locationDetails', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
    });
    await queryInterface.addColumn('customers', 'preferredCommunicationChannel', {
      type: Sequelize.ENUM('whatsapp', 'email', 'sms', 'push_notification', 'none'),
      allowNull: true,
      defaultValue: 'none',
    });
    await queryInterface.addColumn('customers', 'campaignInteractionHistory', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
    });
    await queryInterface.addColumn('customers', 'lastSurveyCompletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('customers', 'lastSurveyId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'surveys',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('customers', 'rfvScore');
    await queryInterface.removeColumn('customers', 'npsSegment');
    await queryInterface.removeColumn('customers', 'lastPurchaseDate');
    await queryInterface.removeColumn('customers', 'totalOrders');
    await queryInterface.removeColumn('customers', 'averageTicket');
    await queryInterface.removeColumn('customers', 'lastTicketValue');
    await queryInterface.removeColumn('customers', 'mostBoughtProducts');
    await queryInterface.removeColumn('customers', 'mostBoughtCategories');
    await queryInterface.removeColumn('customers', 'purchaseBehaviorTags');
    await queryInterface.removeColumn('customers', 'locationDetails');
    await queryInterface.removeColumn('customers', 'preferredCommunicationChannel');
    await queryInterface.removeColumn('customers', 'campaignInteractionHistory');
    await queryInterface.removeColumn('customers', 'lastSurveyCompletedAt');
    await queryInterface.removeColumn('customers', 'lastSurveyId');
  }
};
