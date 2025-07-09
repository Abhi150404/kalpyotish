// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../controllers/adminController');
const { upload } = require('../utilis/cloudinary'); 

// Registration with profile image upload
router.post('/register', upload.single('profile'), registerAdmin);
router.post('/login', loginAdmin);

module.exports = router;
