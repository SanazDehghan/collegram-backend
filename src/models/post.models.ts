import { z } from "zod";
import { Brand } from "./common";

export type Description = Brand<string, "description">;

export const isDescription = (description: string): description is Description =>
  description.length > 0 && description.length <= 255;

export const zodDescription = z.string().nonempty().refine(isDescription);
