import { Brand } from "./common";
import { z } from "zod";

export type Token = Brand<string, "token">;

export type BearerToken = `Bearer ${Token}`;

//should be implemented later
export const isToken = (val: string): val is Token => {
  const pattern = /^eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/;

  return pattern.test(val);
};

export const isBearerToken = (val: string): val is BearerToken => {
  const splitted = val.split(" ");

  if (splitted.length !== 2) {
    return false;
  }

  return splitted[0] === "Bearer" && isToken(splitted[1]!);
};

const transform = (bearer: BearerToken): Token => bearer.split(" ")[1] as Token;

export const zodBearerToken = z.string().nonempty().refine(isBearerToken).transform(transform);

export const  zodToken = z.string().nonempty().refine(isToken)