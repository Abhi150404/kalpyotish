const admin = require("../utilis/firebase"); 
const User = require("../models/User");

exports.verifyAndSignup = async (req, res) => {
  const { token, name, number, gender } = req.body;

  if (!token || !name || !number || !gender) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const firebaseUID = decoded.uid;

    // if user already exists
    const existingUser = await User.findOne({ firebaseUID });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Create new user
    const newUser = await User.create({ firebaseUID, name, number, gender });

    return res.status(200).json({ message: "User created successfully", user: newUser });

  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
