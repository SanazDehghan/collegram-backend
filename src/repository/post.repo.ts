import { UUID } from "crypto";
import { z } from "zod";
import { dataManager } from "~/DataManager";
import { PostsEntity } from "~/entities/post.entities";
import { PaginationNumber } from "~/models/common";
import { MinimalPost, zodMinimalPost } from "~/models/post.models";

export interface IPostRepo {
  getAllUserPosts: (userId: UUID, limit: PaginationNumber, page: PaginationNumber) => Promise<[MinimalPost[], number]>;
}

export class PostRepo implements IPostRepo {
  private repository = dataManager.source.getRepository(PostsEntity);

  public async getAllUserPosts(userId: UUID, limit: PaginationNumber, page: PaginationNumber) {
    const skip = (page - 1) * limit;

    const result = await this.repository.findAndCount({
      where: { userId },
      relations: {
        images: true,
      },
      take: limit,
      skip,
    });

    const posts = z.array(zodMinimalPost).parse(result[0]);
    const total = result[1];

    const output: [MinimalPost[], number] = [posts, total];

    return output;
  }
}
