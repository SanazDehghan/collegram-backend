import "express";

declare global {
  declare namespace Express {
    interface Request {
      dto?: any;
    }
    interface Response {
      data?: any;
    }
  }
}
