import { IUserRepo } from "~/repository/user.repo"; // Import the interfaces
import { UUID } from "crypto";
import { PasswordHash, zodPassword, zodPasswordHash } from "~/models/password.models";
import { BaseUser, Email, User, UserWithPasswordHash, Username, zodEmail, zodUsername } from "~/models/user.models";
import { UserServices } from "~/services/user.services";
import { v4 } from "uuid";
import { zodUUID } from "~/models/common";
import { PasswordRepo } from "~/repository/password.repo";
import { TokenServices } from "~/services/token.services";
import { MailServices } from "~/services/mail.services";

jest.mock("bcrypt");

class UserRepoMock implements IUserRepo {
  private users: UserWithPasswordHash[] = []; // A storage for mock user data
  constructor() {}
  async addUserWithPassword(user: BaseUser, passwordHash: PasswordHash) {
    const addinguser: UserWithPasswordHash = {
      ...user,
      passwordHash,
      id: zodUUID.parse(v4()),
      followers: 0,
      followings: 0,
    };
    this.users.push(addinguser);
    return addinguser.id;
  }

  async getUserById(id: UUID): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null;
  }

  async getUserByUsername(username: Username): Promise<User | null> {
    return this.users.find((user) => user.username === username) || null;
  }

  async getUserByEmail(email: Email): Promise<User | null> {
    return this.users.find((user) => user.email === email) || null;
  }

  async editUser(userId: UUID, editedUser: Partial<BaseUser>) {
    return false;
  }

  async getUserWithPasswordHash(identifier: Username | Email) {
    const user = this.users.find((user) => user.username === identifier || user.email === identifier);
    if (user !== undefined) {
      return user;
    } else {
      return null;
    }
  }
}

export { UserRepoMock };

describe("User Service login", () => {
  let userService: UserServices;

  it("should return error because of wrong password", async () => {
    const mockUserRepo = new UserRepoMock();
    const passwordRepo = new PasswordRepo();
    const tokensService = new TokenServices();
    const mailService = new MailServices();
    const userService = new UserServices(mockUserRepo, passwordRepo, tokensService, mailService);
    const mockUser: BaseUser = {
      username: zodUsername.parse("test_user"),
      email: zodEmail.parse("test@example.com"),
      isPrivate: false,
    };
    const mockPasswordHash: PasswordHash = zodPasswordHash.parse(
      "PasswordHash888PasswordHash888PasswordHash888PasswordHash888",
    );
    const isUserAdded = await mockUserRepo.addUserWithPassword(mockUser, mockPasswordHash);

    expect(async () => {
      await userService.login({
        identifier: zodUsername.parse("test_user"),
        password: zodPassword.parse("Password88888"),
      });
    }).rejects.toThrow();
  });

  it("should return error beacause this user is not exist", async () => {
    const mockUserRepo = new UserRepoMock();
    const passwordRepo = new PasswordRepo();
    const tokensService = new TokenServices();
    const mailService = new MailServices();
    const userService = new UserServices(mockUserRepo, passwordRepo, tokensService, mailService);
    const mockUser: BaseUser = {
      username: zodUsername.parse("test_user"),
      email: zodEmail.parse("test@example.com"),
      isPrivate: false,
    };
    const mockPasswordHash: PasswordHash = zodPasswordHash.parse(
      "PasswordHash888PasswordHash888PasswordHash888PasswordHash888",
    );
    const isUserAdded = await mockUserRepo.addUserWithPassword(mockUser, mockPasswordHash);

    expect(async () => {
      await userService.login({ identifier: zodUsername.parse("user"), password: zodPassword.parse("Password88888") });
    }).rejects.toThrow();
  });
});
