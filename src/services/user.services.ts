import { Password, generatePasswordHash } from "~/models/password.models";
import { Email, Username, BaseUser } from "~/models/user.models";
import { IUserRepo } from "~/repository/user.repo";
import { DuplicateEmailError, InvalidUsernameOrPasswordError, UsernameTakenError } from "./errors/service.errors";
import { TokenServices } from "./token.services";
import { compare } from "bcrypt";
import { LoginDTO } from "~/controllers/dtos/user.dtos";
import { IPasswordRepo } from "~/repository/password.repo";
import { MailServices } from "./mail.services";

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

  private async loggedInUser(loginData: LoginDTO) {
    const loggedInUser =
      "email" in loginData
        ? await this.userRepo.getUserByEmail(loginData.email)
        : await this.userRepo.getUserByUsername(loginData.username);

    return loggedInUser;
  }

  public async login(loginData: LoginDTO) {
    const loggedInUser = await this.loggedInUser(loginData);

    if (loggedInUser === null) {
      throw new InvalidUsernameOrPasswordError();
    }
    const password = await this.passwordRepo.getPasswordHash(loggedInUser.id);
    const isPasswordTrue = await compare(password ?? "", loginData.password);

    if (!isPasswordTrue) {
      throw new InvalidUsernameOrPasswordError();
    }

    const token = this.tokenServices.generateToken({ userId: loggedInUser.id });

    return token;
  }
  // how generateresetPasswordLink
  private generateresetPasswordEmail() {
    return "";
  }

  private createEmailRecoveryPassword(email: Email) {
    const resetPasswordLink = this.generateresetPasswordEmail(); // generate link
    return {
      to: email,
      subject: "Reset Password",
      text: `Dear User,

          You have requested a password reset for your account.
          Please click the link below to reset your password:
      
          Reset Password Link:${resetPasswordLink}
      
          If you did not request a password reset, please ignore this email.
      
          Best regards,
          Collegram-Daltonz`,
    };
  }

  public async sendEmailRecoveryPassword(email: Email) {
    const info = this.createEmailRecoveryPassword(email);
    const result = await this.mailServices.sendMail(info.to, info.subject, info.text);
    return result;
  }
  async resetPasswordUser(password: string, uuid: string) {}
}
