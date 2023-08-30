import "dotenv/config";
import { Email } from "~/models/user.models";
import { MailService } from "~/services/mail.service";


require("dotenv").config();
describe("mailService Test", () => {
  it("return an Instance of mailService", () => {
    const mailService = MailService.getInstance();
    expect(mailService).toBeInstanceOf(MailService);
  });

  //make sure that you are not using VPN
  it("send email successfully!", async () => {
    const mailService = MailService.getInstance();
      const to = "sara.njf.ch@gmail.com" as Email;
      const subject = "Test Email";
      const text= "This is a test email";

    await mailService.createConnection();
    const result = await mailService.sendMail(to, subject, text);
    expect(result).toHaveProperty("response");
  });
});

