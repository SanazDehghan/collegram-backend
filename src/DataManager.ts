import { DataSource} from "typeorm";
import { ProcessManager } from "~/utilities/ProcessManager";
import { UsersEntity } from "~/entities/user.entities";
import { PasswordsEntity } from "~/entities/password.entities";

class DataManager {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource({
      type: "postgres",
      host: ProcessManager.get("DB_HOST").str,
      port: ProcessManager.get("DB_PORT").num,
      username: ProcessManager.get("DB_USERNAME").str,
      password: ProcessManager.get("DB_PASSWORD").str,
      database: ProcessManager.get("DB_NAME").str,
      synchronize: true,
      logging: false,
      entities: this.getEntities(),
      subscribers: [],
      migrations: [],
    });
  }

  private getEntities() {
    return [UsersEntity, PasswordsEntity];
  }

  get source() {
    return this.dataSource;
  }

  public async init() {
    return await this.dataSource.initialize();
  }

  public async cleanDB() {
    for (const entity of this.getEntities()) {
      await this.dataSource.getRepository(entity).clear()
    }
  }

  public async close() {
    return await this.dataSource.destroy();
  }
}

export const dataManager = new DataManager();
