import { BaseRoutes, Handler } from "./base.routes";
import { passObject } from "../middleware/passObject";
import { AddCommentDTO, GetCommentDTO } from "../dtos/comment.dtos";
import { CommentServices } from "~/services/comment.services";

export class CommentRoutes extends BaseRoutes {
  constructor(private service: CommentServices) {
    super("/comments");

    this.router.post("/", passObject.passUserDTO(AddCommentDTO.zod, this.addComment.bind(this)));
    this.router.get("/", passObject.passDTO(GetCommentDTO.zod, this.getComment.bind(this)));
  }

  public addComment: Handler.UserDTO<AddCommentDTO.AddCommentType> = (uid, dto) => {
    return async (req, res) => {
      try {
        const { postId, text, parentId } = dto;
        const result = await this.service.addComment(uid, postId, text, parentId);

        this.sendData(res, result);
      } catch (error) {
        this.sendError(res, error);
      }
    };
  };

  public getComment: Handler.DTO<GetCommentDTO.GetCommentType> = (dto) => {
    return async (req, res) => {
      try {
        const { postId, limit, page } = dto;
        const result = await this.service.getComment(postId, limit, page);

        this.sendData(res, result);
      } catch (error) {
        this.sendData(res, error);
      }
    };
  };
}
