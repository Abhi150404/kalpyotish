const express = require("express");
const router = express.Router();

const {
  createAstrologer,
  getAllAstrologers,
  getAstrologer,
  updateAstrologer,
  deleteAstrologer
} = require("../controllers/astrologerController_2");

const { astrologerUploads } = require('../utilis/cloudinary');
// CREATE (Registration)
router.post("/register", astrologerUploads, createAstrologer);

// READ
router.get("/all", getAllAstrologers);
router.get("/single/:id", getAstrologer);

// UPDATE
router.put("/update/:id", astrologerUploads, updateAstrologer);

// DELETE
router.delete("/delete/:id", deleteAstrologer);

module.exports = router;
