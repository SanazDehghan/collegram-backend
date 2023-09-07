import { UUID } from "crypto";
import { v4 } from "uuid";
import { nonEmptyString } from "~/models/common";
import { UploadedImage } from "~/models/image.models";
import { Password, PasswordHash } from "~/models/password.models";
import { Token } from "~/models/token.models";
import { BaseUser, Bio, Email, User, Username } from "~/models/user.models";
import { IPasswordRepo } from "~/repository/password.repo";
import { IUserRepo } from "~/repository/user.repo";
import {
  DuplicateEmailError,
  InvalidTokenError,
  InvalidUsernameOrPasswordError,
  UserNotFound,
  UsernameTakenError,
} from "~/services/errors/service.errors";
import { MailServices } from "~/services/mail.services";
import { TokenServices } from "~/services/token.services";
import { UserServices } from "~/services/user.services";

interface DBPassword {
  userId: UUID;
  passwordHash: PasswordHash;
}
class FakePasswordRepo implements IPasswordRepo {
  db: DBPassword[] = [];

  addPassword(userId: UUID, passwordHash: PasswordHash) {
    this.db.push({ userId, passwordHash });
  }

  getPasswordHash(userId: UUID) {
    const pass = this.db.find((p) => p.userId === userId);

    return pass ? pass.passwordHash : null;
  }

  async editPassword(userId: UUID, passwordHash: PasswordHash) {
    const pass = this.db.find((p) => p.userId);

    if (pass === undefined) {
      return false;
    }

    this.db = this.db.map((p) => (p.userId === userId ? { ...p, passwordHash } : p));

    return true;
  }
}

class FakeUserRepo implements IUserRepo {
  db: User[] = [];

  constructor(private passRepo: FakePasswordRepo) {}

  async addUserWithPassword(user: BaseUser, passwordHash: PasswordHash) {
    const id = v4() as UUID;

    this.db.push({ ...user, id, followings: 0, followers: 0 });
    this.passRepo.addPassword(id, passwordHash);

    return id;
  }

  async getUserById(id: UUID) {
    const user = this.db.find((u) => u.id === id);

    return user ?? null;
  }

  async getUserByUsername(username: Username) {
    const user = this.db.find((u) => u.username === username);

    return user ?? null;
  }

  async getUserByEmail(email: Email) {
    const user = this.db.find((u) => u.email === email);

    return user ?? null;
  }

  async editUser(userId: UUID, editedUser: Partial<BaseUser>) {
    const user = await this.getUserById(userId);

    if (user === null) {
      return false;
    }

    this.db = this.db.map((u) => (u.id === userId ? { ...u, ...editedUser } : u));

    return true;
  }

  async getUserWithPasswordHash(identifier: Email | Username) {
    const user = this.db.find((u) => u.email === identifier || u.username === identifier);

    if (user === undefined) {
      return null;
    }

    const passwordHash = this.passRepo.getPasswordHash(user.id);

    if (passwordHash === null) {
      return null;
    }

    return { ...user, passwordHash };
  }

  async getEmailByIdentifier(identifier: Email | Username) {
    const user = await this.getUserWithPasswordHash(identifier);

    return user ? user.email : null;
  }
}

