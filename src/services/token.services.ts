import { UUID } from "crypto";
import { Token } from "~/models/token.models";

interface TokenData {
  userId: UUID;
}

export function generateToken(data: TokenData, expiresIn: number = 2 * 3600): Token {
  return "token" as Token;
}

export function verify(token: Token): TokenData | null {
  return null;
}
