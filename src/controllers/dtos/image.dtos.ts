import { z } from "zod";
import { zodNonEmptyString } from "~/models/common";
import { UploadedImage } from "~/models/image.models";

export namespace UploadImageDTO {
  export const zod = z.object({
    path: zodNonEmptyString,
    mimetype: UploadedImage.zodMimetype,
    size: UploadedImage.zodSize,
  });

  export type Type = z.TypeOf<typeof zod>;
}
