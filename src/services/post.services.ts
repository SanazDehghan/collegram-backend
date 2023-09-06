import { UUID } from "crypto";
import { IPostRepo } from "~/repository/post.repo";
import { Pagination, PaginationNumber, createPagination } from "~/models/common";
import { MinimalPost } from "~/models/post.models";

export class PostServices {
  constructor(private postRepo: IPostRepo) {}

  public async getAllUserPosts(uid: UUID, limit: PaginationNumber, page: PaginationNumber): Promise<Pagination<MinimalPost>> {
    const [posts, total] = await this.postRepo.getAllUserPosts(uid, limit, page);

    return createPagination(posts, page, limit, total);
  }
}
