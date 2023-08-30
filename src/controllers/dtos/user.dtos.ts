import { z } from "zod";
import { zodPassword } from "~/models/password.models";
import { zodBio, zodEmail, zodUsername } from "~/models/user.models";
import { UUID, randomUUID } from "crypto";
import { zodNonEmptyString, zodUUID } from "~/models/common";

export const zodSignupDTO = z.object({
  email: zodEmail,
  username: zodUsername,
  password: zodPassword,
});

const zodIdentifier = z.union([zodEmail, zodUsername]);

export const zodLoginDTO = z.object({
  identifier: zodIdentifier,
  password: zodPassword,
});

export type SignupDTO = z.infer<typeof zodSignupDTO>;

export type LoginDTO = z.infer<typeof zodLoginDTO>;

export const zodSendPasswordResetEmailDTO = z.object({
  identifier: zodIdentifier,
});

export type SendPasswordResetEmailDTO = z.infer<typeof zodSendPasswordResetEmailDTO>;

export const zodSetPasswordDTO = z.object({
  password: zodPassword,
  uuid: zodUUID,
});

export type ResetPasswordDTO = z.infer<typeof zodSetPasswordDTO>;
