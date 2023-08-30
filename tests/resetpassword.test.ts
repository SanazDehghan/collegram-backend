import { UUID } from "crypto";
import { v4 } from "uuid";
import { nonEmptyString } from "~/models/common";
import { Password, PasswordHash } from "~/models/password.models";
import { BaseUser, Email, User, Username } from "~/models/user.models";
import { IPasswordRepo } from "~/repository/password.repo";
import { IUserRepo } from "~/repository/user.repo";
import { MailServices } from "~/services/mail.services";
import { TokenServices } from "~/services/token.services";
import { UserServices } from "~/services/user.services";
import { mailConfig } from "~/template/config";

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
    return this.dbUser.id;
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

  async addNewPasswordUser(userId: UUID, passwordHash: PasswordHash) {
    return true;
  }
}

class FakePass implements IPasswordRepo {


  async getPasswordHash(userId: UUID) {
    return  "test" as PasswordHash ;
  }

  async editPassword(userId: UUID, passwordHash: PasswordHash) {
    return true;
  }
}

const fakeRepo = new FakeRepo();
const fakePass = new FakePass();

const userServices = new UserServices(fakeRepo, fakePass, new TokenServices(), new MailServices());

describe("Testing reset password Services", () => {
  test("reset password", async () => {
    const pass = "Aw12345678" as Password;
    const result = await userServices.resetPasswordUser(v4() as UUID, pass);
    expect(result).toBe(true);
  });
});
