import ApiError from "./ApiError.js";

class NotFoundError extends ApiError {
  constructor(message = "Recurso não encontrado") {
    super(message, 404);
  }
}

export default NotFoundError;
