const Banner = require('../models/Banner');
const { v4: uuidv4 } = require('uuid');

// Add banner images (multi-upload)
exports.addBanners = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    console.log("Uploaded Files:", req.files); // 👀 Check output here

    const uploadedImages = req.files.map(file => ({
      _id: uuidv4(),
      url: file.path || file.secure_url // safer
    }));

    let banner = await Banner.findOne();
    if (banner) {
      banner.images.push(...uploadedImages);
      await banner.save();
    } else {
      banner = new Banner({ images: uploadedImages });
      await banner.save();
    }

    res.status(201).json({
      success: true,
      message: 'Banner images uploaded successfully',
      data: banner.images
    });
  } catch (err) {
    console.error('Banner upload error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// Get all banner images
exports.getBanners = async (req, res) => {
  try {
    const banner = await Banner.findOne();
    if (!banner) {
      return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({
      success: true,
      message: 'Banner images fetched successfully',
      data: banner.images
    });
  } catch (err) {
    console.error('Get banners error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
