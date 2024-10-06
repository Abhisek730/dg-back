const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Create or update cart
router.post('/', async (req, res) => {
  try {
    const { userId, items } = req.body;

    console
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
      console.log(item)
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


// Get cart by user ID without using populate
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Assuming userId is stored as a string or ObjectId in the Cart schema
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Manually fetch product details for each item in the cart using custom `product_id`
    const cartItemsWithProductDetails = await Promise.all(
      cart.items.map(async (item) => {
        // Fetch product details manually from the Product model using custom `product_id`
        const product = await Product.findOne({ product_id: item.product_id }).lean(); // Use `product_id` as a string

        // Return the merged item with product details
        return {
          ...item.toObject(), // Convert Mongoose document to plain JS object
          productDetails: product, // Add the product details here
        };
      })
    );

    // Send the cart data along with the manually fetched product details
    res.json({
      ...cart.toObject(),
      items: cartItemsWithProductDetails, // Replace items with items including product details
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
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
