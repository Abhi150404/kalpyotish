const router = require("express").Router();
const CallController = require("../controllers/callController");

router.post("/start", CallController.startCall);
router.post("/update-status", CallController.updateCallStatus);
router.get("/history/:userId", CallController.getCallHistory);
router.get("/earnings/:astroId", CallController.getEarnings);


module.exports = router;
