const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true }, // Reference to the user's email
  otp: { type: String, required: true }, // The OTP value
  otpExpires: { type: Date, required: true }, // OTP expiration time
  createdAt: { type: Date, default: Date.now, expires: 600 } // Expire the OTP document after 10 minutes
});

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
