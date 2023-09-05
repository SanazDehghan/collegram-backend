import { PostServices } from "~/services/post.services";
import { GetMyPostsDTO, zodGetMyPostsDTO } from "../dtos/post.dtos";
import { appendDTO } from "../middleware/appendDto";
import { appendUID } from "../middleware/auth";
import { errorMapper } from "../tools/errorMapper.tools";
import { BaseRoutes, RouteHandler } from "./base.routes";

export class PostRoutes extends BaseRoutes {
  constructor(private service: PostServices) {
    super("/posts");

    this.router.get("/", appendUID(), appendDTO(zodGetMyPostsDTO), this.getMyPosts());
  }

  private getMyPosts(): RouteHandler<GetMyPostsDTO> {
    return async (req, res, next) => {
      try {
        const uid = req.uid!;
        const { limit, page } = req.dto!;
        const result = await this.service.getAllUserPosts(uid, limit, page);

        res.data = result;

        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }
}
