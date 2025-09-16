import BaseError from "./BaseError.js";

class ApiError extends BaseError {
  constructor(message, statusCode = 500) {
    super(message, statusCode);
  }
}

export default ApiError;
