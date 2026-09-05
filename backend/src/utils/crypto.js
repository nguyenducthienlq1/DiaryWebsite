const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';

/**
 * Lấy master key từ biến môi trường.
 * MASTER_ENCRYPTION_KEY phải là chuỗi hex 64 ký tự (32 bytes).
 * Sinh key mẫu: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
function getMasterKey() {
  const keyHex = process.env.MASTER_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('MASTER_ENCRYPTION_KEY phải là chuỗi hex 64 ký tự (32 bytes) trong .env');
  }
  return Buffer.from(keyHex, 'hex');
}

/**
 * Mã hóa plaintext, trả về ciphertext + iv + authTag (đều dạng Buffer)
 * để lưu trực tiếp vào các cột BYTEA/TEXT tương ứng trong bảng diary_entries.
 */
function encrypt(plaintext) {
  const key = getMasterKey();
  const iv = crypto.randomBytes(12); // 12 bytes là khuyến nghị chuẩn cho GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString('base64'),
    iv,
    authTag,
  };
}

/**
 * Giải mã, cần đủ 3 thành phần: ciphertext (base64 string), iv (Buffer), authTag (Buffer)
 */
function decrypt({ ciphertext, iv, authTag }) {
  const key = getMasterKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final(),
  ]);

  return plaintext.toString('utf8');
}

module.exports = { encrypt, decrypt };
