const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product_id: { type: String, required: true, ref: 'Product' }, // Use product_id
      optionTitle: { type: String, required: true },
      quantity: { type: Number, required: true },
      region_price: { type: String, required: true },
      totalPrice: { type: Number, required: true }
    }
  ],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  paymentMethod: { type: String, default: 'None' },
  paymentStatus: { type: String, default: 'Not Paid' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
