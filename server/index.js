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
  origin: process.env.DEV_HOST,
  optionsSuccessStatus: 200,
};

// create a rotating write stream
var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "logs"),
});

app.use(morgan("combined", { stream: accessLogStream }));

app.use(express.static("public"));
app.use("/uploads/img", express.static("uploads/img"));
app.use("/uploads/misc", express.static("uploads/misc"));

app.use(cors(corsOptions));

app.use(express.json());

app.use(router);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
