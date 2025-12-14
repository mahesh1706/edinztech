const crypto = require('crypto');

// Lazy load key to ensure env vars are loaded even if required early
const getEncryptionKey = () => {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    // Consistent derivation
    return process.env.ENCRYPTION_KEY || crypto.createHash('sha256').update(secret).digest('base64').substr(0, 32);
};
const IV_LENGTH = 16; // AES block size

const encrypt = (text) => {
    if (!text) return null;
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
    if (!text) return null;
    const key = getEncryptionKey();
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

const generateUserCode = () => {
    // Format: EDZ-STU-YYYY-XXXXXX
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000); // 6 digit random
    return `EDZ-STU-${year}-${random}`;
};

module.exports = {
    encrypt,
    decrypt,
    generateUserCode
};
