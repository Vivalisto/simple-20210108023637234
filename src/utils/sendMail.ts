import Mail from '../services/emailService';

export async function sendMailUtil({ to, cc, subject, message, from }: any) {
  Mail.from = from;
  Mail.to = to;
  Mail.cc = cc;
  Mail.subject = subject;
  Mail.message = message;
  await Mail.sendMail();
}
