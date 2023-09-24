import { NextFunction, RequestHandler, Request, Response } from "express";
import { AnyZodObject, z } from "zod";
import { Token, zodBearerToken } from "~/models/token.models";
import { TokenServices } from "~/services/token.services";
import { UnauthorizedError } from "../errors/http.error";
import { UUID } from "crypto";
import { errorResponse } from "../tools/error.response.tools";

class PassObject {
  constructor(private tokenServices: TokenServices) {}

  private getUserId(token: Token) {
    const tokenData = this.tokenServices.validate(token);

    if (tokenData === null) {
      throw new UnauthorizedError("Token is not valid");
    }

    return tokenData.userId;
  }

  private getDTO(req: Request, zodobject: AnyZodObject) {
    return zodobject.parse({ ...req.query, ...req.params, ...req.body });
  }

  private getUID(req: Request) {
    const auth = req.headers.authorization;
    const token = zodBearerToken.parse(auth);
    const uid = this.getUserId(token);

    return uid;
  }

  public passDTO<T extends AnyZodObject>(zodObject: T, handler: (dto: z.TypeOf<T>) => RequestHandler): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dto = this.getDTO(req, zodObject);

        handler(dto)(req, res, next);
      } catch (error) {
        errorResponse(res, error);
      }
    };
  }

  public passUID(handler: (uid: UUID) => RequestHandler): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const uid = this.getUID(req);

        handler(uid)(req, res, next);
      } catch (error) {
        errorResponse(res, error);
      }
    };
  }

  public passUserDTO<T extends AnyZodObject>(
    data: T,
    fn: (uid: UUID, dto: z.TypeOf<T>) => RequestHandler,
  ): RequestHandler {
    return async (req, res, next) => {
      try {
        const uid = this.getUID(req);
        const dto = this.getDTO(req, data);

        fn(uid, dto)(req, res, next);
      } catch (error) {
        errorResponse(res, error);
      }
    };
  }
}

export const passObject = new PassObject(new TokenServices());
