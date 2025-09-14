const { Op, fn, col, literal } = require("sequelize");
const { BadRequestError, NotFoundError } = require("utils/errors");

class CustomerService {
  constructor(models, sequelize) {
    this.models = models;
    this.sequelize = sequelize;
  }

  async getCustomerDashboardMetrics(restaurantId) {
    const [
      customerAggregations, // Combined Customer and Checkin data
      mostCheckins,
      mostFeedbacks,
    ] = await Promise.all([
      this.models.Customer.findOne({
        where: { restaurantId: restaurantId },
        attributes: [
          [fn("COUNT", col("Customer.id")), "totalCustomers"],
          [
            fn("COUNT", fn("DISTINCT", col("checkins.customerId"))),
            "engagedCustomersCount",
          ],
          [
            fn(
              "COUNT",
              this.sequelize.literal(
                'DISTINCT CASE WHEN "checkins"."createdAt" >= NOW() - INTERVAL \'30 day\' AND "checkins"."id" IS NOT NULL THEN "checkins"."customerId" END',
              ),
            ),
            "loyalCustomersCount",
          ],
        ],
        include: [
          {
            model: this.models.Checkin,
            as: "checkins",
            attributes: [],
            required: false,
          },
        ],
        raw: true,
      }),
      this.models.Checkin.findAll({
        attributes: [
          "customerId",
          [fn("COUNT", col("Checkin.id")), "checkinCount"],
        ],
        where: { restaurantId: restaurantId },
        group: ["customerId", "customer.id", "customer.name"],
        order: [[literal("checkinCount"), "DESC"]],
        limit: 5,
        include: [
          {
            model: this.models.Customer,
            as: "customer",
            attributes: ["name"],
            required: false,
          },
        ],
      }),
      this.models.Feedback.findAll({
        attributes: [
          "customerId",
          [fn("COUNT", col("Feedback.id")), "feedbackCount"],
        ],
        where: { restaurantId: restaurantId },
        group: ["customerId", "customer.id", "customer.name"],
        order: [[literal("feedbackCount"), "DESC"]],
        limit: 5,
        include: [
          {
            model: this.models.Customer,
            as: "customer",
            attributes: ["name"],
            required: false,
          },
        ],
      }),
    ]);

    const mostCheckinsFormatted = mostCheckins.map((c) => ({
      customerId: c.customerId,
      checkinCount: c.dataValues.checkinCount,
      customerName: c.customer ? c.customer.name : "Desconhecido",
    }));

    const mostFeedbacksFormatted = mostFeedbacks.map((f) => ({
      customerId: f.customerId,
      feedbackCount: f.dataValues.feedbackCount,
      customerName: f.customer ? f.customer.name : "Desconhecido",
    }));

    const engagementRate =
      customerAggregations.totalCustomers > 0
        ? customerAggregations.engagedCustomersCount /
          customerAggregations.totalCustomers
        : 0;
    const loyalCustomersCount = customerAggregations.loyalCustomersCount;
    const loyaltyRate =
      customerAggregations.totalCustomers > 0
        ? loyalCustomersCount / customerAggregations.totalCustomers
        : 0;

    return {
      totalCustomers: parseInt(customerAggregations.totalCustomers) || 0,
      mostCheckins: mostCheckinsFormatted,
      mostFeedbacks: mostFeedbacksFormatted,
      engagementRate: engagementRate.toFixed(2),
      loyaltyRate: loyaltyRate.toFixed(2),
    };
  }

  async getBirthdayCustomers(restaurantId) {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    return this.models.Customer.findAll({
      where: {
        restaurantId,
        [Op.and]: [
          this.sequelize.where(
            this.sequelize.fn("MONTH", this.sequelize.col("birthDate")),
            todayMonth,
          ),
          this.sequelize.where(
            this.sequelize.fn("DAY", this.sequelize.col("birthDate")),
            todayDay,
          ),
        ],
      },
    });
  }

  async listCustomers(restaurantId, options) {
    const { page = 1, limit = 10, search, segment, sort } = options;
    const offset = (page - 1) * limit;

    let whereClause = { restaurantId: restaurantId };

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
      order.push([sort, "ASC"]);
    }

    const { count, rows } = await this.models.Customer.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: order.length > 0 ? order : [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    return {
      customers: rows,
      totalPages,
      currentPage: parseInt(page),
      totalCustomers: count,
    };
  }

