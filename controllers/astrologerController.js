const Astrologer = require('../models/Astrologer');

exports.registerAstrologer = async (req, res) => {
  try {
    const { name, number, email, experience, skills } = req.body;

    const profilePhoto = req.file?.path || null;

    const astrologer = new Astrologer({
      name,
      number,
      email,
      experience,
      skills: JSON.parse(skills),
      profilePhoto
    });

    await astrologer.save();

    res.status(201).json({
      success: true,
      message: 'Astrologer registered successfully',
      data: astrologer
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Update Profile Photo
exports.updateProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const profilePhoto = req.file?.path || null;

    if (!profilePhoto) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const updated = await Astrologer.findByIdAndUpdate(
      id,
      { profilePhoto },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      data: updated
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};





exports.getAllAstrologers = async (req, res) => {
  try {
    const astrologers = await Astrologer.find();
    res.status(200).json({
      message: 'Astrologers fetched successfully',
      data: astrologers
    });
  } catch (err) {
    console.error('Fetching error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDropdownOptions = async (req, res) => {
  try {
    // Static dropdowns (could also be fetched from DB if needed)
    const dropdownOptions = {
      categories: ['Vedic', 'Tarot', 'Numerology', 'KP', 'Palmistry'],
      skills: ['Love', 'Career', 'Marriage', 'Business', 'Health'],
      languages: ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali'],
      qualifications: [
        'Diploma in Astrology', 'BA Astrology', 'MA Astrology',
        'PhD Astrology', 'Self Taught', 'Others'
      ]
    };

    res.status(200).json({
      message: 'Dropdown options fetched successfully',
      data: dropdownOptions
    });
  } catch (err) {
    console.error('Dropdown error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};





exports.deleteAstrologer = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAstrologer = await Astrologer.findByIdAndDelete(id);

    if (!deletedAstrologer) {
      return res.status(404).json({ message: 'Astrologer not found' });
    }

    res.status(200).json({
      message: 'Astrologer deleted successfully',
      data: deletedAstrologer
    });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.updateAvailabilityStatus = async (req, res) => {
  try {
    const { id } = req.params; // astrologer's _id from URL
    const { status } = req.body; // live or offline

    if (!['live', 'offline'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updated = await Astrologer.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Astrologer not found' });
    }

    res.status(200).json({
      message: `Astrologer status updated to ${status}`,
      data: updated
    });
  } catch (err) {
    console.error('Availability update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.approveAstrologer = async (req, res) => {
  try {
    const { id } = req.params;

    const astrologer = await Astrologer.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (!astrologer) {
      return res.status(404).json({ message: 'Astrologer not found' });
    }

    res.status(200).json({
      message: 'Astrologer approved successfully',
      data: astrologer
    });

  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Get Astrologer By ID
exports.getAstrologerById = async (req, res) => {
  try {
    const { id } = req.params;

    const astrologer = await Astrologer.findById(id);

    if (!astrologer) {
      return res.status(404).json({
        success: false,
        message: 'Astrologer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Astrologer fetched successfully',
      data: astrologer
    });

  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

