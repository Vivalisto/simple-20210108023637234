//sendgridkey: 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

import * as nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
import sendGridTransport from 'nodemailer-sendgrid-transport';

class Mail {
  constructor(
    public to?: string,
    public subject?: string,
    public message?: string
  ) {}

  sendMail() {
    let mailOptions: MailOptions = {
      from: 'washington.alexandre@vivalisto.com.br',
      to: this.to,
      subject: this.subject,
      html: this.message,
    };

    // const transporter = nodemailer.createTransport({
    //   host: 'smtp.mailtrap.io',
    //   port: 2525,
    //   auth: {
    //     user: '7891e9b3765660',
    //     pass: '650f211fb78a08',
    //   },
    //   tls: { rejectUnauthorized: false },
    // });

    // const transporter = nodemailer.createTransport({
    //   host: 'smtp.sendgrid.net',
    //   port: 465,
    //   auth: {
    //     user: 'apikey',
    //     pass:
    //       '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',
    //   },
    //   tls: { rejectUnauthorized: false },
    // });

    const transporter = nodemailer.createTransport(
      sendGridTransport({
        auth: {
          api_key:
            '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',
        },
      })
    );

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return error;
      } else {
        console.log(info);
        return 'E-mail enviado com sucesso!';
      }
    });
  }
}

export default new Mail();
