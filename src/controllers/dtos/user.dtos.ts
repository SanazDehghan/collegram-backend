import { z } from "zod";
import { zodNonEmptyString } from "~/models/common";
import { zodPassword } from "~/models/password.models";
import { zodBearerToken, zodToken } from "~/models/token.models";
import { zodBio, zodEmail, zodUsername } from "~/models/user.models";

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
  token: zodToken,
});

export type ResetPasswordDTO = z.infer<typeof zodSetPasswordDTO>;

export const zodUserInfoDTO = z.object({
  firstName: zodNonEmptyString.optional(),
  lastName: zodNonEmptyString.optional(),
  email: zodEmail.optional(),
  bio: zodBio.optional(),
  isPrivate: z.boolean().optional(),
  password: zodPassword.optional(),
});

export type UserInfoDTO = z.infer<typeof zodUserInfoDTO>;
