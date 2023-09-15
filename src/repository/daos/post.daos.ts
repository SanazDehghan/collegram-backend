import { z } from "zod";
import { zodUUID } from "../../models/common";
import { zodDescription } from "../../models/post.models";
import { ImageDAO } from "./image.daos";
import { TagDAO } from "./tag.daos";

export namespace PostDetailsDAO {
  const zodCount = z.number().int().gte(0);

  export const zod = z.object({
    id: zodUUID,
    userId: zodUUID,
    closeFriendsOnly: z.boolean(),
    description: zodDescription,
    likes: zodCount,
    bookmarks: zodCount,
    images: z.array(ImageDAO.zod),
    tags: z.array(TagDAO.zod),
    updatedAt: z.coerce.date(),
  });

  export type Type = z.infer<typeof zod>;
}

export namespace GetAllUserPostsDAO {
  const minimalPost = z.object({
    id: zodUUID,
    userId: zodUUID,
    images: z.array(ImageDAO.zod),
  });

  export const zod = z.tuple([z.array(minimalPost), z.number().int().gte(0)]);

  export type Type = z.infer<typeof zod>;
}
