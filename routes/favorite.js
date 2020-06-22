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

    const { manga_id, alias, image_uri, title, time_ms, _id } = req.body;
    if (_id) {
      User.findById(req.user.id).then((user) => {
        Favorite.findById(_id)
          .then((favorite) => {
            // Check favorite owner
            if (user._id.toString() === favorite.user.toString()) {
              Favorite.findByIdAndDelete(_id)
                .then((favorite) =>
                  res.json({
                    success: "Successfully removed from favorites",
                    favorite,
                  })
                )
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
    } else {
      Favorite.find({ manga_id: manga_id }).then((favorites) => {
        const oldFavorite = favorites.filter(
          (fav) => fav.user.toString() === req.user._id.toString()
        );
        if (oldFavorite.length === 0) {
          new Favorite({
            user: req.user.id,
            manga_id,
            alias,
            image_uri,
            title,
            time_ms,
          })
            .save()
            .then((favorite) => res.json(favorite))
            .catch((err) =>
              res.json({ favorite: "Unable to save this user favorite", err })
            );
        } else {
          errors.favoriteExists = "This favorite already exists";
          return res.status(400).json(errors);
        }
      });
    }
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
      Favorite.findById(req.body._id)
        .then((favorite) => {
          // Check favorite owner
          if (user._id.toString() === favorite.user.toString()) {
            Favorite.findByIdAndDelete(req.body._id)
              .then((favorite) =>
                res.json({
                  success: "Successfully removed from favorites",
                  favorite,
                })
              )
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
