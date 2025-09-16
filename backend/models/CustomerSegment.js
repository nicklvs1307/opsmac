"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class CustomerSegment extends Sequelize.Model {
    static associate(models) {
      CustomerSegment.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
    }
  }

  CustomerSegment.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      rules: {
        type: DataTypes.JSONB,
        defaultValue: [],
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
      modelName: "CustomerSegment",
      tableName: "customer_segments",
      timestamps: true,
      underscored: true,
    },
  );

  return CustomerSegment;
};