import { RequestHandler } from "express";
import { errorResponse } from "../tools/error.response.tools";
import { NotFoundError } from "../errors/http.error";

export function defaultHandler(): RequestHandler {
  return (_, res) => {
    errorResponse(res, new NotFoundError("endpoint not found!"));
  };
}
