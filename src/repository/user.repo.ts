import { UUID } from "crypto";
import { FindOptionsWhere } from "typeorm";
import { dataManager } from "~/DataManager";
import { UsersEntity } from "~/entities/user.entities";
import { PasswordHash } from "~/models/password.models";
import { BaseUser, Email, User, Username, zodUser } from "~/models/user.models";
import { cleanObj } from "~/utilities/object";

export interface IUserRepo {
  addUserWithPassword: (user: BaseUser, passwordHash: PasswordHash) => Promise<UUID | null>;
  getUserById: (id: UUID) => Promise<User | null>;
  getUserByUsername: (username: Username) => Promise<User | null>;
  getUserByEmail: (email: Email) => Promise<User | null>;
  editUser: (userId: UUID, editedUser: Partial<BaseUser>) => Promise<boolean>;
}

export class UserRepo implements IUserRepo {
  private repository = dataManager.source.getRepository(UsersEntity);

  private async findOne(where: FindOptionsWhere<UsersEntity>) {
    const result = await this.repository.findOne({
      select: [
        "id",
        "username",
        "firstName",
        "lastName",
        "email",
        "bio",
        "profileUrl",
        "isPrivate",
        "followers",
        "followings",
      ],
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

  public async editUser(userId: UUID, editedUser: Partial<BaseUser>) {
    const dbUser = await this.repository.findOneBy({ id: userId });

    if (dbUser === null) {
      return false;
    }

    const updatedUser = { ...dbUser, ...editedUser };

    this.repository.save(updatedUser);

    return true;
  }
}
