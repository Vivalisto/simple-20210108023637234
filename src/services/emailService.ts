// import nodemailer from 'nodemailer';

// export const transport = nodemailer.createTransport({
//   host: 'smtp.mailtrap.io',
//   port: 2525,
//   auth: {
//     user: '7891e9b3765660',
//     pass: '650f211fb78a08',
//   },
// });

import * as nodemailer from 'nodemailer';
// import config from '../configs/configs';

class Mail {
  constructor(
    public to?: string,
    public subject?: string,
    public message?: string
  ) {}

  sendMail() {
    let mailOptions = {
      from: 'no-reply@vivalisto.com.br',
      to: this.to,
      subject: this.subject,
      html: this.message,
    };

    const transporter = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '7891e9b3765660',
        pass: '650f211fb78a08',
      },
      tls: { rejectUnauthorized: false },
    });

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return error;
      } else {
        return 'E-mail enviado com sucesso!';
      }
    });
  }
}

export default new Mail();
