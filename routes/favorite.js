const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Favorite Input Validation
const validateFavoriteInput = require("../validation/favorite");

// Load User Model
const User = mongoose.model("users");

// Load Favorite Model
const Favorite = require("../models/Favorite");

// @route   GET /favorite/test
// @desc    Test favorite route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Favorites works" }));

// @route   GET /favorite/all
// @desc    Get all current user favorites
// @access  Private
router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    const { user } = req;
    Favorite.find({ user: user.id })
      .then((favorite) => {
        if (!favorite || favorite.length === 0) {
          errors.noFavorite = "This user does not have a favorite";
          return res.status(404).json(errors);
        }
        return res.json(favorite);
      })
      .catch((err) => res.status(404).json(err));
  }
);

// @route   POST /favorite
// @desc    Create user favorite
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateFavoriteInput(req.body);

    // Check Validation
    if (!isValid) return res.status(400).json(errors);

    const { alias, image_uri, title, time_ms, manga_id } = req.body;

    Favorite.findById(manga_id).then((favorite) => {
      errors.favoriteExists = "Favorite already exists";
      if (favorite) return res.status(400).json(errors);

      new Favorite({
        user: req.user.id,
        alias,
        image_uri,
        title,
        time_ms,
      })
        .save()
        .then((favorite) => res.json(favorite))
        .catch((err) =>
          res.json({ err, favorite: "Unable to save this user favorite" })
        );
    });
  }
);

// @route   DELETE /favorite/
// @desc    Delete user favorite by manga_id
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user.id).then((user) => {
      Favorite.findById(req.body.manga_id)
        .then((favorite) => {
          // Check favorite owner
          if (user._id.toString() === favorite.user.toString()) {
            Favorite.findByIdAndDelete(req.body.manga_id)
              .then((favorite) => res.json({ success: true, favorite }))
              .catch((err) =>
                res.status(404).json({
                  noFavoriteFound: "No favorite found with this ID",
                  err,
                })
              );
          } else {
            return res.status(401).json({
              unauthorized: "You are unauthorized to delete this favorite",
            });
          }
        })
        .catch((err) =>
          res
            .status(404)
            .json({ noFavoriteFound: "No favorite found with this ID", err })
        );
    });
  }
);

module.exports = router;
