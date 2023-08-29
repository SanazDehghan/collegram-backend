import { UUID } from "crypto";
import { v4 } from "uuid";
import { nonEmptyString } from "~/models/common";
import { Password, PasswordHash } from "~/models/password.models";
import { BaseUser, Email, User, Username } from "~/models/user.models";
import { IUserRepo } from "~/repository/user.repo";
import { mailservice } from "~/services/user.services";
import { UserService } from "~/services/user.services";

class FakeRepo implements IUserRepo {
  private dbUser: User = {
    id: v4() as UUID,
    username: "username" as Username,
    firstName: "first" as nonEmptyString,
    lastName: "last" as nonEmptyString,
    email: "test@email.com" as Email,
    isPrivate: false,
    followers: 20,
    followings: 40,
  };

  async addUserWithPassword(user: BaseUser, passwordHash: PasswordHash) {
    return true
  }

  async getUserById(id: UUID) {
    return this.dbUser.id === id ? this.dbUser : null;
  }

  async getUserByUsername(username: Username) {
    return this.dbUser.username === username ? this.dbUser : null;
  }

  async getUserByEmail(email: Email) {
    return this.dbUser.email === email ? this.dbUser : null;
  }

  async editUser(userId: UUID, editedUser: Partial<BaseUser>) {
    return true;
  }
}

const fakeRepo = new FakeRepo();

const userServices = new UserService(fakeRepo);

describe("Testing reset password Services", () => {
  test("sendResetPasswordEmail", async () => {
    const mail: mailservice = {
      to: "sanazdgh@gmail.com" as Email,
      subject: "Reset Password",
      text: `Dear User,

            You have requested a password reset for your account.
            Please click the link below to reset your password:
        
            Reset Password Link:
        
            If you did not request a password reset, please ignore this email.
        
            Best regards,
            Collegram-Daltonz`
  };
    const testEmail = userServices.createEmailRecoveryPassword("sanazdgh@gmail.com" as Email)
    await expect(testEmail).toMatchObject(mail);

  });


});
