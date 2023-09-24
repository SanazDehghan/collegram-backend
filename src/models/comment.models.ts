import { z } from "zod";
import { Brand, zodUUID } from "./common";

export type CommentText = Brand<string, "Text">;

export const isText = (text: string): text is CommentText => text.length > 0 && text.length <= 255;

export const zodText = z.string().nonempty().refine(isText);

export namespace AddComment {
  export const items = {
    postId: zodUUID,
    commentText: zodText,
    parentId: zodUUID.optional(),
  };
  export const zod = z.object(items);
  export type Type = z.infer<typeof zod>;
}

export namespace AllComment {
  export const items = {
    postId: zodUUID,
    commentText: zodText,
    parentId: zodUUID.optional(),
  };
  export const zod = z.object(items);
  export type commentType = z.infer<typeof zod>;
}
