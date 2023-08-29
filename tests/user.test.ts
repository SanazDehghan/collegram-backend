import { IUserRepo } from "~/repository/user.repo"; // Import the interfaces
import { IPasswordRepo } from "~/repository/password.repo";
import { UUID } from "crypto";
import { PasswordHash, zodPassword, zodPasswordHash } from "~/models/password.models";
import { BaseUser, Email, User, Username, zodUsername } from "~/models/user.models";
import { UserServices } from "~/services/user.services";
import { LoginDTO, zodLoginDTO } from "~/controllers/dtos/user.dtos";
import { compare } from "bcrypt";
jest.mock("bcrypt");
class UserRepoMock implements IUserRepo {
  private users: User[] = []; // A storage for mock user data

  async addUserWithPassword(user: BaseUser, passwordHash: PasswordHash){
    return true;
  }

  async getUserById(id: UUID): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null;
  }

  async getUserByUsername(username: Username): Promise<User | null> {
    if (username == "test_user") {
      return {
        id: "id-id-id-id-id",
        username: username,
        email: "test@example.com" as Email,
        followers: 0,
        followings: 0,
        isPrivate: false,
      };
    } else {
      return null;
    }
  }

  async getUserByEmail(email: Email): Promise<User | null> {
    if (email == "test@example.com") {
      return {
        id: "id-id-id-id-id",
        username: "test_user" as Username,
        email: email,
        followers: 0,
        followings: 0,
        isPrivate: false,
      };
    } else {
      return null;
    }
  }

  async editUser(userId: UUID, editedUser: BaseUser): Promise<boolean> {
    return false;
  }
}

class PasswordRepoMock implements IPasswordRepo {
  private passwordHashes: Map<UUID, PasswordHash> = new Map(); // A storage for mock password hashes

  async editPassword(userId: UUID, passwordHash: PasswordHash): Promise<boolean> {
    return true;
  }

  async getPasswordHash(userId: UUID): Promise<PasswordHash> {
    if (userId === "id-id-id-id-id") {
      return zodPasswordHash.parse("Password888");
    } else {
      return "" as PasswordHash;
    }
  }
}

export { UserRepoMock, PasswordRepoMock };

describe("User Service login", () => {
  let userService: UserServices;

  it("should return error because of wrong password", async () => {
    const userRepoMock: IUserRepo = new UserRepoMock();
    const passwordRepoMock: IPasswordRepo = new PasswordRepoMock();
    userService = new UserServices(userRepoMock, passwordRepoMock);
    const mockUser = {
      id: "user-id",
      username: "test_user",
      email: "test@example.com",
      followers: 0,
      followings: 0,
      isPrivate: false,
    };

    userRepoMock.getUserByEmail = jest.fn().mockResolvedValue(mockUser);
    passwordRepoMock.getPasswordHash = jest.fn().mockResolvedValue("password-hash");
    const loginData: LoginDTO = {
      username: zodUsername.parse("test_user"),
      password: zodPassword.parse("Password888"),
    };

    expect(async () => {
      await userService.login(loginData);
    }).rejects.toThrow();
  });

  it("should return error beacause this user is not exist", async () => {
    const userRepoMock: IUserRepo = new UserRepoMock();
    const passwordRepoMock: IPasswordRepo = new PasswordRepoMock();
    userService = new UserServices(userRepoMock, passwordRepoMock);
    const mockUser = null;

    userRepoMock.getUserByEmail = jest.fn().mockResolvedValue(mockUser);
    passwordRepoMock.getPasswordHash = jest.fn().mockResolvedValue("password-hash");
    const loginData: LoginDTO = {
      username: zodUsername.parse("test_user"),
      password: zodPassword.parse("Password888"),
    };

    expect(async () => {
      await userService.login(loginData);
    }).rejects.toThrow();
  });

  it("should create a token when username and password are correct", async () => {
    const userRepoMock: IUserRepo = new UserRepoMock();
    const passwordRepoMock: IPasswordRepo = new PasswordRepoMock();
    userService = new UserServices(userRepoMock, passwordRepoMock);
    const mockUser = {
      id: "user-id",
      username: "test_user",
      email: "test@example.com",
      followers: 0,
      followings: 0,
      isPrivate: false,
    };

    userRepoMock.getUserByEmail = jest.fn().mockResolvedValue(mockUser);
    passwordRepoMock.getPasswordHash = jest.fn().mockResolvedValue("password-hash");
    const loginData: LoginDTO = {
      username: zodUsername.parse("test_user"),
      password: zodPassword.parse("Password888"),
    };
    (compare as jest.Mock).mockResolvedValue(true);

    const token = await userService.login(loginData);
    expect(token).toBeDefined();
  });
});
