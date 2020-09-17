require('dotenv').config();

module.exports = {
  service: process.env.MAIL_SERVICE,
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PWD,
};
