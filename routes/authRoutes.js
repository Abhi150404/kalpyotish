


const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");


router.post("/signup", authController.verifyAndSignup);
router.post("/login", authController.loginWithPhone);

module.exports = router;

