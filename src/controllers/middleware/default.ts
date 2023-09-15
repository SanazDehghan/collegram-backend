import { RequestHandler } from "express";

export function defaultHandler(): RequestHandler {
  return (_, res) => {
    res.status(404).send({
      success: false,
      error: {
        message: "endpoint not found!",
      },
    });
  };
}
