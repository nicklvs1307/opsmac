const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [2, 100],
          msg: 'Nome deve ter entre 2 e 100 caracteres'
        }
      }
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Email deve ter um formato válido'
        }
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^[\+]?[1-9][\d]{0,15}$/,
          msg: 'Telefone deve ter um formato válido'
        }
      }
    },
    cpf: {
      type: DataTypes.STRING(11),
      allowNull: true,
      unique: true,
      validate: {
        is: {
          args: /^\d{11}$/,
          msg: 'CPF deve conter exatamente 11 dígitos numéricos'
        }
      }
    },
    whatsapp: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^[\+]?[1-9][\d]{0,15}$/,
          msg: 'WhatsApp deve ter um formato válido'
        }
      }
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        cuisine_types: [],
        dietary_restrictions: [],
        communication_preferences: {
          email: true,
          whatsapp: false,
          sms: false
        },
        favorite_dishes: [],
        allergies: []
      }
    },
    loyalty_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_visits: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_spent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    average_rating_given: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    },
    last_visit: {
      type: DataTypes.DATE,
      allowNull: true
    },
    first_visit: {
      type: DataTypes.DATE,
      allowNull: true
    },
    customer_segment: {
      type: DataTypes.ENUM('new', 'regular', 'vip', 'inactive'),
      defaultValue: 'new'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'blocked'),
      defaultValue: 'active'
    },
    source: {
      type: DataTypes.ENUM('qrcode', 'whatsapp', 'tablet', 'web', 'referral', 'social_media', 'checkin_qrcode'),
      allowNull: true
    },
    referral_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    referred_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    marketing_consent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    gdpr_consent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    gdpr_consent_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_birthday_message_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Ano em que a última mensagem de aniversário foi enviada'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        acquisition_source: null,
        utm_campaign: null,
        utm_source: null,
        utm_medium: null,
        device_info: null,
        location_data: null
      }
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: true, // Pode ser false se todo cliente precisar de um restaurante
      references: {
        model: 'restaurants',
        key: 'id'
      }
    }
  }, {
    tableName: 'customers',
    indexes: [
      {
        unique: true,
        fields: ['email'],
        where: {
          email: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      },
      {
        unique: true,
        fields: ['phone'],
        where: {
          phone: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      },
      {
        unique: true,
        fields: ['referral_code'],
        where: {
          referral_code: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      },
      {
        fields: ['customer_segment']
      },
      {
        fields: ['status']
      },
      {
        fields: ['loyalty_points']
      },
      {
        fields: ['last_visit']
      }
    ],
    hooks: {
      beforeCreate: (customer) => {
        // Gerar código de referência único
        if (!customer.referral_code) {
          customer.referral_code = generateReferralCode();
        }
        
        // Definir primeira visita
        if (!customer.first_visit) {
          customer.first_visit = new Date();
        }
      },
      afterCreate: async (customer) => {
        // Dar pontos de boas-vindas
        if (customer.loyalty_points === 0) {
          await customer.addLoyaltyPoints(50, 'welcome_bonus');
        }
      }
    }
  });

  Customer.associate = (models) => {
    Customer.hasMany(models.Feedback, {
      foreignKey: 'customer_id',
      as: 'feedbacks'
    });
    Customer.hasMany(models.Checkin, {
      foreignKey: 'customer_id',
      as: 'checkins'
    });
    Customer.belongsTo(models.Restaurant, {
      foreignKey: 'restaurant_id',
      as: 'restaurant',
      onDelete: 'CASCADE'
    });
  };

  // Função para gerar código de referência
  function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Métodos de instância
  Customer.prototype.addLoyaltyPoints = async function(points, reason = 'feedback') {
    const newPoints = this.loyalty_points + points;
    await this.update({ loyalty_points: newPoints });
    
    // Registrar histórico de pontos (seria implementado em outro modelo)
    // await PointsHistory.create({
    //   customer_id: this.id,
    //   points: points,
    //   reason: reason,
    //   balance_after: newPoints
    // });
    
    return newPoints;
  };

  Customer.prototype.deductLoyaltyPoints = async function(points, reason = 'redemption') {
    if (this.loyalty_points < points) {
      throw new Error('Pontos insuficientes');
    }
    
    const newPoints = this.loyalty_points - points;
    await this.update({ loyalty_points: newPoints });
    
    return newPoints;
  };

  Customer.prototype.updateSegment = async function() {
    let segment = 'new';
    
    if (this.total_visits === 0) {
      segment = 'new';
    } else if (this.total_visits >= 20 || this.total_spent >= 1000) {
      segment = 'vip';
    } else if (this.total_visits >= 5) {
      segment = 'regular';
    } else if (this.last_visit && 
               new Date() - new Date(this.last_visit) > 90 * 24 * 60 * 60 * 1000) {
      segment = 'inactive';
    }
    
    if (segment !== this.customer_segment) {
      await this.update({ customer_segment: segment });
    }
    
    return segment;
  };

  Customer.prototype.updateStats = async function() {
    const { models } = sequelize;
    
    // Calcular estatísticas de feedback
    const feedbackStats = await models.Feedback.findOne({
      where: { customer_id: this.id },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_feedbacks'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
        [sequelize.fn('MAX', sequelize.col('created_at')), 'last_feedback'],
        [sequelize.fn('MIN', sequelize.col('created_at')), 'first_feedback']
      ],
      raw: true
    });

    const updates = {};
    
    if (feedbackStats) {
      if (feedbackStats.total_feedbacks) {
        updates.total_visits = parseInt(feedbackStats.total_feedbacks);
      }
      
      if (feedbackStats.average_rating) {
        updates.average_rating_given = parseFloat(feedbackStats.average_rating).toFixed(2);
      }
      
      if (feedbackStats.last_feedback) {
        updates.last_visit = new Date(feedbackStats.last_feedback);
      }
      
      if (feedbackStats.first_feedback && !this.first_visit) {
        updates.first_visit = new Date(feedbackStats.first_feedback);
      }
    }

    if (Object.keys(updates).length > 0) {
      await this.update(updates);
    }

    // Atualizar segmento
    await this.updateSegment();

    return this;
  };

  Customer.prototype.canReceiveReward = function() {
    return this.status === 'active' && this.loyalty_points >= 100;
  };

  Customer.prototype.toJSON = function() {
    const values = { ...this.get() };
    // Remover dados sensíveis se necessário
    if (!this.gdpr_consent) {
      delete values.email;
      delete values.phone;
      delete values.whatsapp;
    }
    return values;
  };

  return Customer;
};