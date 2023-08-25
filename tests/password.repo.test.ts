import { UUID } from "crypto";
<<<<<<< HEAD
import { v4 } from "uuid";
=======
>>>>>>> 3b62218 (#4: userDatabase: password repo implemented)
import { dataManager } from "~/DataManager";
import { Password, PasswordHash, generatePasswordHash } from "~/models/password.models";
import { Email, Username } from "~/models/user.models";
import { PasswordRepo } from "~/repository/password.repo";
import { UserRepo } from "~/repository/user.repo";

describe("Testing Password Repo", () => {
  let userRepo: UserRepo;
  let passRepo: PasswordRepo;

  const email = "test@email.com" as Email;
  const username = "test_user" as Username;
  const password = "password" as Password;

  let hash: PasswordHash;
  let userId: UUID;

  beforeAll(async () => {
    await dataManager.init();
    userRepo = new UserRepo();
    passRepo = new PasswordRepo();

    hash = await generatePasswordHash(password);
  });

  beforeEach(async () => {
    const res = await userRepo.addUserWithPassword({ email, username, isPrivate: false }, hash);

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

  test("edit password", async () => {
    const newHash = await generatePasswordHash("pass2" as Password);

    await expect(passRepo.editPassword(userId, newHash)).resolves.toBe(true);

<<<<<<< HEAD
    await expect(passRepo.editPassword(v4() as UUID, newHash)).resolves.toBe(false);
=======
    await expect(passRepo.editPassword("fake id" as UUID, newHash)).resolves.toBe(false);
>>>>>>> 3b62218 (#4: userDatabase: password repo implemented)
  });

  test("get password hash", async () => {
    await expect(passRepo.getPasswordHash(userId)).resolves.toBe(hash);

<<<<<<< HEAD
    await expect(passRepo.getPasswordHash(v4() as UUID)).resolves.toBeNull();
=======
    await expect(passRepo.getPasswordHash("fake id" as UUID)).resolves.toBeNull();
>>>>>>> 3b62218 (#4: userDatabase: password repo implemented)
  });
});
