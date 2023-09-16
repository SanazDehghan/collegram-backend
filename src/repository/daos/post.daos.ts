import { z } from "zod";
import { zodNonEmptyString, zodUUID } from "../../models/common";
import { zodDescription } from "../../models/post.models";
import { ImageDAO } from "./image.daos";
import { TagDAO } from "./tag.daos";
import { Tag } from "../../models/tag.models";
import { zodUsername } from "../../models/user.models";
import { Image } from "../../models/image.models";

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

export namespace GetUserBookmarksDAO {
  const minimalPost = z.object({
    id: zodUUID,
    userId: zodUUID,
    images: z.array(ImageDAO.zod),
  });

  export const zod = z.tuple([z.array(minimalPost), z.number().int().gte(0)]);

  export type Type = z.infer<typeof zod>;
}

export namespace GetPostsByUserIdsDAO {
  const schema = z.object({
    id: zodUUID,
    closeFriendsOnly: z.boolean(),
    likes: z.number().int().gte(0),
    bookmarks: z.number().int().gte(0),
    commentsNum: z.number().int().gte(0),
    images: z.array(Image.zod),
    tags: z.array(z.object({value: Tag.zod})),
    user: z.object({
      id: zodUUID,
      username: zodUsername,
      firstName: zodNonEmptyString.optional(),
      lastName: zodNonEmptyString.optional(),
    }),
  });

  export const zod = z.tuple([z.array(schema), z.number().int().gte(0)]);

  export type Type = z.infer<typeof zod>;
}
