// @ts-check
const { isVideo, isImage } = require("../helpers");

const express = require("express"),
  router = express.Router(),
  { v4: uuidv4 } = require("uuid"),
  multer = require("multer"),
  maxSize = 100 * 1024 * 1024,
  path = require("path"),
  appDir = path.dirname(require.main.filename),
  fs = require("fs"),
  mime = require("mime-types");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = "./uploads/";
    switch (true) {
      case isVideo(file):
        dest += "video";
        break;
      case isImage(file):
        dest += "img";
        break;
      default:
        dest += "misc";
        break;
    }
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    let name = file.originalname.split(".");
    const ext = name.pop();
    name = `${name.join("")}-${uuidv4()}.${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage, limits: { fileSize: maxSize } });

router.post("/upload-files", upload.array("files"), (req, res) => {
  res.json(req.files);
});

router.get("/uploads/video/:name", function (req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    return res.status(400).send("Requires Range header");
  }

  const name = req.params.name;
  const videoPath = `${appDir}/uploads/video/${name}`;
  const videoSize = fs.statSync(videoPath).size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": mime.lookup(videoPath) || "application/octet-stream",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

module.exports = router;
