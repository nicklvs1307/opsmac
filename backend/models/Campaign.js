"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Campaign extends Model {
    static associate(models) {
      Campaign.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      Campaign.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "creator",
      });
    }
  }

  Campaign.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "restaurant_id",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      }, // e.g., 'email', 'sms', 'whatsapp', 'push_notification'
      status: {
        type: DataTypes.STRING,
        defaultValue: "draft",
      }, // e.g., 'draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'
      scheduledAt: {
        type: DataTypes.DATE,
        field: "scheduled_at",
      },
      sentAt: {
        type: DataTypes.DATE,
        field: "sent_at",
      },
      segmentId: {
        type: DataTypes.UUID,
        field: "segment_id",
      }, // Optional: Link to a customer segment
      messageContent: {
        type: DataTypes.JSONB,
        allowNull: false,
        field: "message_content",
      }, // e.g., { subject: '...', body: '...' } or { text: '...' }
      createdBy: {
        type: DataTypes.UUID,
        field: "created_by",
      },
      stats: {
        type: DataTypes.JSONB,
        defaultValue: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
      },
    },
    {
      sequelize,
      modelName: "Campaign",
      tableName: "campaigns",
      timestamps: true,
      underscored: true,
    },
  );

  return Campaign;
};
