import { UUID } from "crypto";
import { dataManager } from "~/DataManager";
import { PaginationNumber, nonEmptyString } from "~/models/common";
import { Password, PasswordHash, generatePasswordHash } from "~/models/password.models";
import { Description } from "~/models/post.models";
import { Tag } from "~/models/tag.models";
import { Email, Username } from "~/models/user.models";
import { PostRepo } from "~/repository/post.repo";
import { UserRepo } from "~/repository/user.repo";

describe("Testing Post Repo", () => {
  let repo: PostRepo;
  let userRepo: UserRepo;

  let hash: PasswordHash;
  let userId: UUID;
  let postId: UUID;

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

    const post = await repo.addPost({description: "Description" as Description, closeFriendsOnly: true}, [{value:"tag"as Tag.tagBrand}] , [
      {
          "path": "uploads/9da4aa1be447068fa63e9b00f9a3c18d" as nonEmptyString,
          "mimetype": "image/png",
          "size": 411138,
      }
  ], userId);
  postId = post.id;
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

test("should edit user post", async () => {
  const res = await repo.editPost(userId, postId, [{value: "tig" as Tag.tagBrand}], {description: "description" as Description, closeFriendsOnly: true})
  expect(res?.id).toEqual(postId);
  expect(res?.description).toEqual("description");

});

});
