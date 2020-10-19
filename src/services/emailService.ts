//sendgridkey: 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

import * as nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
const sendGridTransport = require('nodemailer-sendgrid-transport');

import keys from '../config/keys-dev';

class Mail {
  constructor(
    public from: string ,
    public to?: string,
    public cc?: Array<string>,
    public subject?: string,
    public message?: string
  ) {}

  sendMail() {
    let mailOptions: MailOptions = {
      from: this.from || 'noreply@vivalisto.com.br',
      to: this.to,
      cc: this.cc,
      subject: this.subject,
      html: this.message,
    };

    const transporter = nodemailer.createTransport(
      sendGridTransport({
        auth: {
          api_key: keys.apiKeySendgrid,
        },
      })
    );

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return error;
      } else {
        console.log('info', info);
        return 'E-mail enviado com sucesso!';
      }
    });
  }
}

export default new Mail();
