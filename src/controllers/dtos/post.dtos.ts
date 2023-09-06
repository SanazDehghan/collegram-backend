import { z } from "zod";
import { zodPaginationNumber, zodUUID } from "~/models/common";

export const zodGetMyPostsDTO = z.object({
  limit: zodPaginationNumber.default(20),
  page: zodPaginationNumber.default(1),
});

export type GetMyPostsDTO = z.infer<typeof zodGetMyPostsDTO>;

export const zodGetPostDetailsDTO = z.object({
  postId: zodUUID,
});

export type GetPostDetailsDTO = z.infer<typeof zodGetPostDetailsDTO>;
