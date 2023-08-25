import { Brand } from "./common";
import { z } from "zod";

export type Token = Brand<string, "token">;

//should be implemented later
export const isToken = (val: string): val is Token => {
  const pattern = /^eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/;

  return pattern.test(val);
};

export const zodToken = z.string().nonempty().refine(isToken);
