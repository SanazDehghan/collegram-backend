import { z } from "zod";
import { zodText } from "~/models/comment.models";
import { zodPaginationNumber, zodUUID } from "~/models/common";

export namespace AddCommentDTO {
  export const zod = z.object({
    postId: zodUUID,
    text: zodText,
    parentId: zodUUID.optional(),
  });

  export type AddCommentType = z.infer<typeof zod>;
}
export namespace GetCommentDTO {
  export const zod = z.object({
    postId: zodUUID,
    limit: zodPaginationNumber.default(20),
    page: zodPaginationNumber.default(2),
  });

  export type GetCommentType = z.infer<typeof zod>;
}
