const mongoose = require("mongoose");

const validGenders = ["male", "female", "other"];

const userSchema = new mongoose.Schema({
  firebaseUID: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  number: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: validGenders,
    set: (val) => val.toLowerCase(),
    validate: {
      validator: function (value) {
        return validGenders.includes(value.toLowerCase());
      },
      message: (props) => `${props.value} is not a valid gender (male, female, other)`,
    },
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);