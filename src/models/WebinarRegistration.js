const mongoose = require('mongoose');

const WebinarRegistrationSchema = new mongoose.Schema({
  webinarTitle: {
    type: String,
    required: true
  },
  webinarDate: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WebinarRegistration', WebinarRegistrationSchema);
