const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/UserDetail");

// Helper function to generate unique numeric uid


// Helper function to generate unique numeric uid
// This is a basic example; for a high-traffic app, consider more robust ID generation.
const generateUniqueUid = async () => {
  let newUid;
  let isUnique = false;
  while (!isUnique) {
    // Generate a number, for example, based on timestamp and a small random component
    newUid = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
    const existingUser = await User.findOne({ uid: newUid });
    if (!existingUser) {
      isUnique = true;
    }
  }
  return newUid;
};


exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone) return res.status(400).json({ success: false, message: "Phone number is required" });

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

    if (!user) {
      // ✅ Create user and generate UID
      const newUid = await generateUniqueUid(); // Generate UID before creating user
      user = new User({ mobileNo: phone, uid: newUid }); // Assign the generated UID
    }

    user.isVerified = true;

    if (!user.token) {
      const userSecret = crypto.randomBytes(32).toString("hex");
      const token = jwt.sign({ id: user._id }, userSecret, { expiresIn: "7d" });
      user.token = token;
      user.jwtSecret = userSecret; // Ensure jwtSecret is stored if you plan to verify tokens later
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token: user.token,
      data: user,
    });
  } catch (error) {
    console.error("Verification error:", error); // Log the full error for debugging
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
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

