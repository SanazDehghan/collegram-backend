import { z } from "zod";
import { zodPaginationNumber, zodUUID } from "~/models/common";
import { zodDescription } from "~/models/post.models";
import { Tag } from "~/models/tag.models";

export const zodGetMyPostsDTO = z.object({
  limit: zodPaginationNumber.default(20),
  page: zodPaginationNumber.default(1),
});

export type GetMyPostsDTO = z.infer<typeof zodGetMyPostsDTO>;

export const zodGetPostDetailsDTO = z.object({
  postId: zodUUID,
});

export type GetPostDetailsDTO = z.infer<typeof zodGetPostDetailsDTO>;

export namespace ADDPostDTO {
  export const zod = z.object({
    description: zodDescription,
    closeFriendsOnly: z.boolean(),
    tags: z.array(Tag.zod),
  });

  export type AddPostType = z.infer<typeof zod>;
}
