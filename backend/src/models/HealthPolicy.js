const mongoose = require('mongoose');

const HealthPolicySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthApplication' },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthPlan' },
  policyNumber: String,
  monthlyPremium: Number,
  coverageAmount: Number,
  startDate: Date,
  endDate: Date,
  status: String,
  paymentStatus: String,
  renewalDate: Date,
  renewalReminderSent: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('HealthPolicy', HealthPolicySchema);
