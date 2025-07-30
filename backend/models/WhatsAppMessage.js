const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WhatsAppMessage = sequelize.define('WhatsAppMessage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    message_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message_type: {
      type: DataTypes.ENUM(
        'feedback_request',
        'bulk_feedback_request',
        'manual',
        'checkin_thank_you',
        'coupon_reminder',
        'birthday_greeting',
        'received',
        'response',
        'notification'
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('sent', 'delivered', 'read', 'failed', 'received'),
      allowNull: false,
      defaultValue: 'sent',
    },
    whatsapp_message_id: {
      type: DataTypes.STRING(255),
      allowNull: true, // ID da mensagem retornado pela API do WhatsApp
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: true, // Pode ser nulo para mensagens recebidas sem contexto de restaurante
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: true, // Pode ser nulo se o cliente não for identificado
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    table_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    coupon_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'coupons',
        key: 'id',
      },
    },
    sent_by: {
      type: DataTypes.UUID,
      allowNull: true, // ID do usuário que enviou a mensagem (para mensagens manuais/bulk)
      references: {
        model: 'users',
        key: 'id',
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  }, {
    tableName: 'whatsapp_messages',
    timestamps: true,
    underscored: true,
  });

  WhatsAppMessage.associate = (models) => {
    WhatsAppMessage.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    WhatsAppMessage.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
    WhatsAppMessage.belongsTo(models.Coupon, { foreignKey: 'coupon_id', as: 'coupon' });
    WhatsAppMessage.belongsTo(models.User, { foreignKey: 'sent_by', as: 'sender' });
  };

  return WhatsAppMessage;
};