import { UUID } from "crypto";
import { PasswordHash } from "~/models/password.models";

export interface IPasswordRepo {
  editPassword: (userId: UUID, passwordHash: PasswordHash) => Promise<boolean>;
}
