const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary'); // using your existing multer-cloudinary config
const { addBanners, getBanners } = require('../controllers/bannerController');

// Upload multiple banner images
router.post('/add-banner', upload.array('images'), addBanners);

// Get banner images
router.get('/get-banner', getBanners);

module.exports = router;
