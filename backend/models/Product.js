const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    sku: { // Stock Keeping Unit (Código de Referência do Estoque)
      type: DataTypes.STRING,
      unique: true
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id'
      }
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id',
      },
    },
    is_pizza: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    pizza_type: {
      type: DataTypes.ENUM('variable_price', 'fixed_price'),
      allowNull: true,
    },
    available_for_delivery: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    available_for_dine_in: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    available_for_online_order: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    available_for_digital_menu: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    freezeTableName: true, // Model tableName will be the same as the model name
    tableName: 'products' // Explicitly define the table name
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Restaurant, {
      foreignKey: 'restaurant_id',
      as: 'restaurant'
    });
    Product.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });
    // Associação com a ficha técnica
    Product.hasOne(models.TechnicalSpecification, {
      foreignKey: 'product_id',
      as: 'technicalSpecification'
    });
    Product.hasOne(models.Stock, { // Adicionando a associação que faltava
      foreignKey: 'product_id',
      as: 'stock'
    });
  };

  return Product;
};