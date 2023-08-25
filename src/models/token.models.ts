import { UUID } from "crypto";
import { Brand } from "./common";
import { z } from "zod";

export type Token = Brand<string, "token">;

//should be implemented later
export const isToken = (val: string): val is Token => true;

export const zodToken = z.string().nonempty().refine(isToken);
