const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class Order extends Model {}
  Order.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id'
      }
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: true, // Pode ser nulo se o cliente não for encontrado/criado no sistema
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    external_order_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'ID do pedido na plataforma externa (iFood, Delivery Much, etc.)'
    },
    platform: {
      type: DataTypes.ENUM('ifood', 'delivery_much', 'uai_rango', 'saipos', 'other'),
      allowNull: false,
      comment: 'Plataforma de origem do pedido'
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled', 'concluded', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
      comment: 'Status atual do pedido'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Valor total do pedido'
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Taxa de entrega'
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Array de objetos com os itens do pedido (nome, quantidade, preço, etc.)'
    },
    customer_details: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      comment: 'Detalhes do cliente do pedido (nome, telefone, endereço, etc.)'
    },
    order_details: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Detalhes brutos do pedido da plataforma externa'
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data e hora do pedido'
    },
    delivery_address: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Endereço de entrega do pedido'
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Método de pagamento'
    },
    delivery_type: {
      type: DataTypes.ENUM('delivery', 'pickup', 'dine_in'),
      allowNull: true,
      comment: 'Tipo de entrega/serviço'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações do pedido'
    },
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['restaurant_id'],
      },
      {
        fields: ['customer_id'],
      },
      {
        fields: ['platform'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['order_date'],
      },
    ]
  });

  Order.associate = (models) => {
    Order.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    Order.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
  };

  return Order;
};
