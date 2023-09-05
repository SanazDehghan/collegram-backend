import { NextFunction, RequestHandler, Request, Response } from "express";
import { AnyZodObject, ZodObject, z } from "zod";
import { RouteHandler } from "../routes/base.routes";
import { Token, zodBearerToken } from "~/models/token.models";
import { TokenServices } from "~/services/token.services";
import { UnauthorizedError } from "../errors/http.error";
import { UUID } from "crypto";

export class PassObject{
  constructor(
    private tokenServices:TokenServices
  ){}
public async  getUserId(token: Token) {
  const tokenData = this.tokenServices.validate(token);

  if (tokenData === null) {
    throw new UnauthorizedError("Token is not valid");
  }

  return tokenData.userId;
}
 public passDTO<T extends AnyZodObject>
  (zodObject: T,
  handler:(x:z.TypeOf<T>)=>RequestHandler):RequestHandler{
    return async (req:Request, res:Response, next:NextFunction) => {
      try {
        const dto = zodObject.parse({ ...req.query, ...req.params, ...req.body });
        return handler(dto)(req, res, next);
      } catch (error) {
        return next(error);
      }
  
  };
}

public passUID(handler:(x:UUID)=>RequestHandler): RequestHandler {
  return async (req:Request, res:Response, next:NextFunction) => {
    const auth = req.headers.authorization;
    try {
      const token = zodBearerToken.parse(auth);
      const uid = await this.getUserId(token);

      return handler(uid)(req, res,next);
    } catch (error) {
      return next(error);
    }
  };
}

public passDTO_UID<T extends AnyZodObject>(
  data: T,
  fn: (uid: UUID, dto: z.TypeOf<T>) => RequestHandler,
): RequestHandler {
  return async (req, res, next) => {
    try {
      const auth = req.headers.authorization;
      const token = zodBearerToken.parse(auth);
      const uid = await this.getUserId(token);
      const dto = data.parse({ ...req.query, ...req.params});

      await fn(uid, dto)(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
}