import Mail from '../services/emailService';

export async function sendMail(to: string, subject: string, message: string) {
  Mail.to = to;
  Mail.subject = subject;
  Mail.message = message;
  await Mail.sendMail();
}
