import { z } from "zod";
import { Brand, nonEmptyString } from "./common";

export namespace Tag {
  export type tagBrand = Brand<string, "tag">;

  export const check = (val: string): val is tagBrand => {
    const pattern = /^[^0-9]*$/;
    return 0 < val.length && 32 >= val.length && pattern.test(val);
  };

  export const zod = z.string().nonempty().refine(check);
}

export namespace BaseTag {
  export const items = {
    value: Tag.zod,
  };
  export const zod = z.object(items);
  export type baseTagType = z.infer<typeof zod>;
}
