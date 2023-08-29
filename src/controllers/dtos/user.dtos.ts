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

const zodLoginByUsername = z.object({
  username: zodUsername,
  password: zodPassword,
});

const zodLoginByEmail = z.object({
  email: zodEmail,
  password: zodPassword,
});

export const zodLoginDTO = z.union([zodLoginByUsername, zodLoginByEmail]);

export type SignupDTO = z.infer<typeof zodSignupDTO>;

export type LoginDTO = z.infer<typeof zodLoginDTO>;

export const zodsendPasswordResetEmailDTO = z.object({
  email: zodEmail,
});

export type SendPasswordResetEmailDTO = z.infer<typeof zodsendPasswordResetEmailDTO>;

export const zodSetPasswordDTO = z.object({
  password: zodPassword,
  uuid: zodUUID,
});

export type ResetPasswordDTO = z.infer<typeof zodSetPasswordDTO>;

export const zodUserInfo = z.object({
  username: zodUsername,
  firstName: zodNonEmptyString.optional(),
  lastName: zodNonEmptyString.optional(),
  email: zodEmail,
  bio: zodBio.optional(),
  profileUrl: zodNonEmptyString.optional(),
  isPrivate: z.boolean(),
  followers: z.number().int(),
  followings: z.number().int(),
})

export type UserInfoDTO = z.infer<typeof zodUserInfo>
