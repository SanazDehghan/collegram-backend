import { UUID } from "crypto";
import { v4 } from "uuid";
import { Password, generatePasswordHash } from "~/models/password.models";
import { Email, User, Username } from "~/models/user.models";
import { IUserRepo, UserRepo } from "~/repository/user.repo";
import { IUserRelationsRepo, UserRelationsRepo } from "~/repository/userRelations.repo";
import { ForbiddenFollowUser, UserNotFound } from "~/services/errors/service.errors";
import { UserRelationsServices } from "~/services/userRelations.services";
import { dataManager } from "../src/DataManager";

describe("Testing User Relations Services", () => {
  let userRelationsRepo: IUserRelationsRepo;
  let userRepo: IUserRepo;
  let userRelationsServices: UserRelationsServices;

  let followerId: UUID;
  let followingId: UUID;

  beforeAll(async () => {
    await dataManager.init();
    await dataManager.cleanDB();

    userRelationsRepo = new UserRelationsRepo();
    userRepo = new UserRepo();
    userRelationsServices = new UserRelationsServices(userRelationsRepo);
  });

  beforeEach(async () => {
    const followerPasswordHash = await generatePasswordHash("followerPass" as Password);
    followerId = await userRepo.addUserWithPassword(
      { email: "follower@email.com" as Email, username: "follower" as Username, isPrivate: false },
      followerPasswordHash,
    );

    const receiverPasswordHash = await generatePasswordHash("receiverPass" as Password);
    followingId = await userRepo.addUserWithPassword(
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

  test("should follow the user", async () => {
    const result = await userRelationsServices.follow(followerId, { id: followingId, isPrivate: false });
    expect(result).toBe("FOLLOWED");
  });

  test("should request to follow the user when the user page is private", async () => {
    const result = await userRelationsServices.follow(followerId, { id: followingId, isPrivate: true });
    expect(result).toBe("REQUESTED");
  });

  test("should throw ForbiddenFollowUser error when the user is already following the target user", async () => {
    const result = await userRelationsServices.follow(followerId, { id: followingId, isPrivate: false });
    await expect(userRelationsServices.follow(followerId, { id: followingId, isPrivate: false })).rejects.toThrow(
      ForbiddenFollowUser,
    );
  });
});
