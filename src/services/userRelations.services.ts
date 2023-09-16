import { IUserRelationsRepo } from "~/repository/userRelations.repo";
import { ForbiddenFollowUser, UserNotFound } from "./errors/service.errors";
import { UUID } from "crypto";
import { IUserRelations, UserRelationTypes } from "~/models/user.models";

export interface FollowingUser {
  id: UUID;
  isPrivate: boolean;
}

export class UserRelationsServices {
  constructor(private userRelationsRepo: IUserRelationsRepo) {}

  public async follow(followerId: UUID, followingUser: FollowingUser) {
    const relation = await this.userRelationsRepo.getRelations(followerId, followingUser.id);

    if (!this.canFollow(relation, followerId)) {
      throw new ForbiddenFollowUser();
    }

    if (!followingUser.isPrivate) {
      await this.userRelationsRepo.addRelations(followerId, followingUser.id, "FOLLOW");
      return "FOLLOWED";
    }

    if (this.canRequest(relation, followerId)) {
      await this.userRelationsRepo.addRelations(followerId, followingUser.id, "REQUESTED");
      return "REQUESTED";
    }

    return null;
  }

  private checkRelation(relations: IUserRelations[], find: UserRelationTypes, followerId: UUID) {
    const foundRelations = relations.filter((item) => item.relationType === find);

    if (foundRelations.length === 0) {
      return null;
    }

    if (foundRelations.length === 1) {
      return foundRelations[0]?.user1Id === followerId ? "ONE_WAY" : "OTHER_WAY";
    }

    return "BOTH_WAY";
  }

  private canFollow(relations: IUserRelations[], uid: UUID) {
    const followStatus = this.checkRelation(relations, "FOLLOW", uid);
    const blockStatus = this.checkRelation(relations, "BLOCKED", uid);

    return followStatus !== "ONE_WAY" && followStatus !== "BOTH_WAY" && blockStatus === null;
  }

  private canRequest(relations: IUserRelations[], followerId: UUID) {
    const requestStatus = this.checkRelation(relations, "REQUESTED", followerId);

    return this.canFollow(relations, followerId) && requestStatus !== "ONE_WAY" && requestStatus !== "BOTH_WAY";
  }

  public async getUserFollowingIds(userId: UUID) {
    const followingId = await this.userRelationsRepo.getRelatedUserIds(userId, "FOLLOW");
    return followingId;
  }
}
