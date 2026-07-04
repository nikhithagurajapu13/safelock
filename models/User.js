const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true,
      unique: true
    },
    otp: String,
    otpExpires: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);