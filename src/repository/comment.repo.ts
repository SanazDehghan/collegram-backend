import { UUID } from "crypto";
import { Like } from "typeorm";
import { z } from "zod";
import { dataManager } from "~/DataManager";
import { CommentsEntity } from "~/entities/comment.entities";
import { AllComment, AddComment, CommentText } from "~/models/comment.models";
import { PaginationNumber } from "~/models/common";
import { BasePost } from "~/models/post.models";
import { CommentDAO, GetAllCommentPostsDAO } from "./daos/comment.daos";
import { parseDAO } from "./tool/parse";
import { PostsEntity } from "~/entities/post.entities";

export interface ICommentRepo {
  addComment: (userId: UUID, postId: UUID, text: CommentText, parentId?: UUID) => Promise<CommentDAO.Type | null>;
  getAllPostComment: (
    psotId: UUID,
    limit: PaginationNumber,
    page: PaginationNumber,
  ) => Promise<[CommentDAO.Type[], number]>;
}

export class CommentRepo implements ICommentRepo {
  private repository = dataManager.source.getRepository(CommentsEntity);

  private postRepo = dataManager.source.getRepository(PostsEntity);

  public async addComment(uid: UUID, postId: UUID, text: CommentText, parentId: AddComment.Type["parentId"]) {
    const post = await this.postRepo.findOneBy({ id: postId });

    if (post === null) {
      return null;
    }
    const result = await this.repository.save({
      userId: uid,
      postId: postId,
      text: text,
      parentId: parentId,
    });

    await this.postRepo.update(postId, { commentsNum: post.commentsNum + 1 });

    return parseDAO(CommentDAO.zod, result);
  }

  public async getAllPostComment(postId: UUID, limit: PaginationNumber, page: PaginationNumber) {
    const skip = (page - 1) * limit;

    const result = await this.repository.findAndCount({
      where: { postId },
      relations: {
        post: true,
      },
      take: limit,
      skip,
    });

    return parseDAO(GetAllCommentPostsDAO.zod, result);
  }
}
