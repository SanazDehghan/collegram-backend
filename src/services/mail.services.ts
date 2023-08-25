import nodemailer, { Transport, Transporter } from "nodemailer";
import { nonEmptyString } from "~/models/common";
import { Email } from "~/models/user.models";
import { ProcessManager } from "~/utilities/ProcessManager";

class MailService {
  private transporter!: nodemailer.Transporter;

  constructor() {
    this.transporter = this.createConnection();
  }

  //Creating a connection to the mail server, use this method to connect to the mail server
  private createConnection() {
    const transporter = nodemailer.createTransport({
      host: ProcessManager.get("SMTP_HOST").str,
      port: ProcessManager.get("SMTP_PORT").num,
      secure: false,
      auth: {
        user: ProcessManager.get("SMTP_USERNAME").str,
        pass: ProcessManager.get("SMTP_PASSWORD").str,
      },
      tls: {
        minVersion: "TLSv1.2",
      },
    });
    return transporter;
  }

  //sending email, Second step: you can send mail with this method
  async sendMail(email: Email, subject: string, text: string) {
    return this.transporter
      .sendMail({
        from: process.env.SMTP_SMTP_SENDER,
        to: email,
        subject: subject,
        text: text,
      })
      .then((info) => {
        return info;
      });
  }

  //You Can Verify the connection to smtp server
  async verifyConnection() {
    return this.transporter.verify();
  }
}

export const mailService = new MailService();
