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

const sendGetInTouchConfirmationEmail = async (email, contactDetails) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email, // Recipient's email
        subject: 'Get In Touch Confirmation',
        html: `
            <h1>Thank You for Reaching Out!</h1>
            <p>Your message has been received, and we will get back to you shortly.</p>
            <h3>Your Details:</h3>
            <p><strong>Name:</strong> ${contactDetails.name}</p>
            <p><strong>Email:</strong> ${contactDetails.email}</p>
            <p><strong>Course:</strong> ${contactDetails.course}</p>
            <p><strong>Organization:</strong> ${contactDetails.organization}</p>
            <p><strong>Country:</strong> ${contactDetails.country}</p>
            <p><strong>Phone:</strong> ${contactDetails.phone}</p>
            <p><strong>Message:</strong> ${contactDetails.message}</p>
            <p>Thank you for getting in touch!</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Get In Touch confirmation email sent');
    } catch (error) {
        console.error('Error sending Get In Touch confirmation email:', error);
    }
};

module.exports = { sendGetInTouchConfirmationEmail };
