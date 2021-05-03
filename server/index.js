const express = require("express"),
  app = express(),
  port = process.env.PORT || 3000,
  router = require("./routes/routes"),
  cors = require("cors");
require("dotenv").config();

const corsOptions = {
  origin: process.env.DEV_HOST,
  optionsSuccessStatus: 200,
};

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use(cors(corsOptions));

app.use(express.json());

app.use(router);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
