const PhoneAuth = require("../models/PhoneAuth");
const crypto = require("crypto");

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    // ✅ Step 1: Check if phone number already exists in DB
    const existing = await PhoneAuth.findOne({ phone });

    if (existing) {
      // ✅ If already verified before, return existing token
      return res.status(200).json({
        success: true,
        message: "Phone number already verified",
        data: {
          phone: existing.phone,
          token: existing.token,
        },
      });
    }

    // ✅ Step 2: Verify OTP (static mock OTP = 1234)
    if (otp !== "1234") {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ✅ Step 3: Create a JWT-like token (no secret, no expiry)
    const header = Buffer.from(
      JSON.stringify({ alg: "none", typ: "JWT" })
    ).toString("base64url");

    const payload = Buffer.from(
      JSON.stringify({ phone })
    ).toString("base64url");

    const token = `${header}.${payload}.`; // unsigned JWT-style token

    // ✅ Step 4: Save in DB
    const newAuth = new PhoneAuth({ phone, token });
    await newAuth.save();

    // ✅ Step 5: Respond
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        phone,
        token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
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

