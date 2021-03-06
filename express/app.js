"use strict";
const express = require("express");
const path = require("path");
const serverless = require("serverless-http");
const app = express();
const cors = require("cors");
const createError = require("http-errors");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// Importing Routes
const indexRouter = require("../routes/index");
const usersRouter = require("../routes/users");
const profileRouter = require("../routes/profile");
const favoriteRouter = require("../routes/favorite");
const bookmarkRouter = require("../routes/bookmark");

// Import mongoose Key
const uri = require("../config/keys").mongoURI;

// Mongoose setup
mongoose
  .connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Passport Middleware
app.use(passport.initialize());

// Passport Config
require("../config/passport")(passport);

app.use(logger("dev"));
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS Middleware
app.use(cors());

// Use routes
app.use("/", indexRouter);
app.use("/.netlify/functions/app/", indexRouter);
app.use("/.netlify/functions/app/users", usersRouter);
app.use("/.netlify/functions/app/profile", profileRouter);
app.use("/.netlify/functions/app/favorite", favoriteRouter);
app.use("/.netlify/functions/app/bookmark", bookmarkRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ err: "Page Not Found" });
});

app.use("/", (req, res) => res.sendFile(path.join(__dirname, "../index.html")));

module.exports = app;
module.exports.handler = serverless(app);
