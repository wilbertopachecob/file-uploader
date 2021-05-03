const express = require("express"),
  app = express(),
  router = require("./routes/routes"),
  cors = require("cors"),
  morgan = require("morgan");
require("dotenv").config();

const port = process.env.PORT || 3000,

const corsOptions = {
  origin: process.env.DEV_HOST,
  optionsSuccessStatus: 200,
};

app.use(morgan("combined"));

app.use(express.static("public"));
app.use("/uploads/img", express.static("uploads/img"));
app.use("/uploads/misc", express.static("uploads/misc"));

app.use(cors(corsOptions));

app.use(express.json());

app.use(router);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
