const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create User Bookmark Schema
const BookmarkSchema = new Schema({
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

module.exports = Bookmark = mongoose.model("bookmark", BookmarkSchema);
