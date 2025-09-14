const ApiError = require("./ApiError");

class PaymentRequiredError extends ApiError {
  constructor(message = "Payment Required", details = null) {
    super(message, 402);
    this.name = "PaymentRequiredError";
    this.details = details;
  }
}

module.exports = PaymentRequiredError;
