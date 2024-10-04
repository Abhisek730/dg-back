const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require("cors");
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require("./routes/categoryRoutes");
const checkoutRoutes = require("./routes/checkOutRoutes")
const paymentRoutes = require('./routes/paymentRoutes');


dotenv.config();

const app = express();
const port = process.env.PORT || 3007;

// Middleware
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log(process.env.PORT);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Session setup
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Use secure: true in production for HTTPS
}));

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api/checkout",checkoutRoutes)
app.use('/api/payment', paymentRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
