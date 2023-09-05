import { z } from "zod";
import { Brand, zodUUID } from "./common";
import { zodImage } from "./image.model";

export type Description = Brand<string, "description">;

export const isDescription = (description: string): description is Description =>
  description.length > 0 && description.length <= 255;

export const zodDescription = z.string().nonempty().refine(isDescription);

export const zodMinimalPost = z.object({
  id: zodUUID,
  userId: zodUUID,
  images: zodImage,
});

export type MinimalPost = z.infer<typeof zodMinimalPost>