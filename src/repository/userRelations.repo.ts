import { UUID } from "crypto";
import { dataManager } from "~/DataManager";
import { UserRelationsEntity } from "~/entities/userRelations.entities";
import { GetRelationsDAO } from "./daos/userRelations.daos";
import { UserRelationTypes } from "~/models/user.models";
import { IsNull } from "typeorm";

export interface IUserRelationsRepo {
  getRelations: (followerId: UUID, followingId: UUID) => Promise<GetRelationsDAO.Type>;
  addRelations: (followerId: UUID, followingId: UUID, relation: UserRelationTypes) => Promise<UserRelationsEntity>;
  getRelatedUserIds: (id: UUID, relation: UserRelationTypes) => Promise<UUID[]>;
}

export class UserRelationsRepo implements IUserRelationsRepo {
  private repository = dataManager.source.getRepository(UserRelationsEntity);

  public async getRelations(firstUserId: UUID, secondUserId: UUID) {
    const relation = await this.repository.find({
      select: {
        user1Id: true,
        user2Id: true,
        relationType: true,
      },
      where: [
        {
          user1Id: firstUserId,
          user2Id: secondUserId,
          deletedAt: IsNull(),
        },
        {
          user1Id: secondUserId,
          user2Id: firstUserId,
          deletedAt: IsNull(),
        },
      ],
    });
    return GetRelationsDAO.zod.parse(relation);
  }

  public async addRelations(followerId: UUID, followingId: UUID, relation: UserRelationTypes) {
    const result = await this.repository.save({
      user1Id: followerId,
      user2Id: followingId,
      relationType: relation,
    });
    return result;
  }

  public async getRelatedUserIds(id: UUID, relation: UserRelationTypes) {
    const records = await this.repository.find({
      select: {
        user2Id: true,
      },
      where: {
        user1Id: id,
        relationType: relation,
        deletedAt: IsNull(),
      },
    });
    const userIds = records.map((item) => item.user2Id);
    return userIds;
  }
}
