const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { upload } = require('../config/cloudinary');

router.post('/signup', upload.single('profile'), authController.signup);
router.post('/login', authController.login);
router.put('/update/:id', upload.single('profile'), authController.updateUser);

module.exports = router;
