const { imageTypes, videoTypes } = require("./mimeTypes");

function bytesToSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

function isImage(f) {
  return (
    f.mimetype &&
    (imageTypes.includes(f.mimetype) || f.mimetype.includes("image"))
  );
}

function isVideo(f) {
  return (
    f.mimetype &&
    (videoTypes.includes(f.mimetype) || f.mimetype.includes("video"))
  );
}

module.exports = {
  bytesToSize,
  isImage,
  isVideo,
};
