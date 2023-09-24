import { z } from "zod";
import { Tag } from "../../models/tag.models";

export namespace TagDAO {
  export const zod = z.object({
    id: z.number(),
    value: Tag.zod,
  });

  export type Type = z.infer<typeof zod>;
}
