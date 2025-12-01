const Astrologer = require("../models/astroModel");

// CREATE
exports.createAstrologer = async (req, res) => {
  try {
    let profilePhoto = null;

    if (req.files && req.files.length > 0) {
      const file = req.files.find(f => f.fieldname === "profilePhoto");
      if (file) profilePhoto = file.path; // cloudinary URL
    }

    const newData = {
      ...req.body,
      profilePhoto,
      available_at: req.body.available_at
        ? JSON.parse(req.body.available_at)
        : undefined
    };

    const astro = await Astrologer.create(newData);
    res.status(201).json({ success: true, data: astro });
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
