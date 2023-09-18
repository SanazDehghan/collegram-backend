import { Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../errors/http.error";
import { Output } from "../routes/base.routes";

export function errorResponse(res: Response, error: unknown) {
  const output: Output = { success: false, error: { message: "an error occurred" } };
  let status = 500;

  if (error instanceof HttpError) {
    output.error.message = error.message;
    status = error.status;
  } else if (error instanceof ZodError) {
    output.error.issues = error.issues;
    status = 400;
  }

  res.status(status).send(output);
}
