import { z } from "zod";
import { zodNonEmptyString, zodUUID } from "./common";

export namespace UploadedImage {
  export const zodMimetype = z.enum(["image/jpeg", "image/png"]);
  export const zodSize = z.number().int().gt(0);

  export const zod = z.object({
    path: zodNonEmptyString,
    mimetype: zodMimetype,
    size: zodSize,
  });

  export type Type = z.TypeOf<typeof zod>;
}

export namespace Image {
  export const zod = z.object({
    path: zodNonEmptyString,
    id: zodUUID,
  });

  export type Type = z.infer<typeof zod>;
}
