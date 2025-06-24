const express = require('express');
const router = express.Router();
const { upload } = require('../utilis/cloudinary');  // your multer config
const astrologerController = require('../controllers/astrologerController');

router.post('/register', upload.single('profilePhoto'), registerAstrologer);

// Update profile photo
router.patch('/update-profile/:id', upload.single('profilePhoto'), updateProfilePhoto);

router.get('/all', astrologerController.getAllAstrologers);
router.get('/dropdowns', astrologerController.getDropdownOptions);

router.delete('/delete/:id', astrologerController.deleteAstrologer);
router.patch('/status/:id', astrologerController.updateAvailabilityStatus);
router.patch('/approve/:id', astrologerController.approveAstrologer);


module.exports = router;
