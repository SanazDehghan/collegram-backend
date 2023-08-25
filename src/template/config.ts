import { string } from "zod";

export function  mailConfig(resetLink:string){
    const subject = 'Reset Password'
    const text =`Dear User,

    You have requested a password reset for your account.
    Please click the link below to reset your password:

    Reset Password Link:${resetLink}

    If you did not request a password reset, please ignore this email.

    Best regards,
    Collegram-Daltonz`
    const result = {"subject":subject, "text":text}
    return result
}