const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

// Create Order Route
router.post('/createOrder', async (req, res) => {
    try {
        const { amount } = req.body; // Expecting amount to be sent in request body
        const options = {
            amount: amount * 100, // Convert amount to paise
            currency: 'INR',
            receipt: `receipt_order_${new Date().getTime()}`
        };

        razorpayInstance.orders.create(options, (err, order) => {
            if (!err) {
                res.status(200).json({
                    success: true,
                    orderId: order.id,
                    amount: amount,
                    key_id: RAZORPAY_ID_KEY
                });
            } else {
                res.status(400).json({ success: false, msg: 'Something went wrong!' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
});

module.exports = router;
