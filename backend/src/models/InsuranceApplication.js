import mongoose from 'mongoose';

const insuranceApplicationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  // Vehicle details
  vehicleType: String,
  vehicleMake: String,
  vehicleModel: String,
  vehicleYear: Number,
  vin: String,
  licensePlate: String,
  color: String,
  mileage: Number,
  // Driver details
  driverName: String,
  driverLicense: String,
  driverAge: Number,
  driverExperience: Number,
  // Coverage details
  coverageType: String,
  coverageAmount: Number,
  deductible: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.InsuranceApplication || mongoose.model('InsuranceApplication', insuranceApplicationSchema);
