const User = require('../models/UserDetail');
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const emailStore = {};

const { getNextSequenceValue } = require('../utilis/sequenceGenerator');
exports.signup = async (req, res) => {
  try {
    const { name, email, password, gender, city, mobileNo, dateOfBirth, timeOfBirth } = req.body;
    const profile = req.file?.path;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Get the next unique numeric ID for the new user
    const userUid = await getNextSequenceValue('user_uid'); // <-- USE THE FUNCTION

    const newUser = new User({
      uid: userUid, // <-- ASSIGN THE UID
      name,
      email,
      password, // Again, please hash this password!
      gender,
      city,
      mobileNo,
      dateOfBirth,
      timeOfBirth,
      profile,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', data: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};




exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // You need to fetch the user from the database first
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // This is plain text comparison. Very insecure.
    // Use bcrypt.compare(password, user.password) instead.
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // The 'user' object now contains the 'uid' field.
    // Your Flutter app will receive it here.
    res.json({ message: 'Login successful', data: user });

  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};



exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.file) {
      updates.profile = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

    res.json({ message: 'User updated successfully', data: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};


exports.getUserStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const male = await User.countDocuments({ gender: 'male' });
    const female = await User.countDocuments({ gender: 'female' });

    res.status(200).json({
      message: 'User stats fetched successfully',
      data: {
        total,
        male,
        female
      }
    });
  } catch (err) {
    console.error('Admin user stats error:', err);
    res.status(500).json({
      message: 'Failed to fetch user stats',
      error: err.message
    });
  }
};

// ✅ Get all users (for admin)
exports.getUserList = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      message: 'Users fetched successfully',
      data: users
    });
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({
      message: 'Failed to fetch users',
      error: err.message
    });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vikrantbhawani2020@gmail.com",
    pass: "kfcvjpvcsdiixzwh", // App Password
  },
});

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
}

// Send OTP API
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = generateOTP();
  const expires = Date.now() + 5 * 60 * 1000; // valid for 5 mins

  emailStore[email] = { otp, expires, verified: false };

  const mailOptions = {
    from: "vikrantbhawani2020@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your verification OTP is ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
}

// Verify OTP API
exports.verifyOTP = (req, res) =>{
  const { email, otp } = req.body;
  const record = emailStore[email];

  if (!record) return res.status(400).json({ message: "No OTP sent to this email" });

  if (record.verified)
    return res.status(400).json({ message: "Email already verified" });

  if (Date.now() > record.expires)
    return res.status(400).json({ message: "OTP expired" });

  if (record.otp !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  emailStore[email].verified = true;
  res.json({ message: "Email verified successfully" });
}


exports.updateFcmToken = async (req, res) => {
  try {
    const { id } = req.params; // userId
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: "FCM Token is required" });
    }

    const user = await UserDetail.findByIdAndUpdate(
      id,
      { fcmToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "FCM token updated successfully",
      user
    });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// To check if email is verified before registration
// function isEmailVerified(email) {
//   return emailStore[email]?.verified === true;
// }


