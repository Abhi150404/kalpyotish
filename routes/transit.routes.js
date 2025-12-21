const express = require("express");
const router = express.Router();
const transitController = require("../controllers/transit.controller");

router.get("/transits", transitController.getTransits);

module.exports = router;
