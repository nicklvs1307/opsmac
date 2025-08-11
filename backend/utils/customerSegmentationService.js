const { Op } = require('sequelize');

const calculateRFV = async (customer, models) => {
  let recency = null;
  let frequency = customer.total_orders || 0;
  let monetary = parseFloat(customer.total_spent) || 0;

  // Recency: Days since last purchase/check-in
  if (customer.last_purchase_date) {
    const lastPurchase = new Date(customer.last_purchase_date);
    const now = new Date();
    recency = Math.floor((now - lastPurchase) / (1000 * 60 * 60 * 24));
  }

  // Frequency: total_orders is already updated by checkins.
  // If there was an 'Order' model, we would count orders.

  // Monetary: total_spent is already updated.
  // If there was an 'Order' model, we would sum order totals.

  return { recency, frequency, monetary };
};

const determineNPSSegment = async (customer, models) => {
  // This is a simplified example. A real implementation would fetch
  // survey responses for the customer and calculate their NPS score.
  // For now, we'll assume NPS score is available or can be derived.

  // Placeholder: If customer has recent NPS survey response, use that.
  // Otherwise, default to 'unknown'.
  const latestNpsResponse = await models.SurveyResponse.findOne({
    where: {
      customer_id: customer.id,
    },
    include: [{
      model: models.Survey,
      where: { type: 'nps_only' } // Assuming 'nps_only' type for NPS surveys
    }, {
      model: models.Answer,
      include: [{
        model: models.Question,
        where: { question_type: 'nps' }, // Filter directly on Question model
        attributes: []
      }]
    }],
    order: [['created_at', 'DESC']],
  });

  if (latestNpsResponse && latestNpsResponse.answers.length > 0) {
    const npsAnswer = latestNpsResponse.answers[0]; // Assuming one NPS question per survey
    const score = parseInt(npsAnswer.answer_value, 10);
    if (!isNaN(score)) {
      if (score >= 9) return 'promoter';
      if (score >= 7 && score <= 8) return 'passive';
      if (score >= 0 && score <= 6) return 'detractor';
    }
  }
  return 'unknown';
};

const segmentCustomer = async (customer, models) => {
  const { recency, frequency, monetary } = await calculateRFV(customer, models);
  const npsSegment = await determineNPSSegment(customer, models);

  let finalSegment = 'new'; // Default segment

  // Update RFV scores
  customer.rfv_score = { recency, frequency, monetary };
  customer.nps_segment = npsSegment;

  // RFV-based segmentation (as per your update.txt)
  if (recency !== null && frequency !== null && monetary !== null) {
    if (recency <= 7 && frequency > 5 && monetary >= 500) { // Example thresholds
      finalSegment = 'champion';
    } else if (frequency > 3 && monetary >= 200) {
      finalSegment = 'loyal';
    } else if (recency <= 30 && frequency <= 2) {
      finalSegment = 'promising';
    } else if (recency > 30 && recency <= 90 && frequency >= 1) {
      finalSegment = 'at_risk';
    } else if (recency > 90) {
      finalSegment = 'lost';
    }
  }

  // Override or refine segment based on other criteria
  // Example: If customer has only 1 order and hasn't returned
  if (customer.total_orders === 1 && recency > 30) {
    finalSegment = 'churned_single_purchase';
  }

  // Example: High total spent, regardless of other factors
  if (monetary >= 1000) {
    finalSegment = 'vip';
  }

  // Update customer_segment field
  customer.customer_segment = finalSegment;

  // Update purchase behavior tags (placeholder logic)
  const purchaseBehaviorTags = [];
  if (customer.last_purchase_date) {
    const lastPurchaseDay = new Date(customer.last_purchase_date).getDay(); // 0 = Sunday, 6 = Saturday
    if (lastPurchaseDay === 0 || lastPurchaseDay === 6) {
      purchaseBehaviorTags.push('weekend_shopper');
    }
    const lastPurchaseHour = new Date(customer.last_purchase_date).getHours();
    if (lastPurchaseHour >= 18 || lastPurchaseHour < 6) {
      purchaseBehaviorTags.push('night_shopper');
    }
  }
  customer.purchase_behavior_tags = purchaseBehaviorTags;

  // Update preferred communication channel (placeholder logic)
  // This would ideally come from user preferences or interaction history
  if (customer.whatsapp) {
    customer.preferred_communication_channel = 'whatsapp';
  } else if (customer.email) {
    customer.preferred_communication_channel = 'email';
  } else {
    customer.preferred_communication_channel = 'none';
  }

  // Update location details (placeholder logic)
  // This would require a mechanism to capture and store location data
  if (customer.metadata && customer.metadata.location_data) {
    customer.location_details = {
      neighborhood: customer.metadata.location_data.neighborhood || null,
      city: customer.metadata.location_data.city || null,
      zone: customer.metadata.location_data.zone || null,
      distance_from_store: customer.metadata.location_data.distance || null,
    };
  }

  // Update campaign interaction history (placeholder)
  // This would be populated by tracking campaign interactions
  customer.campaign_interaction_history = customer.campaign_interaction_history || {};

  return customer;
};

module.exports = {
  calculateRFV,
  determineNPSSegment,
  segmentCustomer,
};
