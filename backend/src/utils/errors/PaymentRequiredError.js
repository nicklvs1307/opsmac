import ApiError from "./ApiError.js";

class PaymentRequiredError extends ApiError {
  constructor(message = "Payment Required", details = null) {
    super(message, 402);
    this.name = "PaymentRequiredError";
    this.details = details;
  }
}

export default PaymentRequiredError;
