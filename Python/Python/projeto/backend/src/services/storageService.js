const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'denuncias');

// Garante que a pasta existe ao iniciar
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

async function uploadFile(buffer, originalname) {
  const ext = path.extname(originalname);
  const filename = `${uuidv4()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  fs.writeFileSync(filePath, buffer);

  const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
  const url = `${baseUrl}/uploads/denuncias/${filename}`;

  return { url, filename };
}

async function deleteFile(filename) {
  try {
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (_) {}
}

module.exports = { uploadFile, deleteFile };
