const User = require('../models/UserDetail');

exports.signup = async (req, res) => {
  try {
    const { name, email, gender, city, mobileNo, password } = req.body;
    const profile = req.file?.path;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const newUser = new User({
      name,
      email,
      gender,
      city,
      mobileNo,
      password, // ⚠️ Storing as plain text (not secure)
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

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // No JWT, just return user
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
