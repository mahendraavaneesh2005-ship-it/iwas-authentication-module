const mongoose = require('mongoose');

const HealthPaymentSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthApplication', required: true },
  userId: { type: String, required: true },
  paymentMethod: String,
  paymentAmount: Number,
  paymentStatus: { type: String, default: 'pending' },
  paidAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthPayment', HealthPaymentSchema);
    