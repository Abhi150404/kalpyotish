// utils/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: 'dvumlrxml',
  api_key: '437932967899129',
  api_secret: 'Pg4zI1EW8iCdotG29P4jcHFAW4s',
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'astrologers_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => `profile_${Date.now()}_${file.originalname.split('.')[0]}`,
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
