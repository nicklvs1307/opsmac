export default (sequelize, DataTypes, Sequelize) => {
  class Checkin extends Sequelize.Model {
    static associate(models) {
      Checkin.belongsTo(models.Customer, {
        foreignKey: "customer_id",
        as: "customer",
      });
      Checkin.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
        as: "restaurant",
      });
    }
  }

  Checkin.init(
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
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      checkinTime: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "checkin_time",
      },
      checkoutTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "checkout_time",
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "expires_at",
      },
    },
    {
      sequelize,
      modelName: "Checkin",
      tableName: "checkins",
      timestamps: true,
      underscored: true,
    },
  );

  return Checkin;
};