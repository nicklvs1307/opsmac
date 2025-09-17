export default (sequelize, DataTypes, Sequelize) => {
  class CashRegisterSession extends Sequelize.Model {
    static associate(models) {
      CashRegisterSession.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      CashRegisterSession.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
      CashRegisterSession.hasMany(models.CashRegisterMovement, {
        foreignKey: "session_id",
        as: "movements",
      });
    }
  }

  CashRegisterSession.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      openingBalance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "opening_balance",
      },
      closingBalance: {
        type: DataTypes.DECIMAL(10, 2),
        field: "closing_balance",
      },
      openedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "opened_at",
      },
      closedAt: {
        type: DataTypes.DATE,
        field: "closed_at",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
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
      modelName: "CashRegisterSession",
      tableName: "cash_register_sessions",
      timestamps: true,
      underscored: true,
    },
  );

  return CashRegisterSession;
};
