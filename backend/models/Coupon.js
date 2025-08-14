const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        msg: 'Código do cupom já existe'
      },
      validate: {
        notEmpty: {
          msg: 'Código do cupom é obrigatório'
        },
        len: {
          args: [6, 50],
          msg: 'Código deve ter entre 6 e 50 caracteres'
        },
        isUppercase: {
          msg: 'Código deve estar em maiúsculas'
        }
      }
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Título do item sorteado na roleta (se aplicável)'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição do item sorteado na roleta (se aplicável)'
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Valor do item sorteado na roleta (se aplicável)'
    },
    reward_type: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Tipo de recompensa do item sorteado na roleta (se aplicável)'
    },
    status: {
      type: DataTypes.ENUM('active', 'redeemed', 'expired', 'cancelled'),
      defaultValue: 'active'
    },
    generated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    redeemed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    order_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'Valor do pedido deve ser positivo'
        }
      }
    },
    discount_applied: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'Desconto aplicado deve ser positivo'
        }
      }
    },
    redemption_location: {
      type: DataTypes.ENUM('online', 'in_store', 'delivery', 'takeout'),
      allowNull: true
    },
    redemption_method: {
      type: DataTypes.ENUM('qrcode', 'manual', 'pos_system', 'app'),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        ip_address: null,
        user_agent: null,
        device_type: null,
        location: null,
        session_id: null,
        staff_member: null
      }
    },
    qr_code_data: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notification_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notification_sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reminder_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reminder_sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    visit_milestone: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'O número da visita (marco) em que este cupom foi concedido.'
    },
    reward_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'rewards',
        key: 'id'
      }
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
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
    redeemed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'coupons',
    indexes: [
      {
        unique: true,
        fields: ['code']
      },
      {
        fields: ['reward_id']
      },
      {
        fields: ['customer_id']
      },
      {
        fields: ['restaurant_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['expires_at']
      },
      {
        fields: ['generated_at']
      },
      {
        fields: ['redeemed_at']
      }
    ],
    hooks: {
      beforeCreate: async (coupon) => {
        // Gerar QR Code data
        if (!coupon.qr_code_data) {
          coupon.qr_code_data = JSON.stringify({
            type: 'coupon',
            code: coupon.code,
            restaurant_id: coupon.restaurant_id,
            expires_at: coupon.expires_at,
            generated_at: coupon.generated_at
          });
        }
      },
      afterCreate: async (coupon) => {
        // Enviar notificação para o cliente
        if (!coupon.notification_sent) {
          // Implementar envio de notificação
          // await NotificationService.sendCouponGenerated(coupon);
        }
      },
      beforeUpdate: async (coupon) => {
        // Marcar data de resgate
        if (coupon.changed('status') && coupon.status === 'redeemed' && !coupon.redeemed_at) {
          coupon.redeemed_at = new Date();
        }
        
        // Marcar data de cancelamento
        if (coupon.changed('status') && coupon.status === 'cancelled' && !coupon.cancelled_at) {
          coupon.cancelled_at = new Date();
        }
      },
      afterUpdate: async (coupon) => {
        // Atualizar analytics da recompensa quando resgatado
        if (coupon.changed('status') && coupon.status === 'redeemed') {
          const reward = await coupon.getReward();
          if (reward) {
            await reward.updateAnalytics('redeemed', coupon.order_value || 0);
          }
        }
      }
    }
  });

  // Métodos de instância
  Coupon.prototype.isValid = function() {
    if (this.status !== 'active') return false;
    if (this.expires_at && new Date() > this.expires_at) return false;
    return true;
  };

  Coupon.prototype.isExpired = function() {
    return this.expires_at && new Date() > this.expires_at;
  };

  Coupon.prototype.canBeRedeemed = function() {
    return this.status === 'active' && !this.isExpired();
  };

  Coupon.prototype.redeem = async function(orderValue, redemptionData = {}) {
    if (!this.canBeRedeemed()) {
      throw new Error('Cupom não pode ser resgatado');
    }

    const reward = await this.getReward();
    if (!reward) {
      throw new Error('Recompensa não encontrada');
    }

    // Verificar valor mínimo de compra
    if (reward.minimum_purchase && orderValue < reward.minimum_purchase) {
      throw new Error(`Valor mínimo de compra é R$ ${reward.minimum_purchase}`);
    }

    // Calcular desconto
    let discountAmount = 0;
    switch (reward.reward_type) {
      case 'discount_percentage':
        discountAmount = (orderValue * reward.value) / 100;
        break;
      case 'discount_fixed':
        discountAmount = Math.min(reward.value, orderValue);
        break;
      case 'free_item':
        discountAmount = reward.value;
        break;
      case 'cashback':
        discountAmount = (orderValue * reward.value) / 100;
        break;
      default:
        discountAmount = reward.value;
    }

    // Atualizar cupom
    await this.update({
      status: 'redeemed',
      redeemed_at: new Date(),
      order_value: orderValue,
      discount_applied: discountAmount,
      redemption_location: redemptionData.location || 'in_store',
      redemption_method: redemptionData.method || 'manual',
      redeemed_by: redemptionData.staff_id || null,
      metadata: {
        ...this.metadata,
        ...redemptionData.metadata
      }
    });

    // Deduzir pontos do cliente
    const customer = await this.getCustomer();
    if (customer && reward.points_required > 0) {
      await customer.deductLoyaltyPoints(reward.points_required, 'coupon_redemption');
    }

    return {
      discount_amount: discountAmount,
      final_amount: orderValue - discountAmount
    };
  };

  Coupon.prototype.cancel = async function(reason = 'cancelled_by_user') {
    if (this.status === 'redeemed') {
      throw new Error('Cupom já foi resgatado e não pode ser cancelado');
    }

    await this.update({
      status: 'cancelled',
      cancelled_at: new Date(),
      notes: this.notes ? `${this.notes}\nCancelado: ${reason}` : `Cancelado: ${reason}`
    });

    return this;
  };

  Coupon.prototype.extend = async function(days) {
    if (this.status !== 'active') {
      throw new Error('Apenas cupons ativos podem ter validade estendida');
    }

    const newExpiryDate = new Date(this.expires_at || new Date());
    newExpiryDate.setDate(newExpiryDate.getDate() + days);

    await this.update({
      expires_at: newExpiryDate,
      notes: this.notes ? `${this.notes}\nValidade estendida por ${days} dias` : `Validade estendida por ${days} dias`
    });

    return this;
  };

  Coupon.prototype.sendReminder = async function() {
    if (this.status !== 'active' || this.reminder_sent) {
      return false;
    }

    // Verificar se está próximo do vencimento (3 dias)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    if (this.expires_at && this.expires_at <= threeDaysFromNow) {
      // Implementar envio de lembrete
      // await NotificationService.sendCouponReminder(this);
      
      await this.update({
        reminder_sent: true,
        reminder_sent_at: new Date()
      });
      
      return true;
    }

    return false;
  };

  Coupon.prototype.generateQRCode = async function() {
    const QRCode = require('qrcode');
    
    const qrData = {
      type: 'coupon',
      code: this.code,
      restaurant_id: this.restaurant_id,
      expires_at: this.expires_at
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return null;
    }
  };

  // Métodos estáticos
  Coupon.findByCode = function(code) {
    return this.findOne({
      where: { code: code.toUpperCase() },
      include: [
        { model: sequelize.models.Reward, as: 'reward' },
        { model: sequelize.models.Customer, as: 'customer' },
        { model: sequelize.models.Restaurant, as: 'restaurant' }
      ]
    });
  };

  Coupon.getExpiringSoon = function(days = 3) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.findAll({
      where: {
        status: 'active',
        expires_at: {
          [sequelize.Sequelize.Op.lte]: futureDate
        },
        reminder_sent: false
      },
      include: [
        { model: sequelize.models.Customer, as: 'customer' },
        { model: sequelize.models.Restaurant, as: 'restaurant' }
      ]
    });
  };

  Coupon.associate = (models) => {
    Coupon.belongsTo(models.Reward, { foreignKey: 'reward_id', as: 'reward' });
    Coupon.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
    Coupon.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    Coupon.belongsTo(models.User, { foreignKey: 'redeemed_by', as: 'redeemedByUser' });
    Coupon.hasOne(models.Checkin, { foreignKey: 'coupon_id', as: 'checkin' }); // New association
  };

  return Coupon;
};