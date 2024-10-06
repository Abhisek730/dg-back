const express = require('express');
const router = express.Router();
const GetInTouch = require('../models/GetInTouch'); // Import the GetInTouch model
const { sendGetInTouchConfirmationEmail } = require('../utils/sendGetInTouchConfirmationEmail'); // Adjust the path as needed

// POST route for handling form submission
router.post('/', async (req, res) => {
    try {
        // Create a new document from the request body
        const getInTouchData = new GetInTouch(req.body);
        
        // Save the data in the database
        await getInTouchData.save();

        // Send confirmation email
        await sendGetInTouchConfirmationEmail(req.body.email, req.body); // Send email to the user

        // Send success response
        res.status(200).json({ message: 'Form submitted successfully!' });
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ message: 'Form submission failed. Please try again.' });
    }
});

module.exports = router;
