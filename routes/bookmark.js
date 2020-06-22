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

    const { manga_id, alias, image_uri, title, time_ms, _id } = req.body;

    if (_id) {
      User.findById(req.user.id).then((user) => {
        Bookmark.findById(_id)
          .then((bookmark) => {
            // Check bookmark owner
            if (user._id.toString() === bookmark.user.toString()) {
              Bookmark.findByIdAndDelete(_id)
                .then((bookmark) =>
                  res.json({
                    success: "Successfully removed from bookmarks",
                    bookmark,
                  })
                )
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
    } else {
      Bookmark.find({ manga_id: manga_id }).then((bookmarks) => {
        const oldBookmark = bookmarks.filter(
          (mark) => mark.user.toString() === req.user._id.toString()
        );
        if (oldBookmark.length === 0) {
          new Bookmark({
            user: req.user.id,
            manga_id,
            alias,
            image_uri,
            title,
            time_ms,
          })
            .save()
            .then((bookmark) => res.json(bookmark))
            .catch((err) =>
              res.json({ bookmark: "Unable to save this user bookmark", err })
            );
        } else {
          errors.bookmarkExists = "This bookmark already exists";
          return res.status(400).json(errors);
        }
      });
    }
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
      Bookmark.findById(req.body._id)
        .then((bookmark) => {
          // Check bookmark owner
          if (user._id.toString() === bookmark.user.toString()) {
            Bookmark.findByIdAndDelete(req.body._id)
              .then((bookmark) =>
                res.json({
                  success: "Successfully removed from bookmarks",
                  bookmark,
                })
              )
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
