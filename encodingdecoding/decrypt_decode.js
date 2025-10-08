const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const secretKey = process.env.SECRET_KEY;
if (!secretKey || Buffer.from(secretKey, 'hex').length !== 32) {
  throw new Error('Invalid or missing SECRET_KEY in .env file. Must be a 32-byte hex string.');
}

const ivHex = fs.readFileSync(path.join(__dirname, 'iv.txt'), 'utf-8');
const iv = Buffer.from(ivHex, 'hex');
const encryptedContent = fs.readFileSync(path.join(__dirname, 'output.json'), 'utf-8');

try {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
  let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  const jsonData = JSON.parse(decrypted);
  const decodedContent = jsonData.content
    .replace(/{SPACE}/g, ' ')
    .replace(/{TAB}/g, '\t')
    .replace(/{NEWLINE}/g, '\n');
  fs.writeFileSync(path.join(__dirname, 'restored.html'), decodedContent, 'utf-8');
  console.log('HTML file restored: encodingdecoding/restored.html');
} catch (error) {
  console.error('Error decrypting or decoding:', error.message);
}