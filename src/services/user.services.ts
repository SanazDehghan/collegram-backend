import { Password, generatePasswordHash } from "~/models/password.models";
import { Email, Username, BaseUser } from "~/models/user.models";
import { IUserRepo } from "~/repository/user.repo";
import { DuplicateEmailError, UsernameTakenError } from "./errors/service.errors";
import { TokenServices } from "./token.services";

export class UserServices {
  constructor(private repository: IUserRepo, private tokenServices: TokenServices) {}

  private createUser(email: Email, username: Username): BaseUser {
    return {
      email,
      username,
      isPrivate: false,
    };
  }

  public async signup(email: Email, username: Username, password: Password) {
    const dbUsername = await this.repository.getUserByUsername(username);

    if (dbUsername !== null) {
      throw new UsernameTakenError();
    }

    const dbEmail = await this.repository.getUserByEmail(email);

    if (dbEmail) {
      throw new DuplicateEmailError();
    }

    const user = this.createUser(email, username);
    const hash = await generatePasswordHash(password);

    const userId = await this.repository.addUserWithPassword(user, hash);

    if (userId === null) {
      throw new Error();
    }

    const token = this.tokenServices.generateToken({ userId }, 24 * 3600);

    return token;
  }
}