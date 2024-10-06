const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Ensure this is configured securely
    },
});

const sendOrderConfirmationEmail = async (email, order) => {
  // Ensure the email is a valid format
  if (!email || !email.trim()) {
      console.error('Invalid email address:', email);
      return;
  }

  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // This should be the recipient email
      subject: 'Order Confirmation',
      html: `
          <h1>Thank you for your order!</h1>
          <p>Your order #${order._id} has been placed successfully.</p>
          <p><strong>Total:</strong> ₹${order.total}</p>
          <p>We will notify you once your order is shipped.</p>
          <h3>Order Details</h3>
          <ul>
              ${order.items && order.items.length > 0 
                  ? order.items.map(item => `
                      <li>
                          ${item.productId.name} - ${item.type} x ${item.quantity} = ₹${item.totalPrice}
                      </li>
                  `).join('')
                  : '<li>No items in the order.</li>'}
          </ul>
      `,
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent');
  } catch (error) {
      console.error('Error sending order confirmation email:', error);
  }
};

module.exports = { sendOrderConfirmationEmail };
