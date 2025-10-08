const crypto = require('crypto');
const fs = require('fs');

// Generate a random 32-byte key
const secretKey = crypto.randomBytes(32).toString('hex');
fs.writeFileSync('secret_key.txt', secretKey, 'utf-8');
console.log('Generated Secret Key saved to secret_key.txt:', secretKey);