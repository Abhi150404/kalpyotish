// server.js

require('dotenv').config(); // Load variables from .env

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000; // Default to 3000 if not set

app.get('/', (req, res) => {
  res.send('Server is running on port ' + PORT);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
