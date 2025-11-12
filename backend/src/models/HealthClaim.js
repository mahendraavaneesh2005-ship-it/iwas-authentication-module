const mongoose = require('mongoose');

const HealthClaimSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthPolicy' },
  claimNumber: String,
  status: { type: String, default: 'submitted' },
  submittedAt: Date,
  reviewedAt: Date,
  reviewedBy: String,
  approvedAmount: Number,
  rejectionReason: String,
  documents: [String],
  treatmentDate: Date,
  hospitalName: String,
  doctorName: String,
  diagnosis: String,
  treatmentDescription: String,
  claimAmount: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('HealthClaim', HealthClaimSchema);
