const admin = require("firebase-admin");
const serviceAccount = require("../kapljyotish.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
