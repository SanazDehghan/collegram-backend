import { PostServices } from "~/services/post.services";
import {
  ADDPostDTO,
  BookmarkPostDTO,
  EditPostDTO,
  GetMyPostsDTO,
  GetPostDetailsDTO,
  LikePostDTO,
  zodGetMyPostsDTO,
  zodGetPostDetailsDTO,
} from "../dtos/post.dtos";
import { errorMapper } from "../tools/errorMapper.tools";
import { BaseRoutes, RouteHandler } from "./base.routes";
import { RequestHandler } from "express";
import { UUID } from "crypto";
import { passObject } from "../middleware/passObject";
import { upload } from "../middleware/upload";
import { UploadImageDTO } from "~/controllers/dtos/image.dtos";

export class PostRoutes extends BaseRoutes {
  constructor(private service: PostServices) {
    super("/posts");

    this.router.post("/", upload.files("photos", 5), upload.passData(ADDPostDTO.zod, this.addPost.bind(this)));
    this.router.get("/", passObject.passUserDTO(zodGetMyPostsDTO, this.getMyPosts.bind(this)));
    this.router.get("/:postId", passObject.passUserDTO(zodGetPostDetailsDTO, this.getPostDetails.bind(this)));
    this.router.put("/:postId", passObject.passUserDTO(EditPostDTO.zod, this.editPost.bind(this)));
    this.router.post("/like", passObject.passUserDTO(LikePostDTO.zod, this.likePost.bind(this)));
    this.router.put("/bookmark", passObject.passUserDTO(BookmarkPostDTO.zod, this.bookmarkPost.bind(this)));
  }

  private editPost(uid: UUID, dto: EditPostDTO.Type): RequestHandler {
    return async (req, res, next) => {
      try {
        const postId = dto.postId;
        const tags = dto.tags;
        const basePost = { description: dto.description, closeFriendsOnly: dto.closeFriendsOnly };
        const result = await this.service.editPost(uid, postId, tags, basePost);
        res.data = result;
        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }

  private getMyPosts(uid: UUID, dto: GetMyPostsDTO): RequestHandler {
    return async (req, res, next) => {
      try {
        const { limit, page } = dto;
        const result = await this.service.getAllUserPosts(uid, limit, page);

        res.data = result;

        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }

  private getPostDetails(uid: UUID, dto: GetPostDetailsDTO): RequestHandler {
    return async (req, res, next) => {
      try {
        const result = await this.service.getPostDetails(uid, dto.postId);

        res.data = result;

        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }

  private addPost(
    userId: UUID,
    dto: ADDPostDTO.AddPostType,
    files: UploadImageDTO.Type[],
  ): RouteHandler<ADDPostDTO.AddPostType> {
    return async (req, res, next) => {
      try {
        const tags = dto.tags;
        const basePost = { description: dto.description, closeFriendsOnly: dto.closeFriendsOnly };
        const post = await this.service.addPost(basePost, files, tags, userId);
        res.data = post;

        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }

  private likePost(uid: UUID, dto: LikePostDTO.Type): RequestHandler {
    return async (req, res, next) => {
      try {
        const result = await this.service.likePost(uid, dto.postId);

        res.data = result;

        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }

  private bookmarkPost(uid: UUID, dto: BookmarkPostDTO.Type): RequestHandler {
    return async (req, res, next) => {
      try {
        const { postId, bookmark } = dto;
        const result = await this.service.bookmarkPost(uid, postId, bookmark);

        res.data = result;

        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }
}
