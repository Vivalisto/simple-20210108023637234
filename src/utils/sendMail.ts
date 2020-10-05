import Mail from '../services/emailService';

export async function sendMailUtil({ to, subject, message, from }: any) {
  Mail.from = from;
  Mail.to = to;
  Mail.subject = subject;
  Mail.message = message;
  await Mail.sendMail();
}
