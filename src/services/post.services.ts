import { UUID } from "crypto";
import { PaginationNumber, createPagination } from "~/models/common";
import { BasePost } from "~/models/post.models";
import { Tag } from "~/models/tag.models";
import { IPostRepo } from "~/repository/post.repo";
import { ForbiddenNumberOfPhotos, ForbiddenNumberOfTags, PostNotFound } from "./errors/service.errors";
import { UploadedImage } from "~/models/image.models";

export class PostServices {
  constructor(private postRepo: IPostRepo) {}

  private createBaseTags(tags: Tag.tagBrand[]) {
    const baseTags = tags.map((tag) => ({ value: tag }));
    return baseTags;
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

  public async getAllUserPosts(uid: UUID, limit: PaginationNumber, page: PaginationNumber) {
    const [posts, total] = await this.postRepo.getAllUserPosts(uid, limit, page);

    const singleImagePosts = posts.map((post) => {
      const { images, ...rest } = post;

      if (images[0] === undefined) {
        return post;
      }

      return { ...rest, image: images[0] };
    });

    return createPagination(singleImagePosts, page, limit, total);
  }

  public async getPostDetails(userId: UUID, postId: UUID) {
    const post = await this.postRepo.getPostDetails(postId);

    if (post === null) {
      throw new PostNotFound();
    }

    const isLiked = await this.postRepo.isLikedBy(userId, postId);

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

  public async likePost(uid: UUID, postId: UUID) {
    const result = await this.postRepo.likeAndUpdateCount(uid, postId);

    if (result === "ERROR_POST_NOT_FOUND") {
      throw new PostNotFound();
    }

    return result;
  }

  public async bookmarkPost(uid: UUID, postId: UUID, bookmark: boolean) {
    const result = bookmark
      ? await this.postRepo.bookmarkAndUpdateCount(uid, postId)
      : await this.postRepo.removeBookmarkAndUpdateCount(uid, postId);

    if (result === "ERROR_POST_NOT_FOUND") {
      throw new PostNotFound();
    }

    return result;
  }
}
