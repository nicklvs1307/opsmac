import { query } from "express-validator";

export const getDashboardOverviewValidation = [
  query("period")
    .optional()
    .isIn(["7d", "30d", "90d", "1y", "all"])
    .withMessage("Período deve ser: 7d, 30d, 90d, 1y ou all"),
];

export const getDashboardAnalyticsValidation = [
  query("start_date")
    .optional()
    .isISO8601()
    .withMessage("Data de início inválida"),
  query("end_date").optional().isISO8601().withMessage("Data de fim inválida"),
  query("granularity")
    .optional()
    .isIn(["day", "week", "month"])
    .withMessage("Granularidade deve ser: day, week ou month"),
];

export const generateReportValidation = [
  query("report_type")
    .isIn(["nps", "satisfaction", "complaints", "trends", "customers"])
    .withMessage(
      "Tipo de relatório deve ser: nps, satisfaction, complaints, trends ou customers",
    ),
  query("format")
    .optional()
    .isIn(["json", "csv"])
    .withMessage("Formato deve ser json ou csv"),
];
