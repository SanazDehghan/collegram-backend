import "dotenv/config";
import { Email, zodEmail } from "~/models/user.models";
import { mailService } from "~/services/mail.services";



describe("mailService Test", () => {
 
  //make sure that you are not using VPN
  it("send email successfully!", async () => {
    
      const to = zodEmail.parse("sara.njf.ch@gmail.com");
      const subject = "Test Email";
      const text= "This is a test email";

    const result = await mailService.sendMail(to, subject, text);
    expect(result).toHaveProperty("response");
  });
});

