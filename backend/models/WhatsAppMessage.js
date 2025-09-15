"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WhatsappMessage extends Model {
    static associate(models) {
      WhatsappMessage.belongsTo(models.Customer, {
        foreignKey: "customer_id",
        as: "customer",
      });
      WhatsappMessage.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
    }
  }

  WhatsappMessage.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "customer_id",
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sentAt: {
        type: DataTypes.DATE,
        field: "sent_at",
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "restaurant_id",
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
      modelName: "WhatsappMessage",
      tableName: "whatsapp_messages",
      timestamps: true,
      underscored: true,
    },
  );

  return WhatsappMessage;
};
