const path = require('path');
const nodeMailer = require('nodemailer');

const ConfirmEmail = require('../../models/ConfirmEmail');

const { service, user, pass } = require('../../config/mail');
const e = require('express');

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
};
