const bcrypt = require('bcrypt');
const salt = 10; // 10 rounds of salting for security

async function hashPassword(pwd) {
    return await bcrypt.hash(pwd, salt);
}

async function verifyPassword(pwd, hashedPassword) {
    return await bcrypt.compare(pwd, hashedPassword);
}

module.exports = { hashPassword, verifyPassword };