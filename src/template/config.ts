import { string } from "zod";
import { Token } from "~/models/token.models";
import { ProcessManager } from "~/utilities/ProcessManager";

export function mailConfig(resetLink: string) {
  const subject = "Reset Password";
  const text = `Dear User,

    You have requested a password reset for your account.
    Please click the link below to reset your password:

    Reset Password Link:${resetLink}

    If you did not request a password reset, please ignore this email.

    Best regards,
    Collegram-Daltonz`;
  const result = { subject: subject, text: text };
  return result;
}

export function baseUrl(token: Token): string {
  const url = `${ProcessManager.get("BASE_URL").str}/reset-password?token=${token}`;
  return url;
}
