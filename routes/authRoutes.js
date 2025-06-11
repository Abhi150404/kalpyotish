


const express = require("express");
const router = express.Router();
const { verifyAndSignup } = require("../controllers/authController");

router.post("/signup", verifyAndSignup);

module.exports = router;

