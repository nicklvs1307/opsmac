import { validationResult } from "express-validator";
import BadRequestError from "../utils/errors/BadRequestError.js";

const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Dados inválidos", errors.array());
  }
  next();
};

export default validationHandler;
