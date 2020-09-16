require('dotenv').config();

module.exports = {
  secret: process.env.SECRET,
  refresh_secret: process.env.REFRESH_SECRET,
  refresh_cookie_exp: process.env.REFRESH_COOKIE_EXP,
  refresh_token_exp: process.env.REFRESH_TOKEN_EXP,
  token_exp: process.env.TOKEN_EXP,
};
