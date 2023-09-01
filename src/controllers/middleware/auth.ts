import { RequestHandler } from "express";
import { Token, zodToken } from "~/models/token.models";
import { TokenServices } from "~/services/token.services";
import { UnauthorizedError } from "../errors/http.error";

const tokenServices = new TokenServices();

function getUserId(token: Token) {
  const tokenData = tokenServices.validate(token);

  if (tokenData === null) {
    throw new UnauthorizedError("Token is not valid");
  }

  return tokenData.userId;
}

export function appendUID(): RequestHandler {
  return async (req, _, next) => {
    const auth = req.headers.authorization;
    
    try {
      const token = zodToken.parse(auth);

      const uid = getUserId(token);

      req.uid = uid;

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
