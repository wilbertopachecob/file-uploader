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
    let dest = path.join(appDir, "uploads");
    if (isVideo(file)) dest = path.join(dest, "video");
    else if (isImage(file)) dest = path.join(dest, "img");
    else dest = path.join(dest, "misc");
    try {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    } catch (e) {
      cb(e);
    }
  },
  filename: function (req, file, cb) {
    // Strip path separators and collapse whitespace
    const safeBase = String(file.originalname || "file")
      .replace(/[\\/]/g, "_")
      .replace(/\s+/g, " ")
      .trim();
    const dotIndex = safeBase.lastIndexOf(".");
    const base = dotIndex > 0 ? safeBase.slice(0, dotIndex) : safeBase;
    const ext = dotIndex > 0 ? safeBase.slice(dotIndex + 1) : (mime.extension(file.mimetype) || "bin");
    const name = `${base}-${uuidv4()}.${ext}`;
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
  const videoPath = path.join(appDir, "uploads", "video", name);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: "Video not found" });
  }

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
  const CHUNK_SIZE = 10 ** 6; // 1MB default chunk size
  const matches = /bytes=(\d+)-(\d*)/.exec(range);
  const start = matches ? Number(matches[1]) : 0;
  const requestedEnd = matches && matches[2] ? Number(matches[2]) : NaN;
  const end = Number.isFinite(requestedEnd)
    ? Math.min(requestedEnd, videoSize - 1)
    : Math.min(start + CHUNK_SIZE, videoSize - 1);

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
