import { UUID } from "crypto";
import { dataManager } from "~/DataManager";
import { PostsEntity } from "~/entities/post.entities";
import { PaginationNumber } from "~/models/common";
import { UploadedImage } from "~/models/image.models";
import { BasePost } from "~/models/post.models";
import { BaseTag } from "~/models/tag.models";
import { TagsEntity } from "../entities/tag.entities";
import {
  GetAllUserPostsDAO,
  GetBookmarkRecordDAO,
  GetLikeRecordDAO,
  GetPostByIdDAO,
  GetPostsByUserIdsDAO,
  GetUserBookmarksDAO,
  PostDetailsDAO,
} from "./daos/post.daos";
import { parseDAO } from "./tools/parse";
import { PostLikesEntity } from "../entities/postLikes.entities";
import { PostBookmarksEntity } from "../entities/postBookmarks.entities";
import { In, IsNull } from "typeorm";
import { paginate } from "./tools/paginate";

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
  getPostById: (postId: UUID) => Promise<GetPostByIdDAO.Type | null>;
  getLikeRecord: (userId: UUID, postId: UUID) => Promise<GetLikeRecordDAO.Type | null>;
  addNewPostLike: (userId: UUID, postId: UUID, newLikesCount: number) => Promise<void>;
  removePostLike: (likeRecord: GetLikeRecordDAO.Type, newLikesCount: number) => Promise<void>;
  getBookmarkRecord: (userId: UUID, postId: UUID) => Promise<GetBookmarkRecordDAO.Type | null>;
  addNewPostBookmark: (userId: UUID, postId: UUID, newBookmarksCount: number) => Promise<void>;
  removePostBookmark: (bookmarkRecord: GetBookmarkRecordDAO.Type, newBookmarksCount: number) => Promise<void>;
  getUserBookmarks: (
    userId: UUID,
    limit: PaginationNumber,
    page: PaginationNumber,
  ) => Promise<GetUserBookmarksDAO.Type>;
  getPostsByUserIds: (
    userIds: UUID[],
    limit: PaginationNumber,
    page: PaginationNumber,
  ) => Promise<GetPostsByUserIdsDAO.Type>;
}

export class PostRepo implements IPostRepo {
  private repository = dataManager.source.getRepository(PostsEntity);
  private tagsRepo = dataManager.source.getRepository(TagsEntity);
  private postLikesRepo = dataManager.source.getRepository(PostLikesEntity);
  private postBookmarksRepo = dataManager.source.getRepository(PostBookmarksEntity);

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
        bookmarks: true,
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

  public async getPostById(postId: UUID) {
    const result = await this.repository.findOneBy({ id: postId });

    return parseDAO(GetPostByIdDAO.zod.nullable(), result);
  }

  public async getLikeRecord(userId: UUID, postId: UUID) {
    const record = await this.postLikesRepo.findOneBy({ userId, postId, unLikedAt: IsNull() });

    return parseDAO(GetLikeRecordDAO.zod.nullable(), record);
  }

  public async addNewPostLike(userId: UUID, postId: UUID, newLikesCount: number) {
    await this.postLikesRepo.save({ userId, postId });
    await this.repository.update(postId, { likes: newLikesCount });
  }

  public async removePostLike(likeRecord: GetLikeRecordDAO.Type, newLikesCount: number) {
    await this.postLikesRepo.update(likeRecord.id, { unLikedAt: new Date() });
    await this.repository.update(likeRecord.postId, { likes: newLikesCount });
  }

  public async getBookmarkRecord(userId: UUID, postId: UUID) {
    const record = await this.postBookmarksRepo.findOneBy({ userId, postId, deletedAt: IsNull() });

    return parseDAO(GetBookmarkRecordDAO.zod.nullable(), record);
  }

  public async addNewPostBookmark(userId: UUID, postId: UUID, newBookmarksCount: number) {
    await this.postBookmarksRepo.save({ userId, postId });
    await this.repository.update(postId, { bookmarks: newBookmarksCount });
  }

  public async removePostBookmark(bookmarkRecord: GetBookmarkRecordDAO.Type, newBookmarksCount: number) {
    await this.postBookmarksRepo.update(bookmarkRecord.id, { deletedAt: new Date() });
    await this.repository.update(bookmarkRecord.postId, { bookmarks: newBookmarksCount });
  }

  private async getUserBookmarkedPosts(userId: UUID) {
    const records = await this.postBookmarksRepo.find({
      select: { postId: true },
      where: { userId, deletedAt: IsNull() },
    });

    const postIds = records.map((record) => record.postId);

    return postIds;
  }

  public async getUserBookmarks(userId: UUID, limit: PaginationNumber, page: PaginationNumber) {
    const postIds = await this.getUserBookmarkedPosts(userId);

    const result = await this.repository.findAndCount({
      select: {
        id: true,
        userId: true,
        images: true,
      },
      where: { id: In(postIds) },
      relations: { images: true },
      ...paginate(limit, page),
    });

    return parseDAO(GetUserBookmarksDAO.zod, result);
  }

  public async getPostsByUserIds(userIds: UUID[], limit: PaginationNumber, page: PaginationNumber) {
    const skip = (page - 1) * limit;

    const results = await this.repository.findAndCount({
      select: {
        id: true,
        likes: true,
        bookmarks: true,
        commentsNum: true,
        closeFriendsOnly: true,
        images: {
          id: true,
          path: true,
        },
        tags: {
          value: true,
        },
        user: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
        createdAt: true,
      },
      relations: { images: true, tags: true, user: true },
      where: { userId: In(userIds) },
      order: { createdAt: "DESC" },
      take: limit,
      skip,
    });

    return parseDAO(GetPostsByUserIdsDAO.zod, results);
  }
}
