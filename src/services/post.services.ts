import { UUID } from "crypto";
import { PaginationNumber, createPagination } from "~/models/common";
import { BasePost, MinimalPost, MinimalPostMultipleImages } from "~/models/post.models";
import { Tag } from "~/models/tag.models";
import { IPostRepo } from "~/repository/post.repo";
import { ForbiddenNumberOfPhotos, ForbiddenNumberOfTags, PostNotFound } from "./errors/service.errors";
import { UploadedImage } from "~/models/image.models";
import { UserRelationsServices } from "./userRelations.services";

export class PostServices {
  constructor(
    private postRepo: IPostRepo,
    private userRelationsServices: UserRelationsServices,
  ) {}

  private createBaseTags(tags: Tag.tagBrand[]) {
    const baseTags = tags.map((tag) => ({ value: tag }));
    return baseTags;
  }

  private createBaseImage(images: UploadedImage.Type[], userId: UUID) {
    const baseImage = images.map((image) => ({ userId, ...image }));
    return baseImage;
  }

  public async addPost(post: BasePost.basePostType, images: UploadedImage.Type[], tags: Tag.tagBrand[], userId: UUID) {
    if (images.length == 0) {
      throw new ForbiddenNumberOfPhotos();
    }

    if (tags.length > 7) {
      throw new ForbiddenNumberOfTags();
    }

    const baseTags = this.createBaseTags(tags);
    //const baseImages = this.createBaseImage(images, userId);
    const addedPost = await this.postRepo.addPost(post, baseTags, images, userId);

    return addedPost;
  }

  private makeSingleImagePosts(posts: MinimalPostMultipleImages[]): MinimalPost[] {
    const singleImagePosts = posts.map((post) => {
      const { images, ...rest } = post;

      if (images[0] === undefined) {
        return rest;
      }

      return { ...rest, image: images[0] };
    });

    return singleImagePosts;
  }

  public async getAllUserPosts(uid: UUID, limit: PaginationNumber, page: PaginationNumber) {
    const [posts, total] = await this.postRepo.getAllUserPosts(uid, limit, page);

    const singleImagePosts = this.makeSingleImagePosts(posts);

    return createPagination(singleImagePosts, page, limit, total);
  }

  public async getPostDetails(userId: UUID, postId: UUID) {
    const post = await this.postRepo.getPostDetails(postId);

    if (post === null) {
      throw new PostNotFound();
    }

    const likeRecord = await this.postRepo.getLikeRecord(userId, postId);
    const isLiked = likeRecord !== null

    const result = { ...post, isLiked };

    return result;
  }

  public async editPost(userId: UUID, postId: UUID, tags: Tag.tagBrand[], basePost: BasePost.basePostType) {
    if (tags.length > 7) {
      throw new ForbiddenNumberOfTags();
    }
    const baseTags = this.createBaseTags(tags);
    const post = await this.postRepo.editPost(userId, postId, baseTags, basePost);
    if (post === null) {
      throw new PostNotFound();
    }
    return post;
  }

  public async togglePostLike(uid: UUID, postId: UUID) {
    const result = await this.postRepo.toggleLikeAndUpdateCount(uid, postId);

    if (result === "ERROR_POST_NOT_FOUND") {
      throw new PostNotFound();
    }

    return result;
  }

  public async toggleBookmarkPost(uid: UUID, postId: UUID) {
    const result = await this.postRepo.toggleBookmarkAndUpdateCount(uid, postId);

    if (result === "ERROR_POST_NOT_FOUND") {
      throw new PostNotFound();
    }

    return result;
  }

  public async getMyBookmarks(userId: UUID, limit: PaginationNumber, page: PaginationNumber) {
    const [posts, total] = await this.postRepo.getUserBookmarks(userId, limit, page);

    const singleImagePosts = this.makeSingleImagePosts(posts);

    return createPagination(singleImagePosts, page, limit, total);
  }
  
  public async getAllFollowingsPosts(uid: UUID, limit: PaginationNumber, page: PaginationNumber) {
    const followingsUserIds = await this.userRelationsServices.getUserFollowingIds(uid);
    const [followingsPosts, total] = await this.postRepo.getPostsByUserIds(followingsUserIds, limit, page);

    return createPagination(followingsPosts, page, limit, total);
  }
}
