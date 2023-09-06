import { z } from "zod";

export const zodUploadImage = z.object({
  path: z.string().nonempty(),
  mimetype: z.union([z.literal("image/jpeg"), z.literal("image/png")]),
  size: z.number().int().gt(0),
});

export type UploadImage = z.TypeOf<typeof zodUploadImage>;
