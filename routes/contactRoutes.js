// routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const { createContact, getContacts } = require("../controllers/contactController");

router.post("/add", createContact);
router.get("/get", getContacts);

module.exports = router;
