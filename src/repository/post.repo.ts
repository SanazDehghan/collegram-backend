import { UUID } from "crypto";
import { dataManager } from "~/DataManager";
import { PostsEntity } from "~/entities/post.entities";
import { PaginationNumber } from "~/models/common";
import { UploadedImage } from "~/models/image.models";
import { BasePost } from "~/models/post.models";
import { BaseTag } from "~/models/tag.models";
import { TagsEntity } from "../entities/tag.entities";
import { GetAllUserPostsDAO, PostDetailsDAO } from "./daos/post.daos";
import { parseDAO } from "./tools/parse";
import { PostLikesEntity } from "../entities/postLikes.entities";

export interface IPostRepo {
  addPost: (
    post: BasePost.basePostType,
    tags: BaseTag.baseTagType[],
    images: UploadedImage.Type[],
    userId: UUID,
  ) => Promise<PostDetailsDAO.Type | null>;
  getAllUserPosts: (userId: UUID, limit: PaginationNumber, page: PaginationNumber) => Promise<GetAllUserPostsDAO.Type>;
  editPost: (
    userId: UUID,
    postId: UUID,
    tags: BaseTag.baseTagType[],
    basePost: BasePost.basePostType,
  ) => Promise<PostsEntity | null>;
  getPostDetails: (postId: UUID) => Promise<PostDetailsDAO.Type | null>;
  isLikedBy: (userId: UUID, postId: UUID) => Promise<boolean>;
  likeAndUpdateCount: (userId: UUID, postId: UUID) => Promise<"ERROR_POST_NOT_FOUND" | "LIKED_BEFORE" | "OK">;
}

export class PostRepo implements IPostRepo {
  private repository = dataManager.source.getRepository(PostsEntity);
  private tagsRepo = dataManager.source.getRepository(TagsEntity);
  private postLikesRepo = dataManager.source.getRepository(PostLikesEntity);

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

    return parseDAO(PostDetailsDAO.zod, result);
  }

  public async editPost(userId: UUID, postId: UUID, tags: BaseTag.baseTagType[], basePost: BasePost.basePostType) {
    const tagsToAdd = await this.getTagsToAdd(tags);
    const dbPost = await this.repository.findOneBy({ id: postId, userId: userId });
    if (dbPost === null) {
      return null;
    }
    const updatedPost = {
      ...dbPost,
      tags: tagsToAdd,
      description: basePost.description,
      closeFriendsOnly: basePost.closeFriendsOnly,
    };
    const result = await this.repository.save({
      ...updatedPost,
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

    return parseDAO(GetAllUserPostsDAO.zod, result);
  }

  public async getPostDetails(postId: UUID) {
    const result = await this.repository.findOne({
      select: {
        id: true,
        userId: true,
        description: true,
        closeFriendsOnly: true,
        likes: true,
        updatedAt: true,
        images: {
          id: true,
          path: true,
        },
        tags: {
          id: true,
          value: true,
        },
      },
      relations: { images: true, tags: true },
      where: { id: postId },
    });

    if (result === null) {
      return null;
    }

    return parseDAO(PostDetailsDAO.zod, result);
  }

  public async isLikedBy(userId: UUID, postId: UUID) {
    const record = await this.postLikesRepo.findOne({
      select: { id: true },
      where: { userId, postId },
    });

    return record !== null;
  }

  public async likeAndUpdateCount(userId: UUID, postId: UUID) {
    const post = await this.repository.findOneBy({ id: postId });

    if (post === null) {
      return "ERROR_POST_NOT_FOUND";
    }

    const isLikedBefore = await this.isLikedBy(userId, postId);
    
    if (isLikedBefore) {
      return "LIKED_BEFORE";
    }

    await this.postLikesRepo.save({ userId, postId });
    await this.repository.update(postId, { likes: post.likes + 1 });

    return "OK";
  }
}
