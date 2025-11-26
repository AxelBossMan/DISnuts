const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.users_phoneKey, 'hex');

// Encrypt and Decrypt functions for phone numbers
let encrypt_phoneNumber = (phone_number) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = cipher.update(phone_number, 'utf-8', 'hex') + cipher.final('hex');

    const ivHex = iv.toString('hex');
    return ivHex + ':' + encrypted;
};

let decrypt_phoneNumber = (val) => {
    const [ivHex, encrypted]= val.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = decipher.update(encrypted, 'hex', 'utf-8') + decipher.final('utf-8');
    return decrypted;
}

module.exports = { encrypt_phoneNumber, decrypt_phoneNumber };