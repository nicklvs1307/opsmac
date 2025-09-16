import ApiError from "./ApiError.js";

class ForbiddenError extends ApiError {
  constructor(message = "Forbidden", details = null) {
    super(message, 403);
    this.name = "ForbiddenError";
    this.details = details;
  }
}

export default ForbiddenError;
