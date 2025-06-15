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
