import { RequestHandler } from "express";
import { AnyZodObject } from "zod";

export function appendDTO<T extends AnyZodObject>(zodObject: T): RequestHandler {
  return async (req, _, next) => {
    try {
      req.dto = zodObject.parse({ ...req.query, ...req.params, ...req.body });
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
