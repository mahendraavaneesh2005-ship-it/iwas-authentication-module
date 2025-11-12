// Example Mongoose schema for InsuranceApplication

const mongoose = require('mongoose');

const insuranceApplicationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  vehicleMake: String,
  vehicleModel: String,
  vehicleYear: Number,
  vin: String,
  coverageType: String,
  coverageAmount: Number,
  deductible: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InsuranceApplication', insuranceApplicationSchema);
