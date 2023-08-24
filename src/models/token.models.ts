import { UUID } from "crypto";
import { Brand } from "./common";

interface TokenPayload {
  userId: UUID;
}

export type Token = Brand<string, "token">;

//should be implemented later
export const isToken = (val: string): val is Token => true;

export const generateToken = (payload: TokenPayload, expiresIn: number = 2 * 3600): Token => {
  return "token" as Token;
};
