import { UUID } from "crypto";
import { dataManager } from "~/DataManager";
import { PaginationNumber } from "~/models/common";
import { Password, PasswordHash, generatePasswordHash } from "~/models/password.models";
import { Email, Username } from "~/models/user.models";
import { PostRepo } from "~/repository/post.repo";
import { UserRepo } from "~/repository/user.repo";

describe("Testing Post Repo", () => {
  let repo: PostRepo;
  let userRepo: UserRepo;

  let hash: PasswordHash;
  let userId: UUID;

  beforeAll(async () => {
    await dataManager.init();

    repo = new PostRepo();
    userRepo = new UserRepo();

    hash = await generatePasswordHash("password" as Password);
  });

  beforeEach(async () => {
    const res = await userRepo.addUserWithPassword(
      { email: "email" as Email, username: "username" as Username, isPrivate: false },
      hash,
    );

    userId = res!;
  });

  afterEach(async () => {
    await dataManager.cleanDB();
  });

  beforeEach(async () => {
    const res = await userRepo;
  });

  afterAll(async () => {
    await dataManager.close();
  });

  test("get user posts", async () => {
    await expect(repo.getAllUserPosts(userId, 20 as PaginationNumber, 1 as PaginationNumber)).resolves.toEqual([[], 0]);
  });
});
