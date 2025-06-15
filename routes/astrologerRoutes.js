const express = require('express');
const router = express.Router();
const { upload } = require('../utilis/cloudinary');  // your multer config
const astrologerController = require('../controllers/astrologerController');

router.post('/register', upload.single('user_profile'), astrologerController.registerAstrologer);
router.get('/all', astrologerController.getAllAstrologers);
router.get('/dropdowns', astrologerController.getDropdownOptions);
router.put('/update/:id', upload.single('user_profile'), astrologerController.updateAstrologer);
router.delete('/delete/:id', astrologerController.deleteAstrologer);

module.exports = router;
