import { PasswordRepo } from "./password.repo";
import { UserRepo } from "./user.repo";

export const repositories = {
  user: new UserRepo(),
  password: new PasswordRepo(),
}