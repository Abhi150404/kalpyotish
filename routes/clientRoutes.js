// routes/clientRoutes.js
const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const { upload } = require("../utilis/cloudinary");

// Signup route
router.post(
  "/signup",
  upload.single("profile"), 
  clientController.signup
);

module.exports = router;
