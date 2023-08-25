import { UUID } from "crypto";
import { PasswordHash } from "~/models/password.models";
import { BaseUser, Email, User, Username } from "~/models/user.models";

export interface IUserRepo {
  addUserWithPassword: (user: BaseUser, passwordHash: PasswordHash) => Promise<boolean>;
  getUserById: (id: UUID) => Promise<User | null>;
  getUserByUsername: (username: Username) => Promise<User | null>;
  getUserByEmail: (email: Email) => Promise<User | null>;
  editUser: (userId: UUID, editedUser: BaseUser) => Promise<boolean>;
}
