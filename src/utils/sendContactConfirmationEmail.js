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

const sendContactConfirmationEmail = async (email, contactDetails) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email, // Recipient's email
        subject: 'Contact Form Submission Confirmation',
        html: `
            <h1>Thank You for Contacting Us!</h1>
            <p>Your message has been received, and we will get back to you shortly.</p>
            <h3>Contact Details</h3>
            <p><strong>Name:</strong> ${contactDetails.name}</p>
            <p><strong>Email:</strong> ${contactDetails.email}</p>
            <p><strong>Country:</strong> ${contactDetails.country}</p>
            <p><strong>Phone:</strong> ${contactDetails.phone}</p>
            <p><strong>Message:</strong> ${contactDetails.message}</p>
            <p><strong>Page:</strong> ${contactDetails.page}</p>
            <p>Thank you for reaching out!</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Contact confirmation email sent');
    } catch (error) {
        console.error('Error sending contact confirmation email:', error);
    }
};

module.exports = { sendContactConfirmationEmail };
