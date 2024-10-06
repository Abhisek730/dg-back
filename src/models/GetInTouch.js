const mongoose = require('mongoose');

// Define a schema for the contact form submissions
const GetinTuchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    course: { type: String, required: true },
    organization: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GetinTuch', GetinTuchSchema);
