const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Reward = sequelize.define('Reward', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Título da recompensa é obrigatório'
        },
        len: {
          args: [3, 150],
          msg: 'Título deve ter entre 3 e 150 caracteres'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reward_type: {
      type: DataTypes.ENUM('discount_percentage', 'discount_fixed', 'free_item', 'points', 'cashback', 'gift', 'spin_the_wheel'),
      allowNull: false
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    wheel_config: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    points_required: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 100
    },
    max_uses_per_customer: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_uses_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: 'Limite total de usos deve ser pelo menos 1'
        }
      }
    },
    current_uses: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    minimum_purchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Compra mínima deve ser positiva'
        }
      }
    },
    applicable_items: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    excluded_items: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    valid_from: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    valid_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    days_valid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: 'Dias válidos deve ser pelo menos 1'
        }
      }
    },
    auto_apply: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    requires_approval: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    terms_conditions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    trigger_conditions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        min_rating: null,
        feedback_type: null,
        visit_count: null,
        total_spent: null,
        customer_segment: null,
        special_occasions: []
      }
    },
    notification_settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        send_email: true,
        send_whatsapp: false,
        send_push: false,
        custom_message: ''
      }
    },
    analytics: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        total_generated: 0,
        total_redeemed: 0,
        redemption_rate: 0,
        average_order_value: 0,
        customer_satisfaction: 0
      }
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
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'rewards',
    indexes: [
      {
        fields: ['restaurant_id']
      },
      {
        fields: ['customer_id']
      },
      {
        fields: ['reward_type']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['valid_from', 'valid_until']
      },
      {
        fields: ['points_required']
      },
      {
        fields: ['is_featured']
      }
    ],
    hooks: {
      beforeSave: (reward) => {
        if (reward.reward_type === 'spin_the_wheel' && reward.wheel_config && reward.wheel_config.items) {
          reward.wheel_config.items.forEach(item => {
            if (!item.id) {
              item.id = uuidv4();
            }
          });
        }
      },
      beforeCreate: (reward) => {
        // Definir data de validade baseada em dias_valid
        if (reward.days_valid && !reward.valid_until) {
          const validUntil = new Date(reward.valid_from);
          validUntil.setDate(validUntil.getDate() + reward.days_valid);
          reward.valid_until = validUntil;
        }
      },
      beforeUpdate: (reward) => {
        // Atualizar data de validade se days_valid mudou
        if (reward.changed('days_valid') && reward.days_valid) {
          const validUntil = new Date(reward.valid_from);
          validUntil.setDate(validUntil.getDate() + reward.days_valid);
          reward.valid_until = validUntil;
        }
      }
    }
  });

  // Métodos de instância
  Reward.prototype.isValid = function() {
    const now = new Date();
    
    if (!this.is_active) return false;
    if (this.valid_from && now < this.valid_from) return false;
    if (this.valid_until && now > this.valid_until) return false;
    if (this.total_uses_limit && this.current_uses >= this.total_uses_limit) return false;
    
    return true;
  };

  Reward.prototype.canCustomerUse = async function(customerId, extraData = {}) {
    if (!this.isValid()) return false;
    
    // Verificar se o cliente pode usar esta recompensa
    if (this.customer_id && this.customer_id !== customerId) return false;

    // Se for uma recompensa por visita, a verificação de duplicata já foi feita na rota de check-in.
    // Portanto, podemos pular a verificação genérica de max_uses_per_customer.
    if (extraData && extraData.visit_milestone) {
      return true;
    }
    
    // Verificação padrão para outros tipos de recompensa
    if (this.max_uses_per_customer) {
      const { models } = sequelize;
      const usageCount = await models.Coupon.count({
        where: {
          reward_id: this.id,
          customer_id: customerId
        }
      });
      
      if (usageCount >= this.max_uses_per_customer) return false;
    }
    
    return true;
  };

  Reward.prototype.generateCoupon = async function(customerId, extraData = {}) {
    const canUse = await this.canCustomerUse(customerId, extraData); // Passar extraData
    if (!canUse) {
      throw new Error('Cliente não pode usar esta recompensa');
    }
    
    const { models } = sequelize;
    const { spinWheel } = require('../utils/wheelService'); // Importar o serviço da roleta

    // Buscar o cliente para obter o nome
    const customer = await models.Customer.findByPk(customerId);
    if (!customer) {
      throw new Error('Cliente não encontrado.');
    }
    const customerName = customer.name || 'CLIENTE';

    let couponRewardId = this.id;
    let couponTitle = this.title;
    let couponDescription = this.description;
    let couponValue = this.value;
    let couponRewardType = this.reward_type;
    let winningItem = null;

    if (this.reward_type === 'spin_the_wheel') {
      if (!this.wheel_config || !this.wheel_config.items || this.wheel_config.items.length === 0) {
        throw new Error('Configuração da roleta inválida ou vazia.');
      }
      winningItem = spinWheel(this.wheel_config);
      if (!winningItem) {
        throw new Error('Não foi possível sortear um item da roleta.');
      }
      // Usar as propriedades do item sorteado para o cupom
      couponTitle = winningItem.title;
      couponDescription = winningItem.description || winningItem.title;
      couponValue = winningItem.value || 0; // Valor do item sorteado
      couponRewardType = winningItem.reward_type || 'free_item'; // Tipo do item sorteado
      // Se o item sorteado tiver um reward_id próprio, usar ele. Caso contrário, usa o da roleta.
      couponRewardId = winningItem.reward_id || this.id;
    }
    
    // Gerar código único do cupom usando o nome do cliente
    const couponCode = this.generateCouponCode(customerName);
    
    // Calcular data de expiração
    let expiresAt = this.valid_until;
    if (this.days_valid) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.days_valid);
    }
    
    const coupon = await models.Coupon.create({
      code: couponCode,
      reward_id: couponRewardId, // Usar o ID da recompensa da roleta ou do item sorteado
      customer_id: customerId,
      restaurant_id: this.restaurant_id,
      expires_at: expiresAt,
      status: 'active',
      title: couponTitle, // Adicionar título do cupom
      description: couponDescription, // Adicionar descrição do cupom
      value: couponValue, // Adicionar valor do cupom
      reward_type: couponRewardType, // Adicionar tipo do cupom
      ...extraData, // Adicionar dados extras, como visit_milestone
    });
    
    // Incrementar contador de usos
    await this.increment('current_uses');
    
    // Atualizar analytics
    const analytics = { ...this.analytics };
    analytics.total_generated = (analytics.total_generated || 0) + 1;
    await this.update({ analytics });
    
    return { coupon, winningItem, winningIndex };
  };

  Reward.prototype.generateCouponCode = function(customerName) {
    const cleanedName = customerName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5); // Pega as 5 primeiras letras/números
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Número aleatório de 4 dígitos
    return `${cleanedName}${randomNumber}`;
  };

  Reward.prototype.updateAnalytics = async function(action, orderValue = 0) {
    const analytics = { ...this.analytics };
    
    switch (action) {
      case 'redeemed':
        analytics.total_redeemed = (analytics.total_redeemed || 0) + 1;
        if (orderValue > 0) {
          const currentAvg = analytics.average_order_value || 0;
          const totalRedeemed = analytics.total_redeemed;
          analytics.average_order_value = ((currentAvg * (totalRedeemed - 1)) + orderValue) / totalRedeemed;
        }
        break;
      case 'expired':
        // Lógica para cupons expirados
        break;
    }
    
    // Calcular taxa de resgate
    if (analytics.total_generated > 0) {
      analytics.redemption_rate = (analytics.total_redeemed / analytics.total_generated) * 100;
    }
    
    await this.update({ analytics });
  };

  Reward.prototype.checkTriggerConditions = function(feedback, customer) {
    const conditions = this.trigger_conditions;
    if (!conditions) return true;
    
    // Verificar rating mínimo
    if (conditions.min_rating && feedback.rating < conditions.min_rating) {
      return false;
    }
    
    // Verificar tipo de feedback
    if (conditions.feedback_type && feedback.feedback_type !== conditions.feedback_type) {
      return false;
    }
    
    // Verificar número de visitas
    if (conditions.visit_count && customer.total_visits < conditions.visit_count) {
      return false;
    }
    
    // Verificar total gasto
    if (conditions.total_spent && customer.total_spent < conditions.total_spent) {
      return false;
    }
    
    // Verificar segmento do cliente
    if (conditions.customer_segment && customer.customer_segment !== conditions.customer_segment) {
      return false;
    }
    
    return true;
  };

  return Reward;
};