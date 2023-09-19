import { UUID } from "crypto";
import { dataManager } from "../src/DataManager";
import { PasswordHash, generatePasswordHash, Password } from "../src/models/password.models";
import { BasePost, Description } from "../src/models/post.models";
import { Tag } from "../src/models/tag.models";
import { Email, Username } from "../src/models/user.models";
import { PostRepo } from "../src/repository/post.repo";
import { UserRepo } from "../src/repository/user.repo";
import { PostServices } from "../src/services/post.services";
import { ForbiddenNumberOfTags, PostNotFound } from "../src/services/errors/service.errors";
import { PaginationNumber } from "../src/models/common";
import { IUserRelationsRepo, UserRelationsRepo } from "../src/repository/userRelations.repo";
import { UserRelationsServices } from "../src/services/userRelations.services";

describe("Testing Post Services", () => {
  let userRepo: UserRepo;
  let postRepo: PostRepo;
  let userRelationsRepo: IUserRelationsRepo;
  let userRelationsServices: UserRelationsServices;
  let postServices: PostServices;

  let hash: PasswordHash;
  let userId: UUID;
  let postId: UUID;

  beforeAll(async () => {
    await dataManager.init();
    await dataManager.cleanDB();

    userRepo = new UserRepo();
    postRepo = new PostRepo();
    userRelationsRepo = new UserRelationsRepo();
    userRelationsServices = new UserRelationsServices(userRelationsRepo);
    postServices = new PostServices(postRepo, userRelationsServices);

    hash = await generatePasswordHash("password" as Password);
  });

  beforeEach(async () => {
    const user = await userRepo.addUserWithPassword(
      { email: "email" as Email, username: "username" as Username, isPrivate: false },
      hash,
    );
    userId = user;

    const post = await postRepo.addPost(
      { description: "description" as Description, closeFriendsOnly: false },
      [{ value: "tag" as Tag.tagBrand }],
      [],
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

  test("should throw an error if tags length is more than 7", async () => {
    const tags = ["tig", "git", "github", "tags", "gat", "gallary", "yrallag", "yellows"] as Tag.tagBrand[];
    const userId = "565e379f-85b5-412a-b8a3-19aea38c6824";
    const postId = "c0b123b7-d51b-4ffa-97d8-a343795c6ad6";
    const basePost = {
      description: "Description",
      closeFriendsOnly: true,
    } as BasePost.basePostType;
    await expect(postServices.editPost(userId, postId, tags, basePost)).rejects.toThrow(ForbiddenNumberOfTags);
  });

  test("like post", async () => {
    await expect(postServices.likePost(userId, postId)).resolves.toBe("OK");
  });

  test("like post: should be liked before", async () => {
    await postServices.likePost(userId, postId);
    await expect(postServices.likePost(userId, postId)).resolves.toBe("LIKED_BEFORE");
  });

  test("like post: should fail due to wrong postId", async () => {
    await expect(postServices.likePost(userId, "85d4d57c-a98f-4600-9a2e-e51be3e066f0" as UUID)).rejects.toThrow(
      PostNotFound,
    );
  });

  test("bookmark post", async () => {
    await expect(postServices.bookmarkPost(userId, postId, true)).resolves.toBe("OK");
  });

  test("bookmark post: should already be bookmarked", async () => {
    await postServices.bookmarkPost(userId, postId, true);
    await expect(postServices.bookmarkPost(userId, postId, true)).resolves.toBe("ALREADY_BOOKMARKED");
  });

  test("remove bookmark: has no bookmarks", async () => {
    await expect(postServices.bookmarkPost(userId, postId, false)).resolves.toBe("NOT_BOOKMARKED");
  });

  test("remove bookmark", async () => {
    await postServices.bookmarkPost(userId, postId, true);
    await expect(postServices.bookmarkPost(userId, postId, false)).resolves.toBe("OK");
  });

  test("bookmark post: should fail due to wrong postId", async () => {
    await expect(
      postServices.bookmarkPost(userId, "85d4d57c-a98f-4600-9a2e-e51be3e066f0" as UUID, true),
    ).rejects.toThrow(PostNotFound);
  });

  test("get my bookmarks", async () => {
    await postServices.bookmarkPost(userId, postId, true);

    const result = await postServices.getMyBookmarks(userId, 1 as PaginationNumber, 1 as PaginationNumber);
    expect(result.items[0]).toHaveProperty("id", postId);
  });

  test("should get all followings posts", async () => {
    const result = await postServices.getAllFollowingsPosts(userId, 1 as PaginationNumber, 1 as PaginationNumber);

    expect(result.items.length).toBe(0);
  });

  test("should get all followings posts", async () => {
    const followerId = await userRepo.addUserWithPassword(
      { email: "email2" as Email, username: "username2" as Username, isPrivate: false },
      hash,
    );
    await userRelationsServices.follow(followerId, {id: userId, isPrivate: false});

    const result = await postServices.getAllFollowingsPosts(followerId, 1 as PaginationNumber, 1 as PaginationNumber);

    expect(result.items[0]?.id).toBe(postId);
  });
});
