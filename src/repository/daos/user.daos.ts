import { z } from "zod";
import { zodNonEmptyString } from "~/models/common";
import { zodBio, zodEmail, zodUsername } from "~/models/user.models";

export namespace editedUserDAO{
    export const zod = z.object({
        username: zodUsername,
        firstName: zodNonEmptyString.optional(),
        lastName: zodNonEmptyString.optional(),
        email: zodEmail,
        bio: zodBio.optional(),
        profileUrl: zodNonEmptyString.optional(),
        isPrivate: z.boolean(),
    });
  
    export type Type = z.infer<typeof zod>;
}