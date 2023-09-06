import { PostServices } from "~/services/post.services";
import { GetMyPostsDTO, zodGetMyPostsDTO } from "../dtos/post.dtos";
import { errorMapper } from "../tools/errorMapper.tools";
import { BaseRoutes, RouteHandler } from "./base.routes";
import { RequestHandler } from "express";
import { UUID } from "crypto";
import { passObject } from "../middleware/passObject";

export class PostRoutes extends BaseRoutes {
  constructor(private service: PostServices) {
    super("/posts");
    this.router.get("/", passObject.passUserDTO(zodGetMyPostsDTO, this.getMyPosts.bind(this)));
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
}
