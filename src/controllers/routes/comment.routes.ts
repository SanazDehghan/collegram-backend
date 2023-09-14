import { errorMapper } from "../tools/errorMapper.tools";
import { BaseRoutes, RouteHandler } from "./base.routes";
import { RequestHandler } from "express";
import { passObject } from "../middleware/passObject";
import { AddCommentDTO, GetCommentDTO } from "../dtos/comment.dtos";
import { CommentServices } from "~/services/comment.services";
import { UUID } from "crypto";


export class CommentRoutes extends BaseRoutes {
  constructor(private service: CommentServices) {
    super("/comments");

    this.router.post("/", passObject.passUserDTO(AddCommentDTO.zod, this.addComment.bind(this)));
    this.router.get("/", passObject.passUserDTO(GetCommentDTO.zod, this.getComment.bind(this)));
  }

  public addComment(uid: UUID, dto: AddCommentDTO.AddCommentType): RequestHandler {
    return async (req, res, next) => {
      try {
        const { postId, text, parentId } = dto;
        const result = await this.service.addComment(uid, postId, text, parentId);

        res.data = {result};

        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }

  public getComment(uid: UUID, dto: GetCommentDTO.GetCommentType): RequestHandler {
    return async (req, res, next) => {
      try {
        const { postId, limit, page } = dto;
        const result = await this.service.getComment(postId, limit, page);

        res.data = {result};

        next();
      } catch (error) {
        next(errorMapper(error));
      }
    };
  }
}
