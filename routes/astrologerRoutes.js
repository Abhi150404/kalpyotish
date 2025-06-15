const express = require('express');
const router = express.Router();
const { registerAstrologer,getAllAstrologers} = require('../controllers/astrologerController');
const { upload } = require('../utilis/cloudinary'); //right speeling

// 'profile' is the name of the image field in form-data
router.post('/register', upload.single('profile'), registerAstrologer);
// GET - All Astrologers
router.get('/getAllAstrologers', getAllAstrologers);
router.get('/dropdowns', astrologerController.getDropdownOptions);
router.put('/update/:id', upload.single('user_profile'), astrologerController.updateAstrologer);
router.delete('/delete/:id', astrologerController.deleteAstrologer);

module.exports = router;
//--------//
