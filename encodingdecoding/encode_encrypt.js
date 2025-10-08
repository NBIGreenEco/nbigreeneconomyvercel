const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const secretKey = process.env.SECRET_KEY;
if (!secretKey || Buffer.from(secretKey, 'hex').length !== 32) {
  throw new Error('Invalid or missing SECRET_KEY in .env file. Must be a 32-byte hex string.');
}

const iv = crypto.randomBytes(16);
const htmlContent = fs.readFileSync(path.join(__dirname, '../ADMIN/database.html'), 'utf-8');
const encodedContent = htmlContent
  .replace(/\s/g, (match) => {
    if (match === ' ') return '{SPACE}';
    if (match === '\t') return '{TAB}';
    if (match === '\n') return '{NEWLINE}';
    return match;
  });

const jsonContent = {
  metadata: {
    encoding: { space: "{SPACE}", tab: "{TAB}", newline: "{NEWLINE}" },
    description: "HTML content for Database Management page with preserved whitespace"
  },
  content: encodedContent
};

const jsonString = JSON.stringify(jsonContent);
const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
let encrypted = cipher.update(jsonString, 'utf8', 'hex');
encrypted += cipher.final('hex');

fs.writeFileSync(path.join(__dirname, 'output.json'), encrypted, 'utf-8');
fs.writeFileSync(path.join(__dirname, 'iv.txt'), iv.toString('hex'), 'utf-8');
console.log('Encrypted JSON file created: encodingdecoding/output.json');
console.log('IV saved to: encodingdecoding/iv.txt');