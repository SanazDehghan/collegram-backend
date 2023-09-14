import { UUID } from "crypto";
import { AddComment, AllComment, CommentText } from "~/models/comment.models";
import { ICommentRepo } from "~/repository/comment.repo";
import { CommentNotFound, InvalidCommentError, PostNotFound } from "./errors/service.errors";
import { Pagination, PaginationNumber, createPagination } from "~/models/common";

export class CommentServices {
  constructor(private commentRepo: ICommentRepo) {}

  public async addComment(
    userId: UUID,
    postId: UUID,
    text: CommentText,
    parentId?: UUID,
  ) {
    const addedComment = await this.commentRepo.addComment(userId, postId, text, parentId);
    if (addedComment === null) {
      throw new InvalidCommentError();
    }
    return addedComment;
  }
  public async getComment(
    postId: UUID,
    limit: PaginationNumber,
    page: PaginationNumber,
  ): Promise<Pagination<AllComment.commentType>> {
    const [comments, total] = await this.commentRepo.getAllPostComment(postId, limit, page);
    if (comments === undefined || total === undefined) {
      throw new CommentNotFound();
    }
    return createPagination(comments, page, limit, total);
  }
}
