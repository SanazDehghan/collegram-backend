import { UUID } from "crypto";
import { dataManager } from "../src/DataManager";
import { PasswordHash, generatePasswordHash, Password } from "../src/models/password.models";
import { BasePost, Description } from "../src/models/post.models";
import { Tag } from "../src/models/tag.models";
import { Email, Username } from "../src/models/user.models";
import { PostRepo } from "../src/repository/post.repo";
import { UserRepo } from "../src/repository/user.repo";
import { PostServices } from "../src/services/post.services";
import { ForbiddenNumberOfTags, ParentCommentNotFound, PostNotFound } from "../src/services/errors/service.errors";
import { PaginationNumber } from "../src/models/common";
import { IUserRelationsRepo, UserRelationsRepo } from "../src/repository/userRelations.repo";
import { UserRelationsServices } from "../src/services/userRelations.services";
import { CommentRepo } from "~/repository/comment.repo";
import { CommentServices } from "~/services/comment.services";
import { AddComment, CommentText } from "~/models/comment.models";

describe("Testing Comment Services", () => {
  let userRepo: UserRepo;
  let postRepo: PostRepo;
  let commentRepo: CommentRepo;
  let userRelationsRepo: IUserRelationsRepo;
  let userRelationsServices: UserRelationsServices;
  let postServices: PostServices;
  let commentServices: CommentServices;

  let hash: PasswordHash;
  let userId: UUID;
  let postId: UUID;

  beforeAll(async () => {
    await dataManager.init();
    await dataManager.cleanDB();

    userRepo = new UserRepo();
    postRepo = new PostRepo();
    commentRepo = new CommentRepo();
    userRelationsRepo = new UserRelationsRepo();
    userRelationsServices = new UserRelationsServices(userRelationsRepo);
    postServices = new PostServices(postRepo, userRelationsServices);
    commentServices = new CommentServices(commentRepo);

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

    const comment1= await commentRepo.addComment(userId,postId,"sample" as CommentText,undefined)
    const comment2 = await commentRepo.addComment(userId, postId, "sample2" as CommentText,undefined)
  });

  afterEach(async () => {
    await dataManager.cleanDB();
  });

  afterAll(async () => {
    await dataManager.close();
  });

  test("should add a comment and return it", async () => {
    const text = "Test comment" as CommentText;
    const parentId = undefined;

    const result = await commentServices.addComment(userId, postId, text, parentId);

    expect(result).toBeDefined();
    expect(result.userId).toBe(userId);
    expect(result.postId).toBe(postId);
    expect(result.commentText).toBe(text);
    expect(result.parentId).toBe(parentId);
  });

  test("should throw PostNotFound if commentRepo returns null", async () => {
    const postId = "c0b123b7-d51b-4ffa-97d8-a343795c6ad6";
    const text = "Test comment" as CommentText;
    const parentId = undefined;

    await expect(commentServices.addComment(userId, postId, text, parentId)).rejects.toThrow(PostNotFound);
  });

  test("should throw ParentCommentNotFound if commentRepo returns null", async () => {
    const text = "Test comment" as CommentText;
    const parentId = "c0b123b7-d51b-4ffa-97d8-a343795c6ad6";

    await expect(commentServices.addComment(userId, postId, text, parentId)).rejects.toThrow(ParentCommentNotFound);
  });

    test ("should return paginated comments", async () => {
      const limit = 10 as PaginationNumber;
      const page = 1 as PaginationNumber;

      const result = await commentServices.getComment(postId, limit, page);

      expect(result).toBeDefined();
      expect(result.items.length).toBe(2); // Mock data has 2 comments
    });
  });
