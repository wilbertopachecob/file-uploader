// @ts-check
const express = require("express"),
  app = express(),
  router = require("./routes/routes"),
  cors = require("cors"),
  morgan = require("morgan"),
  path = require("path"),
  rfs = require("rotating-file-stream");
require("dotenv").config();

const port = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.DEV_HOST || true,
  optionsSuccessStatus: 200,
};

// create a rotating write stream
var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "logs"),
});

// Log to rotating file in production-like envs; log to console in dev for readability
const isProduction = process.env.NODE_ENV === "production";
app.use(
  isProduction
    ? morgan("combined", { stream: accessLogStream })
    : morgan("dev")
);

// Security and static paths
app.disable("x-powered-by");
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads/img", express.static(path.join(__dirname, "uploads", "img")));
app.use("/uploads/misc", express.static(path.join(__dirname, "uploads", "misc")));

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.use(router);

// Centralized error handler
 
app.use((err, req, res, next) => {
  if (!err) return next();
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  if (!isProduction) {
    // Log stack in development for easier debugging
     
    console.error(err);
  }
  res.status(status).json({ error: message });
});

app.listen(port);