describe("Testing User Services", () => {
  const fakePasswordRepo = new FakePasswordRepo();
  const fakeUserRepo = new FakeUserRepo(fakePasswordRepo);
  const fakeTokenService = new TokenServices();

  const userServices = new UserServices(fakeUserRepo, fakePasswordRepo, fakeTokenService, new MailServices());

  const baseUser: BaseUser = {
    email: "test@email.com" as Email,
    username: "username" as Username,
    isPrivate: false,
  };
  const password = "pass" as Password;
  let userId: UUID;

  beforeEach(async () => {
    fakeUserRepo.db = [];
    fakePasswordRepo.db = [];

    userId = await fakeUserRepo.addUserWithPassword(baseUser, "hash" as PasswordHash);
  });

  test("signup: should signup", async () => {
    await expect(userServices.signup("email" as Email, "name" as Username, password)).resolves.toBeDefined();
  });

  test("signup: should fail due to duplicated email", async () => {
    await expect(userServices.signup(baseUser.email, "name" as Username, password)).rejects.toThrow(
      DuplicateEmailError,
    );
  });

  test("signup: should fail due to duplicated email", async () => {
    const baseUser: BaseUser = {
      email: "test@email.com" as Email,
      username: "username" as Username,
      isPrivate: false,
    };
    const password = "pass" as Password;

    fakeUserRepo.addUserWithPassword(baseUser, "hash" as PasswordHash);

    await expect(userServices.signup("test@email.com" as Email, baseUser.username, password)).rejects.toThrow(
      UsernameTakenError,
    );
  });

  test("login: should return error because of wrong password", async () => {
    await expect(
      userServices.login({
        identifier: baseUser.username,
        password: "Password88888" as Password,
      }),
    ).rejects.toThrow(InvalidUsernameOrPasswordError);
  });

  test("login: should return error because this user is not exist", async () => {
    await expect(
      userServices.login({
        identifier: "user" as Username,
        password: "Password88888" as Password,
      }),
    ).rejects.toThrow(InvalidUsernameOrPasswordError);
  });

  test("send recovery email: should return error because user not found", async () => {
    const email = "errorEmail@email.com" as Email;
    await expect(userServices.sendEmailRecoveryPassword({ identifier: email })).rejects.toThrow(UserNotFound);
  });

  test("send recovery email: should return user's email", async () => {
    const email = "test@email.com" as Email;
    const result = await userServices.sendEmailRecoveryPassword({ identifier: email });
    expect(result).toBe(email);
  }, 20000);

  test("reset password: should reset password", async () => {
    const token = fakeTokenService.generateToken({ userId });
    const pass = "Aw12345678" as Password;
    await expect(userServices.resetPasswordUser(token, pass)).resolves.toBe(true);
  });

  test("reset password: should return error because the token is not valid", async () => {
    const token = fakeTokenService.generateToken({ userId });
    const fakeToken = token.replace("e", "Q") as Token;
    await expect(userServices.resetPasswordUser(fakeToken, password)).rejects.toThrow(InvalidTokenError);
  });

  test("user info: get user info that not exists in database", async () => {
    await expect(userServices.getUserInfo("43" as UUID)).rejects.toThrow(UserNotFound);
  });

  test("user info: get user info that exists in database", async () => {
    const user = await userServices.getUserInfo(userId);
    expect(user).toBe(fakeUserRepo.db[0]);
  });

  test("edit user info: should return true by edit all item except photo", async () => {
    const info = {
      password: "Qwer1234" as Password,
      firstName: "test" as nonEmptyString,
      lastName: "test" as nonEmptyString,
      bio: "chert" as Bio,
      is_private: true,
    };
    const files: UploadedImage.Type[] = [];
    const status = await userServices.updateUserInfo(userId, info, files);
    expect(status).toBe(true);
  });

  test("edit user info: should throw error because user not found", async () => {
    const fakeUserId = "fake_id" as UUID;
    const info = {
      password: "Qwer1234" as Password,
      firstName: "test" as nonEmptyString,
      lastName: "test" as nonEmptyString,
      bio: "chert" as Bio,
      is_private: true,
    };
    const files: UploadedImage.Type[] = [];

    await expect(userServices.updateUserInfo(fakeUserId, info, files)).rejects.toThrow(UserNotFound);
  });
  test("edit user info: should return true by edit all item", async () => {
    const info = {
      password: "Qwer1234" as Password,
      firstName: "test" as nonEmptyString,
      lastName: "test" as nonEmptyString,
      bio: "chert" as Bio,
      is_private: true,
    };
    const files: UploadedImage.Type[] = [
      {
        path: "url_of_photo" as nonEmptyString,
        mimetype: "image/jpeg",
        size: 1,
      },
    ];
    const status = await userServices.updateUserInfo(userId, info, files);
    expect(status).toBe(true);
  });
});
