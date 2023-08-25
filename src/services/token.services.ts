import jwt from "jsonwebtoken";
import { z } from "zod";
import { zodUUID } from "~/models/common";
import { Token } from "~/models/token.models";
import { ProcessManager } from "~/utilities/ProcessManager";

const zodTokenData = z.object({ userId: zodUUID }).strip();

type TokenData = z.infer<typeof zodTokenData>;

export class TokenServices {
  private secret: string;

  constructor(){
    this.secret = this.getSecret()
  }
  private getSecret() {
    const secret = ProcessManager.get("SECRET").str;
  
    if (secret === undefined) {
      throw new Error("token secret is not provided");
    }
  
    return secret;
  }
  
  public generateToken(data: TokenData, expiresIn: number = 2 * 3600): Token {
    const token = jwt.sign(data, this.secret, { expiresIn }) as Token;
  
    return token;
  }
  
  public validate(token: Token): TokenData | null {
    try {
      const decoded = jwt.verify(token, this.secret);
      
      return zodTokenData.parse(decoded);
    } catch (error) {
      return null;
    }
  }
}