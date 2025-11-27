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
const astrologerUploads = upload.array("files", 10); // allow up to 10 files


module.exports = {
  upload,
  astrologerUploads
};
