import { z } from "zod";
import { zodNonEmptyString, zodUUID } from "../../models/common";

export namespace ImageDAO {
  export const zod = z.object({
    id: zodUUID,
    path: zodNonEmptyString,
  });

  export type Type = z.infer<typeof zod>;
}
