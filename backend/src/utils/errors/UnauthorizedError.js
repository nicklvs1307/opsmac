import ApiError from "./ApiError.js";

class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized", details = null) {
    super(message, 401);
    this.name = "UnauthorizedError";
    this.details = details;
  }
}

export default UnauthorizedError;
