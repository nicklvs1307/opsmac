const { Op } = require("sequelize");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("utils/errors");

module.exports = (db) => {
  const models = db;

  const getNextSurvey = async (restaurantSlug, customerId) => {
    const restaurant = await models.Restaurant.findOne({
      where: { slug: restaurantSlug },
      attributes: ["id", "name", "logo", "slug", "settings"],
    });

    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado.");
    }

    let customer = null;
    if (customerId) {
      customer = await models.Customer.findByPk(customerId, {
        attributes: ["id", "last_survey_id", "last_survey_completed_at"],
      });
    }

    const commonSurveyOptions = {
      where: { restaurant_id: restaurant.id, status: "active" },
      include: [
        {
          model: models.Question,
          as: "questions",
          attributes: [
            "id",
            "question_text",
            "question_type",
            "options",
            "order",
          ],
        },
        {
          model: models.Restaurant,
          as: "restaurant",
          attributes: ["name", "logo", "slug", "settings"],
        },
      ],
      attributes: [
        "id",
        "title",
        "description",
        "type",
        "slug",
        "rotation_group",
        "coupon_validity_days",
      ],
    };

    let targetSurvey = null;

    if (customer && customer.last_survey_id) {
      const lastSurvey = await models.Survey.findByPk(customer.last_survey_id);
      if (lastSurvey && lastSurvey.rotation_group) {
        const surveysInGroup = await models.Survey.findAll({
          ...commonSurveyOptions,
          where: {
            ...commonSurveyOptions.where,
            rotation_group: lastSurvey.rotation_group,
            id: { [Op.ne]: lastSurvey.id },
          },
        });

        if (surveysInGroup.length > 0) {
          targetSurvey = surveysInGroup[0];
        }
      }
    }

    if (!targetSurvey) {
      const allActiveSurveys = await models.Survey.findAll({
        ...commonSurveyOptions,
        order: models.sequelize.literal("RANDOM()"),
        limit: 1,
      });
      if (allActiveSurveys.length > 0) {
        targetSurvey = allActiveSurveys[0];
      }
    }

    if (!targetSurvey) {
      throw new NotFoundError(
        "Nenhuma pesquisa ativa encontrada para este restaurante.",
      );
    }

    return { survey: targetSurvey, restaurant: targetSurvey.restaurant };
  };

  const getPublicSurveyBySlugs = async (restaurantSlug, surveySlug) => {
    const restaurant = await models.Restaurant.findOne({
      where: { slug: restaurantSlug },
      attributes: ["id"],
    });

    if (!restaurant) {
      throw new NotFoundError("Restaurante não encontrado.");
    }

    const survey = await models.Survey.findOne({
      where: {
        slug: surveySlug,
        restaurant_id: restaurant.id,
        status: "active",
      },
      include: [
        {
          model: models.Question,
          as: "questions",
          attributes: [
            "id",
            "question_text",
            "question_type",
            "options",
            "order",
          ],
          include: [
            {
              model: models.NpsCriterion,
              as: "npsCriterion",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: models.Restaurant,
          as: "restaurant",
          attributes: ["name", "logo", "slug", "settings"],
        },
      ],
      attributes: ["id", "title", "description", "type", "slug"],
    });

    if (!survey) {
      throw new NotFoundError(
        "Pesquisa não encontrada ou inativa para este restaurante.",
      );
    }

    return { survey, restaurant: survey.restaurant };
  };

  const submitSurveyResponses = async (surveySlug, answers, customer_id) => {
    const survey = await models.Survey.findOne({
      where: { slug: surveySlug, status: "active" },
      include: [
        {
          model: models.Question,
          as: "questions",
          include: [
            {
              model: models.NpsCriterion,
              as: "npsCriterion",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!survey) {
      throw new NotFoundError("Pesquisa não encontrada ou inativa");
    }

    const surveyQuestionIds = survey.questions.map((q) => q.id);
    for (const ans of answers) {
      if (!surveyQuestionIds.includes(ans.question_id)) {
        throw new BadRequestError(
          `Pergunta com ID ${ans.question_id} não pertence a esta pesquisa.`,
        );
      }
    }

    const newSurveyResponse = await models.SurveyResponse.create({
      survey_id: survey.id,
      customer_id: customer_id || null,
    });

    let feedbackRating = null;
    let feedbackNpsScore = null;
    let feedbackComment = [];
    let feedbackType = "general";
    let isAnonymous = !customer_id;

    const npsScoresByCriterion = {};

    for (const ans of answers) {
      const question = survey.questions.find((q) => q.id === ans.question_id);
      if (question) {
        const value = parseInt(ans.answer_value, 10);
        if (!isNaN(value)) {
          if (question.question_type === "nps") {
            feedbackNpsScore = value;
            if (question.npsCriterion) {
              const criterionId = question.npsCriterion.id;
              const score = parseInt(ans.answer_value);
              let category = "";
              if (score >= 9) {
                category = "promoters";
              } else if (score >= 7) {
                category = "passives";
              } else {
                category = "detractors";
              }

              if (!npsScoresByCriterion[criterionId]) {
                npsScoresByCriterion[criterionId] = {
                  promoters: 0,
                  passives: 0,
                  detractors: 0,
                  total: 0,
                };
              }
              npsScoresByCriterion[criterionId][category]++;
              npsScoresByCriterion[criterionId].total++;
            }
          } else if (
            question.question_type === "ratings" ||
            question.question_type === "csat"
          ) {
            feedbackRating = value;
          } else if (
            question.question_type === "text" ||
            question.question_type === "textarea"
          ) {
            feedbackComment.push(ans.answer_value);
          }
        }
      }
    }

    if (feedbackRating !== null) {
      if (feedbackRating >= 4) {
        feedbackType = "compliment";
      } else if (feedbackRating <= 2) {
        feedbackType = "complaint";
      }
    } else if (feedbackNpsScore !== null) {
      if (feedbackNpsScore >= 9) {
        feedbackType = "compliment";
      } else if (feedbackNpsScore <= 6) {
        feedbackType = "complaint";
      }
    }

    const feedbackData = {
      restaurant_id: survey.restaurant_id,
      customer_id: customer_id || null,
      rating: feedbackRating,
      nps_score: feedbackNpsScore,
      comment: feedbackComment.join("\n"),
      feedback_type: feedbackType,
      source: "web",
      is_anonymous: isAnonymous,
    };

    if (feedbackRating !== null) {
      await models.Feedback.create(feedbackData);
    }

    if (customer_id) {
      const customer = await models.Customer.findByPk(customer_id);
      if (customer) {
        await customer.increment("survey_responses_count");
        await customer.reload();
        await customer.updateStats();
        await customer.update({
          last_survey_id: survey.id,
          last_survey_completed_at: new Date(),
        });
      }
    }

    const restaurant = await models.Restaurant.findByPk(survey.restaurant_id);
    if (restaurant) {
      const currentNpsScores = restaurant.npsCriteriaScores || {};
      for (const criterionId in npsScoresByCriterion) {
        if (Object.prototype.hasOwnProperty.call(npsScoresByCriterion, criterionId)) {
          const newScores = npsScoresByCriterion[criterionId];
          currentNpsScores[criterionId] = {
            promoters:
              (currentNpsScores[criterionId]?.promoters || 0) +
              newScores.promoters,
            passives:
              (currentNpsScores[criterionId]?.passives || 0) +
              newScores.passives,
            detractors:
              (currentNpsScores[criterionId]?.detractors || 0) +
              newScores.detractors,
            total:
              (currentNpsScores[criterionId]?.total || 0) + newScores.total,
          };
        }
      }
      await restaurant.update({ npsCriteriaScores: currentNpsScores });
    }

    let rewardData = null;
    if (customer_id && restaurant) {
      const surveyRewardSettings =
        restaurant.settings?.survey_reward_settings || {};
      const rewardsPerResponse =
        surveyRewardSettings.rewards_per_response || [];
      const customer = await models.Customer.findByPk(customer_id);
      const currentResponseCount = customer.survey_responses_count;

      for (const rewardConfig of rewardsPerResponse) {
        const responseMilestone = parseInt(rewardConfig.response_count, 10);
        if (responseMilestone === currentResponseCount) {
          const existingCoupon = await models.Coupon.findOne({
            where: {
              customer_id: customer.id,
              reward_id: rewardConfig.reward_id,
              visit_milestone: responseMilestone,
            },
          });

          if (existingCoupon) {
            continue;
          }

          const reward = await models.Reward.findByPk(rewardConfig.reward_id);
          if (reward) {
            const { coupon } = await reward.generateCoupon(customer.id, {
              coupon_validity_days:
                reward.validity_days || survey.coupon_validity_days,
              metadata: {
                source: "survey_response_milestone",
                survey_id: survey.id,
                response_id: newSurveyResponse.id,
                milestone: currentResponseCount,
              },
            });
            rewardData = { type: "coupon", details: coupon };
            break;
          }
        }
      }
    }

    if (!rewardData && survey.reward_id && customer_id) {
      const reward = await models.Reward.findByPk(survey.reward_id);
      const customer = await models.Customer.findByPk(customer_id);
      if (
        reward &&
        (!reward.canCustomerUse || (await reward.canCustomerUse(customer_id)))
      ) {
        if (reward.type === "coupon") {
          const { coupon } = await reward.generateCoupon(customer_id, {
            coupon_validity_days: survey.coupon_validity_days,
            metadata: {
              source: "survey_response",
              survey_id: survey.id,
              response_id: newSurveyResponse.id,
            },
          });
          rewardData = { type: "coupon", details: coupon };
        } else if (reward.type === "wheel_spin") {
          rewardData = {
            type: "wheel_spin",
            details: { message: "Você ganhou um giro na roleta!" },
          };
        }
      }
    }

    return { responseId: newSurveyResponse.id, reward: rewardData };
  };

  const linkCustomerToResponse = async (responseId, customer_id) => {
    const surveyResponse = await models.SurveyResponse.findByPk(responseId, {
      include: [
        {
          model: models.Survey,
          as: "survey",
          include: [{ model: models.Reward, as: "reward" }],
        },
      ],
    });

    if (!surveyResponse) {
      throw new NotFoundError("Resposta da pesquisa não encontrada.");
    }

    if (surveyResponse.customer_id) {
      throw new BadRequestError(
        "Esta resposta já está vinculada a um cliente.",
      );
    }

    await surveyResponse.update({ customer_id });

    const { survey } = surveyResponse;
    let rewardData = null;

    if (survey && survey.reward_id) {
      const reward = survey.reward;
      if (
        reward &&
        (!reward.canCustomerUse || (await reward.canCustomerUse(customer_id)))
      ) {
        if (reward.type === "coupon") {
          const { coupon } = await reward.generateCoupon(customer_id, {
            coupon_validity_days: survey.coupon_validity_days,
            metadata: {
              source: "survey_response_linked",
              survey_id: survey.id,
              response_id: surveyResponse.id,
            },
          });
          rewardData = { type: "coupon", details: coupon };
        } else if (reward.type === "wheel_spin") {
          rewardData = {
            type: "wheel_spin",
            details: { message: "Você ganhou um giro na roleta!" },
          };
        }
      }
    }

    const customer = await models.Customer.findByPk(customer_id);
    if (customer) {
      await customer.updateStats();
      await customer.update({
        last_survey_id: survey.id,
        last_survey_completed_at: new Date(),
      });
    }

    return { reward: rewardData };
  };

  return {
    getNextSurvey,
    getPublicSurveyBySlugs,
    submitSurveyResponses,
    linkCustomerToResponse,
  };
};
