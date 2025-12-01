const express = require("express");
const router = express.Router();

const {
  createAstrologer,
  getAllAstrologers,
  getAstrologer,
  updateAstrologer,
  deleteAstrologer,
  loginAstro,
  sendResetOtp,
  verifyOtpAndResetPassword
} = require("../controllers/astroController");

const { astrologerUploads } = require("../utilis/cloudinary");

// CREATE
router.post("/create", astrologerUploads, createAstrologer);

// GET ALL
router.get("/get", getAllAstrologers);

// GET ONE
router.get("/:id", getAstrologer);

// UPDATE
router.put("/update/:id", astrologerUploads, updateAstrologer);

// DELETE
router.delete("/delete/:id", deleteAstrologer);

router.post("/login", loginAstro);
router.post("/reset/send-otp", sendResetOtp);
router.post("/reset/verify", verifyOtpAndResetPassword);


module.exports = router;
