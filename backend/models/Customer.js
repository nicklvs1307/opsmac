'use strict';
const { Model, DataTypes } = require('sequelize');
const customerService = require('../src/domains/customer/customer.service'); // Import the new service

module.exports = (sequelize) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Customer.hasMany(models.Feedback, {
        foreignKey: 'customer_id',
        as: 'feedbacks',
      });
      Customer.hasMany(models.Checkin, {
        foreignKey: 'customer_id',
        as: 'checkins',
      });
      Customer.hasMany(models.SurveyResponse, {
        foreignKey: 'customer_id',
        as: 'survey_responses',
      });
      Customer.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
        onDelete: 'CASCADE',
      });
      Customer.hasMany(models.Coupon, {
        foreignKey: 'customer_id',
        as: 'coupons',
      });
      Customer.belongsTo(models.Survey, {
        foreignKey: 'last_survey_id',
        as: 'lastSurvey',
      });
    }

    canReceiveReward() {
      return this.status === 'active' && this.loyalty_points >= 100;
    }

    toJSON() {
      const values = { ...this.get() };
      // Remover dados sensíveis se necessário
      if (!this.gdpr_consent) {
        delete values.email;
        delete values.phone;
        delete values.whatsapp;
      }
      return values;
    }
  }

  Customer.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [2, 100],
          msg: 'Nome deve ter entre 2 e 100 caracteres',
        },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Email deve ter um formato válido',
        },
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^[\+]?[1-9][\d]{0,15}$/,
          msg: 'Telefone deve ter um formato válido',
        },
      },
    },
    cpf: {
      type: DataTypes.STRING(11),
      allowNull: true,
      unique: true,
      validate: {
        is: {
          args: /^\d{11}$/,
          msg: 'CPF deve conter exatamente 11 dígitos numéricos',
        },
      },
    },
    whatsapp: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^[\+]?[1-9][\d]{0,15}$/,
          msg: 'WhatsApp deve ter um formato válido',
        },
      },
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        cuisine_types: [],
        dietary_restrictions: [],
        communication_preferences: {
          email: true,
          whatsapp: false,
          sms: false,
        },
        favorite_dishes: [],
        allergies: [],
      },
    },
    loyalty_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_visits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    survey_responses_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total de pesquisas de satisfação respondidas pelo cliente',
    },
    total_spent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    average_rating_given: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
    },
    last_visit: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    first_visit: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    customer_segment: {
      type: DataTypes.ENUM('new', 'regular', 'vip', 'inactive'),
      defaultValue: 'new',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'blocked'),
      defaultValue: 'active',
    },
    source: {
      type: DataTypes.ENUM('qrcode', 'whatsapp', 'tablet', 'web', 'referral', 'social_media', 'checkin_qrcode'),
      allowNull: true,
    },
    referral_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    referred_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    marketing_consent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    gdpr_consent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    gdpr_consent_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_birthday_message_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Ano em que a última mensagem de aniversário foi enviada',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        acquisition_source: null,
        utm_campaign: null,
        utm_source: null,
        utm_medium: null,
        device_info: null,
        location_data: null,
      },
    },
    // Novos campos para segmentação e NPS
    rfv_score: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        recency: null,
        frequency: null,
        monetary: null,
      },
      comment: 'Pontuação RFV (Recência, Frequência, Valor)',
    },
    nps_segment: {
      type: DataTypes.ENUM('promoter', 'passive', 'detractor', 'unknown'),
      allowNull: true,
      defaultValue: 'unknown',
      comment: 'Segmento NPS do cliente',
    },
    last_purchase_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data da última compra/check-in',
    },
    total_orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Número total de pedidos/check-ins',
    },
    average_ticket: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: 'Ticket médio do cliente',
    },
    last_ticket_value: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: 'Valor do último pedido/check-in',
    },
    most_bought_products: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
      comment: 'Lista de produtos mais comprados (placeholder)',
    },
    most_bought_categories: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
      comment: 'Lista de categorias mais compradas (placeholder)',
    },
    purchase_behavior_tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
      comment: 'Tags de comportamento de compra (ex: weekend_shopper)',
    },
    location_details: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        neighborhood: null,
        city: null,
        zone: null,
        distance_from_store: null,
      },
      comment: 'Detalhes de localização do cliente',
    },
    preferred_communication_channel: {
      type: DataTypes.ENUM('whatsapp', 'email', 'sms', 'push_notification', 'none'),
      allowNull: true,
      defaultValue: 'none',
      comment: 'Canal de comunicação preferido do cliente',
    },
    campaign_interaction_history: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Histórico de interação com campanhas',
    },
    last_survey_completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data da última pesquisa respondida',
    },
    last_survey_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Surveys', // Referencia a tabela Surveys
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'ID da última pesquisa respondida',
    },
    restaurant_id: { // Add this field
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'restaurants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
        where: {
          email: {
            [sequelize.Sequelize.Op.ne]: null,
          },
        },
      },
      {
        unique: true,
        fields: ['phone'],
        where: {
          phone: {
            [sequelize.Sequelize.Op.ne]: null,
          },
        },
      },
      {
        unique: true,
        fields: ['referral_code'],
        where: {
          referral_code: {
            [sequelize.Sequelize.Op.ne]: null,
          },
        },
      },
      {
        fields: ['customer_segment'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['loyalty_points'],
      },
      {
        fields: ['last_visit'],
      },
      // Novos índices para os campos de segmentação
      {
        fields: ['nps_segment'],
      },
      {
        fields: ['last_purchase_date'],
      },
      {
        fields: ['total_orders'],
      },
      {
        fields: ['average_ticket'],
      },
    ],
    hooks: {
      beforeCreate: (customer) => {
        customerService.handleCustomerBeforeCreate(customer);
      },
      afterCreate: async (customer) => {
        await customerService.handleCustomerAfterCreate(customer);
      },
    },
  });

  return Customer;
};