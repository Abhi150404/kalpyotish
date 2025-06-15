const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer'); // your multer config
const astrologerController = require('../controllers/astrologerController');

router.post('/register', upload.single('user_profile'), astrologerController.registerAstrologer);
router.get('/getAllAstrologer', astrologerController.getAllAstrologers);
router.get('/dropdowns', astrologerController.getDropdownOptions);
router.put('/update/:id', upload.single('user_profile'), astrologerController.updateAstrologer);
router.delete('/delete/:id', astrologerController.deleteAstrologer);

module.exports = router;




s
//--------//
