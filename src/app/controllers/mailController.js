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
    console.log(user);
    console.log(pass);
    const confirmation = await ConfirmEmail.create({
      email: email,
      code: val,
      deleted_at: null,
    });
    try {
      const transport = nodeMailer.createTransport({
        host: service,
        port: 465,
        secure: true, // use SSL
        auth: {
          user,
          pass,
        },
      });
      var mailOptions = {
        from: 'validacao.email@hangthedj.com.br',
        to: email,
        subject: 'Hang the DJ',
        text: 'Seu código de confirmação é: ' + val,
      };

      transport.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log('ERROR');
          console.log(error);
          return res.status(500);
        } else {
          console.log('Email sent: ' + info.response);
          return res.status(200).json();
        }
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Falha ao enviar código' });
    }
  },

  async forgotPassword(req, res, next) {
    var randomPwd = randomString(6, process.env.RESET_KEY);
    const { email } = req.body;
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
        console.log(service);
        const smtpConfig = {
          host: service,
          port: 465,
          secure: true, // use SSL
          auth: {
            user,
            pass,
          },
        };

        const transport = nodeMailer.createTransport(smtpConfig);
        var mailOptions = {
          from: 'validacao.email@hangthedj.com.br',
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
        res.status(400).json({ error: 'Usuário não existe' });
      }
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Falha ao enviar e-mail' });
    }
  },
};
