const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', }, // Required as payments should be linked to orders
  razorpayOrderId: { type: String, }, // Razorpay order ID for reference
  razorpayPaymentId: { type: String }, // Store Razorpay payment ID when payment is made
  razorpaySignature: { type: String }, // Store Razorpay signature for security validation
  
  amount: { type: Number, }, // Amount must be required to ensure it's always specified
  status: { 
    type: String, 
    
    enum: ['created', 'paid', 'failed'], // Restrict to these statuses
    default: 'created' // Default to 'created' when the payment is initiated
  },
  
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date } // Optional field to track updates
});

// Pre-save hook to update the modifiedAt field
paymentSchema.pre('save', function(next) {
  this.modifiedAt = Date.now();
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
