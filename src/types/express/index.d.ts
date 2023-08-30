import { UUID } from "crypto";
import "express";

declare global {
  declare namespace Express {
    interface Request {
      dto?: any;
      uid?: UUID 
    }
    interface Response {
      data?: any;
    }
  }
}
