const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/UserDetail");

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    let user = await User.findOne({ mobileNo: phone });

    if (user && user.isVerified && user.token) {
      return res.status(200).json({
        success: true,
        message: "User already verified",
        token: user.token,
        data: user,
      });
    }

    if (!otp) return res.status(400).json({ success: false, message: "OTP is required" });
    if (otp !== "1234") return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (!user) user = new User({ mobileNo: phone });

    user.isVerified = true;

    // Generate a unique secret per user for JWT
    if (!user.token) {
      const userSecret = crypto.randomBytes(32).toString("hex"); // unique per user
      const token = jwt.sign({ id: user._id }, userSecret, { expiresIn: "7d" });
      user.token = token;
      user.jwtSecret = userSecret; // save this secret to verify token later
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token: user.token,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};





exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Static OTP
    const otp = "1234";

    // Normally here you'd send SMS via Twilio, MSG91, etc.
    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${phone}`,
      otp: otp, // 👈 In real app don’t send OTP in response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

