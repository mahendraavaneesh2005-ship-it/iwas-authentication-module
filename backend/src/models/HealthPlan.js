import mongoose from 'mongoose';

const HealthPlanSchema = new mongoose.Schema({
  planName: { type: String, required: true },
  planType: String,
  coverageAmount: Number,
  monthlyPremiumBase: Number,
  annualDeductible: Number,
  copayAmount: Number,
  outOfPocketMax: Number,
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

export default mongoose.models.HealthPlan || mongoose.model('HealthPlan', HealthPlanSchema);
