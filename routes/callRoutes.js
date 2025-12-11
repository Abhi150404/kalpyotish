const router = require("express").Router();
const CallController = require("../controllers/callController");

router.post("/start", CallController.startCall);
router.post("/update-status", CallController.updateCallStatus);
router.get("/history/:userId", CallController.getCallHistory);

module.exports = router;
