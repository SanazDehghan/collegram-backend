import { z } from "zod";
import { Brand, zodUUID } from "./common";

export const zodPath = z.string().nonempty();

export type Size = Brand<number, "size">;
const isSize = (val: number): val is Size => {
  return val > 0 && val < 10000;
};
export const zodSize = z.number().refine(isSize);

export const zodMimeType = z.enum(["image/jpeg", "image/png"]);
export type MimeType = z.infer<typeof zodMimeType>;

export namespace PostImage {
  export const zodUploadImage = z.object({
    path: z.string().nonempty(),
    mimetype: z.enum(["image/jpeg", "image/png"]),
    size: z.number().int().gt(0),
  });

  export type UploadImage = z.TypeOf<typeof zodUploadImage>;
}
