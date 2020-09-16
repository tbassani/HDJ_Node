const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../../models/User');
const sequelize = require('sequelize');

const ConfirmEmail = require('../../models/ConfirmEmail');

const authConfig = require('../../config/auth');

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: authConfig.token_exp,
  });
}

module.exports = {
  async create(req, res, next) {
    try {
      const { email, password, code } = req.body;

      const find_user = await Users.findAll({
        where: {
          email,
          deleted_at: null,
        },
      });
      const check_user = find_user[0];

      if (check_user && check_user !== undefined && find_user.length > 0) {
        return res.status(400).json({ error: 'User already registered' });
      }

      const confirmation = await ConfirmEmail.findAll({
        where: {
          email: email,
          code: code,
        },
        order: sequelize.col('created_at'),
      });
      console.log(code);
      if (confirmation && confirmation.length > 0) {
        if (confirmation[0].code !== code) {
          return res.status(400).json({ error: 'Incorrect conformation code' });
        }
      } else {
        return res.status(400).json({ error: 'Incorrect conformation code' });
      }
      const hash = bcrypt.hashSync(password, 10);

      const user = await Users.create({
        email: email,
        password: hash,
      });
      return res.json(user);
    } catch (error) {
      next({ error: 'Registration failed' });
    }
  },

  async signup(req, res, next) {
    try {
      const { email } = req.body;

      const find_user = await Users.findAll({
        where: {
          email,
          deleted_at: null,
        },
      });
      const check_user = find_user[0];

      if (check_user && check_user !== undefined && find_user.length > 0) {
        return res.status(400).json({ error: 'User already registered' });
      }

      const hash = bcrypt.hashSync(password, 10);

      const user = await Users.create({
        email: email,
        password: hash,
      });
      return res.json(user);
    } catch (error) {
      console.error(error);
      next({ error: 'Registration failed' });
    }
  },
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await Users.findAll({
        where: {
          email,
          deleted_at: null,
        },
      });
      const login_user = user[0];

      if (!login_user || login_user === undefined || user.length === 0) {
        return res.status(400).json({ error: 'User not found' });
      }

      if (!(await bcrypt.compare(password, login_user.password))) {
        console.log('400-----------------------------------');
        return res.status(400).json({ error: 'Invalid password' });
      }

      const jwt = generateToken({ id: login_user.id });
      res.status(200).json({
        jwt,
      });
    } catch (error) {
      next(error);
    }
  },
};
