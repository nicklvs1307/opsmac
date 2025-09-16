import ApiError from "./ApiError.js";

class BadRequestError extends ApiError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export default BadRequestError;
