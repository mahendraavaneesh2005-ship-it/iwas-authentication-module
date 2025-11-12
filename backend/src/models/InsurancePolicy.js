const mongoose = require('mongoose');

const insurancePolicySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  applicationId: String,
  policyNumber: String,
  startDate: Date,
  endDate: Date,
  status: String,
  coverageType: String,
  coverageAmount: Number,
  deductible: Number,
  premium: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InsurancePolicy', insurancePolicySchema);
