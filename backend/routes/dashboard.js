const express = require('express');
const { query, validationResult } = require('express-validator');
const { models } = require('../config/database');
const { auth, checkRestaurantOwnership } = require('../middleware/auth');
const { Op, fn, col, literal } = require('sequelize');

const router = express.Router();

// @route   GET /api/dashboard/overview/:restaurantId
// @desc    Obter visão geral do dashboard
// @access  Private
router.get('/overview/:restaurantId', auth, checkRestaurantOwnership, [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y', 'all'])
    .withMessage('Período deve ser: 7d, 30d, 90d, 1y ou all')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: errors.array()
      });
    }

    const { restaurantId } = req.params;
    const { period = '30d' } = req.query;

    // Calcular data de início baseada no período
    let startDate = null;
    if (period !== 'all') {
      const days = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days[period]);
    }

    const dateFilter = startDate ? {
      created_at: {
        [Op.gte]: startDate
      }
    } : {};

    // Adicionar restaurant_id ao filtro base
    const baseFilter = { restaurant_id: restaurantId, ...dateFilter };

    // Estatísticas gerais
    const [totalFeedbacks, averageRating, npsData, feedbacksByRating] = await Promise.all([
      // Total de feedbacks
      models.Feedback.count({
        where: baseFilter
      }),

      // Avaliação média
      models.Feedback.findOne({
        where: baseFilter,
        attributes: [
          [fn('AVG', col('rating')), 'average']
        ],
        raw: true
      }),

      // Dados NPS
      models.Feedback.findAll({
        where: { ...baseFilter, nps_score: { [Op.not]: null } },
        attributes: [
          [fn('COUNT', col('id')), 'total'],
          [fn('SUM', literal('CASE WHEN nps_score >= 9 THEN 1 ELSE 0 END')), 'promoters'],
          [fn('SUM', literal('CASE WHEN nps_score <= 6 THEN 1 ELSE 0 END')), 'detractors'],
          [fn('SUM', literal('CASE WHEN nps_score BETWEEN 7 AND 8 THEN 1 ELSE 0 END')), 'passives']
        ],
        raw: true
      }),

      // Distribuição por rating
      models.Feedback.findAll({
        where: baseFilter,
        attributes: [
          'rating',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['rating'],
        order: [['rating', 'ASC']],
        raw: true
      })
    ]);

    // Calcular NPS
    let npsScore = 0;
    if (npsData.length > 0 && npsData[0].total > 0) {
      const { total, promoters, detractors } = npsData[0];
      npsScore = Math.round(((promoters - detractors) / total) * 100);
    }

    // Feedbacks por tipo
    const feedbacksByType = await models.Feedback.findAll({
      where: baseFilter,
      attributes: [
        'feedback_type',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['feedback_type'],
      raw: true
    });

    // Feedbacks por fonte
    const feedbacksBySource = await models.Feedback.findAll({
      where: baseFilter,
      attributes: [
        'source',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['source'],
      raw: true
    });

    // Tendência temporal (últimos 30 dias)
    const trendDataRaw = await models.Feedback.findAll({
      where: {
        restaurant_id: restaurantId,
        created_at: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'total_responses_day'],
        [fn('SUM', literal('CASE WHEN nps_score >= 9 THEN 1 ELSE 0 END')), 'promoters'],
        [fn('SUM', literal('CASE WHEN nps_score <= 6 THEN 1 ELSE 0 END')), 'detractors'],
        [fn('SUM', literal('CASE WHEN nps_score BETWEEN 7 AND 8 THEN 1 ELSE 0 END')), 'passives']
      ],
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true
    });

    const npsTrendData = trendDataRaw.map(day => {
      const total = day.promoters + day.passives + day.detractors;
      const nps = total > 0 ? Math.round(((day.promoters - day.detractors) / total) * 100) : 0;
      return {
        date: day.date,
        nps: nps
      };
    });

    // Status dos feedbacks
    const feedbacksByStatus = await models.Feedback.findAll({
      where: baseFilter,
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Top clientes (por número de feedbacks)
    const topCustomers = await models.Customer.findAll({
      where: { restaurant_id: restaurantId }, // Adicionar filtro aqui também
      include: [
        {
          model: models.Feedback,
          as: 'feedbacks',
          where: baseFilter,
          required: true,
          attributes: [] // Não precisamos de atributos de feedbacks aqui
        }
      ],
      attributes: [
        'id',
        'name',
        'email',
        'customer_segment',
        [fn('COUNT', col('feedbacks.id')), 'feedback_count'],
        [fn('AVG', col('feedbacks.rating')), 'avg_rating']
      ],
      group: ['Customer.id', 'Customer.name', 'Customer.email', 'Customer.customer_segment'],
      order: [[literal('feedback_count'), 'DESC']],
      limit: 10,
      subQuery: false // Adicionado para evitar problemas com group by e limit
    });

    const totalCustomers = await models.Customer.count({
      where: { restaurant_id: restaurantId }
    });

    const couponsGenerated = await models.Coupon.count({
      where: { restaurant_id: restaurantId, ...dateFilter }
    });

    const couponsUsed = await models.Coupon.count({
      where: {
        restaurant_id: restaurantId,
        status: 'redeemed',
        ...dateFilter
      }
    });

    res.json({
      overview: {
        total_feedbacks: totalFeedbacks,
        average_rating: parseFloat(averageRating?.average || 0).toFixed(1),
        nps_score: npsScore,
        period,
        promoters: npsData[0]?.promoters || 0,
        neutrals: npsData[0]?.passives || 0,
        detractors: npsData[0]?.detractors || 0,
        total_answers: totalFeedbacks,
        total_customers: totalCustomers,
        coupons_generated: couponsGenerated,
        coupons_used: couponsUsed
      },
      nps_breakdown: npsData[0] || { total: 0, promoters: 0, detractors: 0, passives: 0 },
      ratings_distribution: feedbacksByRating,
      feedback_types: feedbacksByType,
      feedback_sources: feedbacksBySource,
      feedback_status: feedbacksByStatus,
      nps_trend_data: npsTrendData,
      top_customers: topCustomers
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro ao carregar dados do dashboard'
    });
  }
});

// @route   GET /api/dashboard/analytics/:restaurantId
// @desc    Obter análises detalhadas
// @access  Private
router.get('/analytics/:restaurantId', auth, checkRestaurantOwnership, [
  query('start_date').optional().isISO8601().withMessage('Data de início inválida'),
  query('end_date').optional().isISO8601().withMessage('Data de fim inválida'),
  query('granularity').optional().isIn(['day', 'week', 'month']).withMessage('Granularidade deve ser: day, week ou month')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: errors.array()
      });
    }

    const { restaurantId } = req.params;
    const { start_date, end_date, granularity = 'day' } = req.query;

    // Definir período padrão (últimos 30 dias)
    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const dateFilter = {
      created_at: {
        [Op.between]: [startDate, endDate]
      }
    };

    // Adicionar restaurant_id ao filtro base
    const baseFilter = { restaurant_id: restaurantId, ...dateFilter };

    // Função para agrupar por período
    const getDateTrunc = (granularity) => {
      switch (granularity) {
        case 'week':
          return fn('DATE_TRUNC', 'week', col('created_at'));
        case 'month':
          return fn('DATE_TRUNC', 'month', col('created_at'));
        default:
          return fn('DATE', col('created_at'));
      }
    };

    // Análise temporal detalhada
    const timeAnalysis = await models.Feedback.findAll({
      where: baseFilter,
      attributes: [
        [getDateTrunc(granularity), 'period'],
        [fn('COUNT', col('id')), 'total_feedbacks'],
        [fn('AVG', col('rating')), 'avg_rating'],
        [fn('COUNT', literal('CASE WHEN rating >= 4 THEN 1 END')), 'positive_feedbacks'],
        [fn('COUNT', literal('CASE WHEN rating <= 2 THEN 1 END')), 'negative_feedbacks'],
        [fn('COUNT', literal('CASE WHEN nps_score >= 9 THEN 1 END')), 'promoters'],
        [fn('COUNT', literal('CASE WHEN nps_score <= 6 THEN 1 END')), 'detractors']
      ],
      group: [getDateTrunc(granularity)],
      order: [[getDateTrunc(granularity), 'ASC']],
      raw: true
    });

    // Análise por mesa/localização
    const tableAnalysis = await models.Feedback.findAll({
      where: { ...baseFilter, table_number: { [Op.not]: null } },
      attributes: [
        'table_number',
        [fn('COUNT', col('id')), 'total_feedbacks'],
        [fn('AVG', col('rating')), 'avg_rating'],
        [fn('COUNT', literal('CASE WHEN rating >= 4 THEN 1 END')), 'positive_feedbacks'],
        [fn('COUNT', literal('CASE WHEN rating <= 2 THEN 1 END')), 'negative_feedbacks']
      ],
      group: ['table_number'],
      order: [['table_number', 'ASC']],
      raw: true
    });

    // Análise de sentimentos por categoria
    const sentimentAnalysis = await models.Feedback.findAll({
      where: { ...baseFilter, sentiment: { [Op.not]: null } },
      attributes: [
        'sentiment',
        [fn('COUNT', col('id')), 'count'],
        [fn('AVG', col('rating')), 'avg_rating']
      ],
      group: ['sentiment'],
      raw: true
    });

    // Análise de tempo de resposta
    const responseTimeAnalysis = await models.Feedback.findAll({
      where: { ...baseFilter, response_date: { [Op.not]: null } },
      attributes: [
        [fn('AVG', literal('EXTRACT(EPOCH FROM (response_date - created_at))/3600')), 'avg_response_time_hours'],
        [fn('COUNT', col('id')), 'total_responses'],
        [fn('COUNT', literal('CASE WHEN EXTRACT(EPOCH FROM (response_date - created_at))/3600 <= 24 THEN 1 END')), 'responses_within_24h']
      ],
      raw: true
    });

    // Análise de retenção de clientes
    const customerRetention = await models.Customer.findAll({
      where: { restaurant_id: restaurantId }, // Filtrar clientes por restaurant_id
      include: [
        {
          model: models.Feedback,
          as: 'feedbacks',
          where: baseFilter,
          attributes: []
        }
      ],
      attributes: [
        [fn('COUNT', literal('CASE WHEN total_visits = 1 THEN 1 END')), 'new_customers'],
        [fn('COUNT', literal('CASE WHEN total_visits > 1 THEN 1 END')), 'returning_customers'],
        [fn('AVG', col('total_visits')), 'avg_visits_per_customer']
      ],
      raw: true
    });

    // Comparação com período anterior
    const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    const previousPeriodEnd = startDate;

    const previousPeriodStats = await models.Feedback.findOne({
      where: {
        restaurant_id: restaurantId,
        created_at: {
          [Op.between]: [previousPeriodStart, previousPeriodEnd]
        }
      },
      attributes: [
        [fn('COUNT', col('id')), 'total_feedbacks'],
        [fn('AVG', col('rating')), 'avg_rating'],
        [fn('COUNT', literal('CASE WHEN nps_score >= 9 THEN 1 END')), 'promoters'],
        [fn('COUNT', literal('CASE WHEN nps_score <= 6 THEN 1 END')), 'detractors'],
        [fn('COUNT', literal('CASE WHEN nps_score IS NOT NULL THEN 1 END')), 'total_nps']
      ],
      raw: true
    });

    // Calcular variações percentuais
    const currentStats = await models.Feedback.findOne({
      where: baseFilter,
      attributes: [
        [fn('COUNT', col('id')), 'total_feedbacks'],
        [fn('AVG', col('rating')), 'avg_rating'],
        [fn('COUNT', literal('CASE WHEN nps_score >= 9 THEN 1 END')), 'promoters'],
        [fn('COUNT', literal('CASE WHEN nps_score <= 6 THEN 1 END')), 'detractors'],
        [fn('COUNT', literal('CASE WHEN nps_score IS NOT NULL THEN 1 END')), 'total_nps']
      ],
      raw: true
    });

    const calculateChange = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    const periodComparison = {
      feedbacks_change: calculateChange(currentStats.total_feedbacks, previousPeriodStats.total_feedbacks),
      rating_change: calculateChange(currentStats.avg_rating, previousPeriodStats.avg_rating),
      nps_change: (() => {
        const currentNPS = currentStats.total_nps > 0 ? 
          ((currentStats.promoters - currentStats.detractors) / currentStats.total_nps * 100) : 0;
        const previousNPS = previousPeriodStats.total_nps > 0 ? 
          ((previousPeriodStats.promoters - previousPeriodStats.detractors) / previousPeriodStats.total_nps * 100) : 0;
        return calculateChange(currentNPS, previousNPS);
      })()
    };

    res.json({
      time_analysis: timeAnalysis,
      table_analysis: tableAnalysis,
      sentiment_analysis: sentimentAnalysis,
      response_time_analysis: responseTimeAnalysis[0] || {},
      customer_retention: customerRetention[0] || {},
      period_comparison: periodComparison,
      date_range: {
        start_date: startDate,
        end_date: endDate,
        granularity
      }
    });
  } catch (error) {
    console.error('Erro ao buscar análises:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/dashboard/reports/:restaurantId
// @desc    Gerar relatórios específicos
// @access  Private
router.get('/reports/:restaurantId', auth, checkRestaurantOwnership, [
  query('report_type')
    .isIn(['nps', 'satisfaction', 'complaints', 'trends', 'customers'])
    .withMessage('Tipo de relatório deve ser: nps, satisfaction, complaints, trends ou customers'),
  query('format').optional().isIn(['json', 'csv']).withMessage('Formato deve ser json ou csv')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: errors.array()
      });
    }

    const { restaurantId } = req.params;
    const { report_type, format = 'json', start_date, end_date } = req.query;

    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const dateFilter = {
      created_at: {
        [Op.between]: [startDate, endDate]
      }
    };

    let reportData = {};

    switch (report_type) {
      case 'nps':
        reportData = await generateNPSReport(restaurantId, dateFilter);
        break;
      case 'satisfaction':
        reportData = await generateSatisfactionReport(restaurantId, dateFilter);
        break;
      case 'complaints':
        reportData = await generateComplaintsReport(restaurantId, dateFilter);
        break;
      case 'trends':
        reportData = await generateTrendsReport(restaurantId, dateFilter);
        break;
      case 'customers':
        reportData = await generateCustomersReport(restaurantId, dateFilter);
        break;
    }

    if (format === 'csv') {
      // Implementar conversão para CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${report_type}_report.csv"`);
      // res.send(convertToCSV(reportData));
      res.json({ message: 'Formato CSV em desenvolvimento' });
    } else {
      res.json({
        report_type,
        date_range: { start_date: startDate, end_date: endDate },
        data: reportData
      });
    }
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Funções auxiliares para gerar relatórios
async function generateNPSReport(restaurantId, dateFilter) {
  const npsData = await models.Feedback.findAll({
    where: {
      restaurant_id: restaurantId,
      nps_score: { [Op.not]: null },
      ...dateFilter
    },
    attributes: [
      [fn('DATE', col('created_at')), 'date'],
      [fn('COUNT', col('id')), 'total_responses'],
      [fn('COUNT', literal('CASE WHEN nps_score >= 9 THEN 1 END')), 'promoters'],
      [fn('COUNT', literal('CASE WHEN nps_score BETWEEN 7 AND 8 THEN 1 END')), 'passives'],
      [fn('COUNT', literal('CASE WHEN nps_score <= 6 THEN 1 END')), 'detractors'],
      [fn('AVG', col('nps_score')), 'avg_score']
    ],
    group: [fn('DATE', col('created_at'))],
    order: [[fn('DATE', col('created_at')), 'ASC']],
    raw: true
  });

  return npsData.map(day => ({
    ...day,
    nps_score: day.total_responses > 0 ? 
      Math.round(((day.promoters - day.detractors) / day.total_responses) * 100) : 0
  }));
}

async function generateSatisfactionReport(restaurantId, dateFilter) {
  return await models.Feedback.findAll({
    where: {
      restaurant_id: restaurantId,
      ...dateFilter
    },
    attributes: [
      [fn('DATE', col('created_at')), 'date'],
      [fn('COUNT', col('id')), 'total_feedbacks'],
      [fn('AVG', col('rating')), 'avg_rating'],
      [fn('COUNT', literal('CASE WHEN rating = 5 THEN 1 END')), 'excellent'],
      [fn('COUNT', literal('CASE WHEN rating = 4 THEN 1 END')), 'good'],
      [fn('COUNT', literal('CASE WHEN rating = 3 THEN 1 END')), 'average'],
      [fn('COUNT', literal('CASE WHEN rating = 2 THEN 1 END')), 'poor'],
      [fn('COUNT', literal('CASE WHEN rating = 1 THEN 1 END')), 'terrible']
    ],
    group: [fn('DATE', col('created_at'))],
    order: [[fn('DATE', col('created_at')), 'ASC']],
    raw: true
  });
}

async function generateComplaintsReport(restaurantId, dateFilter) {
  return await models.Feedback.findAll({
    where: {
      restaurant_id: restaurantId,
      [Op.or]: [
        { feedback_type: 'complaint' },
        { rating: { [Op.lte]: 2 } }
      ],
      ...dateFilter
    },
    include: [
      {
        model: models.Customer,
        as: 'customer',
        attributes: ['name', 'email', 'customer_segment']
      }
    ],
    attributes: [
      'id', 'rating', 'comment', 'feedback_type', 'source', 
      'status', 'priority', 'created_at', 'response_date'
    ],
    order: [['created_at', 'DESC']]
  });
}

async function generateTrendsReport(restaurantId, dateFilter) {
  return await models.Feedback.findAll({
    where: {
      restaurant_id: restaurantId,
      ...dateFilter
    },
    attributes: [
      [fn('DATE_TRUNC', 'week', col('created_at')), 'week'],
      [fn('COUNT', col('id')), 'total_feedbacks'],
      [fn('AVG', col('rating')), 'avg_rating'],
      [fn('COUNT', literal('CASE WHEN rating >= 4 THEN 1 END')), 'positive_feedbacks'],
      [fn('COUNT', literal('CASE WHEN rating <= 2 THEN 1 END')), 'negative_feedbacks']
    ],
    group: [fn('DATE_TRUNC', 'week', col('created_at'))],
    order: [[fn('DATE_TRUNC', 'week', col('created_at')), 'ASC']],
    raw: true
  });
}

async function generateCustomersReport(restaurantId, dateFilter) {
  return await models.Customer.findAll({
    where: { restaurant_id: restaurantId }, // Adicionar filtro aqui também
    include: [
      {
        model: models.Feedback,
        as: 'feedbacks',
        where: {
          restaurant_id: restaurantId,
          ...dateFilter
        },
        attributes: []
      }
    ],
    attributes: [
      'id', 'name', 'email', 'customer_segment', 'total_visits',
      'loyalty_points', 'average_rating_given', 'last_visit',
      [fn('COUNT', col('feedbacks.id')), 'feedback_count'],
      [fn('AVG', col('feedbacks.rating')), 'avg_feedback_rating']
    ],
    group: ['Customer.id'],
    order: [[fn('COUNT', col('feedbacks.id')), 'DESC']]
  });
}

module.exports = router;

// @route   GET /api/dashboard/rewards/analytics/:restaurantId
// @desc    Obter análises de todas as recompensas
// @access  Private
router.get('/rewards/analytics/:restaurantId', auth, checkRestaurantOwnership, async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const totalRewards = await models.Reward.count({ where: { restaurant_id: restaurantId } });
        const activeRewards = await models.Reward.count({ where: { restaurant_id: restaurantId, is_active: true } });

        const rewardsByType = await models.Reward.findAll({
            where: { restaurant_id: restaurantId },
            attributes: [
                'reward_type',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['reward_type'],
            raw: true
        });

        const totalCoupons = await models.Coupon.count({ where: { restaurant_id: restaurantId } });
        const redeemedCoupons = await models.Coupon.count({ where: { restaurant_id: restaurantId, status: 'redeemed' } });

        const redemptionRate = totalCoupons > 0 ? (redeemedCoupons / totalCoupons) * 100 : 0;

        res.json({
            total_rewards: totalRewards,
            active_rewards: activeRewards,
            rewards_by_type: rewardsByType,
            total_coupons_generated: totalCoupons,
            total_coupons_redeemed: redeemedCoupons,
            redemption_rate: redemptionRate.toFixed(2)
        });

    } catch (error) {
        console.error('Erro ao buscar análises de recompensas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});