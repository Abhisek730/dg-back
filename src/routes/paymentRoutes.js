const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { sendOrderConfirmationEmail } = require('../utils/sendOrderConfirmationEmail');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

// Route 1: Initiate Payment
router.post('/createPayment', async (req, res) => {
    try {
        const { userId, amount, items } = req.body;

        // Validate input
        if (!userId || !amount || !items || items.length === 0) {
            return res.status(400).json({ success: false, msg: 'Invalid input data' });
        }

        // Create a Razorpay order
        const options = {
            amount: amount * 100, // Amount in paise (Razorpay expects this)
            currency: 'INR',
            receipt: `receipt_order_${new Date().getTime()}`
        };

        razorpayInstance.orders.create(options, async (err, order) => {
            if (!err) {
                // Create a new payment entry in the database
                const newPayment = new Payment({
                    userId,
                    razorpayOrderId: order.id,
                    amount,
                    status: 'created' // Initial status
                });

                await newPayment.save();

                res.status(200).json({
                    success: true,
                    orderId: order.id,
                    amount: amount,
                    key_id: RAZORPAY_ID_KEY
                });
            } else {
                console.error(err);
                res.status(400).json({ success: false, msg: 'Failed to create Razorpay order' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
});

// Route 2: Complete Payment and Create Order
router.post('/completePayment', async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, email } = req.body;

        // Step 1: Find the payment entry by razorpayOrderId
        const payment = await Payment.findOne({ razorpayOrderId });
        if (!payment) return res.status(404).json({ success: false, msg: 'Payment not found' });

        // Step 2: Verify the payment details (assuming Razorpay's signature verification is done here)
        // Add Razorpay signature verification logic here if necessary
        // ...

        // Step 3: Find the user's cart and create the order
        const cart = await Cart.findOne({ userId: payment.userId }).populate('items.product_id');
        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ success: false, msg: 'Cart is empty' });
        }

        // Step 4: Create a new order using the items in the cart
        const newOrder = new Order({
            userId: payment.userId,
            items: cart.items.map(item => ({
                product_id: item.product_id,
                optionTitle: item.optionTitle,
                quantity: item.quantity,
                totalPrice: item.totalPrice
            })),
            subtotal: payment.amount,
            status: 'Completed', // Set order status to completed
            paymentStatus: 'Paid' // Mark payment as paid
        });

        await newOrder.save();

        // Step 5: Clear the user's cart after order creation
        cart.items = [];
        await cart.save();

        // Step 6: Update the payment entry with Razorpay details and set status to 'paid'
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.razorpaySignature = razorpaySignature;
        payment.status = 'paid';
        await payment.save();

        // Step 7: Send the order confirmation email to the user
        const orderDetails = {
            _id: newOrder._id,
            total: newOrder.subtotal,
            items: newOrder.items,
        };

        if (email) {
            await sendOrderConfirmationEmail(email, orderDetails);
        }

        res.status(200).json({ success: true, msg: 'Payment successful, order created, cart cleared, and confirmation email sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
});

module.exports = router;
