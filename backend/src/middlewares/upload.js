const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) return cb(null, true);
  cb(new Error("Only image files are allowed"));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // সর্বোচ্চ 3 MB
});