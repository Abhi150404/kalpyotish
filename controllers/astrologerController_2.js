// Generate EID: KALP + 4 Digit Random
const generateEID = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `KALP${num}`;
};

// Generate 12 Digit Password
const generatePassword = () => {
  return Math.random().toString().slice(2, 14); // 12 digits
};
const Astrologer = require("../models/AstrologerModel");

exports.createAstrologer = async (req, res) => {
  try {
    const {
      name, age, gender, state, district, city, address,
      speciality, salary, phoneNumber, alternativeNumber,
      email, experience, availability
    } = req.body;

    const profilePhoto = req.files?.profilePhoto?.[0]?.path;
    const bankDocument = req.files?.bankDocument?.[0]?.path;
    const adharCard = req.files?.adharCard?.[0]?.path;
    const panCard = req.files?.panCard?.[0]?.path;

    const eid = generateEID();
    const password = generatePassword();

    const newAstrologer = await Astrologer.create({
      eid,
      password,
      name,
      age,
      gender,
      state,
      district,
      city,
      address,
      speciality,
      salary,
      phoneNumber,
      alternativeNumber,
      email,
      experience,
      availability: JSON.parse(availability), // coming as string
      profilePhoto,
      bankDocument,
      adharCard,
      panCard
    });

    res.status(201).json({
      success: true,
      message: "Astrologer registered successfully",
      eid: eid,
      password: password,
      data: newAstrologer
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getAllAstrologers = async (req, res) => {
  try {
    const data = await Astrologer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAstrologer = async (req, res) => {
  try {
    const data = await Astrologer.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateAstrologer = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.files?.profilePhoto) {
      updateData.profilePhoto = req.files.profilePhoto[0].path;
    }
    if (req.files?.bankDocument) {
      updateData.bankDocument = req.files.bankDocument[0].path;
    }
    if (req.files?.adharCard) {
      updateData.adharCard = req.files.adharCard[0].path;
    }
    if (req.files?.panCard) {
      updateData.panCard = req.files.panCard[0].path;
    }

    if (updateData.availability) {
      updateData.availability = JSON.parse(updateData.availability);
    }

    const updated = await Astrologer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({ success: true, message: "Updated successfully", data: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.deleteAstrologer = async (req, res) => {
  try {
    await Astrologer.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Astrologer deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
