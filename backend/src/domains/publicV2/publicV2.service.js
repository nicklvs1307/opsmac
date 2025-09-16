import { NotFoundError, BadRequestError } from "../../utils/errors.js";

export default (db) => {
  const { models } = db;

  const submitFeedback = async (
    restaurant_id,
    customer_id,
    rating,
    comment,
    nps_score,
  ) => {
    if (customer_id) {
      const customer = await models.Customer.findOne({
        where: { id: customer_id, restaurant_id },
      });
      if (!customer) {
        throw new NotFoundError(
          "Cliente não encontrado ou não pertence a este restaurante.",
        );
      }
    }

    return models.Feedback.create({
      restaurant_id,
      customer_id,
      rating,
      comment,
      nps_score,
      source: "api_publica",
    });
  };

  const registerCheckin = async (restaurant_id, customer_id) => {
    const customer = await models.Customer.findOne({
      where: { id: customer_id, restaurant_id },
    });

    if (!customer) {
      throw new NotFoundError(
        "Cliente não encontrado ou não pertence a este restaurante.",
      );
    }

    const existingCheckin = await models.Checkin.findOne({
      where: {
        customer_id,
        restaurant_id,
        status: "active",
      },
    });

    if (existingCheckin) {
      throw new BadRequestError(
        "Cliente já possui um check-in ativo neste restaurante.",
      );
    }

    return models.Checkin.create({
      customer_id,
      restaurant_id,
      checkin_time: new Date(),
      status: "active",
    });
  };

  return {
    submitFeedback,
    registerCheckin,
  };
};
