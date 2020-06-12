const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create User Profile Schema
const ProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  location: {
    type: String,
  },
  bio: {
    type: String,
  },
  gender: {
    type: String,
  },
  date_of_birth: {
    type: Date,
  },
  social: {
    twitter: {
      type: String,
    },
    facebook: {
      type: String,
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
