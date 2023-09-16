import { UUID } from "crypto";
import { FindOptionsSelect, FindOptionsWhere } from "typeorm";
import { dataManager } from "~/DataManager";
import { UsersEntity } from "~/entities/user.entities";
import { PasswordHash, zodPasswordHash } from "~/models/password.models";
import { BaseUser, Email, User, UserWithPasswordHash, Username, zodEmail, zodUser } from "~/models/user.models";
import { cleanObj } from "~/utilities/object";

export interface IUserRepo {
  addUserWithPassword: (user: BaseUser, passwordHash: PasswordHash) => Promise<UUID>;
  getUserById: (id: UUID) => Promise<User | null>;
  getUserByUsername: (username: Username) => Promise<User | null>;
  getUserByEmail: (email: Email) => Promise<User | null>;
  editUser: (userId: UUID, editedUser: Partial<UserWithPasswordHash>) => Promise<Partial<UserWithPasswordHash> | null>;
  getUserWithPasswordHash: (identifier: Email | Username) => Promise<UserWithPasswordHash | null>;
  getEmailByIdentifier: (identifier: Email | Username) => Promise<Email | null>;
  increaseFollowCount : (followerId: UUID, followingId: UUID) => Promise<"UPDATED" | "ERROR_USER_NOT_FOUND">;
}

export class UserRepo implements IUserRepo {
  private repository = dataManager.source.getRepository(UsersEntity);
  private columns: FindOptionsSelect<UsersEntity> = {
    id: true,
    username: true,
    firstName: true,
    lastName: true,
    email: true,
    bio: true,
    profileUrl: true,
    isPrivate: true,
    followers: true,
    followings: true,
  };

  private async findOne(where: FindOptionsWhere<UsersEntity>) {
    const result = await this.repository.findOne({
      select: this.columns,
      where,
    });

    return result ? zodUser.parse(cleanObj(result)) : null;
  }

  public async addUserWithPassword(user: BaseUser, passwordHash: PasswordHash) {
    const result = await this.repository.save({
      ...user,
      password: {
        passwordHash: passwordHash,
      },
    });

    return result.id;
  }

  public async getUserById(id: UUID) {
    return await this.findOne({ id });
  }

  public async getUserByUsername(username: Username) {
    return await this.findOne({ username });
  }

  public async getUserByEmail(email: Email) {
    return await this.findOne({ email });
  }

  public async editUser(userId: UUID, editedUser: Partial<UserWithPasswordHash>) {
    const dbUser = await this.repository.findOneBy({ id: userId });

    if (dbUser === null) {
      return null;
    }

    const updatedUser = { ...dbUser, ...editedUser };

    this.repository.save({
      ...updatedUser,
      password: {
        passwordHash: editedUser.passwordHash,
      },
    });

    return editedUser;
  }

  public async getUserWithPasswordHash(identifier: Email | Username) {
    const dbUser = await this.repository.findOne({
      select: {
        ...this.columns,
        password: {
          passwordHash: true,
        },
      },
      where: [{ username: identifier }, { email: identifier }],
      relations: {
        password: true,
      },
    });

    if (dbUser === null) {
      return null;
    }

    const { password, ...user } = dbUser;
    const parsedPasswordHash = zodPasswordHash.parse(password.passwordHash);
    const parsedUser = zodUser.parse(cleanObj(user));

    return { ...parsedUser, passwordHash: parsedPasswordHash };
  }

  public async getEmailByIdentifier(identifier: Email | Username) {
    const user = await this.repository.findOne({
      select: this.columns,
      where: [{ username: identifier }, { email: identifier }],
    });

    if (user === null) {
      return null;
    }

    const email: Email = zodEmail.parse(user.email);

    return email;
  }

  public async increaseFollowCount(followerId: UUID, followingId: UUID) {
    const follower = await this.repository.findOneBy({ id: followerId });
    const following = await this.repository.findOneBy({ id: followingId });
    if (follower === null || following === null) {
      return  "ERROR_USER_NOT_FOUND";
    }

    const updateFollower = await this.repository.update(followerId, { followings: follower.followings + 1 });
    const updateFollowing = await this.repository.update(followingId, { followers: following.followers + 1 });

    return "UPDATED";
  }
}
