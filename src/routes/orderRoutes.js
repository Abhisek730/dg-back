const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Payment = require('../models/Payment');

// ROUTE: Get Order by ID with all user, items, and payment details manually fetched
router.get('/order/:id', async (req, res) => {
    try {
        const orderId = req.params.id;

        // Fetch the order by ID without using populate
        const order = await Order.findById(orderId).lean(); // Convert to plain JS object

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Manually fetch user details
        const user = await User.findById(order.userId).lean();
        const userData = user ? {
            _id: user._id,
            name: user.name,
            email: user.email,
            // Add other user fields as needed
        } : null;

        // Manually fetch payment details if paymentId exists
        let paymentData = null;
        if (order.paymentId) {
            const payment = await Payment.findById(order.paymentId).lean();
            paymentData = payment ? {
                _id: payment._id,
                amount: payment.amount,
                status: payment.status,
                // Add other payment fields as needed
            } : null;
        }

        // Manually fetch product details for each item in the order using custom `product_id`
        const itemsWithProductDetails = await Promise.all(
            order.items.map(async (item) => {
                const product = await Product.findOne({ product_id: item.product_id }).lean(); // Fetch by custom `product_id`

                // Return the item along with product details
                return {
                    ...item, // Include item fields like quantity, optionTitle, etc.
                    productDetails: product 
                };
            })
        );

        // Structure the final order response with all details
        const orderData = {
            _id: order._id,
            userId: userData,
            items: itemsWithProductDetails, // Replace items with items including product details
            subtotal: order.subtotal,
            total: order.total,
            status: order.status,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            paymentId: paymentData,
            createdAt: order.createdAt
        };

        // Respond with the manually fetched order details
        res.status(200).json(orderData);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
