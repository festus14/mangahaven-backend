const createError = require("http-errors");
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const path = require("path");
const serverless = require("serverless-http");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
var router = express.Router();

// Importing Routes
const indexRouter = require("../routes/index");
const usersRouter = require("../routes/users");

const app = express();

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
app.use(express.static(path.join(__dirname, "public")));

// Use routes
app.use("/", indexRouter);
app.use("/users", usersRouter);

router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(
    "<h1>Hello, this is the mangahaven backend please attach '/.netlify/functions/server' to the end of this route</h1>"
  );
  res.end();
});
router.get("/another", (req, res) =>
  res.json({ route: req.originalUrl, info: "another/route" })
);
router.post("/", (req, res) =>
  res.json({ msg: "Success", postBody: req.body })
);

// Configure netlify route
app.use("/.netlify/functions/server", router); // path must route to lambda

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
  res.render("error");
});

module.exports = app;
module.exports.handler = serverless(app);
