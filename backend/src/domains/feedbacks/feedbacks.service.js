import { Op } from "sequelize";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/errors/index.js";
import natural from "natural";
import logger from "../../utils/logger.js"; // Re-add logger as it's used elsewhere
import notificationServiceFactory from "../../services/notificationService.js";

const tokenizer = new natural.WordTokenizer();
// Define Portuguese stop words. The 'natural' library's default stopwords are for English.
// You might need to create a more comprehensive list or use a dedicated library for Portuguese.
const portugueseStopwords = new Set([
  "a",
  "ao",
  "aos",
  "aquela",
  "aquelas",
  "aquele",
  "aqueles",
  "aquilo",
  "as",
  "às",
  "até",
  "com",
  "como",
  "da",
  "das",
  "de",
  "dela",
  "delas",
  "dele",
  "deles",
  "depois",
  "do",
  "dos",
  "e",
  "é",
  "ela",
  "elas",
  "ele",
  "eles",
  "em",
  "entre",
  "era",
  "eram",
  "essa",
  "essas",
  "esse",
  "esses",
  "esta",
  "estas",
  "este",
  "estes",
  "estou",
  "eu",
  "foi",
  "fomos",
  "for",
  "foram",
  "fosse",
  "fui",
  "há",
  "isso",
  "isto",
  "já",
  "lhe",
  "lhes",
  "mais",
  "mas",
  "me",
  "mesmo",
  "meu",
  "meus",
  "minha",
  "minhas",
  "muito",
  "na",
  "nas",
  "nem",
  "no",
  "nos",
  "nossa",
  "nossas",
  "nosso",
  "nossos",
  "num",
  "numa",
  "nunca",
  "o",
  "os",
  "ou",
  "para",
  "pela",
  "pelas",
  "pelo",
  "pelos",
  "por",
  "porque",
  "qual",
  "quando",
  "que",
  "quem",
  "se",
  "sem",
  "ser",
  "serei",
  "seremos",
  "seria",
  "seriam",
  "seu",
  "seus",
  "só",
  "somos",
  "sua",
  "suas",
  "também",
  "te",
  "tem",
  "têm",
  "tinha",
  "tinham",
  "tive",
  "tivemos",
  "tiver",
  "tiveram",
  "tivesse",
  "tu",
  "tua",
  "tuas",
  "tudo",
  "um",
  "uma",
  "uns",
  "você",
  "vocês",
  "vos",
]);

  const _getFeedbackIncludes = (models) => {
    return [
      {
        model: models.Customer,
        as: "customer",
        attributes: [
          "id",
          "name",
          "email",
          "phone",
          "customerSegment",
          "total_visits",
          "loyaltyPoints",
        ],
      },
      {
        model: models.Restaurant,
        as: "restaurant",
        attributes: ["id", "name"],
      },
    ];
  };

