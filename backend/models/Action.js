export default (sequelize, DataTypes) => {
  class Action extends Model {
    static associate(models) {
      Action.hasMany(models.RolePermission, {
        foreignKey: "action_id",
        as: "rolePermissions",
      });
      Action.hasMany(models.UserPermissionOverride, {
        foreignKey: "action_id",
        as: "userOverrides",
      });
    }
  }

  Action.init(
    {
      id: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true,
      },
      key: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false,
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
      modelName: "Action",
      tableName: "actions",
      timestamps: true,
      underscored: true,
    },
  );

  return Action;
};
