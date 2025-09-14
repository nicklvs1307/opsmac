const { validationResult } = require("express-validator");
const { BadRequestError } = require("utils/errors");
const auditService = require("services/auditService"); // Import auditService

module.exports = (db) => {
  const feedbackService = require("./feedbacks.service")(db);

  const handleValidation = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  return {
    createFeedback: async (req, res, next) => {
      handleValidation(req);
      const restaurantId = req.context.restaurantId;
      const reqInfo = { ip: req.ip, userAgent: req.get("User-Agent") };
      const { feedback, points_earned } = await feedbackService.createFeedback(
        req.body,
        restaurantId,
        reqInfo,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "FEEDBACK_CREATED",
        `Feedback:${feedback.id}`,
        { rating: feedback.rating, comment: feedback.comment },
      );
      res.status(201).json({
        message: "Feedback criado com sucesso",
        feedback,
        points_earned,
      });
    },

    listFeedbacks: async (req, res, next) => {
      handleValidation(req);
      const restaurantId = req.context.restaurantId;
      const { count, rows } = await feedbackService.listFeedbacks(
        restaurantId,
        req.query,
      );
      res.json({
        feedbacks: rows,
        pagination: {
          current_page: parseInt(req.query.page || 1),
          total_pages: Math.ceil(count / (req.query.limit || 20)),
          total_items: count,
          items_per_page: parseInt(req.query.limit || 20),
        },
      });
    },

    getFeedbackById: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const feedback = await feedbackService.getFeedbackById(
        req.params.id,
        restaurantId,
      );
      res.json({ feedback });
    },

    updateFeedback: async (req, res, next) => {
      handleValidation(req);
      const restaurantId = req.context.restaurantId;
      const updatedFeedback = await feedbackService.updateFeedback(
        req.params.id,
        restaurantId,
        req.user.userId,
        req.body,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "FEEDBACK_UPDATED",
        `Feedback:${updatedFeedback.id}`,
        { updatedData: req.body },
      );
      res.json({
        message: "Feedback atualizado com sucesso",
        feedback: updatedFeedback,
      });
    },

    deleteFeedback: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      await feedbackService.deleteFeedback(
        req.params.id,
        restaurantId,
        req.user,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "FEEDBACK_DELETED",
        `Feedback:${req.params.id}`,
        {},
      );
      res.json({ message: "Feedback deletado com sucesso" });
    },

    respondToFeedback: async (req, res, next) => {
      handleValidation(req);
      const restaurantId = req.context.restaurantId;
      const feedback = await feedbackService.respondToFeedback(
        req.params.id,
        restaurantId,
        req.user.userId,
        req.body.response_text,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "FEEDBACK_RESPONDED",
        `Feedback:${feedback.id}`,
        { responseText: req.body.response_text },
      );
      res.json({ message: "Resposta enviada com sucesso", feedback });
    },

    getFeedbackWordFrequency: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const wordFrequency = await feedbackService.getFeedbackWordFrequency(
        restaurantId,
        req.query,
      );
      res.json(wordFrequency);
    },
  };
};
