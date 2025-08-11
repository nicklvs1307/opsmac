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
    category: { // New field for product category
      type: DataTypes.STRING,
      allowNull: true, // Category can be null initially
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id'
      }
    }
    // Você pode adicionar um campo category_id aqui depois
  }, {
    freezeTableName: true, // Model tableName will be the same as the model name
    tableName: 'products' // Explicitly define the table name
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Restaurant, {
      foreignKey: 'restaurant_id',
      as: 'restaurant'
    });
    // Associação com a ficha técnica
    Product.hasOne(models.TechnicalSpecification, {
      foreignKey: 'product_id',
      as: 'technicalSpecification'
    });
  };

  return Product;
};