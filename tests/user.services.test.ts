import { UUID } from "crypto";
import { v4 } from "uuid";
import { nonEmptyString } from "~/models/common";
import { Password, PasswordHash } from "~/models/password.models";
import { BaseUser, Email, User, Username } from "~/models/user.models";
import { IUserRepo } from "~/repository/user.repo";
import { DuplicateEmailError, UsernameTakenError } from "~/services/errors/service.errors";
import { UserServices } from "~/services/user.services";

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
}

const fakeRepo = new FakeRepo();

const userServices = new UserServices(fakeRepo);

describe("Testing User Services", () => {
  test("signup", async () => {
    const baseUser: BaseUser = {
      email: "testing@email.com" as Email,
      username: "name" as Username,
      isPrivate: false,
    };
    const password = "pass" as Password;

    await expect(userServices.signup(baseUser.email, baseUser.username, password)).resolves.toBeDefined();

    await expect(userServices.signup("test@email.com" as Email, baseUser.username, password)).rejects.toThrow(
      DuplicateEmailError,
    );

    await expect(userServices.signup(baseUser.email, "username" as Username, password)).rejects.toThrow(
      UsernameTakenError,
    );
  });
});
