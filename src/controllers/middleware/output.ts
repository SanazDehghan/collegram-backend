import { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError, NotFoundError } from "~/controllers/errors/http.error";
import { ZodError, ZodIssue } from "zod";

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

type Output = SuccessOutput | ErrorOutput;

export function successHandler(): RequestHandler {
  return (_, res, next) => {
    if (res.data !== undefined) {
      const output: Output = { success: true, data: res.data };

      res.send(output);
      return;
    } else {
      return next();
    }
  };
}

export function notFoundHandler(): RequestHandler {
  return (_, __, next) => {
    next(new NotFoundError("Not Found!"));
  };
}

export function errorHandler(): ErrorRequestHandler {
  return (error, _, res, __) => {
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
    return;
  };
}
