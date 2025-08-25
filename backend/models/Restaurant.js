'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Restaurant extends Model {
    static associate(models) {
      Restaurant.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
      Restaurant.hasMany(models.NpsCriterion, { as: 'npsCriteria', foreignKey: 'restaurantId' });
      Restaurant.hasMany(models.User, { foreignKey: 'restaurantId', as: 'users' });
      Restaurant.belongsToMany(models.Module, { through: 'restaurant_modules', foreignKey: 'restaurantId', otherKey: 'moduleId', as: 'modules' });
      // Adicione outras associações aqui se necessário
    }

    // Métodos de instância podem ser movidos para cá
    async updateStats() {
        const { models } = sequelize;
        const feedbackStats = await models.Feedback.findOne({ where: { restaurantId: this.id }, attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'total'], [sequelize.fn('AVG', sequelize.col('rating')), 'average'], [sequelize.fn('COUNT', sequelize.literal('CASE WHEN npsScore >= 9 THEN 1 END')), 'promoters'], [sequelize.fn('COUNT', sequelize.literal('CASE WHEN npsScore BETWEEN 7 AND 8 THEN 1 END')), 'passives'], [sequelize.fn('COUNT', sequelize.literal('CASE WHEN npsScore <= 6 THEN 1 END')), 'detractors']], raw: true });
        if (feedbackStats && feedbackStats.total > 0) {
            const total = parseInt(feedbackStats.total);
            const promoters = parseInt(feedbackStats.promoters || 0);
            const passives = parseInt(feedbackStats.passives || 0);
            const detractors = parseInt(feedbackStats.detractors || 0);
            const npsScore = Math.round(((promoters - detractors) / total) * 100);
            await this.update({ totalFeedbacks: total, averageRating: parseFloat(feedbackStats.average || 0).toFixed(2), npsScore: npsScore, totalPromoters: promoters, totalNeutrals: passives, totalDetractors: detractors });
        }
        return this;
    }

    isSubscriptionActive() {
        if (this.subscriptionPlan === 'free') return true;
        return this.subscriptionExpires && this.subscriptionExpires > new Date();
    }

    canCreateFeedback() {
        return this.isActive && this.settings.feedbackEnabled && this.isSubscriptionActive();
    }
  }

  Restaurant.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false, validate: { notEmpty: { msg: 'Nome do restaurante é obrigatório' }, len: { args: [2, 150], msg: 'Nome deve ter entre 2 e 150 caracteres' } } },
    slug: { type: DataTypes.STRING(150), allowNull: true, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    cuisineType: { type: DataTypes.STRING(50), allowNull: true, validate: { len: { args: [0, 50], msg: 'Tipo de culinária deve ter no máximo 50 caracteres' } } },
    address: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: { msg: 'Endereço é obrigatório' } } },
    city: { type: DataTypes.STRING(100), allowNull: false, validate: { notEmpty: { msg: 'Cidade é obrigatória' } } },
    state: { type: DataTypes.STRING(50), allowNull: false, validate: { notEmpty: { msg: 'Estado é obrigatório' } } },
    zipCode: { type: DataTypes.STRING(20), allowNull: true, validate: { is: { args: /^[\d]{5}-?[\d]{3}$/, msg: 'CEP deve ter formato válido (00000-000)' } } },
    phone: { type: DataTypes.STRING(20), allowNull: true, validate: { is: { args: /^[\+]?[1-9][\d]{0,15}$/,
          msg: 'Telefone deve ter um formato válido' } } },
    email: { type: DataTypes.STRING(150), allowNull: true, validate: { isEmail: { msg: 'Email deve ter um formato válido' } } },
    website: { type: DataTypes.STRING(255), allowNull: true, validate: { isUrl: { msg: 'Website deve ter um formato válido' } } },
    whatsappApiUrl: { type: DataTypes.STRING(255), allowNull: true, validate: { isUrl: { msg: 'URL da API do WhatsApp deve ser um formato válido' } } },
    whatsappApiKey: { type: DataTypes.STRING(255), allowNull: true },
    whatsappInstanceId: { type: DataTypes.STRING(255), allowNull: true, unique: true },
    whatsappPhoneNumber: { type: DataTypes.STRING(20), allowNull: true, validate: { is: { args: /^[\+]?[1-9][\d]{0,15}$/, msg: 'Número de telefone do WhatsApp deve ter um formato válido' } } },
    logo: { type: DataTypes.STRING(500), allowNull: true },
    coverImage: { type: DataTypes.STRING(500), allowNull: true },
    openingHours: { type: DataTypes.JSONB, allowNull: true, defaultValue: { monday: { open: '09:00', close: '22:00', closed: false }, tuesday: { open: '09:00', close: '22:00', closed: false }, wednesday: { open: '09:00', close: '22:00', closed: false }, thursday: { open: '09:00', close: '22:00', closed: false }, friday: { open: '09:00', close: '22:00', closed: false }, saturday: { open: '09:00', close: '22:00', closed: false }, sunday: { open: '09:00', close: '22:00', closed: false } } },
    socialMedia: { type: DataTypes.JSONB, allowNull: true, defaultValue: { facebook: '', instagram: '', twitter: '', whatsapp: '' } },
    settings: { type: DataTypes.JSONB, allowNull: true, defaultValue: { feedbackEnabled: true, whatsappEnabled: false, rewardsEnabled: true, autoResponse: true, npsEnabled: true, tabletMode: false, checkinRequiresTable: false, checkinProgramSettings: { requireCouponForCheckin: false }, surveyProgramSettings: {}, primaryColor: '#3f51b5', secondaryColor: '#f50057', integrations: {}, enabledModules: [] } },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isOpen: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default to open
      allowNull: false,
      comment: 'Indicates if the restaurant is currently open for new orders/interactions'
    },
    posStatus: {
      type: DataTypes.ENUM('open', 'closed'),
      defaultValue: 'closed', // Default to closed
      allowNull: false,
      comment: 'Status of the Point of Sale (POS) cash register for order processing'
    },
    subscriptionPlan: { type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise'), defaultValue: 'free' },
    subscriptionExpires: { type: DataTypes.DATE, allowNull: true },
    totalTables: { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: { args: [0], msg: 'Número de mesas não pode ser negativo' } } },
    averageRating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.00, validate: { min: { args: [0], msg: 'Avaliação não pode ser negativa' }, max: { args: [5], msg: 'Avaliação não pode ser maior que 5' } } },
    totalFeedbacks: { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: { args: [0], msg: 'Total de feedbacks não pode ser negativo' } } },
    npsScore: { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: { args: [-100], msg: 'NPS não pode ser menor que -100' }, max: { args: [100], msg: 'NPS não pode ser maior que 100' } } },
    totalPromoters: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false, validate: { min: 0 } },
    totalNeutrals: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false, validate: { min: 0 } },
    totalDetractors: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false, validate: { min: 0 } },
    ownerId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
    apiToken: { type: DataTypes.STRING(255), allowNull: true, unique: true },
    npsCriteriaScores: { type: DataTypes.JSONB, allowNull: true, defaultValue: {} },
  }, {
    sequelize,
    modelName: 'Restaurant',
    tableName: 'restaurants',
    timestamps: true, // Habilitado para consistência
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['city', 'state'] },
      { fields: ['cuisineType'] },
      { fields: ['isActive'] },
      { fields: ['subscriptionPlan'] }
    ]
  });

  return Restaurant;
};