import { UUID } from "crypto";
import { dataManager } from "~/DataManager";
import { PaginationNumber, nonEmptyString } from "~/models/common";
import { Password, PasswordHash, generatePasswordHash } from "~/models/password.models";
import { Description } from "~/models/post.models";
import { Tag } from "~/models/tag.models";
import { Email, Username } from "~/models/user.models";
import { PostRepo } from "~/repository/post.repo";
import { UserRepo } from "~/repository/user.repo";
import { UserRelationsServices } from "../src/services/userRelations.services";
import { UserRelationsRepo } from "../src/repository/userRelations.repo";
import { v4 } from "uuid";

describe("Testing Post Repo", () => {
  let userRepo: UserRepo;
  let postRepo: PostRepo;
  let userRelationsServices: UserRelationsServices;

  let hash: PasswordHash;
  let userId: UUID;
  let postId: UUID;

  beforeAll(async () => {
    await dataManager.init();
    await dataManager.cleanDB();

    userRepo = new UserRepo();
    postRepo = new PostRepo();
    userRelationsServices = new UserRelationsServices(new UserRelationsRepo());

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

  test("get post by id", async () => {
    await expect(postRepo.getPostById(postId)).resolves.toHaveProperty("id", postId);
  });

  test("should not be able to find post", async () => {
    await expect(postRepo.getPostById(v4() as UUID)).resolves.toBeNull();
  });

  test("add new post like", async () => {
    await postRepo.addNewPostLike(userId, postId, 5);

    await expect(postRepo.getLikeRecord(userId, postId)).resolves.not.toBeNull();
    await expect(postRepo.getPostById(postId)).resolves.toHaveProperty("likes", 5);
  });

  test("remove post like", async () => {
    await postRepo.addNewPostLike(userId, postId, 5);
    const likeRecord = await postRepo.getLikeRecord(userId, postId)
    await postRepo.removePostLike(likeRecord!, 4)

    await expect(postRepo.getLikeRecord(userId, postId)).resolves.toBeNull();
    await expect(postRepo.getPostById(postId)).resolves.toHaveProperty("likes", 4);
  });

  test("should edit user post", async () => {
    const res = await postRepo.editPost(userId, postId, [{ value: "tig" as Tag.tagBrand }], {
      description: "description" as Description,
      closeFriendsOnly: true,
    });
    expect(res?.id).toEqual(postId);
    expect(res?.description).toEqual("description");
  });

  test("add new post bookmark", async () => {
    await postRepo.addNewPostBookmark(userId, postId, 5);

    await expect(postRepo.getBookmarkRecord(userId, postId)).resolves.not.toBeNull();
    await expect(postRepo.getPostById(postId)).resolves.toHaveProperty("bookmarks", 5);
  });

  test("remove post bookmark", async () => {
    await postRepo.addNewPostBookmark(userId, postId, 5);
    const bookmarkRecord = await postRepo.getBookmarkRecord(userId, postId);
    await postRepo.removePostBookmark(bookmarkRecord!, 4)
    

    await expect(postRepo.getBookmarkRecord(userId, postId)).resolves.toBeNull();
    await expect(postRepo.getPostById(postId)).resolves.toHaveProperty("bookmarks", 4);
  });

  test("get user bookmarks", async () => {
    await postRepo.addNewPostBookmark(userId, postId, 5);

    const result = await postRepo.getUserBookmarks(userId, 1 as PaginationNumber, 1 as PaginationNumber);
    expect(result[0][0]).toHaveProperty("id", postId);
  });

  test("get posts by userIds", async () => {
    const [result, total] = await postRepo.getPostsByUserIds([userId], 1 as PaginationNumber, 1 as PaginationNumber);

    expect(result[0]?.id).toBe(postId);
  });
});
