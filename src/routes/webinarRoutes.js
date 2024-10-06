const express = require('express');
const router = express.Router();
const WebinarRegistration = require('../models/WebinarRegistration');  // Importing the model
const { sendWebinarConfirmationEmail } = require('../utils/sendWebinarConfermationEmail'); // Adjust the path as needed

// @route   POST /webinars/register
// @desc    Register a user for a webinar
router.post('/register', async (req, res) => {
  const { webinarTitle, webinarDate, name, email, country, phoneNumber, company, designation } = req.body;

  try {
    // Create a new registration entry
    const newRegistration = new WebinarRegistration({
      webinarTitle,
      webinarDate,
      name,
      email,
      country,
      phoneNumber,
      company,
      designation
    });

    // Save the registration to the database
    await newRegistration.save();

    // Send confirmation email
    await sendWebinarConfirmationEmail(email, { webinarTitle, webinarDate, name, country, phoneNumber, company, designation });

    // Send a success response
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error registering for webinar:', error.message);
    res.status(500).json({ error: 'Server error, please try again later' });
  }
});

module.exports = router;
