import { PostServices } from "~/services/post.services";
import {
  ADDPostDTO,
  GetMyPostsDTO,
  GetPostDetailsDTO,
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
}
