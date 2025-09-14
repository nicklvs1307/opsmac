const { validationResult } = require("express-validator");
const { BadRequestError } = require("utils/errors");
const auditService = require("services/auditService");

module.exports = (db) => {
  const customerSegmentationService = require("./customerSegmentation.service")(
    db,
  );

  const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Dados inválidos", errors.array());
    }
  };

  return {
    listSegments: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const segments =
        await customerSegmentationService.listSegments(restaurantId);
      res.json(segments);
    },

    getSegmentById: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const segment = await customerSegmentationService.getSegmentById(
        req.params.id,
        restaurantId,
      );
      res.json(segment);
    },

    createSegment: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const newSegment = await customerSegmentationService.createSegment(
        req.body,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "SEGMENT_CREATED",
        `Segment:${newSegment.id}`,
        { name: newSegment.name },
      );
      res.status(201).json(newSegment);
    },

    updateSegment: async (req, res, next) => {
      handleValidationErrors(req);
      const restaurantId = req.context.restaurantId;
      const updatedSegment = await customerSegmentationService.updateSegment(
        req.params.id,
        req.body,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "SEGMENT_UPDATED",
        `Segment:${updatedSegment.id}`,
        { changes: req.body },
      );
      res.json(updatedSegment);
    },

    deleteSegment: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      await customerSegmentationService.deleteSegment(
        req.params.id,
        restaurantId,
      );
      await auditService.log(
        req.user,
        restaurantId,
        "SEGMENT_DELETED",
        `Segment:${req.params.id}`,
        {},
      );
      res.status(200).json({ message: "Segmento excluído com sucesso." });
    },

    applySegmentationRules: async (req, res, next) => {
      const restaurantId = req.context.restaurantId;
      const result =
        await customerSegmentationService.applySegmentationRules(restaurantId);
      await auditService.log(
        req.user,
        restaurantId,
        "SEGMENTATION_RULES_APPLIED",
        `Restaurant:${restaurantId}`,
        {},
      );
      res.status(200).json(result);
    },
  };
};
