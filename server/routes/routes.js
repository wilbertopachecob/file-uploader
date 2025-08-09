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

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.get("/uploads/video/:name", function (req, res) {
  const range = req.headers.range;
  const name = req.params.name;
  const videoPath = `${appDir}/uploads/video/${name}`;

  const videoSize = fs.statSync(videoPath).size;
  const contentType = mime.lookup(videoPath) || "application/octet-stream";

  // If the client did not request a specific range, stream the whole file.
  if (!range) {
    res.writeHead(200, {
      "Content-Length": videoSize,
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
    });
    fs.createReadStream(videoPath).pipe(res);
    return;
  }

  // Parse Range header (e.g., "bytes=32324-")
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  const contentLength = end - start + 1;
  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": contentType,
  });

  fs.createReadStream(videoPath, { start, end }).pipe(res);
});

module.exports = router;
