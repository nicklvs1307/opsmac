const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QRCode = sequelize.define('QRCode', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    table_number: {
      type: DataTypes.INTEGER,
      allowNull: true, // Permitir nulo para QR Codes genéricos
      validate: {
        min: 1,
        customValidator(value) {
          if (value === null && !this.is_generic) {
            throw new Error('O número da mesa é obrigatório para QR Codes não genéricos.');
          }
          if (value !== null && value < 1) {
            throw new Error('O número da mesa deve ser um número positivo.');
          }
        }
      }
    },
    table_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [1, 50],
          msg: 'Nome da mesa deve ter entre 1 e 50 caracteres'
        }
      }
    },
    qr_type: {
      type: DataTypes.ENUM('feedback', 'checkin', 'menu'),
      defaultValue: 'feedback',
      allowNull: false,
    },
    qr_code_data: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    qr_code_image: {
      type: DataTypes.TEXT, // Base64 encoded image
      allowNull: true
    },
    feedback_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    short_url: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_generic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    location_description: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: {
          args: [0, 200],
          msg: 'Descrição da localização deve ter no máximo 200 caracteres'
        }
      }
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'Capacidade deve ser pelo menos 1'
        }
      }
    },
    area: {
      type: DataTypes.ENUM('indoor', 'outdoor', 'terrace', 'private', 'bar', 'vip'),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('available', 'occupied', 'reserved', 'maintenance', 'inactive'),
      defaultValue: 'available'
    },
    total_scans: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_feedbacks: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_scan: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_feedback: {
      type: DataTypes.DATE,
      allowNull: true
    },
    average_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        auto_redirect: true,
        show_menu: false,
        collect_contact: true,
        require_rating: true,
        enable_photos: true,
        custom_message: '',
        theme_color: '#007bff'
      }
    },
    analytics: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        daily_scans: {},
        peak_hours: {},
        conversion_rate: 0,
        average_session_time: 0,
        bounce_rate: 0
      }
    },
    custom_fields: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    print_settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        size: 'medium', // small, medium, large
        include_logo: true,
        include_table_info: true,
        include_instructions: true,
        paper_size: 'A4',
        orientation: 'portrait'
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
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'qr_codes',
    indexes: [
      {
        unique: true,
        fields: ['restaurant_id', 'table_number']
      },
      {
        unique: true,
        fields: ['short_url'],
        where: {
          short_url: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      },
      {
        fields: ['restaurant_id']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['status']
      },
      {
        fields: ['area']
      },
      {
        fields: ['total_scans']
      },
      {
        fields: ['last_scan']
      }
    ],
    hooks: {
      beforeValidate: async (qrcode) => {
        const baseUrl = process.env.FRONTEND_URL || 'https://feedelizapro.towersfy.com';
        
        if (qrcode.qr_type === 'checkin') {
          const restaurant = await sequelize.models.Restaurant.findByPk(qrcode.restaurant_id);
          if (!restaurant) throw new Error('Restaurante não encontrado para gerar URL de check-in.');
          qrcode.feedback_url = `${baseUrl}/checkin/public/${restaurant.slug}`;
          qrcode.qr_code_data = JSON.stringify({
            type: 'checkin',
            restaurant_slug: restaurant.slug,
            url: qrcode.feedback_url,
            created_at: new Date().toISOString()
          });
        } else if (qrcode.qr_type === 'menu') {
            const table = await sequelize.models.Table.findOne({ where: { restaurant_id: qrcode.restaurant_id, table_number: qrcode.table_number } });
            let tableId;
            if (!table) {
              // Se a mesa não existir, crie uma. Isso garante que o QR code sempre aponte para uma mesa válida.
              const newTable = await sequelize.models.Table.create({
                restaurant_id: qrcode.restaurant_id,
                table_number: qrcode.table_number,
              });
              tableId = newTable.id;
            } else {
              tableId = table.id;
            }
            qrcode.feedback_url = `${baseUrl}/menu/dine-in/${tableId}`;
            qrcode.qr_code_data = JSON.stringify({
              type: 'menu',
              table_id: tableId,
              url: qrcode.feedback_url,
              created_at: new Date().toISOString()
            });
        } else { // Default to feedback
          qrcode.feedback_url = `${baseUrl}/feedback/new?qrCodeId=${qrcode.id}`;
          qrcode.qr_code_data = JSON.stringify({
            type: 'feedback',
            qr_code_id: qrcode.id,
            url: qrcode.feedback_url,
            created_at: new Date().toISOString()
          });
        }
      },
      beforeCreate: async (qrcode) => {
        // Gerar short URL
        if (!qrcode.short_url) {
          qrcode.short_url = await qrcode.generateShortUrl();
        }
      },
      afterCreate: async (qrcode) => {
        // Gerar imagem do QR Code
        await qrcode.generateQRCodeImage();
      }
    }
  });

  // Métodos de instância
  QRCode.prototype.generateShortUrl = async function() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    // Gerar código único
    do {
      result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (await QRCode.findOne({ where: { short_url: result } }));
    
    return result;
  };

  QRCode.prototype.generateQRCodeImage = async function() {
    const QRCodeLib = require('qrcode');
    
    try {
      const qrCodeDataURL = await QRCodeLib.toDataURL(this.feedback_url, {
        width: parseInt(process.env.QR_CODE_SIZE) || 200,
        margin: parseInt(process.env.QR_CODE_MARGIN) || 2,
        color: {
          dark: this.settings?.theme_color || '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      await this.update({ qr_code_image: qrCodeDataURL });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return null;
    }
  };

  QRCode.prototype.recordScan = async function(metadata = {}) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Atualizar contadores
    await this.increment('total_scans');
    await this.update({ last_scan: now });
    
    // Atualizar analytics diários
    const analytics = { ...this.analytics };
    if (!analytics.daily_scans) analytics.daily_scans = {};
    analytics.daily_scans[today] = (analytics.daily_scans[today] || 0) + 1;
    
    // Atualizar analytics de horário de pico
    const hour = now.getHours();
    if (!analytics.peak_hours) analytics.peak_hours = {};
    analytics.peak_hours[hour] = (analytics.peak_hours[hour] || 0) + 1;
    
    await this.update({ analytics });
    
    // Registrar log de scan (seria implementado em outro modelo)
    // await ScanLog.create({
    //   qr_code_id: this.id,
    //   scanned_at: now,
    //   metadata: metadata
    // });
  };

  QRCode.prototype.recordFeedback = async function() {
    const now = new Date();
    
    await this.increment('total_feedbacks');
    await this.update({ last_feedback: now });
    
    // Atualizar taxa de conversão
    const analytics = { ...this.analytics };
    if (this.total_scans > 0) {
      analytics.conversion_rate = (this.total_feedbacks / this.total_scans) * 100;
    }
    
    await this.update({ analytics });
  };

  QRCode.prototype.updateStats = async function() {
    const { models } = sequelize;
    
    // Calcular estatísticas de feedback para esta mesa
    const feedbackStats = await models.Feedback.findOne({
      where: {
        restaurant_id: this.restaurant_id,
        table_number: this.table_number
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'average']
      ],
      raw: true
    });

    if (feedbackStats && feedbackStats.total > 0) {
      await this.update({
        total_feedbacks: parseInt(feedbackStats.total),
        average_rating: parseFloat(feedbackStats.average || 0).toFixed(2)
      });
    }

    return this;
  };

  QRCode.prototype.getShortUrl = function() {
    const baseUrl = process.env.BACKEND_URL || 'https://feedelizaapi.towersfy.com';
    return `${baseUrl}/s/${this.short_url}`;
  };

  QRCode.prototype.generatePrintableQR = async function() {
    const restaurant = await this.getRestaurant();
    
    return {
      qr_code_image: this.qr_code_image,
      table_info: {
        number: this.table_number,
        name: this.table_name,
        capacity: this.capacity,
        area: this.area,
        location: this.location_description
      },
      restaurant_info: {
        name: restaurant?.name,
        logo: restaurant?.logo
      },
      instructions: {
        title: 'Como avaliar:',
        steps: [
          '1. Escaneie este QR Code com seu celular',
          '2. Avalie sua experiência',
          '3. Ganhe pontos e cupons de desconto!'
        ]
      },
      urls: {
        feedback: this.feedback_url,
        short: this.getShortUrl()
      },
      settings: this.print_settings
    };
  };

  QRCode.prototype.clone = async function(newTableNumber) {
    const clonedData = {
      table_number: newTableNumber,
      table_name: this.table_name ? `${this.table_name} (Cópia)` : null,
      location_description: this.location_description,
      capacity: this.capacity,
      area: this.area,
      settings: this.settings,
      print_settings: this.print_settings,
      restaurant_id: this.restaurant_id,
      created_by: this.created_by
    };
    
    return await QRCode.create(clonedData);
  };

  // Métodos estáticos
  QRCode.findByShortUrl = function(shortUrl) {
    return this.findOne({
      where: { short_url: shortUrl, is_active: true },
      include: [
        { model: sequelize.models.Restaurant, as: 'restaurant' }
      ]
    });
  };

  QRCode.getTableStats = function(restaurantId, startDate, endDate) {
    return this.findAll({
      where: {
        restaurant_id: restaurantId,
        is_active: true
      },
      attributes: [
        'table_number',
        'table_name',
        'total_scans',
        'total_feedbacks',
        'average_rating',
        'last_scan',
        'last_feedback'
      ],
      order: [['table_number', 'ASC']]
    });
  };

  return QRCode;
};