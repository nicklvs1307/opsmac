const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Restaurant = sequelize.define('Restaurant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome do restaurante é obrigatório'
        },
        len: {
          args: [2, 150],
          msg: 'Nome deve ter entre 2 e 150 caracteres'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cuisine_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'Tipo de culinária deve ter no máximo 50 caracteres'
        }
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Endereço é obrigatório'
        }
      }
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Cidade é obrigatória'
        }
      }
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Estado é obrigatório'
        }
      }
    },
    zip_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^[\d]{5}-?[\d]{3}$/,
          msg: 'CEP deve ter formato válido (00000-000)'
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
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Email deve ter um formato válido'
        }
      }
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Website deve ter um formato válido'
        }
      }
    },
    whatsapp_api_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'URL da API do WhatsApp deve ser um formato válido'
        }
      }
    },
    whatsapp_api_key: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    whatsapp_instance_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true, // Instância deve ser única
    },
    whatsapp_phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^[\+]?[1-9][\d]{0,15}$/,
          msg: 'Número de telefone do WhatsApp deve ter um formato válido'
        }
      }
    },
    logo: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    cover_image: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    opening_hours: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '22:00', closed: false },
        saturday: { open: '09:00', close: '22:00', closed: false },
        sunday: { open: '09:00', close: '22:00', closed: false }
      }
    },
    social_media: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        facebook: '',
        instagram: '',
        twitter: '',
        whatsapp: ''
      }
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        feedback_enabled: true,
        whatsapp_enabled: false,
        rewards_enabled: true,
        auto_response: true,
        nps_enabled: true,
        tablet_mode: false
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    subscription_plan: {
      type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise'),
      defaultValue: 'free'
    },
    subscription_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    total_tables: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Número de mesas não pode ser negativo'
        }
      }
    },
    average_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
      validate: {
        min: {
          args: [0],
          msg: 'Avaliação não pode ser negativa'
        },
        max: {
          args: [5],
          msg: 'Avaliação não pode ser maior que 5'
        }
      }
    },
    total_feedbacks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Total de feedbacks não pode ser negativo'
        }
      }
    },
    nps_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: {
          args: -100,
          msg: 'NPS não pode ser menor que -100'
        },
        max: {
          args: 100,
          msg: 'NPS não pode ser maior que 100'
        }
      }
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    api_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    }
  }, {
    tableName: 'restaurants',
    indexes: [
      {
        fields: ['owner_id']
      },
      {
        fields: ['city', 'state']
      },
      {
        fields: ['cuisine_type']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['subscription_plan']
      }
    ]
  });

  // Métodos de instância
  Restaurant.prototype.updateStats = async function() {
    const { models } = sequelize;
    
    // Calcular estatísticas de feedback
    const feedbackStats = await models.Feedback.findOne({
      where: { restaurant_id: this.id },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'average'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN nps_score >= 9 THEN 1 END')), 'promoters'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN nps_score <= 6 THEN 1 END')), 'detractors']
      ],
      raw: true
    });

    if (feedbackStats && feedbackStats.total > 0) {
      const total = parseInt(feedbackStats.total);
      const promoters = parseInt(feedbackStats.promoters || 0);
      const detractors = parseInt(feedbackStats.detractors || 0);
      const npsScore = Math.round(((promoters - detractors) / total) * 100);

      await this.update({
        total_feedbacks: total,
        average_rating: parseFloat(feedbackStats.average || 0).toFixed(2),
        nps_score: npsScore
      });
    }

    return this;
  };

  Restaurant.prototype.isSubscriptionActive = function() {
    if (this.subscription_plan === 'free') return true;
    return this.subscription_expires && this.subscription_expires > new Date();
  };

  Restaurant.prototype.canCreateFeedback = function() {
    return this.is_active && this.settings.feedback_enabled && this.isSubscriptionActive();
  };

  return Restaurant;
};