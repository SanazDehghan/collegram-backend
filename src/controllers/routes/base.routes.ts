import { UUID } from "crypto";
import { NextFunction, Request, Response, Router } from "express";

export interface CustomRequest<T = any> extends Request {
  dto?: T;
  uid?: UUID;
}

export type RouteHandler<T = any> = (req: CustomRequest<T>, res: Response, next: NextFunction) => Promise<any>

export abstract class BaseRoutes {
  public router: Router;

  constructor(public base: string) {
    this.router = Router();
  }
}
