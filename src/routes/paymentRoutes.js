const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User = require("../models/User");
const { sendOrderConfirmationEmail } = require('../utils/sendOrderConfirmationEmail');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;


const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

// ROUTE 1 : Create Order Api Using POST Method http://localhost:4000/api/payment/order
// ROUTE 1 : Create Order Api Using POST Method
router.post('/order', async (req, res) => {
    const { amount, userId, items } = req.body;

    try {
        if (!amount || !items || !userId) {
            return res.status(400).json({ message: "Invalid input data" });
        }

        // Calculate subtotal by summing up the totalPrice of each item
        const subtotal = items.reduce((acc, item) => acc + (item.region_price * item.quantity), 0);

        // Add any shipping and tax here (as an example, flat shipping rate and 5% tax)
        const shipping = 50;
        const tax = subtotal * 0.05;
        const total = subtotal + shipping + tax;

        // Create the order options for Razorpay
        const options = {
            amount: Number(total * 100), // Amount in paise (Razorpay expects this)
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"), // Generate a random receipt number
        };

        // Create the order in Razorpay
        const order = await razorpayInstance.orders.create(options);
        if (!order) {
            return res.status(500).json({ message: "Something Went Wrong!" });
        }

        // Save the order in your database
        const newOrder = new Order({
            userId,
            items: items.map(item => ({
                product_id: item.product_id,
                optionTitle: item.optionTitle,
                quantity: item.quantity,
                region_price: item.region_price,
                totalPrice: item.region_price * item.quantity // Calculate total price per item
            })),
            subtotal: subtotal, // Add subtotal
            total: total, // Add total
            razorpayOrderId: order.id,
            status: 'Pending', // Set order status as 'Pending' until payment is complete
            paymentStatus: 'Not Paid' // Initial payment status
        });

        await newOrder.save();

        // Send the order details to the frontend
        res.status(200).json({ data: order, orderId: newOrder._id });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
        console.log(error);
    }
});



router.post('/verify', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, orderId } = req.body;

    try {
        // Fetch user details using userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create HMAC signature to verify the payment
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
            .update(sign.toString())
            .digest("hex");

        // Verify the authenticity of the payment
        if (expectedSign === razorpay_signature) {
            // Find the order by its ID
            const order = await Order.findById(orderId);
            if (!order) return res.status(404).json({ message: "Order not found" });

            // Step 1: Create a new payment entry in the Payment model
            const payment = new Payment({
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                amount: order.total,
                userId: userId,
                status: 'paid'
            });

            // Save the payment and get the payment ID
            const savedPayment = await payment.save();

            // Step 2: Update the order with the payment ID and mark as completed
            order.paymentStatus = 'Paid';
            order.status = 'Completed';
            order.paymentId = savedPayment._id; // Add the payment ID to the order
            await order.save();

            // Step 3: Clear the user's cart after the order is completed
            const cart = await Cart.findOne({ userId: userId });
            if (cart) {
                cart.items = [];
                await cart.save();
            }

            // Send order confirmation email to the user's email fetched from the database
            await sendOrderConfirmationEmail(user.email, order);

            // Respond with success
            res.json({
                success: true,
                message: "Payment Successfully Verified and Order Completed",
                order
            });
        } else {
            // If the signature is not valid
            res.status(400).json({ message: "Invalid Signature" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
        console.error(error);
    }
});

module.exports = router;
