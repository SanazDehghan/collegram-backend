import { UUID } from "crypto";
import { dataManager } from "~/DataManager";
import { UserRelationsEntity } from "~/entities/userRelations.entities";
import { GetRelationsDAO } from "./daos/userRelations.daos";
import { UsersEntity } from "~/entities/user.entities";
import { UserRelationTypes } from "~/models/user.models";
import { IsNull } from "typeorm";

export interface IUserRelationsRepo {
  getRelations: (uid: UUID, userId: UUID) => Promise<GetRelationsDAO.Type>;
  findUser: (id: UUID) => Promise<UsersEntity | null>;
  addRelations: (uid: UUID, userId: UUID, relation: UserRelationTypes) => Promise<UserRelationsEntity>;
}

export class UserRelationsRepo implements IUserRelationsRepo {
  private repository = dataManager.source.getRepository(UserRelationsEntity);
  private userRepo = dataManager.source.getRepository(UsersEntity);

  public async getRelations(uid: UUID, userId: UUID) {
    const relation = await this.repository.find({
      select: {
        user1Id: true,
        user2Id: true,
        relationType: true,
      },
      where: [
        {
          user1Id: uid,
          user2Id: userId,
          deletedAt: IsNull(),
        },
        {
          user1Id: userId,
          user2Id: uid,
          deletedAt: IsNull(),
        },
      ],
    });
    return GetRelationsDAO.zod.parse(relation);
  }

  public async findUser(id: UUID) {
    return await this.userRepo.findOneBy({ id });
  }

  public async addRelations(uid: UUID, userId: UUID, relation: UserRelationTypes) {
    const result = await this.repository.save({
      user1Id: uid,
      user2Id: userId,
      relationType: relation,
    });
    return result;
  }
}
