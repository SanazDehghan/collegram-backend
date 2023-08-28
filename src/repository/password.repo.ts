import { UUID } from "crypto";
import { dataManager } from "~/DataManager";
import { PasswordsEntity } from "~/entities/password.entities";
import { PasswordHash } from "~/models/password.models";

export interface IPasswordRepo {
  editPassword: (userId: UUID, passwordHash: PasswordHash) => Promise<boolean>;
  getPasswordHash: (userId: UUID) => Promise<PasswordHash | null>;
}

export class PasswordRepo implements IPasswordRepo {
  private repository = dataManager.source.getRepository(PasswordsEntity);

  public async editPassword(userId: UUID, passwordHash: PasswordHash) {
    const dbPassword = await this.repository.findOneBy({ userId });

    if (dbPassword === null) {
      return false;
    }

    dbPassword.passwordHash = passwordHash;

    await this.repository.save(dbPassword);

    return true;
  }

  public async getPasswordHash(userId: UUID) {
    const dbPassword = await this.repository.findOneBy({ userId });

    return dbPassword ? (dbPassword.passwordHash as PasswordHash) : null;
  }
}
