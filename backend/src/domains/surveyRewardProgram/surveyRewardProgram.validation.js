import { body } from "express-validator";

export const saveSurveyRewardProgramValidation = [
  body("rewards_per_response")
    .isArray()
    .withMessage("rewards_per_response deve ser um array"),
  body("rewards_per_response.*.response_count")
    .isInt({ min: 1 })
    .withMessage("response_count deve ser um número inteiro positivo"),
  body("rewards_per_response.*.reward_id")
    .isUUID()
    .withMessage("reward_id deve ser um UUID válido"),
  body("rewards_per_response.*.trigger")
    .isIn(["checkin", "survey_completion"])
    .withMessage("trigger deve ser 'checkin' ou 'survey_completion'"),
];
