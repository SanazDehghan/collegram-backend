import { UUID } from "crypto";
import { dataManager } from "~/DataManager";
import { PostsEntity } from "~/entities/post.entities";
import { PaginationNumber } from "~/models/common";
import { UploadedImage } from "~/models/image.models";
import { BasePost } from "~/models/post.models";
import { BaseTag } from "~/models/tag.models";
import { TagsEntity } from "../entities/tag.entities";
import { GetAllUserPostsDAO, GetPostsByUserIdsDAO, GetUserBookmarksDAO, PostDetailsDAO } from "./daos/post.daos";
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
  getLikeRecord: (userId: UUID, postId: UUID) => Promise<{ id: number } | null>;
  toggleLikeAndUpdateCount: (userId: UUID, postId: UUID) => Promise<"ERROR_POST_NOT_FOUND" | "LIKED" | "LIKE_REMOVED">;
  toggleBookmarkAndUpdateCount: (
    userId: UUID,
    postId: UUID,
  ) => Promise<"ERROR_POST_NOT_FOUND" | "BOOKMARKED" | "BOOKMARK_REMOVED">;
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

  public async getLikeRecord(userId: UUID, postId: UUID) {
    const record = await this.postLikesRepo.findOne({
      select: { id: true },
      where: { userId, postId, unLikedAt: IsNull() },
    });

    return record;
  }

  public async toggleLikeAndUpdateCount(userId: UUID, postId: UUID) {
    const post = await this.repository.findOneBy({ id: postId });

    if (post === null) {
      return "ERROR_POST_NOT_FOUND";
    }

    const likeRecord = await this.getLikeRecord(userId, postId);

    if (likeRecord === null) {
      await this.postLikesRepo.save({ userId, postId });
      await this.repository.update(postId, { likes: post.likes + 1 });

      return "LIKED";
    } else {
      await this.postLikesRepo.update(likeRecord.id, { unLikedAt: new Date() });
      await this.repository.update(postId, { likes: post.likes - 1 });

      return "LIKE_REMOVED";
    }
  }

  private async getBookmark(userId: UUID, postId: UUID) {
    const record = await this.postBookmarksRepo.findOne({
      select: { id: true },
      where: { userId, postId, deletedAt: IsNull() },
    });

    return record;
  }

  public async toggleBookmarkAndUpdateCount(userId: UUID, postId: UUID) {
    const post = await this.repository.findOneBy({ id: postId });

    if (post === null) {
      return "ERROR_POST_NOT_FOUND";
    }

    const bookmarkRecord = await this.getBookmark(userId, postId);

    if (bookmarkRecord === null) {
      await this.postBookmarksRepo.save({ userId, postId });
      await this.repository.update(postId, { bookmarks: post.bookmarks + 1 });

      return "BOOKMARKED";
    } else {
      await this.postBookmarksRepo.update(bookmarkRecord.id, { deletedAt: new Date() });
      await this.repository.update(postId, { bookmarks: post.bookmarks - 1 });

      return "BOOKMARK_REMOVED";
    }
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
      },
      relations: { images: true, tags: true, user: true },
      where: { userId: In(userIds) },
      take: limit,
      skip,
    });

    return parseDAO(GetPostsByUserIdsDAO.zod, results);
  }
}
