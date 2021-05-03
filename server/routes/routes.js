const express = require("express"),
  router = express.Router(),
  { v4: uuidv4 } = require("uuid"),
  multer = require("multer"),
  maxSize = 100 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    let name = file.originalname.split(".");
    const ext = name.pop();
    name = `${name.join("")}-${uuidv4()}.${ext}`;
    cb(null, name);
  },
  limits: { fileSize: maxSize },
});

const upload = multer({ storage });

router.post("/upload-files", upload.array("files"), (req, res) => {
  res.json(req.files);
});

module.exports = router;
