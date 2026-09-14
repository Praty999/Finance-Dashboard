const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], default: 'expense' },
  category: { type: String, default: 'Other' },
  frequency: { type: String, enum: ['Weekly', 'Monthly', 'Quarterly', 'Yearly'], default: 'Monthly' },
  nextDue: { type: Date, required: true },
  paymentMethod: { type: String, default: 'UPI' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Recurring', recurringSchema);
