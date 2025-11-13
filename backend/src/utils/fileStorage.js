const path = require('path');
const multer = require('multer');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const uploadPath = path.join(__dirname, '..', '..', UPLOAD_DIR);
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + file.originalname.replace(/\s+/g,'_');
    cb(null, safe);
  }
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

module.exports = { upload, uploadPath };
