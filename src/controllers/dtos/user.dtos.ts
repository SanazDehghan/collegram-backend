import { z } from "zod";
import { zodPassword } from "~/models/password.models";
import { zodEmail, zodUsername } from "~/models/user.models";

export const zodSignupDTO = z.object({
  email: zodEmail,
  username: zodUsername,
  password: zodPassword,
});

export type SignupDTO = z.infer<typeof zodSignupDTO>;
