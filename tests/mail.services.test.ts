import { zodEmail } from "~/models/user.models";
import { MailServices } from "~/services/mail.services";

jest.setTimeout(10000);
describe("mailService Test", () => {
  const mailServices = new MailServices();

  beforeEach(() => {});

  afterAll(() => {
    mailServices.closeConnection();
  });

  test("send email successfully!", async () => {
    const to = zodEmail.parse("boley52843@xgh6.com");
    const subject = "Test Email";
    const text = "This is a test email";

    const result = await mailServices.sendMail(to, subject, text);

    expect(result).toHaveProperty("response");
  }, 20000);
});
