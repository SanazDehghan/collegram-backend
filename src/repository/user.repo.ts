import { UUID } from "crypto";
import { FindOptionsSelect, FindOptionsWhere } from "typeorm";
import { dataManager } from "~/DataManager";
import { UsersEntity } from "~/entities/user.entities";
import { PasswordHash, zodPasswordHash } from "~/models/password.models";
import {
  BaseUser,
  Email,
  User,
  UserWithPasswordHash,
  Username,
  zodUser,
  zodUserWithPasswordHash,
} from "~/models/user.models";
import { cleanObj } from "~/utilities/object";

export interface IUserRepo {
  addUserWithPassword: (user: BaseUser, passwordHash: PasswordHash) => Promise<UUID | null>;
  getUserById: (id: UUID) => Promise<User | null>;
  getUserByUsername: (username: Username) => Promise<User | null>;
  getUserByEmail: (email: Email) => Promise<User | null>;
  editUser: (userId: UUID, editedUser: Partial<BaseUser>) => Promise<boolean>;
  getUserWithPasswordHash: (identifier: Email | Username) => Promise<UserWithPasswordHash | null>;
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

  public async editUser(userId: UUID, editedUser: Partial<BaseUser>) {
    const dbUser = await this.repository.findOneBy({ id: userId });

    if (dbUser === null) {
      return false;
    }

    const updatedUser = { ...dbUser, ...editedUser };

    this.repository.save(updatedUser);

    return true;
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
    });

    if (dbUser === null) {
      return null;
    }

    const { password, ...user } = dbUser;
    const parsedPasswordHash = zodPasswordHash.parse(password.passwordHash);
    const parsedUser = zodUser.parse(cleanObj(user));

    return { ...parsedUser, passwordHash: parsedPasswordHash };
  }
}
