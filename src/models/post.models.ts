import { z } from "zod";
import { Brand, zodUUID } from "./common";
import { AddComment } from "./comment.models";
import { Tag } from "./tag.models";
import { Image, UploadedImage } from "./image.models";
import { UUID } from "crypto";

export type Description = Brand<string, "description">;

export const isDescription = (description: string): description is Description =>
  description.length > 0 && description.length <= 255;

export const zodDescription = z.string().nonempty().refine(isDescription);

export interface MinimalPost {
  id: UUID,
  userId: UUID,
  image?: Image.Type
}

export interface MinimalPostMultipleImages {
  id: UUID,
  userId: UUID,
  images: Image.Type[]
}

export namespace BasePost {
  export const items = {
    description: zodDescription,
    closeFriendsOnly: z.boolean(),
  };
  export const zod = z.object(items).strict();
  export type basePostType = z.infer<typeof zod>;
}

export namespace Post {
  export const items = {
    ...BasePost.items,
    images: z.array(UploadedImage.zod),
    tags: z.array(Tag.zod),
    userId: zodUUID,
    comment: AddComment.zod,
  };
  export const zod = z.object(items).strict();
  export type postType = z.infer<typeof zod>;
}
