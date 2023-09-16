import { z } from "zod";
import { zodUUID } from "~/models/common";
import { zodUserRelations } from "~/models/user.models";

export namespace GetRelationsDAO {
  const zodRelationObject = z.object({
    user1Id: zodUUID,
    user2Id: zodUUID,
    relationType: zodUserRelations,
  });

  export const zod = z.array(zodRelationObject);

  export type Type = z.infer<typeof zod>;
}

export namespace FollowRelationsDAO {
  const zodFollowRelationObject = z.object({
    user2Id: zodUUID,
  });

  export const zod = z.array(zodFollowRelationObject);
  
  export type Type = z.infer<typeof zod>;
}
