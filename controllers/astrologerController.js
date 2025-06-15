const Astrologer = require('../models/Astrologer');

exports.registerAstrologer = async (req, res) => {
  try {
    // Extract image from multer
    const profileImage = req.file?.path || null;

    // Destructure body fields (form-data)
    const {
      name, email, mobileNo,
      astrologer_category, primary_skills, all_skills,
      language, charge_per_minute, report_charges, experience,
      working_hours, app_info, other_platform_selected,
      platform_name,
      highest_qualification,
      qualification_1, qualification_2, qualification_3,
      qualification_4, qualification_5, qualification_6,
      qualification_7, qualification_8, qualification_9,
      qualification_10, qualification_11, qualification_12,
      instagram, facebook, youtube, linkedin,
      assignment_1, assignment_2, assignment_3, assignment_4, assignment_5,
      sunday, monday, tuesday, wednesday, thursday, friday, saturday
    } = req.body;

    const astrologer = new Astrologer({
      name,
      email,
      mobileNo,
      user_profile: profileImage,
      astrologer_category,
      primary_skills,
      all_skills: JSON.parse(all_skills), // expecting array in string format
      language: JSON.parse(language),     // same
      charge_per_minute,
      report_charges,
      experience,
      working_hours,
      app_info,
      other_platform: {
        selected: other_platform_selected === 'true',
        platform_name: other_platform_selected === 'true' ? platform_name : 'no'
      },
      highest_qualification,
      qualification_1,
      qualification_2,
      qualification_3,
      qualification_4,
      qualification_5,
      qualification_6,
      qualification_7,
      qualification_8,
      qualification_9,
      qualification_10,
      qualification_11,
      qualification_12,
      social_media_links: {
        instagram,
        facebook,
        youtube,
        linkedin
      },
      assignment_1,
      assignment_2,
      assignment_3,
      assignment_4,
      assignment_5,
      availability: {
        sunday,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday
      }
    });

    await astrologer.save();

    res.status(201).json({
      message: 'Astrologer registered successfully',
      data: astrologer
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
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


exports.updateAstrologer = async (req, res) => {
  try {
    const { id } = req.params;
    const profileImage = req.file?.path || undefined; // Optional file update

    const updateData = {
      ...req.body,
    };

    // If image provided
    if (profileImage) updateData.user_profile = profileImage;

    // Parse arrays if sent as string
    if (req.body.all_skills) updateData.all_skills = JSON.parse(req.body.all_skills);
    if (req.body.language) updateData.language = JSON.parse(req.body.language);

    // Update nested objects
    updateData.other_platform = {
      selected: req.body.other_platform_selected === 'true',
      platform_name: req.body.other_platform_selected === 'true' ? req.body.platform_name : 'no'
    };

    updateData.social_media_links = {
      instagram: req.body.instagram,
      facebook: req.body.facebook,
      youtube: req.body.youtube,
      linkedin: req.body.linkedin
    };

    updateData.availability = {
      sunday: req.body.sunday,
      monday: req.body.monday,
      tuesday: req.body.tuesday,
      wednesday: req.body.wednesday,
      thursday: req.body.thursday,
      friday: req.body.friday,
      saturday: req.body.saturday
    };

    const updatedAstrologer = await Astrologer.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      message: 'Astrologer updated successfully',
      data: updatedAstrologer
    });
  } catch (err) {
    console.error('Update error:', err);
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
