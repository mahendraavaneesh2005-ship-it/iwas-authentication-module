import mongoose from 'mongoose';

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

export default mongoose.models.InsurancePolicy || mongoose.model('InsurancePolicy', insurancePolicySchema);
