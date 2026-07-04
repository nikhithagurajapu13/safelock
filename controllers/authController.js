const User = require("../models/User");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

console.log("authController loaded");

exports.register = async (req, res) => {
  try {
    console.log("Register request received");

    const { username, phone } = req.body;

    if (!username || !phone) {
      return res.status(400).json({
        message: "Username and phone are required"
      });
    }

    let user = await User.findOne({ phone });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (!user) {
      user = new User({
        username,
        phone,
        otp,
        otpExpires: Date.now() + 5 * 60 * 1000
      });
    } else {
      user.username = username;
      user.otp = otp;
      user.otpExpires = Date.now() + 5 * 60 * 1000;
    }

    await user.save();

    await client.messages.create({
      body: `Your SafeLock OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`
    });

    console.log("Register OTP:", otp);

    res.status(200).json({
      message: "OTP sent successfully"
    });
  } catch (err) {
    console.error("Register Error:", err);

    res.status(500).json({
      message: "Registration failed"
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    console.log("OTP verification request received");

    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        message: "Phone and OTP are required"
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("OTP verified successfully for:", phone);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);

    res.status(500).json({
      message: "OTP verification failed"
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("Login request received");

    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required"
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;

    await user.save();

    await client.messages.create({
      body: `Your SafeLock OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`
    });

    console.log("Login OTP:", otp);

    res.status(200).json({
      message: "OTP sent to registered phone number"
    });
  } catch (err) {
    console.error("Login Error:", err);

    res.status(500).json({
      message: "Login failed"
    });
  }
};