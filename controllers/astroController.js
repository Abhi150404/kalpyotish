const Astrologer = require("../models/astroModel");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// Helper to generate 4-digit random number


// -----------------------------------------------
// Generate EID like KALP1234
// -----------------------------------------------
const generateEID = () => {
  const num = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `KALP${num}`;
};

// -----------------------------------------------
// Generate 12-char system password
// -----------------------------------------------
const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let pass = "";
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

// -----------------------------------------------
// CREATE ASTROLOGER
// -----------------------------------------------
exports.createAstrologer = async (req, res) => {
  try {
    let profilePhoto = null;

    // Cloudinary file check
    if (req.files && req.files.length > 0) {
      const file = req.files.find(f => f.fieldname === "profilePhoto");
      if (file) profilePhoto = file.path;
    }

    // Generate unique EID & password
    const eid = generateEID();
    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newData = {
      ...req.body,
      eid,
      password: hashedPassword,
      isSystemGeneratedPassword: true, // for login flow
      profilePhoto,
      available_at: req.body.available_at
        ? JSON.parse(req.body.available_at)
        : undefined
    };

    const astro = await Astrologer.create(newData);

    res.status(201).json({
      success: true,
      message: "Astrologer created successfully",
      data: {
        ...astro._doc,
        systemPassword: rawPassword // send raw password only once
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// GET ALL
exports.getAllAstrologers = async (req, res) => {
  try {
    const data = await Astrologer.find();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET SINGLE
exports.getAstrologer = async (req, res) => {
  try {
    const data = await Astrologer.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
exports.updateAstrologer = async (req, res) => {
  try {
    let profilePhoto;

    if (req.files && req.files.length > 0) {
      const file = req.files.find(f => f.fieldname === "profilePhoto");
      if (file) profilePhoto = file.path;
    }

    const updateData = {
      ...req.body,
      available_at: req.body.available_at
        ? JSON.parse(req.body.available_at)
        : undefined,
    };

    if (profilePhoto) updateData.profilePhoto = profilePhoto;

    const updated = await Astrologer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
exports.deleteAstrologer = async (req, res) => {
  try {
    await Astrologer.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Astrologer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




// LOGIN (EID / Number + Password)
exports.loginAstro = async (req, res) => {
  try {
    const { eid, number, password } = req.body;

    // Find user
    const astro = await Astrologer.findOne({
      $or: [{ eid }, { number }]
    });

    if (!astro) {
      return res.status(404).json({ success: false, message: "Astrologer not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, astro.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // If first-time login → force password reset
    if (astro.isSystemGeneratedPassword) {
      return res.status(200).json({
        success: true,
        resetRequired: true,
        message: "Password reset required before login",
        eid: astro.eid,
        number: astro.number
      });
    }

    // Generate secure login token (NO JWT)
    const loginToken = crypto.randomBytes(32).toString("hex"); // 64 char token

    // (Optional) save token in DB for session tracking
    astro.loginToken = loginToken;
    await astro.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: loginToken,
      data: astro
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.sendResetOtp = async (req, res) => {
  try {
    const { eid } = req.body;

    const astro = await Astrologer.findOne({ eid });

    if (!astro) {
      return res.status(404).json({ success: false, message: "Astrologer not found" });
    }

    // For now static OTP
    const otp = "1234";

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp: otp // remove this in production
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { eid, otp, newPassword } = req.body;

    if (otp !== "1234") {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const astro = await Astrologer.findOne({ eid });

    if (!astro) {
      return res.status(404).json({ success: false, message: "Astrologer not found" });
    }

    // Encrypt new password
    const hashed = await bcrypt.hash(newPassword, 10);

    astro.password = hashed;
    astro.isSystemGeneratedPassword = false;
    await astro.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
