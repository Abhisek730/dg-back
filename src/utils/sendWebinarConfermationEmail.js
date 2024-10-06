const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Store your email password securely
    },
});

const sendWebinarConfirmationEmail = async (email, webinarDetails) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email, // Recipient's email
        subject: 'Webinar Registration Confirmation',
        html: `
            <h1>Thank you for registering for the Webinar!</h1>
            <p>You have successfully registered for the following webinar:</p>
            <h3>${webinarDetails.webinarTitle}</h3>
            <p><strong>Date:</strong> ${webinarDetails.webinarDate}</p>
            <p><strong>Name:</strong> ${webinarDetails.name}</p>
            <p><strong>Country:</strong> ${webinarDetails.country}</p>
            <p><strong>Phone Number:</strong> ${webinarDetails.phoneNumber}</p>
            <p><strong>Company:</strong> ${webinarDetails.company}</p>
            <p><strong>Designation:</strong> ${webinarDetails.designation}</p>
            <p>We look forward to seeing you at the webinar!</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Webinar confirmation email sent');
    } catch (error) {
        console.error('Error sending webinar confirmation email:', error);
    }
};

module.exports = { sendWebinarConfirmationEmail };
