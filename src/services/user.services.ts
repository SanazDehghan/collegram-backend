import { Password, PasswordHash, generatePasswordHash } from "~/models/password.models";
import { Email, Username, BaseUser, User } from "~/models/user.models";
import { IUserRepo } from "~/repository/user.repo";
import { DuplicateEmailError, InvalidUsernameOrPasswordError, UserNotFound, UsernameTakenError } from "./errors/service.errors";
import { TokenServices } from "./token.services";
import { compare } from "bcrypt";
import { LoginDTO } from "~/controllers/dtos/user.dtos";
import { IPasswordRepo } from "~/repository/password.repo";
import { MailServices } from "./mail.services";
import { UUID } from "crypto";
import { mailConfig } from "~/template/config";
import { InvalidEmailError } from "./errors/service.errors";

export class UserServices {
  constructor(
    private userRepo: IUserRepo,
    private passwordRepo: IPasswordRepo,
    private tokenServices: TokenServices,
    private mailServices: MailServices,
  ) {}

  private createUser(email: Email, username: Username): BaseUser {
    return {
      email,
      username,
      isPrivate: false,
    };
  }

  public async signup(email: Email, username: Username, password: Password) {
    const dbUsername = await this.userRepo.getUserByUsername(username);

    if (dbUsername !== null) {
      throw new UsernameTakenError();
    }

    const dbEmail = await this.userRepo.getUserByEmail(email);

    if (dbEmail) {
      throw new DuplicateEmailError();
    }

    const user = this.createUser(email, username);
    const hash = await generatePasswordHash(password);

    const userId = await this.userRepo.addUserWithPassword(user, hash);

    if (userId === null) {
      throw new Error();
    }

    const token = this.tokenServices.generateToken({ userId }, 24 * 3600);

    return token;
  }

  public async login(loginData: LoginDTO) {
    const user = await this.userRepo.getUserWithPasswordHash(loginData.identifier)

    if (user === null) {
      throw new InvalidUsernameOrPasswordError();
    }
    const passwordHash = user.passwordHash;
    const isPasswordTrue = await compare(loginData.password , passwordHash);

    if (!isPasswordTrue) {
      throw new InvalidUsernameOrPasswordError();
    }

    const token = this.tokenServices.generateToken({ userId: user.id });

    return token;
  }
  // how generateresetPasswordLink
  private generateresetPasswordEmail() {
    return "";
  }

  private createEmailRecoveryPassword(email: Email) {
    const resetPasswordLink = this.generateresetPasswordEmail(); // generate link
    const config = mailConfig(resetPasswordLink);
    return {
      to: email,
      subject: config.subject,
      text: config.text,
    };
  }

  public async sendEmailRecoveryPassword(email: Email) {
    const info = this.createEmailRecoveryPassword(email);
    const result = await this.mailServices.sendMail(info.to, info.subject, info.text);
    return result;
  }
  public async resetPasswordUser(uuid: UUID, password: Password): Promise<boolean> {
    const passwordHash: PasswordHash = await generatePasswordHash(password);
    await this.passwordRepo.editPassword(uuid, passwordHash);
    return true;
  }

  public async getUserInfo(uuid: UUID): Promise<User> {
    const user = await this.userRepo.getUserById(uuid);
    if (user === null) {
      throw new UserNotFound;
    }
    return user;
  }
}
