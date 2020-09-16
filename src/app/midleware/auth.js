/* eslint-disable linebreak-style */
const jwt = require('jsonwebtoken');

const authConfig = require('../../config/auth');

module.exports = (req, res, next) => {
  // console.log('MIDDLEWARE BEGIN ----------------------------------------------------------------');

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ error: 'No token provided' });
  }
  const parts = authHeader.split(' ');

  if (!parts.length === 2) {
    res.status(401).send({ error: 'No token error' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    res.status(401).send({ error: 'Token malformated' });
  }

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: 'Invalid token' });
    }
    console.log('JWT OK');
    req.user_id = decoded.id;
    return next();
  });
};
