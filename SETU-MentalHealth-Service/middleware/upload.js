// src/middleware/upload.js
const multer = require("multer");

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_, f, cb) => {
    const ok = /^image\/(png|jpe?g|webp|gif|heic|heif)$/i.test(f.mimetype);
    cb(ok ? null : new Error("Unsupported image type"), ok);
  },
}).single("image"); // field name = image

module.exports = { uploadImage };
