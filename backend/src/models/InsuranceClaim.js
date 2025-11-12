const mongoose = require('mongoose');

const insuranceClaimSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  policyId: String,
  incidentDescription: String,
  incidentDate: Date,
  status: { type: String, default: 'submitted' },
  approvedAmount: Number,
  rejectionReason: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InsuranceClaim', insuranceClaimSchema);
