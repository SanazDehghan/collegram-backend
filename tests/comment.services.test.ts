import { CommentServices } from "../src/services/comment.services";
import { ICommentRepo } from "~/repository/comment.repo";
import { AddComment, AllComment, CommentText } from "~/models/comment.models";
import { InvalidCommentError, ParentCommentNotFound, PostNotFound } from "../src/services/errors/service.errors";
import { PaginationNumber, createPagination } from "~/models/common";
import { UUID } from "crypto";
import { CommentDAO } from "~/repository/daos/comment.daos";

class CommentRepoMock implements ICommentRepo {
  async addComment(userId: UUID, postId: UUID, text: CommentText, parentId?: UUID) {
    // Simulate adding a comment, return an object that matches the interface structure
    return {
      id: "123" as UUID, // Generate a unique ID for the mock comment
      userId,
      postId,
      commentText: text,
      parentId,
      createdAt: new Date(),
    };
  }

  async getAllPostComment(postId: UUID, limit: PaginationNumber, page: PaginationNumber) {
    // Simulate retrieving comments, replace with mock data
    const comments = [
      {
        id: "comment1" as UUID,
        userId: "user1" as UUID,
        postId: postId,
        commentText: "Comment 1" as CommentText,
        parentId: null,
        createdAt: new Date(),
      },
      {
        id: "comment2" as UUID,
        userId: "user2" as UUID,
        postId: postId,
        commentText: "Comment 2" as CommentText,
        parentId: "comment1" as UUID,
        createdAt: new Date(),
      },
    ];

    const total = comments.length;

    // Apply pagination logic
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = comments.slice(startIndex, endIndex);

    return [paginatedComments, total] as [CommentDAO.Type[], number];
  }
}

describe("CommentServices", () => {
  let commentService: CommentServices;

  beforeAll(() => {
    commentService = new CommentServices(new CommentRepoMock());
  });

  describe("addComment", () => {
    it("should add a comment and return it", async () => {
      const userId = "user123" as UUID;
      const postId = "post456" as UUID;
      const text = "Test comment" as CommentText;
      const parentId = undefined;

      const result = await commentService.addComment(userId, postId, text, parentId);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.postId).toBe(postId);
      expect(result.commentText).toBe(text);
      expect(result.parentId).toBe(parentId);
    });

    it("should throw PostNotFound if commentRepo returns null", async () => {
      const userId = "user123" as UUID;
      const postId = "post456" as UUID;
      const text = "Test comment" as CommentText;
      const parentId = undefined;

      CommentRepoMock.prototype.addComment = jest.fn().mockResolvedValue("Post not valid!");

      await expect(commentService.addComment(userId, postId, text, parentId)).rejects.toThrow(PostNotFound);
    });
  });

  it("should throw ParentCommentNotFound if commentRepo returns null", async () => {
    const userId = "user123" as UUID;
    const postId = "post456" as UUID;
    const text = "Test comment" as CommentText;
    const parentId = "parent123" as UUID;

    CommentRepoMock.prototype.addComment = jest.fn().mockResolvedValue("parentId not found!");

    await expect(commentService.addComment(userId, postId, text, parentId)).rejects.toThrow(ParentCommentNotFound);
  });



  describe("getComment", () => {
    it("should return paginated comments", async () => {
      const postId = "post456" as UUID;
      const limit = 10 as PaginationNumber;
      const page = 1 as PaginationNumber;

      const result = await commentService.getComment(postId, limit, page);

      expect(result).toBeDefined();
      expect(result.items.length).toBe(2); // Mock data has 2 comments
      //   expect(result.totalItems).toBe(2); // Mock data has a total of 2 comments
    });
  });
});
