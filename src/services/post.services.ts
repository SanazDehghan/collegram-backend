import { UUID } from "crypto";
import { IPostRepo } from "~/repository/post.repo";
import { Pagination, PaginationNumber, createPagination } from "~/models/common";
import { MinimalPost } from "~/models/post.models";
import { PostNotFound } from "./errors/service.errors";

export class PostServices {
  constructor(private postRepo: IPostRepo) {}

  public async getAllUserPosts(
    uid: UUID,
    limit: PaginationNumber,
    page: PaginationNumber,
  ): Promise<Pagination<MinimalPost>> {
    const [posts, total] = await this.postRepo.getAllUserPosts(uid, limit, page);

    return createPagination(posts, page, limit, total);
  }

  public async getPostDetails(userId: UUID, postId: UUID) {
    const post = await this.postRepo.getPostDetails(userId, postId);

    if (post === null) {
      throw new PostNotFound();
    }

    return post;
  }
}
