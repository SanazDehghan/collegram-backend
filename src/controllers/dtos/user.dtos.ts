import { z } from "zod";
import { zodPassword } from "~/models/password.models";
import { zodEmail, zodUsername } from "~/models/user.models";

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
