const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../../models/User');
const sequelize = require('sequelize');

const ConfirmEmail = require('../../models/ConfirmEmail');
const Profiles = require('../../models/Profiles');

const authConfig = require('../../config/auth');

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: authConfig.token_exp,
  });
}

module.exports = {
  async create(req, res, next) {
    try {
      console.log('Create new user!');
      const [email, password, code] = req.body;
      console.log(email);
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
        raw: true,
      });
      console.log(code);
      if (confirmation && confirmation.length > 0) {
        if (confirmation[0].code.toString() !== code.toString()) {
          return res.status(400).json({ error: 'Incorrect conformation code' });
        } else {
          console.log('Correct code');
          const hash = bcrypt.hashSync(password, 10);

          const register_user = await Users.create({
            email: email,
            password: hash,
          });
          const jwt = generateToken({ id: register_user.id });
          return res.json({ jwt, register_user });
        }
      } else {
        return res.status(400).json({ error: 'Incorrect conformation code' });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Registration Failed' });
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      console.log(req.body);
      const user = await Users.findAll({
        where: {
          email,
          deleted_at: null,
        },
        raw: true,
      });
      console.log(user);
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
        login_user,
      });
    } catch (error) {
      next(error);
    }
  },
  async getActiveProfile(req, res, next) {
    try {
      const profile = await Profiles.findAll({
        where: {
          user_id: req.user_id,
          active: true,
        },
        raw: true,
      });

      res.status(200).json({
        profile,
      });
    } catch (error) {
      next(error);
    }
  },
  async resetPassword(req, res, next) {
    try {
      const { email, old_password, new_password } = req.body;
      console.log(req.body);
      const user = await Users.findAll({
        where: {
          email,
          deleted_at: null,
        },
        raw: true,
      });
      console.log(user);
      const login_user = user[0];

      if (!login_user || login_user === undefined || user.length === 0) {
        return res.status(400).json({ error: 'User not found' });
      }
      if (old_password === login_user.password) {
        console.log('Update Password');
        const hash = bcrypt.hashSync(new_password, 10);
        await Users.update(
          { password: hash },
          {
            where: {
              email,
              deleted_at: null,
            },
          }
        );
        return res.status(200).json({ success: 'Senha alterada' });
      } else {
        return res.status(400).json({ error: 'Senha incorreta' });
      }
    } catch (error) {
      next(error);
    }
  },
};
