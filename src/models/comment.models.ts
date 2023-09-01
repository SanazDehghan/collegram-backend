import { z } from "zod";
import { zodUUID } from "./common";

export namespace Comment {
  export const items = {
    userId: zodUUID,
    postId: zodUUID,
    text: z.string().nonempty(),
    parent: zodUUID,
  };
  export const zod = z.object(items).strict();
  export type commentType = z.infer<typeof zod>;
}
