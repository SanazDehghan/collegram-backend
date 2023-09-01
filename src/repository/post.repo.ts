import { UUID } from "crypto";
import { z } from "zod";
import { dataManager } from "~/DataManager";
import { PostsEntity } from "~/entities/post.entities";
import { PaginationNumber } from "~/models/common";
import { BaseImage } from "~/models/image.models";
import { BasePost, MinimalPost, Post, zodMinimalPost, zodPost } from "~/models/post.models";
import { PostImage } from "~/models/image.models";
import { BasePost } from "~/models/post.models";
import { BaseTag } from "~/models/tag.models";
import { User } from "~/models/user.models";
import { cleanObj } from "~/utilities/object";

export interface IPostRepo {
  addPost: (
    post: BasePost.basePostType,
    tags: BaseTag.baseTagType[],
    images: PostImage.UploadImage[],
    userId: UUID,
  ) => Promise<PostsEntity | null>;
  getAllUserPosts: (userId: UUID, limit: PaginationNumber, page: PaginationNumber) => Promise<[MinimalPost[], number]>;
  getPostDetails: (userId: UUID, postId: UUID) => Promise<Post | null>;
}

export class PostRepo implements IPostRepo {
  private repository = dataManager.source.getRepository(PostsEntity);

  public async addPost(
    post: BasePost.basePostType,
    tags: BaseTag.baseTagType[],
    images: PostImage.UploadImage[],
    userId: UUID,
  ) {
    const result = await this.repository.save({
      closeFriendsOnly: post.closeFriendsOnly,
      description: post.description,
      userId: userId,
      images: images,
      tags: tags,
    });
    return result;
  }

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

  public async getPostDetails(userId: UUID, postId: UUID) {
    const result = await this.repository.findOne({
      select: {
        id: true,
        userId: true,
        description: true,
        createdAt: true,
        images: {
          id: true,
          path: true,
        },
        tags: {
          value: true,
        },
      },
      relations: { images: true, tags: true },
      where: { id: postId, userId },
    });

    if (result === null) {
      return null;
    }

    const flattenTags = result.tags.map((tag) => tag.value);
    const post = cleanObj({ ...result, tags: flattenTags });

    return zodPost.parse(post);
  }
}
