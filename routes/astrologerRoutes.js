const express = require('express');
const router = express.Router();
const { registerAstrologer } = require('../controllers/astrologerController');
const { upload } = require('../utils/cloudinary');

// 'profile' is the name of the image field in form-data
router.post('/register', upload.single('profile'), registerAstrologer);

module.exports = router;
