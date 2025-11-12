const mongoose = require('mongoose');

const HealthApplicationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fullName: String,
  email: String,
  phone: String,
  dateOfBirth: Date,
  gender: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  height: String,
  weight: String,
  smoker: String,
  alcoholConsumption: String,
  exerciseFrequency: String,
  preExistingConditions: String,
  medications: String,
  familyMedicalHistory: String,
  emergencyContactName: String,
  emergencyContactPhone: String,
  selectedPlanId: String,
  calculatedPremium: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthApplication', HealthApplicationSchema);
