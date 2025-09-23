// controllers/clientController.js
const Client = require("../models/Client");

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      gender,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      preferredLanguages,
      concern,
    } = req.body;

    let profileUrl = null;

    if (req.file && req.file.path) {
      profileUrl = req.file.path; // Cloudinary URL from upload middleware
    }

    // Parse preferredLanguages (should be array of objects [{id, name}, {id, name}])
    let parsedLanguages = [];
    if (preferredLanguages) {
      try {
        parsedLanguages = JSON.parse(preferredLanguages);
      } catch (err) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: "preferredLanguages must be a valid JSON array",
        });
      }
    }

    const newClient = new Client({
      name,
      email,
      gender,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      preferredLanguages: parsedLanguages,
      concern,
      profile: profileUrl,
    });

    await newClient.save();

    res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Client registered successfully",
      data: newClient,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
