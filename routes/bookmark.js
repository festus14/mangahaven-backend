const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Bookmark Input Validation
const validateBookmarkInput = require("../validation/favorite");

// Load User Model
const User = mongoose.model("users");

// Load Bookmark Model
const Bookmark = require("../models/Bookmark");

// @route   GET /bookmark/test
// @desc    Test bookmark route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Bookmarks works" }));

// @route   GET /bookmark/all
// @desc    Get all current user bookmarks
// @access  Private
router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    const { user } = req;
    Bookmark.find({ user: user.id })
      .then((bookmark) => {
        if (!bookmark || bookmark.length === 0) {
          errors.noBookmark = "This user does not have a bookmark";
          return res.status(404).json(errors);
        }
        return res.json(bookmark);
      })
      .catch((err) => res.status(404).json(err));
  }
);

// @route   POST /bookmark
// @desc    Create user bookmark
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateBookmarkInput(req.body);

    // Check Validation
    if (!isValid) return res.status(400).json(errors);

    const { alias, image_uri, title, time_ms, manga_id } = req.body;

    Bookmark.findById(manga_id).then((bookmark) => {
      errors.bookmarkExists = "Bookmark already exists";
      if (bookmark) return res.status(400).json(errors);

      new Bookmark({
        user: req.user.id,
        alias,
        image_uri,
        title,
        time_ms,
      })
        .save()
        .then((bookmark) => res.json(bookmark))
        .catch((err) =>
          res.json({ err, bookmark: "Unable to save this user bookmark" })
        );
    });
  }
);

// @route   DELETE /bookmark/
// @desc    Delete user bookmark by manga_id
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user.id).then((user) => {
      Bookmark.findById(req.body.manga_id)
        .then((bookmark) => {
          // Check bookmark owner
          if (user._id.toString() === bookmark.user.toString()) {
            Bookmark.findByIdAndDelete(req.body.manga_id)
              .then((bookmark) => res.json({ success: true, bookmark }))
              .catch((err) =>
                res.status(404).json({
                  noBookmarkFound: "No bookmark found with this ID",
                  err,
                })
              );
          } else {
            return res.status(401).json({
              unauthorized: "You are unauthorized to delete this bookmark",
            });
          }
        })
        .catch((err) =>
          res
            .status(404)
            .json({ noBookmarkFound: "No bookmark found with this ID", err })
        );
    });
  }
);

module.exports = router;
