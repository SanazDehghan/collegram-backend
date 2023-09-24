import { UUID } from "crypto";
import { RequestHandler, Response, Router } from "express";
import { ZodError, ZodIssue } from "zod";
import { errorMapper } from "../tools/errorMapper.tools";
import { HttpError } from "../errors/http.error";
import { UploadImageDTO } from "../dtos/image.dtos";
import { errorResponse } from "../tools/error.response.tools";

interface SuccessOutput {
  success: true;
  data: any;
}

interface ErrorOutput {
  success: false;
  error: {
    message: string;
    issues?: ZodIssue[];
  };
}

export type Output = SuccessOutput | ErrorOutput;

export namespace Handler {
  export type UID = (uid: UUID) => RequestHandler;

  export type DTO<T> = (dto: T) => RequestHandler;

  export type UserDTO<T> = (uid: UUID, dto: T) => RequestHandler;

  export type UploadData<T> = (uid: UUID, dto: T, files: UploadImageDTO.Type[]) => RequestHandler;
}

export abstract class BaseRoutes {
  public router: Router;

  constructor(public base: string) {
    this.router = Router();
  }

  protected sendData(res: Response, data: unknown) {
    const output: Output = { success: true, data };

    res.send(output);
  }

  protected sendError(res: Response, error: unknown) {
    errorResponse(res, errorMapper(error));
  }
}
