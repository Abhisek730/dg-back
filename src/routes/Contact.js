const express = require('express');
const Contact = require('../models/Contact');
const { sendContactConfirmationEmail } = require('../utils/sendContactConfirmationEmail'); // Adjust the path as needed
const router = express.Router();

// POST route for submitting contact form
router.post('/', async (req, res) => {
    const { name, email, country, phone, message, page } = req.body;

    // Validate required fields
    if (!name || !email || !country || !phone || !message || !page) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const newContact = new Contact({
            name,
            email,
            country,
            phone,
            message,
            page
        });

        await newContact.save();

        // Send confirmation email
        await sendContactConfirmationEmail(email, { name, email, country, phone, message, page });

        res.status(201).json({ message: 'Contact information submitted successfully!' });
    } catch (error) {
        console.error('Error saving contact:', error);
        
        // Check if the error is related to validation
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', details: error.errors });
        }
        
        res.status(500).json({ message: 'Error submitting contact information.', error });
    }
});

module.exports = router;
