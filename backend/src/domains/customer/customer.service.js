const { models, sequelize } = require('config/config');
const { Op, fn, col, literal } = require('sequelize');

exports.getCustomerDashboardMetrics = async (restaurantId) => {
  const totalCustomers = await models.Customer.count({
    where: { restaurant_id: restaurantId }
  });

  const mostCheckins = await models.Checkin.findAll({
    attributes: [
      'customer_id',
      [fn('COUNT', col('Checkin.id')), 'checkin_count'],
    ],
    where: { restaurant_id: restaurantId },
    group: ['customer_id', 'customer.id', 'customer.name'],
    order: [[literal('checkin_count'), 'DESC']],
    limit: 5,
    include: [{
      model: models.Customer,
      as: 'customer',
      attributes: ['name'],
      required: false
    }]
  });

  const mostCheckinsFormatted = mostCheckins.map(c => ({
    customer_id: c.customer_id,
    checkin_count: c.dataValues.checkin_count,
    customer_name: c.customer ? c.customer.name : 'Desconhecido'
  }));

  const mostFeedbacks = await models.Feedback.findAll({
    attributes: [
      'customer_id',
      [fn('COUNT', col('Feedback.id')), 'feedback_count'],
    ],
    where: { restaurant_id: restaurantId },
    group: ['customer_id', 'customer.id', 'customer.name'],
    order: [[literal('feedback_count'), 'DESC']],
    limit: 5,
    include: [{
      model: models.Customer,
      as: 'customer',
      attributes: ['name'],
      required: false
    }]
  });

  const mostFeedbacksFormatted = mostFeedbacks.map(f => ({
    customer_id: f.customer_id,
    feedback_count: f.dataValues.feedback_count,
    customer_name: f.customer ? f.customer.name : 'Desconhecido'
  }));

  const engagedCustomersCount = await models.Checkin.count({
    distinct: true,
    col: 'customer_id',
    where: {
      restaurant_id: restaurantId,
    }
  });
  const engagementRate = totalCustomers > 0 ? engagedCustomersCount / totalCustomers : 0;

  const loyalCustomers = await models.Checkin.findAll({
    attributes: ['customer_id'],
    where: {
      restaurant_id: restaurantId,
    },
    group: ['customer_id'],
    having: sequelize.literal('COUNT("id") > 1')
  });
  const loyalCustomersCount = loyalCustomers.length;
  const loyaltyRate = totalCustomers > 0 ? loyalCustomersCount / totalCustomers : 0;

  return {
    totalCustomers,
    mostCheckins: mostCheckinsFormatted,
    mostFeedbacks: mostFeedbacksFormatted,
    engagementRate: engagementRate.toFixed(2),
    loyaltyRate: loyaltyRate.toFixed(2),
  };
};

exports.getBirthdayCustomers = async (restaurantId) => {
  const currentMonth = new Date().getMonth() + 1;

  const birthdays = await models.Customer.findAll({
    where: {
      restaurant_id: restaurantId,
      [Op.and]: sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "birth_date"')), currentMonth)
    },
    order: [[sequelize.literal('EXTRACT(DAY FROM "birth_date")'), 'ASC']],
  });
  return birthdays;
};

exports.listCustomers = async (restaurantId, page, limit, search, segment, sort) => {
  const offset = (page - 1) * limit;

  let whereClause = { restaurant_id: restaurantId };

  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { phone: { [Op.iLike]: `%${search}%` } },
    ];
  }
  if (segment) {
    whereClause.segment = segment;
  }

  let order = [];
  if (sort) {
    order.push([sort, 'ASC']);
  }

  const { count, rows } = await models.Customer.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: order.length > 0 ? order : [['created_at', 'DESC']],
  });

  const totalPages = Math.ceil(count / limit);

  return {
    customers: rows,
    totalPages,
    currentPage: parseInt(page),
    totalCustomers: count,
  };
};

exports.createCustomer = async (customerData, restaurantId) => {
  const newCustomer = await models.Customer.create({ ...customerData, restaurant_id: restaurantId });
  return newCustomer;
};

exports.getCustomerByPhone = async (phone, restaurantId) => {
  const customer = await models.Customer.findOne({
    where: {
      phone: phone,
      restaurant_id: restaurantId
    }
  });
  return customer;
};

exports.getCustomerById = async (customerId, restaurantId) => {
  const customer = await models.Customer.findOne({
    where: {
      id: customerId,
      restaurant_id: restaurantId
    }
  });
  return customer;
};

exports.updateCustomer = async (customerId, restaurantId, updateData) => {
  const customer = await models.Customer.findOne({
    where: {
      id: customerId,
      restaurant_id: restaurantId
    }
  });
  if (!customer) return null;
  await customer.update(updateData);
  return customer;
};

exports.deleteCustomer = async (customerId, restaurantId) => {
  const customer = await models.Customer.findOne({
    where: {
      id: customerId,
      restaurant_id: restaurantId
    }
  });
  if (!customer) return 0;
  await customer.destroy();
  return 1;
};

exports.getCustomerDetails = async (customerId, restaurantId) => {
  const customer = await models.Customer.findOne({
    where: {
      id: customerId,
      restaurant_id: restaurantId
    },
    include: [
      { model: models.Checkin, as: 'checkins', limit: 10, order: [['checkin_time', 'DESC']] },
      { model: models.Feedback, as: 'feedbacks', limit: 10, order: [['created_at', 'DESC']] },
      { model: models.Coupon, as: 'coupons', where: { status: 'redeemed' }, required: false, limit: 10, order: [['updatedAt', 'DESC']] },
      { model: models.SurveyResponse, as: 'survey_responses', limit: 10, order: [['created_at', 'DESC']] }
    ]
  });
  return customer;
};

exports.resetCustomerVisits = async (customerId, restaurantId) => {
  const customer = await models.Customer.findOne({
    where: {
      id: customerId,
      restaurant_id: restaurantId
    }
  });
  if (!customer) return null;
  await customer.update({ total_visits: 0 });
  return customer;
};

exports.clearCustomerCheckins = async (customerId, restaurantId) => {
  const customer = await models.Customer.findOne({
    where: {
      id: customerId,
      restaurant_id: restaurantId
    }
  });
  if (!customer) return 0;
  await models.Checkin.destroy({
    where: {
      customer_id: customerId,
      restaurant_id: restaurantId
    }
  });
  return 1;
};

exports.publicRegisterCustomer = async (customerData) => {
  const { name, phone, birth_date, restaurant_id } = customerData;

  let customer = await models.Customer.findOne({ where: { phone: phone, restaurant_id: restaurant_id } });

  if (customer) {
    await customer.update({ name, birth_date });
    return { message: 'Cliente atualizado com sucesso!', customer, status: 200 };
  } else {
    customer = await models.Customer.create({ name, phone, birth_date, restaurant_id });
    return { message: 'Cliente registrado com sucesso!', customer, status: 201 };
  }
};
