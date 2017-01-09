const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const password = 'V01kmann';
const tokenMap = {};

function authorize(req, res) {
  // Check for existence of token.
  const encryptedToken = req.get('Authorization');
  if (!encryptedToken) {
    res.statusMessage = 'Token Reauired';
    res.status(499).send();
    return false;
  }

  const token = decrypt(encryptedToken);
  const [reqUsername] = token.split('|');

  // Check for matching cached token.
  const cachedToken = tokenMap[reqUsername];
  if (!cachedToken || cachedToken !== token) {
    return false;
  }

  // Check for request from a different client IP address.
  const [username, clientIP, timeout] = token.split('|');
  if (req.ip !== clientIP) {
    res.statusMessage = 'Invalid Token';
    res.status(499).send();
    return false;
  }

  // Check for expired token.
  const timeoutMs = Number(timeout);
  if (timeoutMs < Date.now()) {
    res.statusMessage = 'Session Timeout';
    res.status(440).send();
    delete tokenMap[username];
    return false;
  }

  return true;
}

function decrypt(text) {
  const decipher = crypto.createDecipher(algorithm, password);
  return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
}

function deleteToken(req) {
  const encryptedToken = req.get('Authorization');
  const token = decrypt(encryptedToken);
  const [username] = token.split('|');
  delete tokenMap[username];
}

function encrypt(text) {
  const cipher = crypto.createCipher(algorithm, password);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

function generateToken(username, req, res) {
  // Generate a token based username, client ip address, and expiration time.
  const expires = new Date();
  //expires.setMinutes(expires.getMinutes() + 30); // adds 30 minutes
  // Make token expire in 5 seconds for easier testing.
  expires.setSeconds(expires.getSeconds() + 5);

  const token = `${username}|${req.ip}|${expires.getTime()}`;
  const encryptedToken = encrypt(token);
  //const decryptedToken = decrypt(encryptedToken);
  //console.log('index.js login: decryptedToken =', decryptedToken);

  tokenMap[username] = token;

  res.setHeader('Authorization', encryptedToken);
}

module.exports = {authorize, generateToken, deleteToken};
