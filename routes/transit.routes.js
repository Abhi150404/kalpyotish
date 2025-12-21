const express = require("express");
const router = express.Router();
const transitController = require("../controllers/transit.controller");

router.get("/get-trasnsit", transitController.getTransits);

module.exports = router;
