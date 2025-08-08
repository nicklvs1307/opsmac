'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'rfv_score', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: { recency: null, frequency: null, monetary: null },
      comment: 'Pontuação RFV (Recência, Frequência, Valor)'
    });
    await queryInterface.addColumn('customers', 'nps_segment', {
      type: Sequelize.ENUM('promoter', 'passive', 'detractor', 'unknown'),
      allowNull: true,
      defaultValue: 'unknown',
      comment: 'Segmento NPS do cliente'
    });
    await queryInterface.addColumn('customers', 'last_purchase_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Data da última compra/check-in'
    });
    await queryInterface.addColumn('customers', 'total_orders', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Número total de pedidos/check-ins'
    });
    await queryInterface.addColumn('customers', 'average_ticket', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: 'Ticket médio do cliente'
    });
    await queryInterface.addColumn('customers', 'last_ticket_value', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: 'Valor do último pedido/check-in'
    });
    await queryInterface.addColumn('customers', 'most_bought_products', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: [],
      comment: 'Lista de produtos mais comprados (placeholder)'
    });
    await queryInterface.addColumn('customers', 'most_bought_categories', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: [],
      comment: 'Lista de categorias mais compradas (placeholder)'
    });
    await queryInterface.addColumn('customers', 'purchase_behavior_tags', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: [],
      comment: 'Tags de comportamento de compra (ex: weekend_shopper)'
    });
    await queryInterface.addColumn('customers', 'location_details', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: { neighborhood: null, city: null, zone: null, distance_from_store: null },
      comment: 'Detalhes de localização do cliente'
    });
    await queryInterface.addColumn('customers', 'preferred_communication_channel', {
      type: Sequelize.ENUM('whatsapp', 'email', 'sms', 'push_notification', 'none'),
      allowNull: true,
      defaultValue: 'none',
      comment: 'Canal de comunicação preferido do cliente'
    });
    await queryInterface.addColumn('customers', 'campaign_interaction_history', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Histórico de interação com campanhas'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'rfv_score');
    await queryInterface.removeColumn('customers', 'nps_segment');
    await queryInterface.removeColumn('customers', 'last_purchase_date');
    await queryInterface.removeColumn('customers', 'total_orders');
    await queryInterface.removeColumn('customers', 'average_ticket');
    await queryInterface.removeColumn('customers', 'last_ticket_value');
    await queryInterface.removeColumn('customers', 'most_bought_products');
    await queryInterface.removeColumn('customers', 'most_bought_categories');
    await queryInterface.removeColumn('customers', 'purchase_behavior_tags');
    await queryInterface.removeColumn('customers', 'location_details');
    await queryInterface.removeColumn('customers', 'preferred_communication_channel');
    await queryInterface.removeColumn('customers', 'campaign_interaction_history');
  }
};
