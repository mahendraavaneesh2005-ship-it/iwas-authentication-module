const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  policyId: String,
  amount: Number,
  method: String,
  status: String,
  transactionId: String,
  paidAt: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);
