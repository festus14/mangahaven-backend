const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const isEmpty = require("../validation/isEmpty");

// Load Profile Input Validation
const validateProfileInput = require("../validation/profile");

// Load User Model
const User = mongoose.model("users");

// Load Profile Model
const Profile = require("../models/Profile");

// @route   GET /profile/test
// @desc    Test profile route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Profiles works" }));

// @route   GET /profile
// @desc    Get current user profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    const { user } = req;
    Profile.findOne({ user: user.id })
      .populate("user", ["name", "email", "avatar"])
      .then((profile) => {
        if (!profile) {
          errors.noProfile = "This user does not have a profile";
          return res.status(404).json(errors);
        }
        return res.json(profile);
      })
      .catch((err) => res.status(404).json(err));
  }
);

// @route   GET /profile/user/:user_id
// @desc    Get user profile by user ID
// @access  Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "email", "avatar"])
    .then((profile) => {
      if (!profile) {
        errors.noProfile = "This user does not have a profile";
        return res.status(404).json(errors);
      }
      return res.json(profile);
    })
    .catch((err) =>
      res
        .status(404)
        .json({ profile: "This user does not have a profile", err })
    );
});

// @route   POST /profile/
// @desc    Create and Edit user profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) return res.status(400).json(errors);

    const {
      location,
      bio,
      date_of_birth,
      gender,
      twitter,
      facebook,
    } = req.body;
    const profileFields = {};
    profileFields.user = req.user.id;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (date_of_birth) profileFields.date_of_birth = date_of_birth;
    if (gender) profileFields.gender = gender;

    // Social - Add individual social url into model social object
    profileFields.social = {};
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (profile) {
        // If profile exists, Update with profileFields
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then((profile) => res.json(profile));
      } else {
        //   If profile doesn't exist, Create profile
        new Profile(profileFields)
          .save()
          .then((profile) => res.json(profile))
          .catch((err) =>
            res.json({ err, profile: "Unable to save this user profile" })
          );
      }
    });
  }
);

// @route   DELETE /api/profile
// @desc    Delete user profile
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        User.findOneAndRemove({ _id: req.user.id })
          .then(() => ({
            success: true,
          }))
          .catch((err) => res.status(404).json(err));
      })
      .catch((err) => res.status(404).json(err));
  }
);

module.exports = router;
