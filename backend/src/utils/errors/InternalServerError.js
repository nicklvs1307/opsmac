import ApiError from "./ApiError.js";

class InternalServerError extends ApiError {
  constructor(message = "Erro interno do servidor") {
    super(message, 500);
  }
}

export default InternalServerError;
