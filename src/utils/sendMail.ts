import Mail from '../services/emailService';

export async function sendMailUtil({ to, subject, message }: any) {
  Mail.to = to;
  Mail.subject = subject;
  Mail.message = message;
  await Mail.sendMail();
}
