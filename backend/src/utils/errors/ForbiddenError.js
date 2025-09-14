const ApiError = require("./ApiError");

class ForbiddenError extends ApiError {
  constructor(message = "Forbidden", details = null) {
    super(message, 403);
    this.name = "ForbiddenError";
    this.details = details;
  }
}

module.exports = ForbiddenError;
