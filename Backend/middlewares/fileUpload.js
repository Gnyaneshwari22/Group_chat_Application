const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../services/s3");

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const timestamp = Date.now();
      cb(null, `uploads/${timestamp}-${file.originalname}`);
    },
  }),
});

module.exports = upload;
