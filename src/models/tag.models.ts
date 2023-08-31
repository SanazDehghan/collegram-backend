import { z } from "zod";
import { Brand, nonEmptyString } from "./common";

export type Tag = Brand<string, "tag">;

export const isTag = (val: string): val is Tag => {
  const pattern = /^[^0-9]*$/;
  return 0 < val.length && 32 >= val.length && pattern.test(val);
};

export const zodTag = z.string().nonempty().refine(isTag);
