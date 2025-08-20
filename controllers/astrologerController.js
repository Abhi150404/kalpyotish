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



exports.loginAstrologer = async (req, res) => {
  try {
    const { loginId } = req.body;

    if (!loginId) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required',
      });
    }

    const astrologer = await Astrologer.findOne({
      $or: [{ email: loginId }, { number: loginId }],
    });

    if (!astrologer) {
      return res.status(404).json({
        success: false,
        message: 'Astrologer not found',
      });
    }

    // If you add password later, verify here

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: astrologer,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
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

exports.getAstrologerStats = async (req, res) => {
  try {
    const total = await Astrologer.countDocuments();
    const active = await Astrologer.countDocuments({ status: 'active' });
    const inactive = await Astrologer.countDocuments({ status: 'inactive' });

    res.status(200).json({
      message: 'Astrologer stats fetched successfully',
      data: {
        total,
        active,
        inactive
      }
    });
  } catch (err) {
    console.error('Admin astrologer stats error:', err);
    res.status(500).json({
      message: 'Failed to fetch astrologer stats',
      error: err.message
    });
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


const { RtcTokenBuilder, RtcRole } = require('agora-access-token');


const APP_ID = "cdb07bd78545426d8f8d94396c1226e3";
const APP_CERTIFICATE = "744e98ca28a243acae8f37d54df011ae";

exports.updateAvailabilityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['live', 'offline'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    let updateData = { status };

    if (status === 'live') {
      // Generate Agora token
      const channelName = id; // astrologer's _id as channel
      const uid = Date.now(); // unique integer user ID
      const role = RtcRole.PUBLISHER;
      const expirationTimeInSeconds = 3600;
      const privilegeExpiredTs = Math.floor(Date.now() / 1000) + expirationTimeInSeconds;

      const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        uid,
        role,
        privilegeExpiredTs
      );

      updateData.agoraToken = token;
      updateData.channelId = channelName;
      updateData.uid = uid;
    } else {
      updateData.agoraToken = null;
      updateData.channelId = null;
      updateData.uid = null;
    }

    // Update astrologer and return full profile
    const updated = await Astrologer.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Astrologer not found' });
    }

    res.status(200).json({
      message: `Astrologer status updated to ${status}`,
      profile: {
        _id: updated._id,
        name: updated.name,
        number: updated.number,
        email: updated.email,
        experience: updated.experience,
        skills: updated.skills,
        profilePhoto: updated.profilePhoto,
        availability: updated.availability,
        charges: updated.charges,
        status: updated.status,
        agoraToken: updated.agoraToken,
        channelId: updated.channelId,
        uid: updated.uid,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
      }
    });

  } catch (err) {
    console.error('Availability update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};





// GET /api/astrologers/live?page=1&limit=20
exports.getLiveAstrologers = async (req, res) => {
  try {
    const page  = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip  = (page - 1) * limit;

    const query = { status: 'live' };

    const [rows, total] = await Promise.all([
      Astrologer.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Astrologer.countDocuments(query),
    ]);

    // Shape each item like the PATCH response's "profile"
    const data = rows.map(a => ({
      _id: a._id,
      name: a.name,
      number: a.number,
      email: a.email,
      experience: a.experience,
      skills: a.skills,
      profilePhoto: a.profilePhoto,
      availability: a.availability,
      charges: a.charges,
      status: a.status,             // "live"
      agoraToken: a.agoraToken,     // present while live
      channelId: a.channelId,       // astrologer _id if you set it that way
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));

    return res.status(200).json({
      message: 'Live astrologers',
      page,
      pageSize: limit,
      total,
      count: data.length,
      profiles: data, // array of "profile" objects identical to PATCH response shape
    });
  } catch (err) {
    console.error('Get live astrologers error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
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



// Update availability status for chat/call/videoCall
exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { chat, call, videoCall } = req.body;

    const astrologer = await Astrologer.findById(id);
    if (!astrologer) {
      return res.status(404).json({ success: false, message: 'Astrologer not found' });
    }

    // Update only provided fields
    if (chat !== undefined) astrologer.availability.chat = chat;
    if (call !== undefined) astrologer.availability.call = call;
    if (videoCall !== undefined) astrologer.availability.videoCall = videoCall;

    await astrologer.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: astrologer.availability
    });

  } catch (err) {
    console.error('Availability update error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

