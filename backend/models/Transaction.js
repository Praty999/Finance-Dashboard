const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  description: { type: String, trim: true, default: '' },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Card', 'Bank Transfer', 'NetBanking', 'Wallet', 'Other'], default: 'UPI' },
}, { timestamps: true });

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, description: 'text', category: 'text' });

module.exports = mongoose.model('Transaction', transactionSchema);
