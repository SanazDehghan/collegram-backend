import { UUID } from "crypto";
import { dataManager } from "~/DataManager";
import { Password, generatePasswordHash } from "~/models/password.models";
import { Email, Username } from "~/models/user.models";
import { IUserRepo, UserRepo } from "~/repository/user.repo";
import { IUserRelationsRepo, UserRelationsRepo } from "~/repository/userRelations.repo";

describe("Testing User Relations Repo", () => {
  let userRelationsRepo: IUserRelationsRepo;
  let userRepo: IUserRepo;

  let followerId: UUID;
  let receiverId: UUID;

  beforeAll(async () => {
    await dataManager.init();
    await dataManager.cleanDB();

    userRelationsRepo = new UserRelationsRepo();
    userRepo = new UserRepo();
  });

  beforeEach(async () => {
    const followerPasswordHash = await generatePasswordHash("followerPass" as Password);
    followerId = await userRepo.addUserWithPassword(
      { email: "follower@email.com" as Email, username: "follower" as Username, isPrivate: false },
      followerPasswordHash,
    );

    const receiverPasswordHash = await generatePasswordHash("receiverPass" as Password);
    receiverId = await userRepo.addUserWithPassword(
      { email: "receiver@email.com" as Email, username: "receiver" as Username, isPrivate: false },
      receiverPasswordHash,
    );
  });

  afterEach(async () => {
    await dataManager.cleanDB();
  });

  afterAll(async () => {
    await dataManager.close();
  });

  test("get relations by follower userId and receiver userId", async () => {
    await expect(userRelationsRepo.getRelations(followerId, receiverId)).resolves.not.toBeNull();
  });

  test("find user by userId", async () => {
    await expect(userRelationsRepo.findUser(receiverId)).resolves.not.toBeNull();
  });

  test("add relations by follower userId and receiver userId and relation type", async () => {
    await expect(userRelationsRepo.addRelations(followerId, receiverId, "FOLLOW")).resolves.not.toBeNull();
  });
});
