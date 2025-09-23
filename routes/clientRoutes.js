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

router.get("/:id", clientController.getClientById);

router.put("/update/:id", upload.single("profile"), clientController.updateClient);

// ✅ Delete client by ID
router.delete("delete/:id", clientController.deleteClient);
module.exports = router;
