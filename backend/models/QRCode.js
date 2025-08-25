'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class QRCode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      QRCode.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant',
      });
      QRCode.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'createdBy',
      });
    }

    static findByShortUrl(shortUrl) {
      return this.findOne({
        where: { short_url: shortUrl, isActive: true },
        include: [
          { model: sequelize.models.Restaurant, as: 'restaurant' },
        ],
      });
    }

    static getTableStats(restaurantId, startDate, endDate) {
      return this.findAll({
        where: {
          restaurant_id: restaurantId,
          is_active: true,
        },
        attributes: [
          'table_number',
          'table_name',
          'total_scans',
          'total_feedbacks',
          'average_rating',
          'last_scan',
          'last_feedback',
        ],
        order: [['table_number', 'ASC']],
      });
    }

    getShortUrl() {
      const baseUrl = process.env.BACKEND_URL || 'https://feedelizaapi.towersfy.com';
      return `${baseUrl}/s/${this.short_url}`;
    }
  }

  QRCode.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
        },
      },
    },
    table_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [1, 50],
          msg: 'Nome da mesa deve ter entre 1 e 50 caracteres',
        },
      },
    },
    qr_type: {
      type: DataTypes.ENUM('feedback', 'checkin', 'menu'),
      defaultValue: 'feedback',
      allowNull: false,
    },
    qr_code_data: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    qr_code_image: {
      type: DataTypes.TEXT, // Base64 encoded image
      allowNull: true,
    },
    feedback_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    short_url: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_generic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    location_description: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: {
          args: [0, 200],
          msg: 'Descrição da localização deve ter no máximo 200 caracteres',
        },
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'Capacidade deve ser pelo menos 1',
        },
      },
    },
    area: {
      type: DataTypes.ENUM('indoor', 'outdoor', 'terrace', 'private', 'bar', 'vip'),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('available', 'occupied', 'reserved', 'maintenance', 'inactive'),
      defaultValue: 'available',
    },
    total_scans: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_feedbacks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_scan: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_feedback: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    average_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
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
        theme_color: '#007bff',
      },
    },
    analytics: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        daily_scans: {},
        peak_hours: {}, 
        conversion_rate: 0,
        average_session_time: 0,
        bounce_rate: 0,
      },
    },
    custom_fields: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
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
        orientation: 'portrait',
      },
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id',
      },
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'QRCode',
    tableName: 'qr_codes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['restaurant_id', 'table_number'],
      },
      {
        unique: true,
        fields: ['short_url'],
        where: {
          short_url: {
            [sequelize.Sequelize.Op.ne]: null,
          },
        },
      },
      {
        fields: ['restaurant_id'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['area'],
      },
      {
        fields: ['total_scans'],
      },
      {
        fields: ['last_scan'],
      },
    ],
    hooks: {
      beforeValidate: async (qrcode) => {
        const qrcodeService = require('~/domains/qrcode/qrcode.service');
        await qrcodeService.handleQRCodeBeforeCreate(qrcode);
      },
      beforeCreate: async (qrcode) => {
        // Logic moved to handleQRCodeBeforeCreate
      },
      afterCreate: async (qrcode) => {
        const qrcodeService = require('~/domains/qrcode/qrcode.service');
        await qrcodeService.handleQRCodeAfterCreate(qrcode);
      },
    },
  });

  return QRCode;
};