export default (db) => {
  const models = db;
  const notificationService = notificationServiceFactory(db);

  const _findOrCreateCustomer = async (feedbackData, restaurantId) => {
    const { customerId, is_anonymous, customerData, source } = feedbackData;
    if (is_anonymous) return null;

    if (customerId) {
      const customer = await models.Customer.findByPk(customerId);
      if (customer) return customer;
    }

    if (customerData) {
      const { name, email, phone, whatsapp } = customerData;
      if (email || phone) {
        const existingCustomer = await models.Customer.findOne({
          where: {
            restaurantId: restaurantId,
            [Op.or]: [
              email ? { email } : null,
              phone ? { phone } : null,
            ].filter(Boolean),
          },
        });
        if (existingCustomer) return existingCustomer;
      }
      if (name || email || phone) {
        return await models.Customer.create({
          name,
          email,
          phone,
          whatsapp,
          source,
          restaurantId: restaurantId,
        });
      }
    }
    return null;
  };

  const handleLoyaltyAndRewards = async (customer, restaurant, feedback) => {
    if (!customer) return { pointsEarned: 0 };

    await customer.updateStats();
    const pointsToAdd = parseInt(process.env.POINTS_PER_FEEDBACK) || 10;
    await customer.addLoyaltyPoints(pointsToAdd, "feedback");

    if (restaurant.settings?.rewardsEnabled) {
      const eligibleRewards = await models.Reward.findAll({
        where: {
          restaurantId: restaurant.id,
          isActive: true,
          autoApply: true,
          [Op.or]: [{ customerId: null }, { customerId: customer.id }],
        },
      });

      for (const reward of eligibleRewards) {
        if (reward.checkTriggerConditions(feedback, customer)) {
          try {
            await reward.generateCoupon(customer.id);
          } catch (error) {
            logger.error("Erro ao gerar cupom automático:", error);
          }
        }
      }
    }
    return { pointsEarned: pointsToAdd };
  };

  

  const createFeedback = async (feedbackData, restaurantId, reqInfo) => {
    const restaurant = await models.Restaurant.findByPk(restaurantId);
    if (!restaurant) throw new NotFoundError("Restaurante não encontrado");
    if (!restaurant.canCreateFeedback())
      throw new ForbiddenError(
        "Restaurante não está aceitando feedbacks no momento",
      );

    const customer = await _findOrCreateCustomer(feedbackData, restaurantId);

    const feedback = await models.Feedback.create({
      ...feedbackData,
      restaurantId: restaurantId,
      customerId: customer?.id,
      metadata: {
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
        deviceType: reqInfo.userAgent?.includes("Mobile")
          ? "mobile"
          : "desktop",
      },
    });

    const { pointsEarned } = await handleLoyaltyAndRewards(
      customer,
      restaurant,
      feedback,
    );

    const fullFeedback = await models.Feedback.findByPk(feedback.id, {
      include: _getFeedbackIncludes(models),
    });

    // await handleWhatsAppNotification(fullFeedback);

    await notificationService.sendFeedbackThankYouWhatsApp(fullFeedback);

    return { feedback: fullFeedback, pointsEarned };
  };

  const listFeedbacks = async (restaurantId, queryParams) => {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      rating,
      source,
      feedbackType,
      startDate,
      endDate,
      search,
    } = queryParams;
    const where = { restaurantId: restaurantId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (rating) where.rating = rating;
    if (source) where.source = source;
    if (feedbackType) where.feedbackType = feedbackType;
    if (startDate) where.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate)
      where.createdAt = { ...where.createdAt, [Op.lte]: new Date(endDate) };
    if (search) {
      where[Op.or] = [
        { comment: { [Op.iLike]: `%${search}%` } },
        { "$customer.name$": { [Op.iLike]: `%${search}%` } },
        { "$customer.email$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    return await models.Feedback.findAndCountAll({
      where,
      include: _getFeedbackIncludes(models),
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
  };

  const getFeedbackForRestaurant = async (feedbackId, restaurantId) => {
    const feedback = await models.Feedback.findOne({
      where: { id: feedbackId, restaurantId: restaurantId },
      include: _getFeedbackIncludes(models),
    });
    if (!feedback)
      throw new NotFoundError(
        "Feedback não encontrado ou não pertence ao seu restaurante.",
      );
    return feedback;
  };

  const getFeedbackById = async (feedbackId, restaurantId) => {
    return await getFeedbackForRestaurant(feedbackId, restaurantId);
  };

  const updateFeedback = async (
    feedbackId,
    restaurantId,
    userId,
    updateData,
  ) => {
    const feedback = await getFeedbackForRestaurant(feedbackId, restaurantId);
    const {
      status,
      priority,
      response_text,
      internal_notes,
      follow_up_required,
      follow_up_date,
    } = updateData;

    const dataToUpdate = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (priority !== undefined) dataToUpdate.priority = priority;
    if (response_text !== undefined) {
      dataToUpdate.response_text = response_text;
      dataToUpdate.response_date = new Date();
      dataToUpdate.responded_by = userId;
    }
    if (internal_notes !== undefined)
      dataToUpdate.internal_notes = internal_notes;
    if (follow_up_required !== undefined)
      dataToUpdate.follow_up_required = follow_up_required;
    if (follow_up_date !== undefined)
      dataToUpdate.follow_up_date = new Date(follow_up_date);

    await feedback.update(dataToUpdate);
    return await getFeedbackForRestaurant(feedbackId, restaurantId); // Return updated feedback with includes
  };

  const deleteFeedback = async (feedbackId, restaurantId, user) => {
    const feedback = await getFeedbackForRestaurant(feedbackId, restaurantId);
    if (user.role !== "admin") {
      throw new ForbiddenError(
        "Apenas administradores podem deletar feedbacks",
      );
    }
    await feedback.destroy();
  };

  const respondToFeedback = async (
    feedbackId,
    restaurantId,
    userId,
    responseText,
  ) => {
    const feedback = await getFeedbackForRestaurant(feedbackId, restaurantId);
    await feedback.markAsResponded(responseText, userId);
    // Email sending logic can be triggered here if needed
    return feedback;
  };

  // Function to get word frequency from feedback comments
  async function getFeedbackWordFrequency(restaurantId, queryParams) {
    const { startDate, endDate, feedbackType, surveyId } = queryParams;

    const where = { restaurantId: restaurantId };
    if (feedbackType) where.feedbackType = feedbackType;
    if (startDate) where.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate)
      where.createdAt = { ...where.createdAt, [Op.lte]: new Date(endDate) };

    // If surveyId is provided, filter feedbacks by survey responses
    if (surveyId) {
      const surveyResponses = await models.SurveyResponse.findAll({
        where: { surveyId: surveyId },
        attributes: ["feedbackId"],
      });
      const feedbackIds = surveyResponses
        .map((sr) => sr.feedbackId)
        .filter(Boolean);
      if (feedbackIds.length > 0) {
        where.id = { [Op.in]: feedbackIds };
      } else {
        return []; // No feedbacks for this survey
      }
    }

    const feedbacks = await models.Feedback.findAll({
      where: {
        ...where,
        comment: { [Op.ne]: null, [Op.ne]: "" }, // Only consider feedbacks with comments
      },
      attributes: ["comment"],
    });

    const wordCounts = {};
    feedbacks.forEach((feedback) => {
      const comment = feedback.comment.toLowerCase();
      const tokens = tokenizer.tokenize(comment);
      tokens.forEach((token) => {
        if (token.length > 2 && !portugueseStopwords.has(token)) {
          // Ignore short words and stop words
          wordCounts[token] = (wordCounts[token] || 0) + 1;
        }
      });
    });

    // Convert to array of { text: 'word', value: count } for word cloud libraries
    const wordCloudData = Object.entries(wordCounts)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 100); // Limit to top 100 words

    return wordCloudData;
  }

  return {
    handleLoyaltyAndRewards,
    createFeedback,
    listFeedbacks,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
    respondToFeedback,
    getFeedbackWordFrequency,
  };
};
