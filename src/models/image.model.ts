import { z } from "zod";
import { zodNonEmptyString, zodUUID } from "./common";

export const zodImage = z.object({
  id: zodUUID,
  path: zodNonEmptyString,
});
