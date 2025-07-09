const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { upload } = require('../utilis/cloudinary');
const { getUserStats } = require('../controllers/authController');

router.post('/signup', upload.single('profile'), authController.signup);
router.post('/login', authController.login);
router.put('/update/:id', upload.single('profile'), authController.updateUser);
router.get('/user-stats', getUserStats);


module.exports = router;
