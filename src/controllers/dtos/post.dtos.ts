import { z } from "zod";
import { zodPaginationNumber } from "~/models/common";

export const zodGetMyPostsDTO = z.object({
  limit: zodPaginationNumber.default(20),
  page: zodPaginationNumber.default(1),
});

export type GetMyPostsDTO = z.infer<typeof zodGetMyPostsDTO>;
