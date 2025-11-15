const mongoose = require('mongoose');

const poojaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String,
  price: { type: Number, required: true }, // NEW FIELD
});

module.exports = mongoose.model('Pooja', poojaSchema);
