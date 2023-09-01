import { PostImage, zodMimeType, zodPath, zodSize } from "~/models/image.models";
import { BasePost, Description, zodDescription } from "~/models/post.models";
import { BaseTag, Tag } from "~/models/tag.models";
import { IPostRepo } from "~/repository/post.repo";
import { ForbidenNumberOfPhotos, ForbidenNumberOfTags } from "./errors/service.errors";
import { zodBio } from "~/models/user.models";
import { UUID } from "crypto";
import { IPostRepo } from "~/repository/post.repo";
import { Pagination, PaginationNumber, createPagination } from "~/models/common";
import { BasePost, Description, MinimalPost, zodDescription } from "~/models/post.models";
import { ForbiddenNumberOfPhotos, ForbiddenNumberOfTags, PostNotFound } from "./errors/service.errors";
import { MulterImage, zodPath, zodSize, zodMimeType } from "~/models/image.models";
import { BaseTag, Tag } from "~/models/tag.models";

export class PostServices {
  constructor(private postRepo: IPostRepo) {}

  private createBaseTags(tags: Tag.tagBrand[]) {
    const baseTags = tags.map((tag) => ({ value: tag }));
    return baseTags;
  }

  public async addPost(
    post: BasePost.basePostType,
    images: PostImage.UploadImage[],
    tags: Tag.tagBrand[],
    userId: UUID,
  ) {
    if (images.length == 0) {
      throw new ForbidenNumberOfPhotos();
    }

    if (tags.length > 7) {
      throw new ForbidenNumberOfTags();
    }

    const baseTags = this.createBaseTags(tags);
    const addedPost = await this.postRepo.addPost(post, baseTags, images, userId);

    return addedPost;
  }

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
