const Astrologer = require("../models/astroModel");

// Helper to generate 4-digit random number
const generateEID = () => {
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digit
  return `KALP${random}`;
};

// Helper to generate 12-digit random password
const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let pass = "";
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

// CREATE
exports.createAstrologer = async (req, res) => {
  try {
    let profilePhoto = null;

    if (req.files && req.files.length > 0) {
      const file = req.files.find(f => f.fieldname === "profilePhoto");
      if (file) profilePhoto = file.path; // cloudinary URL
    }

    // Generate unique fields
    const eid = generateEID();
    const password = generatePassword();

    const newData = {
      ...req.body,
      eid,
      password,
      profilePhoto,
      available_at: req.body.available_at
        ? JSON.parse(req.body.available_at)
        : undefined
    };

    const astro = await Astrologer.create(newData);

    res.status(201).json({
      success: true,
      message: "Astrologer created successfully",
      data: astro
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
