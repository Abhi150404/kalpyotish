const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: "astrologers",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    public_id: `file_${Date.now()}_${file.originalname.split(".")[0]}`
  })
});

const upload = multer({ storage });

// MULTIPLE FILES FOR ASTROLOGER
const astrologerUploads = upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "bankDocument", maxCount: 1 },
  { name: "adharCard", maxCount: 1 },
  { name: "panCard", maxCount: 1 }
]);

module.exports = {
  upload,
  astrologerUploads
};
