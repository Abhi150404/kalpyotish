const admin = require("firebase-admin");
const path = require("path");

// Load Firebase service account JSON securely
const serviceAccountPath = path.join(
  __dirname,
  "keys",
  "kalpjyotish-d1f52-firebase-adminsdk-fbsvc-94699fae64.json"
);

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

module.exports = admin;
