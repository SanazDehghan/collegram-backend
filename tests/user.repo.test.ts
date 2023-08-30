import { UUID } from "crypto";
import { v4 } from "uuid";
import { dataManager } from "~/DataManager";
import { Password, PasswordHash, generatePasswordHash } from "~/models/password.models";
import { BaseUser, Email, Username } from "~/models/user.models";
import { UserRepo } from "~/repository/user.repo";

describe("Testing User Repo", () => {
  let repo: UserRepo;

  const email = "test@email.com" as Email;
  const username = "test_user" as Username;
  const password = "password" as Password;

  let hash: PasswordHash;
  let userId: UUID;

  beforeAll(async () => {
    await dataManager.init();
    repo = new UserRepo();

    hash = await generatePasswordHash(password);
  });

  beforeEach(async () => {
    const res = await repo.addUserWithPassword({ email, username, isPrivate: false }, hash);

    if (res) {
      userId = res;
    }
  });

  afterEach(async () => {
    await dataManager.cleanDB();
  });

  afterAll(async () => {
    await dataManager.close();
  });

  test("add user with password", async () => {
    const user: BaseUser = {
      email: "testing@email.com" as Email,
      username: "user" as Username,
      isPrivate: false,
    };

    const password = "password" as Password;

    const hash = await generatePasswordHash(password);

    await expect(repo.addUserWithPassword(user, hash)).resolves.not.toBeNull();
  });

  test("add user with password should throw error: user exists", async () => {
    const user: BaseUser = {
      email: "testing@email.com" as Email,
      username: "user" as Username,
      isPrivate: false,
    };

    const password = "password" as Password;

    const hash = await generatePasswordHash(password);

    await repo.addUserWithPassword(user, hash);

    await expect(repo.addUserWithPassword(user, hash)).rejects.toThrow(Error);
  });

  test("get user by id", async () => {
    await expect(repo.getUserById(userId)).resolves.not.toBeNull();
  });

  test("should fail to get user by id", async () => {
    await expect(repo.getUserById(v4() as UUID)).resolves.toBeNull();
  });

  test("get user by username", async () => {
    await expect(repo.getUserByUsername(username)).resolves.not.toBeNull();
  });

  test("should fail to get user by username", async () => {
    await expect(repo.getUserByUsername(v4() as Username)).resolves.toBeNull();
  });

  test("get user by email", async () => {
    await expect(repo.getUserByEmail(email)).resolves.not.toBeNull();
  });

  test("should fail to get user by email", async () => {
    await expect(repo.getUserByEmail("abc@abc.com" as Email)).resolves.toBeNull();
  });

  test("edit user", async () => {
    await expect(repo.editUser(userId, { username: "new_username" as Username })).resolves.toBe(true);

    await expect(repo.getUserById(userId)).resolves.toHaveProperty("username", "new_username");
  });

  test("should fail to edit user", async () => {
    await expect(repo.editUser(v4() as UUID, { username: "new_username" as Username })).resolves.toBe(false);
  });
});
