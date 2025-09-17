export default (sequelize, DataTypes, Sequelize) => {
  class CashRegisterMovement extends Sequelize.Model {
    static associate(models) {
      CashRegisterMovement.belongsTo(models.CashRegisterSession, {
        foreignKey: "session_id",
        as: "session",
      });
      CashRegisterMovement.belongsTo(models.CashRegisterCategory, {
        foreignKey: "category_id",
        as: "category",
      });
      CashRegisterMovement.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  CashRegisterMovement.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      sessionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "session_id",
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.UUID,
        field: "category_id",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
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
      modelName: "CashRegisterMovement",
      tableName: "cash_register_movements",
      timestamps: true,
      underscored: true,
    },
  );

  return CashRegisterMovement;
};
