"use strict";

export default (sequelize, DataTypes, Sequelize) => {
  class TechnicalSpecification extends Sequelize.Model {
    static associate(models) {
      TechnicalSpecification.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
    }
  }

  TechnicalSpecification.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: "product_id",
      },
      content: {
        type: DataTypes.TEXT,
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
      modelName: "TechnicalSpecification",
      tableName: "technical_specifications",
      timestamps: true,
      underscored: true,
    },
  );

  return TechnicalSpecification;
};