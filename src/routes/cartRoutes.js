const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Create or update cart
router.post('/', async (req, res) => {
  try {
    const { userId, items } = req.body;

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items });
    } else {
      // Merge or update existing items
      items.forEach(item => {
        const existingItem = cart.items.find(cartItem => cartItem.product_id === item.product_id && cartItem.optionTitle === item.optionTitle);
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          cart.items.push(item);
        }
      });
    }

    // Calculate total price for each item and update cart
    for (const item of cart.items) {
      const product = await Product.findOne({ product_id: item.product_id });
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const option = product.trainingOptions.find(opt => opt.title === item.optionTitle);
      if (!option) return res.status(404).json({ error: 'Product option not found' });

      // Use the appropriate price based on region (e.g., India, USD, etc.)
      item.totalPrice = item.quantity * parseFloat(item.region_price.replace(/[^\d.]/g, ''));
    }

    await cart.save();
    res.status(201).json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating cart' });
  }
});

// Get cart by user ID
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.product_id');
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching cart' });
  }
});

// Delete item from cart by product_id and optionTitle
router.delete('/:userId/item/:product_id/:optionTitle', async (req, res) => {
  try {
    const { userId, product_id, optionTitle } = req.params;

    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    // Find the index of the item to be deleted
    const itemIndex = cart.items.findIndex(item =>
      item.product_id === product_id && item.optionTitle === optionTitle
    );

    // If the item is not found, return an error
    if (itemIndex === -1) return res.status(404).json({ error: 'Item not found in cart' });

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error removing item from cart' });
  }
});

module.exports = router;
