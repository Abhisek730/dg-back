const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product_id: { type: String, required: true, ref: 'Product' }, // Use product_id instead of ObjectId
  optionTitle: { type: String, required: true },
  quantity: { type: Number, required: true },
  region_price: { type: String, required: true },
  totalPrice: { type: Number, required: true }
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [cartItemSchema]
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