  async createCustomer(restaurantId, customerData) {
    const {
      name,
      email,
      phone,
      birthDate,
      cpf,
      gender,
      zipCode,
      address,
      city,
      state,
      country,
    } = customerData;

    if (!name || (!email && !phone)) {
      throw new BadRequestError(
        "Nome e pelo menos um e-mail ou telefone são obrigatórios.",
      );
    }

    const t = await this.sequelize.transaction(); // Start transaction
    try {
      const customer = await this.models.Customer.create(
        {
          restaurantId,
          name,
          email,
          phone,
          birthDate,
          cpf,
          gender,
          zipCode,
          address,
          city,
          state,
          country,
        },
        { transaction: t },
      );
      await t.commit(); // Commit transaction
      return customer;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new BadRequestError(
          "Cliente já cadastrado com este e-mail ou telefone.",
        );
      }
      throw error;
    }
  }

  async _findCustomer(customerId, restaurantId, transaction = null) {
    const customer = await this.models.Customer.findOne({
      where: {
        id: customerId,
        restaurantId: restaurantId,
      },
      transaction,
    });
    if (!customer) {
      throw new NotFoundError("Cliente não encontrado.");
    }
    return customer;
  }

  async getCustomerByPhone(restaurantId, phone) {
    const customer = await this.models.Customer.findOne({
      where: {
        phone: phone,
        restaurantId: restaurantId,
      },
    });
    if (!customer) {
      throw new NotFoundError("Cliente não encontrado.");
    }
    return customer;
  }

  async getCustomerById(customerId, restaurantId) {
    return this._findCustomer(customerId, restaurantId);
  }

  async updateCustomer(restaurantId, customerId, updateData) {
    const t = await this.sequelize.transaction(); // Start transaction
    try {
      const customer = await this._findCustomer(customerId, restaurantId, t); // Use _findCustomer
      await customer.update(updateData, { transaction: t });
      await t.commit(); // Commit transaction
      return customer;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  }

  async deleteCustomer(restaurantId, customerId) {
    const t = await this.sequelize.transaction(); // Start transaction
    try {
      const customer = await this._findCustomer(customerId, restaurantId, t); // Use _findCustomer
      await customer.destroy({ transaction: t });
      await t.commit(); // Commit transaction
      return 1;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  }

  async getCustomerDetails(restaurantId, customerId) {
    const customer = await this._findCustomer(customerId, restaurantId); // This will throw NotFoundError if not found

    // Now fetch the customer again with includes
    const detailedCustomer = await this.models.Customer.findOne({
      where: {
        id: customer.id,
        restaurantId: restaurantId,
      },
      include: [
        {
          model: this.models.Checkin,
          as: "checkins",
          limit: 10,
          order: [["checkinTime", "DESC"]],
        },
        {
          model: this.models.Feedback,
          as: "feedbacks",
          limit: 10,
          order: [["createdAt", "DESC"]],
        },
        {
          model: this.models.Coupon,
          as: "coupons",
          where: { status: "redeemed" },
          required: false,
          limit: 10,
          order: [["updatedAt", "DESC"]],
        },
        {
          model: this.models.SurveyResponse,
          as: "surveyResponses",
          limit: 10,
          order: [["createdAt", "DESC"]],
        },
      ],
    });
    return detailedCustomer;
  }

  async resetCustomerVisits(restaurantId, customerId) {
    const t = await this.sequelize.transaction(); // Start transaction
    try {
      const customer = await this._findCustomer(customerId, restaurantId, t); // Use _findCustomer
      await customer.update({ totalVisits: 0 }, { transaction: t });
      await t.commit(); // Commit transaction
      return customer;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  }

  async clearCustomerCheckins(restaurantId, customerId) {
    const t = await this.sequelize.transaction(); // Start transaction
    try {
      const customer = await this._findCustomer(customerId, restaurantId, t); // Use _findCustomer
      await this.models.Checkin.destroy({
        where: {
          customerId: customerId,
          restaurantId: restaurantId,
        },
        transaction: t, // Pass transaction
      });
      await t.commit(); // Commit transaction
      return 1;
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      throw error;
    }
  }

  async publicRegisterCustomer(customerData) {
    const { name, phone, birthDate, restaurantId } = customerData;

    const t = await this.sequelize.transaction(); // Start transaction
    try {
      const customer = await this.models.Customer.create(
        { name, phone, birthDate, restaurantId },
        { transaction: t },
      );
      await t.commit(); // Commit transaction
      return {
        message: "Cliente registrado com sucesso!",
        customer,
        status: 201,
      };
    } catch (error) {
      await t.rollback(); // Rollback transaction on error
      if (error.name === "SequelizeUniqueConstraintError") {
        // If unique constraint error, try to find and update the existing customer
        let customer = await this.models.Customer.findOne({
          where: { phone: phone, restaurantId: restaurantId },
        });
        if (customer) {
          await customer.update({ name, birthDate }, { transaction: t }); // Pass transaction
          await t.commit(); // Commit transaction
          return {
            message: "Cliente atualizado com sucesso!",
            customer,
            status: 200,
          };
        }
      }
      throw error; // Re-throw other errors
    }
  }
}

module.exports = (db) => new CustomerService(db.models, db.sequelize);
