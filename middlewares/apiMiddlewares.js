const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/upload");
  },
  filename: (req, file, cb) => {
    // Check if a file with the same name already exists
    fs.stat(
      `public/upload/${req.cookies.token}.${file.mimetype.split("/")[1]}`,
      (err, stat) => {
        if (err == null) {
          // Find the next available number for the file
          let num = 1;
          while (true) {
            if (
              !fs.existsSync(
                `public/upload/${req.cookies.token}-${num}.${
                  file.mimetype.split("/")[1]
                }`
              )
            ) {
              cb(
                null,
                `${req.cookies.token}-${num}.${file.mimetype.split("/")[1]}`
              );
              break;
            }
            num++;
          }
        } else if (err.code === "ENOENT") {
          // File does not exist, use the token and file extension as the file name
          cb(null, `${req.cookies.token}.${file.mimetype.split("/")[1]}`);
        } else {
          cb(err);
        }
      }
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "text/plain" ||
    file.mimetype === "video/mp4"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

exports.uploader = multer({ storage, fileFilter });

exports.textUploader = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

exports.audioAndImageUploader = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "audio/mp3" ||
      file.mimetype === "audio/mpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, true);
    }
  },
});

exports.audioAndVideoUploader = multer({
  fileStorage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "video/mp4" ||
      file.mimetype === "audio/mp3" ||
      file.mimetype === "audio/mpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

exports.videosUploader = multer({
  fileStorage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "video/mp4" || file.mimetype === "audio/mp3") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});
