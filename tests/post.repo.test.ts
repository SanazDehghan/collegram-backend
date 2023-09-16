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
  let userRepo: UserRepo;
  let postRepo: PostRepo;

  let hash: PasswordHash;
  let userId: UUID;
  let postId: UUID;

  beforeAll(async () => {
    await dataManager.init();
    await dataManager.cleanDB();

    userRepo = new UserRepo();
    postRepo = new PostRepo();

    hash = await generatePasswordHash("password" as Password);
  });

  beforeEach(async () => {
    const user = await userRepo.addUserWithPassword(
      { email: "email" as Email, username: "username" as Username, isPrivate: false },
      hash,
    );
    userId = user!;

    const post = await postRepo.addPost(
      { description: "Description" as Description, closeFriendsOnly: true },
      [{ value: "tag" as Tag.tagBrand }],
      [
        {
          path: "uploads/9da4aa1be447068fa63e9b00f9a3c18d" as nonEmptyString,
          mimetype: "image/png",
          size: 411138,
        },
      ],
      userId,
    );
    postId = post.id;
  });

  afterEach(async () => {
    await dataManager.cleanDB();
  });

  afterAll(async () => {
    await dataManager.close();
  });

  test("get user posts", async () => {
    await expect(
      postRepo.getAllUserPosts(userId, 20 as PaginationNumber, 1 as PaginationNumber),
    ).resolves.toHaveProperty("1", 1);
  });

  test("like and update count", async () => {
    await expect(postRepo.likeAndUpdateCount(userId, postId)).resolves.toBe("OK");
    await expect(postRepo.getPostDetails(postId)).resolves.toHaveProperty("likes", 1);
  });

  test("like and update count: shouldn't update count; already liked;", async () => {
    await postRepo.likeAndUpdateCount(userId, postId);

    await expect(postRepo.likeAndUpdateCount(userId, postId)).resolves.toBe("LIKED_BEFORE");
    await expect(postRepo.getPostDetails(postId)).resolves.toHaveProperty("likes", 1);
  });

  test("like and update count: should fail due to wrong post id", async () => {
    await expect(postRepo.likeAndUpdateCount(userId, "85d4d57c-a98f-4600-9a2e-e51be3e066f0" as UUID)).resolves.toBe(
      "ERROR_POST_NOT_FOUND",
    );
  });

  test("should edit user post", async () => {
    const res = await postRepo.editPost(userId, postId, [{ value: "tig" as Tag.tagBrand }], {
      description: "description" as Description,
      closeFriendsOnly: true,
    });
    expect(res?.id).toEqual(postId);
    expect(res?.description).toEqual("description");
  });

  test("bookmark and update count", async () => {
    await expect(postRepo.bookmarkAndUpdateCount(userId, postId)).resolves.toBe("OK");
    await expect(postRepo.getPostDetails(postId)).resolves.toHaveProperty("bookmarks", 1);
  });

  test("bookmark and update count: shouldn't update count; already bookmarked;", async () => {
    await postRepo.bookmarkAndUpdateCount(userId, postId);

    await expect(postRepo.bookmarkAndUpdateCount(userId, postId)).resolves.toBe("ALREADY_BOOKMARKED");
  });

  test("bookmark and update count: should fail due to wrong post id", async () => {
    await expect(postRepo.bookmarkAndUpdateCount(userId, "85d4d57c-a98f-4600-9a2e-e51be3e066f0" as UUID)).resolves.toBe(
      "ERROR_POST_NOT_FOUND",
    );
  });

  test("remove bookmark and update count", async () => {
    await postRepo.bookmarkAndUpdateCount(userId, postId);

    await expect(postRepo.removeBookmarkAndUpdateCount(userId, postId)).resolves.toBe("OK");
    await expect(postRepo.getPostDetails(postId)).resolves.toHaveProperty("bookmarks", 0);
  });

  test("bookmark and update count: shouldn't update count; already bookmarked;", async () => {
    await expect(postRepo.removeBookmarkAndUpdateCount(userId, postId)).resolves.toBe("NOT_BOOKMARKED");
  });

  test("bookmark and update count: should fail due to wrong post id", async () => {
    await expect(
      postRepo.removeBookmarkAndUpdateCount(userId, "85d4d57c-a98f-4600-9a2e-e51be3e066f0" as UUID),
    ).resolves.toBe("ERROR_POST_NOT_FOUND");
  });

  test("get user bookmarks", async () => {
    await postRepo.bookmarkAndUpdateCount(userId, postId);

    const result = await postRepo.getUserBookmarks(userId, 1 as PaginationNumber, 1 as PaginationNumber);
    expect(result[0][0]).toHaveProperty("id", postId);
  });
});
