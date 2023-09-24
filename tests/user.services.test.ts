import { UUID } from "crypto";
import { dataManager } from "~/DataManager";
import { nonEmptyString } from "~/models/common";
import { UploadedImage } from "~/models/image.models";
import { Password, PasswordHash, generatePasswordHash } from "~/models/password.models";
import { Token } from "~/models/token.models";
import { BaseUser, Bio, Email, Username } from "~/models/user.models";
import { PasswordRepo } from "~/repository/password.repo";
import { UserRepo } from "~/repository/user.repo";
import { UserRelationsRepo } from "~/repository/userRelations.repo";
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
import { UserRelationsServices } from "~/services/userRelations.services";

describe("Testing User Services", () => {
  let userRepo: UserRepo;
  let passwordRepo: PasswordRepo;
  let tokenServices: TokenServices;
  let userRelationsRepo: UserRelationsRepo;
  let userRelationsServices: UserRelationsServices;
  let mailServices: MailServices;
  let userServices: UserServices;

  const baseUser: BaseUser = {
    email: "test@email.com" as Email,
    username: "username" as Username,
    isPrivate: false,
  };
  const password = "pass" as Password;
  let userId: UUID;

  beforeAll(async () => {
    await dataManager.init();
    userRepo = new UserRepo();
    passwordRepo = new PasswordRepo();
    tokenServices = new TokenServices();
    userRelationsRepo = new UserRelationsRepo();
    userRelationsServices = new UserRelationsServices(userRelationsRepo);
    mailServices = new MailServices();
    userServices = new UserServices(userRepo, passwordRepo, tokenServices, userRelationsServices, mailServices);
  });

  beforeEach(async () => {
    const passwordHash = await generatePasswordHash(password);

    userId = await userRepo.addUserWithPassword(baseUser, passwordHash);
  });

  afterEach(async () => {
    await dataManager.cleanDB();
  });

  afterAll(async () => {
    await dataManager.close();
  });

  test("signup: should signup", async () => {
    await expect(userServices.signup("email" as Email, "name" as Username, password)).resolves.toBeDefined();
  });

  test("signup: should fail due to duplicated email", async () => {
    await expect(userServices.signup(baseUser.email, "name" as Username, password)).rejects.toThrow(
      DuplicateEmailError,
    );
  });

  test("signup: should fail due to duplicated username", async () => {
    await expect(userServices.signup("test2@email.com" as Email, baseUser.username, password)).rejects.toThrow(
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
    const token = tokenServices.generateToken({ userId });
    const pass = "Aw12345678" as Password;
    await expect(userServices.resetPasswordUser(token, pass)).resolves.toBe(true);
  });

  test("reset password: should return error because the token is not valid", async () => {
    const token = tokenServices.generateToken({ userId });
    const fakeToken = token.replace("e", "Q") as Token;
    await expect(userServices.resetPasswordUser(fakeToken, password)).rejects.toThrow(InvalidTokenError);
  });

  test("user info: get user info that not exists in database", async () => {
    await expect(userServices.getUserInfo("775afd8c-cd03-4940-8aae-8150cca211cb" as UUID)).rejects.toThrow(UserNotFound);
  });

  test("user info: get user info that exists in database", async () => {
    const user = await userServices.getUserInfo(userId);
    expect(user.id).toBe(userId);
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
    expect(status).toBeDefined();
  });

  test("edit user info: should throw error because user not found", async () => {
    const fakeUserId = "775afd8c-cd03-4940-8aae-8150cca211cb" as UUID;
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
    expect(status).toBeDefined();
  });
});
