import { Op } from "sequelize";
import { BadRequestError, NotFoundError } from "../../utils/errors/index.js";
import { sendWhatsAppMessage } from "../../services/integrations/whatsappApiClient.js";
import { generateCouponForReward } from "../../domains/rewards/rewards.service.js";
import logger from "../../utils/logger.js";

export default (db) => {
  const models = db;

  const submitPublicFeedback = async (
    restaurant_id,
    customer_id,
    rating,
    comment,
    nps_score,
  ) => {
    let customer = null;
    if (customer_id) {
      customer = await models.Customer.findOne({
        where: {
          id: customer_id,
          restaurant_id: restaurant_id,
        },
      });
      if (!customer) {
        throw new NotFoundError(
          "Cliente não encontrado ou não pertence a este restaurante.",
        );
      }
    }

    return models.Feedback.create({
      restaurant_id,
      customer_id: customer?.id,
      rating,
      comment,
      nps_score,
      source: "web",
    });
  };

  const registerPublicCheckin = async (
    restaurant,
    phone_number,
    cpf,
    customer_name,
    table_number,
  ) => {
    const checkinProgramSettings =
      restaurant.settings?.checkin_program_settings || {};
    const checkinDurationMinutes =
      checkinProgramSettings.checkin_duration_minutes || 1440;
    const identificationMethod =
      checkinProgramSettings.identification_method || "phone";

    let customer;
    let customerSearchCriteria = {};
    let customerCreationData = { restaurant_id: restaurant.id };

    if (identificationMethod === "phone") {
      if (!phone_number) {
        throw new BadRequestError(
          "Número de telefone é obrigatório para este método de identificação.",
        );
      }
      customerSearchCriteria = {
        phone: phone_number,
        restaurant_id: restaurant.id,
      };
      customerCreationData.phone = phone_number;
      customerCreationData.whatsapp = phone_number;
    } else if (identificationMethod === "cpf") {
      if (!cpf) {
        throw new BadRequestError(
          "CPF é obrigatório para este método de identificação.",
        );
      }
      customerSearchCriteria = { cpf, restaurant_id: restaurant.id };
      customerCreationData.cpf = cpf;
    } else {
      throw new BadRequestError(
        "Método de identificação inválido configurado para o restaurante.",
      );
    }

    customer = await models.Customer.findOne({ where: customerSearchCriteria });

    if (!customer) {
      customerCreationData.name = customer_name || "Cliente Anônimo";
      customerCreationData.source = "checkin_qrcode";
      customer = await models.Customer.create(customerCreationData);
    } else {
      if (customer_name && customer.name === "Cliente Anônimo") {
        await customer.update({ name: customer_name });
      }
    }

    const existingCheckin = await models.Checkin.findOne({
      where: {
        customer_id: customer.id,
        restaurant_id: restaurant.id,
        status: "active",
        expires_at: { [Op.gt]: new Date() },
      },
    });

    if (existingCheckin) {
      throw new BadRequestError(
        "Cliente já possui um check-in ativo neste restaurante.",
      );
    }

    const checkinTime = new Date();
    const expiresAt = new Date(
      checkinTime.getTime() + checkinDurationMinutes * 60 * 1000,
    );

    const checkin = await models.Checkin.create({
      customer_id: customer.id,
      restaurant_id: restaurant.id,
      table_number,
      checkin_time: checkinTime,
      expires_at: expiresAt,
      status: "active",
    });

    await customer.increment("total_visits");
    await customer.reload();
    await customer.updateStats();

    const { checkin_time_restriction = "unlimited", points_per_checkin = 1 } =
      checkinProgramSettings;

    if (checkin_time_restriction !== "unlimited") {
      const lastCheckin = await models.Checkin.findOne({
        where: {
          customer_id: customer.id,
          restaurant_id: restaurant.id,
          status: "active",
          id: { [Op.ne]: checkin.id },
        },
        order: [["checkin_time", "DESC"]],
      });

      if (lastCheckin) {
        const now = new Date();
        const lastCheckinTime = new Date(lastCheckin.checkin_time);
        const diffHours = Math.abs(now - lastCheckinTime) / 36e5;

        let restrictionHours = 0;
        if (checkin_time_restriction === "1_per_day") restrictionHours = 24;
        if (checkin_time_restriction === "1_per_6_hours") restrictionHours = 6;

        if (restrictionHours > 0 && diffHours < restrictionHours) {
          console.warn(
            `Anti-fraude: Cliente ${customer.id} tentou check-in muito rápido. Último check-in: ${lastCheckinTime.toISOString()}`,
          );
        }
      }
    }

    if (points_per_checkin > 0) {
      if (typeof customer.addLoyaltyPoints === "function") {
        await customer.addLoyaltyPoints(
          parseInt(points_per_checkin, 10),
          "checkin",
        );
      } else {
        console.warn(
          "[Public Check-in] Método addLoyaltyPoints não encontrado no modelo Customer. Pontos não adicionados.",
        );
      }
    }

    let rewardEarned = null;
    const visitRewards =
      restaurant.settings?.checkin_program_settings?.rewards_per_visit || [];

    for (const rewardConfig of visitRewards) {
      const parsedVisitCount = parseInt(rewardConfig.visit_count, 10);

      if (parsedVisitCount === customer.total_visits) {
        const existingCoupon = await models.Coupon.findOne({
          where: {
            customer_id: customer.id,
            reward_id: rewardConfig.reward_id,
            visit_milestone: parsedVisitCount,
          },
        });

        if (existingCoupon) {
          continue;
        }
        const reward = await models.Reward.findByPk(rewardConfig.reward_id);

        if (reward) {
          try {
            if (reward.reward_type === "spin_the_wheel") {
              rewardEarned = {
                reward_id: reward.id,
                reward_title: reward.title,
                reward_type: reward.reward_type,
                wheel_config: reward.wheel_config,
                visit_count: customer.total_visits,
                customer_id: customer.id,
                description: reward.description,
              };
            } else {
              const newCoupon = await reward.generateCoupon(customer.id, {
                visit_milestone: parsedVisitCount,
              });

              if (newCoupon) {
                let rewardMessage =
                  rewardConfig.message_template ||
                  `Parabéns, {{customer_name}}! Você ganhou um cupom de *{{reward_title}}* na sua {{visit_count}}ª visita ao *{{restaurant_name}}*! Use o código: {{coupon_code}}`;

                rewardMessage = rewardMessage
                  .replace(/\{\{customer_name\}\}/g, customer.name || "")
                  .replace(/\{\{restaurant_name\}\}/g, restaurant.name || "");
                rewardMessage = rewardMessage.replace(
                  /\{\{reward_title\}\}/g,
                  reward.title || "",
                );
                rewardMessage = rewardMessage.replace(
                  /\{\{coupon_code\}\}/g,
                  newCoupon.code || "",
                );
                rewardMessage = rewardMessage.replace(
                  /\{\{visit_count\}\}/g,
                  customer.total_visits,
                );

                if (
                  restaurant.whatsapp_api_url &&
                  restaurant.whatsapp_api_key &&
                  restaurant.whatsapp_instance_id &&
                  customer.phone
                ) {
                  try {
                    await sendWhatsAppMessage(
                      restaurant.whatsapp_api_url,
                      restaurant.whatsapp_api_key,
                      restaurant.whatsapp_instance_id,
                      customer.phone,
                      rewardMessage,
                    );
                  } catch (whatsappSendError) {
                    logger.error(
                      `[Public Check-in] Erro inesperado ao tentar enviar recompensa de visita WhatsApp para ${customer.name}:`,
                      whatsappSendError.message,
                      "Stack:",
                      whatsappSendError.stack,
                    );
                  }
                }
                rewardEarned = {
                  reward_title: newCoupon.title || "",
                  coupon_code: newCoupon.code || "",
                  formatted_message: rewardMessage,
                  visit_count: customer.total_visits,
                  reward_type: reward.reward_type,
                  wheel_config: reward.wheel_config,
                  value: newCoupon.value || 0,
                  description: newCoupon.description || "",
                };
              }
            }
          } catch (couponError) {
                        logger.error(
              `Erro ao gerar cupom de recompensa por visita para ${customer.name}:`,
              couponError.message,
              "Stack:",
              couponError.stack,
            );
          }
        } else {
          logger.warn(
            `[Public Check-in] Recompensa com ID ${rewardConfig.reward_id} não encontrada no banco de dados.`,
          );
        }
      }
    }

    if (!rewardEarned) {
      try {
        if (
          restaurant.settings?.whatsapp_enabled &&
          restaurant.whatsapp_api_url &&
          restaurant.whatsapp_api_key &&
          restaurant.whatsapp_instance_id &&
          customer.phone
        ) {
          const checkinMessageEnabled =
            restaurant.settings?.whatsapp_messages?.checkin_message_enabled;
          const customCheckinMessage =
            restaurant.settings?.whatsapp_messages?.checkin_message_text;

          if (checkinMessageEnabled && customCheckinMessage) {
            let messageText = customCheckinMessage
              .replace(/\{\{customer_name\}\}/g, customer.name || "")
              .replace(/\{\{restaurant_name\}\}/g, restaurant.name || "");

            await sendWhatsAppMessage(
              restaurant.whatsapp_api_url,
              restaurant.whatsapp_api_key,
              restaurant.whatsapp_instance_id,
              customer.phone,
              messageText,
            );
          }
        }
      } catch (whatsappError) {
        logger.error(
          "[Public Check-in] Erro inesperado ao tentar enviar mensagem de agradecimento WhatsApp:",
          whatsappError,
        );
      }
    }

    return {
      checkin,
      customer_total_visits: customer.total_visits,
      reward_earned: rewardEarned,
    };
  };

  const createPublicOrder = async (restaurant, orderData) => {
    // Basic validation
    if (
      !restaurant ||
      !orderData ||
      !orderData.items ||
      orderData.items.length === 0
    ) {
      throw new BadRequestError("Dados do pedido inválidos.");
    }

    // Assuming orderData contains:
    // {
    //   customer_id: UUID (optional, if customer is known),
    //   table_number: String (optional, for dine-in),
    //   total_amount: Number,
    //   status: String (e.g., 'pending'),
    //   platform: String (e.g., 'public_web'),
    //   delivery_type: String (e.g., 'delivery', 'pickup', 'dine_in'),
    //   items: [
    //     { product_id: UUID, quantity: Number, price: Number, notes: String }
    //   ]
    // }

    const t = await models.sequelize.transaction();
    try {
      // Create the main order
      const order = await models.Order.create(
        {
          restaurant_id: restaurant.id,
          customer_id: orderData.customer_id,
          table_number: orderData.table_number,
          total_amount: orderData.total_amount,
          status: orderData.status || "pending", // Default to pending
          platform: orderData.platform || "public_web",
          delivery_type: orderData.delivery_type || "pickup",
          // Add other relevant fields from orderData
        },
        { transaction: t },
      );

      // Create order items
      const orderItems = orderData.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
        // Add other relevant item fields
      }));
      await models.OrderItem.bulkCreate(orderItems, { transaction: t });

      await t.commit();
      return order;
    } catch (error) {
      await t.rollback();
      throw new Error(`Erro ao criar pedido público: ${error.message}`);
    }
  };

  const getRestaurantInfoBySlug = async (restaurantSlug) => {
    return models.Restaurant.findOne({
      where: { slug: restaurantSlug },
      attributes: ["id", "name", "settings", "slug", "logo"],
    });
  };

  const getPublicSurveyByIdentifier = async (identifier) => {
    return models.Survey.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ id: identifier }, { slug: identifier }],
        status: "active",
      },
      include: [
        {
          model: models.Question,
          as: "questions",
          attributes: ["id", "text", "type", "options"],
        },
      ],
    });
  };

  return {
    submitPublicFeedback,
    registerPublicCheckin,
    createPublicOrder, // Added this line
    getRestaurantInfoBySlug,
    getPublicSurveyByIdentifier,
  };
};