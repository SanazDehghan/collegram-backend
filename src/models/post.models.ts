import { z } from "zod";
import { Brand, zodUUID } from "./common";
import { zodImage } from "./image.model";
import { Comment } from "./comment.models";
import { Tag } from "./tag.models";
import { PostImage } from "./image.models";

export type Description = Brand<string, "description">;

export const isDescription = (description: string): description is Description =>
  description.length > 0 && description.length <= 255;

export const zodDescription = z.string().nonempty().refine(isDescription);

export const zodMinimalPost = z.object({
  id: zodUUID,
  userId: zodUUID,
  images: zodImage,
});

export type MinimalPost = z.infer<typeof zodMinimalPost>;

export const zodPost = zodMinimalPost.extend({
  description: zodDescription,
  tags: z.array(Tag.zod),
  createdAt: z.number().int(),
});

export type Post = z.infer<typeof zodPost>;
const basePost = {
  description: zodDescription,
  closeFriendsOnly: z.boolean(),
};
export const zodBasePost = z.object(basePost).strict();
export type BasePost = z.infer<typeof zodBasePost>;

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
    images: z.array(PostImage.zodUploadImage),
    tags: z.array(Tag.zod),
    userId: zodUUID,
    comment: Comment.zod,
  };
  export const zod = z.object(items).strict();
  export type postType = z.infer<typeof zod>;
}
