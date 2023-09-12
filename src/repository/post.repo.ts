import { UUID } from "crypto";
import { z } from "zod";
import { dataManager } from "~/DataManager";
import { PostsEntity } from "~/entities/post.entities";
import { PaginationNumber } from "~/models/common";
import { UploadedImage } from "~/models/image.models";
import { BasePost, MinimalPost, Post, zodMinimalPost, zodPost } from "~/models/post.models";
import { BaseTag } from "~/models/tag.models";
import { cleanObj } from "~/utilities/object";
import { TagsEntity } from "../entities/tag.entities";

export interface IPostRepo {
  addPost: (
    post: BasePost.basePostType,
    tags: BaseTag.baseTagType[],
    images: UploadedImage.Type[],
    userId: UUID,
  ) => Promise<PostsEntity | null>;
  getAllUserPosts: (userId: UUID, limit: PaginationNumber, page: PaginationNumber) => Promise<[MinimalPost[], number]>;
  getPostDetails: (userId: UUID, postId: UUID) => Promise<Post | null>;
}

export class PostRepo implements IPostRepo {
  private repository = dataManager.source.getRepository(PostsEntity);
  private tagsRepo = dataManager.source.getRepository(TagsEntity);

  private async getTagsToAdd(tags: BaseTag.baseTagType[]): Promise<(BaseTag.baseTagType | TagsEntity)[]> {
    const dbTags = await this.tagsRepo.findBy(tags);
    const dbTagsValues = dbTags.map((tag) => tag.value);
    const newTags = tags.filter((tag) => !dbTagsValues.includes(tag.value));

    return [...dbTags, ...newTags];
  }

  public async addPost(
    post: BasePost.basePostType,
    tags: BaseTag.baseTagType[],
    images: UploadedImage.Type[],
    userId: UUID,
  ) {
    const tagsToAdd = await this.getTagsToAdd(tags);

    const result = await this.repository.save({
      closeFriendsOnly: post.closeFriendsOnly,
      description: post.description,
      userId: userId,
      images: images.map((image) => {
        return { ...image, userId: userId };
      }),
      tags: tagsToAdd,
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
