const path = require('path');
const nodeMailer = require('nodemailer');

const ConfirmEmail = require('../../models/ConfirmEmail');
const Users = require('../../models/User');

const { service, user, pass } = require('../../config/mail');
const e = require('express');

function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

module.exports = {
  async confirmation(req, res, next) {
    const val = Math.floor(1000 + Math.random() * 9000);
    const { email } = req.body;
    console.log(email);
    const confirmation = await ConfirmEmail.create({
      email: email,
      code: val,
      deleted_at: null,
    });
    try {
      const transport = nodeMailer.createTransport({
        service,
        auth: {
          user,
          pass,
        },
      });
      var mailOptions = {
        from: 'hangthedj.jukebox@gmail.com',
        to: email,
        subject: 'Hang the DJ',
        text: 'Seu código de confirmação é: ' + val,
      };

      transport.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          return res.status(500);
        } else {
          console.log('Email sent: ' + info.response);
          return res.status(200).json();
        }
      });
    } catch (error) {
      console.error(error);
      next({ error: 'Failed to send confirmation code' });
    }
  },

  async forgotPassword(req, res, next) {
    var randomPwd = randomString(6, process.env.RESET_KEY);
    const { email } = req.body;
    console.log(email);
    try {
      const find_user = await Users.findAll({
        where: {
          email,
          deleted_at: null,
        },
        raw: true,
      });
      const check_user = find_user[0];

      if (check_user && check_user !== undefined && find_user.length > 0) {
        await Users.update(
          { password: randomPwd },
          {
            where: {
              email,
              deleted_at: null,
            },
          }
        );
        const transport = nodeMailer.createTransport({
          service,
          auth: {
            user,
            pass,
          },
        });
        var mailOptions = {
          from: 'hangthedj.jukebox@gmail.com',
          to: email,
          subject: 'Hang the DJ',
          text: 'Sua nova senha é: ' + randomPwd,
        };

        transport.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            return res.status(500);
          } else {
            console.log('Email sent: ' + info.response);
            return res.status(200).json();
          }
        });
      } else {
        res.status(200).json({ error: 'User does not exist' });
      }
    } catch (error) {
      console.error(error);
      next({ error: 'Failed to send confirmation code' });
    }
  },
};
