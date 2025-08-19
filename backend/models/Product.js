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
    default_expiration_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    default_label_status: {
      type: DataTypes.ENUM('RESFRIADO', 'CONGELADO', 'AMBIENTE'),
      allowNull: true,
    },
    addons: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: true,
      defaultValue: [],
    },
    variations: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
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
    
    // Associação polimórfica com Stock
    Product.hasOne(models.Stock, {
      foreignKey: 'stockable_id',
      constraints: false,
      scope: {
        stockable_type: 'Product'
      },
      as: 'stock'
    });

    // Associação polimórfica com StockMovement
    Product.hasMany(models.StockMovement, {
      foreignKey: 'stockable_id',
      constraints: false,
      scope: {
        stockable_type: 'Product'
      },
      as: 'stockMovements'
    });
  };

  return Product;
};