import { z } from "zod";
import { Tag } from "../../models/tag.models";
import { zodUUID } from "~/models/common";
import { zodText } from "~/models/comment.models";

export namespace CommentDAO {
  export const zod = z.object({
    id: zodUUID,
    userId: zodUUID,
    postId: zodUUID,
    commentText: zodText,
    parentId: zodUUID.optional(),
    createdAt: z.date(),
  });

  export type Type = z.infer<typeof zod>;
}

export namespace GetAllCommentPostsDAO {
  const comments = z.object({
    id: zodUUID,
    userId: zodUUID,
    postId: zodUUID,
    commentText: zodText,
    parentId: zodUUID.optional(),
    createdAt: z.date(),
  });

  export const zod = z.tuple([z.array(comments), z.number().int().gte(0)]);

  export type Type = z.infer<typeof zod>;
}
