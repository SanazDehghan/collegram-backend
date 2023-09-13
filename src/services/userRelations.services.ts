import { IUserRelationsRepo } from "~/repository/userRelations.repo";
import { ForbiddenFollowUser, UserNotFound } from "./errors/service.errors";
import { UUID } from "crypto";
import { IUserRelations, UserRelationTypes } from "~/models/user.models";

export class UserRelationsServices {
  constructor(private userRelationsRepo: IUserRelationsRepo) {}

  public async follow(uid: UUID, userId: UUID) {
    const receiver = await this.userRelationsRepo.findUser(userId);

    if (receiver === null) {
      throw new UserNotFound();
    }

    const relation = await this.userRelationsRepo.getRelations(uid, userId);

    if (!this.canFollow(relation, uid)) {
      throw new ForbiddenFollowUser();
    }

    if (!receiver.isPrivate) {
      await this.userRelationsRepo.addRelations(uid, userId, "FOLLOW");
      return "FOLLOWED";
    }

    if (this.canRequest(relation, uid)) {
      await this.userRelationsRepo.addRelations(uid, userId, "REQUESTED");
      return "REQUESTED";
    }

    return null;
  }

  private checkRelation(relations: IUserRelations[], find: UserRelationTypes, uid: UUID) {
    const foundRelations = relations.filter((item) => item.relationType === find);

    if (foundRelations.length === 0) {
      return null;
    }

    if (foundRelations.length === 1) {
      return foundRelations[0]?.user1Id === uid ? "ONE_WAY" : "OTHER_WAY";
    }

    return "BOTH_WAY";
  }

  private canFollow(relations: IUserRelations[], uid: UUID) {
    const followStatus = this.checkRelation(relations, "FOLLOW", uid);
    const blockStatus = this.checkRelation(relations, "BLOCKED", uid);

    return followStatus !== "ONE_WAY" && followStatus !== "BOTH_WAY" && blockStatus === null;
  }

  private canRequest(relations: IUserRelations[], uid: UUID) {
    const requestStatus = this.checkRelation(relations, "REQUESTED", uid);

    return this.canFollow(relations, uid) && requestStatus !== "ONE_WAY" && requestStatus !== "BOTH_WAY";
  }
}
