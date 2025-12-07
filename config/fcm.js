const admin = require("firebase-admin");
const serviceAccount = require("../kalpjyotish-d1f52-firebase-adminsdk-fbsvc-94699fae64.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
