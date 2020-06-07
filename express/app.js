"use strict";
const express = require("express");
const path = require("path");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");
const createError = require("http-errors");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// Importing Routes
const indexRouter = require("../routes/index");
const usersRouter = require("../routes/users");

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Use routes
app.use("/.netlify/functions/app/", indexRouter);
app.use("/.netlify/functions/app/users", usersRouter);

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
