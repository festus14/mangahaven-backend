const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create User Favorite Schema
const FavoriteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  manga_id: {
    type: String,
    required: true,
  },
  alias: {
    type: String,
    required: true,
  },
  image_uri: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  time_ms: {
    type: Number,
    required: true,
  },
});

module.exports = Favorite = mongoose.model("favorite", FavoriteSchema);
